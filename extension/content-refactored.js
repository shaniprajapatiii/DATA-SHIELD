/**
 * DataShield – content.js (Refactored)
 * Injected into every page to gather data and display risk overlay
 */

(function () {
  'use strict';

  // ── Prevent double-injection ──────────────────────────────────────────────
  if (window.__datashieldInjected) return;
  window.__datashieldInjected = true;

  // ── Sync auth token from the DataShield web app when available ───────────
  function syncAuthTokenFromPage() {
    try {
      const stored = localStorage.getItem('datashield_user');
      if (!stored) return;

      const user = JSON.parse(stored);
      if (!user?.token) return;

      chrome.runtime.sendMessage({ type: 'SET_AUTH_TOKEN', token: user.token });
    } catch {
      // Ignore malformed storage or inaccessible pages.
    }
  }

  function syncAuthTokenFromMessage(event) {
    if (event.origin !== window.location.origin) return;

    const data = event.data;
    if (!data || data.source !== 'datashield-app' || data.type !== 'DATASHIELD_AUTH_TOKEN') return;

    if (data.token) {
      chrome.runtime.sendMessage({ type: 'SET_AUTH_TOKEN', token: data.token });
      return;
    }

    chrome.runtime.sendMessage({ type: 'CLEAR_AUTH_TOKEN' });
  }

  syncAuthTokenFromPage();
  window.addEventListener('message', syncAuthTokenFromMessage);

  const isLocalAppHost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  if (isLocalAppHost) {
    const tokenSyncTimer = window.setInterval(syncAuthTokenFromPage, 1500);
    window.addEventListener('beforeunload', () => window.clearInterval(tokenSyncTimer));
  }

  // ── Gather page data ──────────────────────────────────────────────────────
  function getPageData() {
    return {
      url:          pageParser.getCurrentUrl(),
      html:         pageParser.getPageHtml(),
      permissions:  domScanner.detectPermissions(),
      cookieBanner: domScanner.detectCookieBanner(),
      metaPrivacy:  pageParser.getPrivacyMeta(),
      links:        policyFinder.getPrivacyLinks(),
      pageTitle:    pageParser.getPageTitle(),
      timestamp:    pageParser.getTimestamp(),
    };
  }

  // ── Message Handler ───────────────────────────────────────────────────────
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    switch (message.type) {
      case 'GET_PAGE_DATA':
        sendResponse(getPageData());
        break;

      case 'SHOW_RISK':
        riskOverlay.injectIndicator(message.score, message.label);
        sendResponse({ shown: true });
        break;

      case 'EXTRACT_POLICY_TEXT':
        sendResponse({
          text: pageParser.extractPolicyText(),
          url: pageParser.getCurrentUrl(),
        });
        break;

      default:
        sendResponse({ error: 'Unknown message' });
    }
    return true; // keep channel open
  });

  // ── Auto-request cached result on page load ────────────────────────────────
  chrome.runtime.sendMessage(
    { type: 'GET_CACHED_RESULT', url: window.location.href },
    (result) => {
      if (result && result.risk_score != null) {
        riskOverlay.injectIndicator(result.risk_score, result.risk_label || 'moderate');
      }
    }
  );
})();
