/**
 * DataShield – background.js (Service Worker, MV3)
 *
 * Responsibilities:
 *  • Intercept tab navigation and trigger auto-scans
 *  • Cache scan results per domain in chrome.storage
 *  • Send desktop notifications for high-risk sites
 *  • Relay messages between content.js and popup.js
 *  • Manage authentication tokens
 */

const API_BASE = 'http://localhost:5000/api'; // Node gateway
const CACHE_TTL_MS = 30 * 60 * 1000;          // 30 minutes

// ─── On Install / Update ──────────────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    chrome.storage.local.set({
      settings: {
        autoScan:           true,
        notifyThreshold:    70,
        notificationsEnabled: true,
      },
      scanCache: {},
    });

    // Open onboarding page
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
  if (!tab.url || tab.url.startsWith('chrome://')) return;

  const { settings } = await chrome.storage.local.get('settings');
  if (settings?.autoScan) {
    triggerScan(tab);
  }
});

// ─── Message Listener ─────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message.type) {
    case 'SCAN_REQUEST':
      handleScanRequest(message.url, message.html)
        .then(sendResponse)
        .catch((err) => sendResponse({ error: err.message }));
      return true; // keep channel open for async

    case 'GET_CACHED_RESULT':
      getCachedResult(message.url).then(sendResponse);
      return true;

    case 'CLEAR_CACHE':
      chrome.storage.local.set({ scanCache: {} });
      sendResponse({ cleared: true });
      break;

    case 'GET_AUTH_TOKEN':
      chrome.storage.local.get('authToken', ({ authToken }) => {
        sendResponse({ token: authToken || null });
      });
      return true;

    case 'SET_AUTH_TOKEN':
      chrome.storage.local.set({ authToken: message.token });
      sendResponse({ saved: true });
      break;

    default:
      sendResponse({ error: 'Unknown message type' });
  }
});

// ─── Core Functions ───────────────────────────────────────────────────────────

async function triggerScan(tab) {
  const domain = extractDomain(tab.url);
  if (!domain) return;

  // Check cache first
  const cached = await getCachedResult(tab.url);
  if (cached) {
    updateBadge(tab.id, cached.risk_score);
    return;
  }

  // Ask content script for page HTML
  try {
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_PAGE_DATA' });
    if (response?.html) {
      const result = await handleScanRequest(tab.url, response.html);
      updateBadge(tab.id, result?.risk_score);
      if (result) maybeNotify(tab, result);
    }
  } catch (_) {
    // Content script not yet loaded — silent fail
  }
}

async function handleScanRequest(url, html = null) {
  try {
    const { authToken } = await chrome.storage.local.get('authToken');
    if (!authToken) return { error: 'Not authenticated', unauthenticated: true };

    const payload = { url };
    if (html) payload.html = html;

    const resp = await fetch(`${API_BASE}/scan/url`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const err = await resp.json();
      return { error: err.error || 'Scan failed' };
    }

    const result = await resp.json();

    // Cache result
    await cacheResult(url, result);
    return result;
  } catch (err) {
    return { error: err.message };
  }
}

async function getCachedResult(url) {
  const domain = extractDomain(url);
  const { scanCache = {} } = await chrome.storage.local.get('scanCache');
  const entry = scanCache[domain];
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) return null;
  return entry.data;
}

async function cacheResult(url, data) {
  const domain = extractDomain(url);
  const { scanCache = {} } = await chrome.storage.local.get('scanCache');
  scanCache[domain] = { data, timestamp: Date.now() };
  // Limit cache to 100 entries
  const keys = Object.keys(scanCache);
  if (keys.length > 100) {
    const oldest = keys.sort((a, b) => scanCache[a].timestamp - scanCache[b].timestamp)[0];
    delete scanCache[oldest];
  }
  await chrome.storage.local.set({ scanCache });
}

function updateBadge(tabId, score) {
  if (score == null) return;

  let color, text;
  if      (score <= 20) { color = '#22c55e'; text = '✓';  }
  else if (score <= 40) { color = '#84cc16'; text = 'L';  }
  else if (score <= 60) { color = '#eab308'; text = '!';  }
  else if (score <= 80) { color = '#f97316'; text = '!!'; }
  else                  { color = '#ef4444'; text = '!!!'; }

  chrome.action.setBadgeText({ text, tabId });
  chrome.action.setBadgeBackgroundColor({ color, tabId });
}

async function maybeNotify(tab, result) {
  const { settings } = await chrome.storage.local.get('settings');
  if (!settings?.notificationsEnabled) return;
  if (result.risk_score < (settings.notifyThreshold || 70)) return;

  chrome.notifications.create(`scan-${tab.id}`, {
    type:    'basic',
    iconUrl: 'icons/icon48.png',
    title:   `⚠ DataShield – High Risk Detected`,
    message: `${extractDomain(tab.url)} scored ${result.risk_score}/100. ${result.summary?.tldr || ''}`,
    buttons: [{ title: 'View Full Report' }],
    priority: 2,
  });
}

chrome.notifications.onButtonClicked.addListener((notifId) => {
  chrome.tabs.create({ url: `http://localhost:3000/dashboard` });
});

// ─── Utility ──────────────────────────────────────────────────────────────────
function extractDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}