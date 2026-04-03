/**
 * DataShield – background.js (Refactored Service Worker)
 * Manages automatic scanning, caching, notifications, and badge updates
 */

importScripts(
  'services/auth-service.js',
  'services/badge-service.js',
  'services/cache-service.js',
  'services/notification-service.js',
  'services/scan-service.js',
  'services/storage-service.js'
);

// ─── On Install ───────────────────────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason === 'install') {
    await storageService.initializeOnInstall();
    chrome.tabs.create({ url: 'http://localhost:3000/welcome?source=extension' });
  }
});

// ─── Keyboard Shortcut ────────────────────────────────────────────────────────
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'scan-current-tab') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) triggerScan(tab);
  }
});

// ─── Tab Navigation Listener ──────────────────────────────────────────────────
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;
  if (!scanService.isScannable(tab.url)) return;

  const settings = await storageService.getSettings();
  if (settings?.autoScan) {
    triggerScan(tab);
  }
});

// ─── Message Listener ────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message.type) {
    case 'SCAN_REQUEST':
      handleScanRequest(message.url, message.html)
        .then(sendResponse)
        .catch((err) => sendResponse({ error: err.message }));
      return true;

    case 'GET_CACHED_RESULT':
      cacheService.getCachedResult(message.url).then(sendResponse);
      return true;

    case 'CLEAR_CACHE':
      cacheService.clearCache().then(() => sendResponse({ cleared: true }));
      return true;

    case 'GET_AUTH_TOKEN':
      authService.getToken().then((token) => sendResponse({ token }));
      return true;

    case 'SET_AUTH_TOKEN':
      authService.setToken(message.token).then(() => sendResponse({ saved: true }));
      return true;

    case 'CLEAR_AUTH_TOKEN':
      authService.clearToken().then(() => sendResponse({ cleared: true }));
      return true;

    default:
      sendResponse({ error: 'Unknown message type' });
  }
});

// ─── Core Functions ───────────────────────────────────────────────────────────

/**
 * Trigger a scan for a tab
 * @param {Object} tab - Chrome tab object
 */
async function triggerScan(tab) {
  // Check cache first
  const cached = await cacheService.getCachedResult(tab.url);
  if (cached) {
    badgeService.updateBadge(tab.id, cached.risk_score);
    return;
  }

  // Get page data from content script
  try {
    const pageData = await scanService.getPageDataFromTab(tab.id);
    if (pageData?.html) {
      const result = await handleScanRequest(tab.url, pageData.html);
      if (result && !result.error) {
        badgeService.updateBadge(tab.id, result.risk_score);
        const settings = await storageService.getSettings();
        await notificationService.notifyIfNeeded(tab, result, settings);
      }
    }
  } catch (_) {
    // Content script not yet loaded — silent fail
  }
}

/**
 * Handle scan request to backend
 * @param {String} url - URL to scan
 * @param {String|null} html - Optional HTML content
 * @returns {Promise<Object>} Scan result
 */
async function handleScanRequest(url, html = null) {
  const result = await scanService.requestScan(url, html);

  if (!result.error && result.risk_score != null) {
    await cacheService.cacheResult(url, result);
  }

  return result;
}
