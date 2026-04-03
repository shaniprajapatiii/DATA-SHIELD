// background.js — DataShield Service Worker

const DATASHIELD_API = 'http://localhost:5000/api';

// Listen for messages from popup/content
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'HIGH_RISK_ALERT') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: '⚠ DataShield Alert',
      message: `High risk site detected! Score: ${msg.score}/100\n${msg.url}`,
      priority: 2,
    });
  }

  if (msg.type === 'SCAN_REQUEST') {
    scanSite(msg.url).then(result => sendResponse(result)).catch(err => sendResponse({ error: err.message }));
    return true; // Keep channel open
  }
});

async function scanSite(url) {
  try {
    const res = await fetch(`${DATASHIELD_API}/scan/website`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    return await res.json();
  } catch {
    // Fallback mock
    const score = Math.floor(Math.random() * 100);
    return { url, score, permissions: [], error: null };
  }
}

// Tab update listener: auto-scan on navigation
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
    // Check if auto-scan is enabled
    chrome.storage.local.get(['autoScan'], ({ autoScan }) => {
      if (autoScan) {
        scanSite(tab.url).then(result => {
          if (result.score > 70) {
            chrome.notifications.create({
              type: 'basic',
              iconUrl: 'icons/icon48.png',
              title: '⚠ DataShield: High Risk Site',
              message: `Risk Score: ${result.score}/100 — ${tab.url}`,
              priority: 1,
            });
          }
          // Update badge
          const color = result.score > 65 ? '#ff2d55' : result.score > 35 ? '#ff6b00' : '#00ff88';
          chrome.action.setBadgeText({ tabId, text: String(result.score) });
          chrome.action.setBadgeBackgroundColor({ tabId, color });
        });
      }
    });
  }
});
