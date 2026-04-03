/**
 * DataShield – content.js (Refactored)
 * Injected into every page to gather data and display risk overlay
 */

(function () {
  'use strict';

  // ── Prevent double-injection ──────────────────────────────────────────────
  if (window.__datashieldInjected) return;
  window.__datashieldInjected = true;

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
