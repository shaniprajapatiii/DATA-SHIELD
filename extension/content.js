/**
 * DataShield – content.js
 *
 * Injected into every page.
 * Responsibilities:
 *  • Scan the DOM for permission API calls (JS source inspection)
 *  • Detect privacy-related meta tags, CSP headers, cookie banners
 *  • Relay page data to background.js on request
 *  • Inject a subtle risk indicator overlay when a result is ready
 */

(function () {
  'use strict';

  // ── Prevent double-injection ──────────────────────────────────────────────
  if (window.__datashieldInjected) return;
  window.__datashieldInjected = true;

  // ── Constants ─────────────────────────────────────────────────────────────
  const PERM_APIS = {
    microphone:    ['getUserMedia', 'AudioContext', 'MediaRecorder'],
    camera:        ['getUserMedia', 'ImageCapture', 'facingMode'],
    location:      ['geolocation', 'getCurrentPosition', 'watchPosition'],
    clipboard:     ['navigator.clipboard', 'readText', 'writeText'],
    notifications: ['Notification.requestPermission', 'pushManager'],
    sensors:       ['DeviceMotionEvent', 'DeviceOrientationEvent', 'Accelerometer'],
    bluetooth:     ['navigator.bluetooth'],
    usb:           ['navigator.usb'],
  };

  const COOKIE_BANNER_SELECTORS = [
    '[id*="cookie"]', '[class*="cookie"]',
    '[id*="consent"]', '[class*="consent"]',
    '[id*="gdpr"]', '[class*="gdpr"]',
    '[id*="privacy-banner"]', '[class*="privacy-notice"]',
  ];

  // ── Gather page data ──────────────────────────────────────────────────────
  function getPageData() {
    const html          = document.documentElement.outerHTML.slice(0, 200_000); // cap 200KB
    const permissions   = detectPermissionsInSource();
    const cookieBanner  = detectCookieBanner();
    const metaPrivacy   = getPrivacyMeta();
    const links         = getPrivacyLinks();

    return {
      url:          window.location.href,
      html,
      permissions,
      cookieBanner,
      metaPrivacy,
      links,
      pageTitle:    document.title,
      timestamp:    Date.now(),
    };
  }

  // ── Detect permission APIs in inline scripts ───────────────────────────────
  function detectPermissionsInSource() {
    const scripts = Array.from(document.querySelectorAll('script:not([src])'))
      .map((s) => s.textContent)
      .join('\n');

    const detected = [];

    for (const [perm, apis] of Object.entries(PERM_APIS)) {
      for (const api of apis) {
        if (scripts.includes(api) || document.documentElement.innerHTML.includes(api)) {
          detected.push({ name: perm, source: 'inline-js', api });
          break;
        }
      }
    }

    return detected;
  }

  // ── Detect cookie consent banners ─────────────────────────────────────────
  function detectCookieBanner() {
    for (const selector of COOKIE_BANNER_SELECTORS) {
      const el = document.querySelector(selector);
      if (el && el.offsetParent !== null) {
        return {
          found: true,
          text:  el.textContent.trim().slice(0, 200),
          selector,
        };
      }
    }
    return { found: false };
  }

  // ── Privacy-related meta tags ──────────────────────────────────────────────
  function getPrivacyMeta() {
    const meta = {};
    const relevantNames = ['robots', 'referrer', 'content-security-policy'];

    document.querySelectorAll('meta').forEach((m) => {
      const name = (m.getAttribute('name') || m.getAttribute('http-equiv') || '').toLowerCase();
      if (relevantNames.some((n) => name.includes(n))) {
        meta[name] = m.getAttribute('content') || '';
      }
    });

    return meta;
  }

  // ── Find privacy policy / TOS links in the page ───────────────────────────
  function getPrivacyLinks() {
    const keywords = ['privacy', 'terms', 'legal', 'cookie', 'gdpr', 'data-policy'];
    const links    = [];

    document.querySelectorAll('a[href]').forEach((a) => {
      const href = a.href.toLowerCase();
      const text = a.textContent.trim().toLowerCase();
      if (keywords.some((k) => href.includes(k) || text.includes(k))) {
        links.push({ href: a.href, text: a.textContent.trim().slice(0, 60) });
      }
    });

    // Deduplicate by href
    const seen = new Set();
    return links.filter(({ href }) => {
      if (seen.has(href)) return false;
      seen.add(href);
      return true;
    }).slice(0, 10);
  }

  // ── Inject floating indicator ─────────────────────────────────────────────
  function injectRiskIndicator(score, label) {
    // Remove any existing indicator
    document.getElementById('__datashield_indicator')?.remove();

    const colors = {
      safe:     '#22c55e',
      low:      '#84cc16',
      moderate: '#eab308',
      high:     '#f97316',
      critical: '#ef4444',
    };

    const el = document.createElement('div');
    el.id = '__datashield_indicator';
    el.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 2147483647;
      background: rgba(10,14,26,0.95);
      border: 1px solid ${colors[label] || '#38bdf8'};
      border-radius: 12px;
      padding: 10px 14px;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4), 0 0 12px ${colors[label]}33;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(8px);
    `;

    el.innerHTML = `
      <div style="
        width: 36px; height: 36px;
        border-radius: 50%;
        background: ${colors[label] || '#38bdf8'}22;
        border: 2px solid ${colors[label] || '#38bdf8'};
        display: flex; align-items: center; justify-content: center;
        font-size: 14px; font-weight: 800; color: ${colors[label] || '#38bdf8'};
      ">${score}</div>
      <div>
        <div style="font-weight:700; font-size:11px; color:${colors[label] || '#38bdf8'}; text-transform:uppercase; letter-spacing:0.5px;">
          DataShield
        </div>
        <div style="color:#94a3b8; font-size:11px; margin-top:1px;">
          ${label.charAt(0).toUpperCase() + label.slice(1)} Risk
        </div>
      </div>
      <div style="color:#64748b; font-size:16px; margin-left:4px;">×</div>
    `;

    el.querySelector('div:last-child').addEventListener('click', (e) => {
      e.stopPropagation();
      el.remove();
    });

    el.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'OPEN_POPUP' });
    });

    // Auto-hide after 8 seconds
    document.body.appendChild(el);
    setTimeout(() => el?.remove(), 8000);
  }

  // ── Message Handler ───────────────────────────────────────────────────────
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    switch (message.type) {
      case 'GET_PAGE_DATA':
        sendResponse(getPageData());
        break;

      case 'SHOW_RISK':
        injectRiskIndicator(message.score, message.label);
        sendResponse({ shown: true });
        break;

      case 'EXTRACT_POLICY_TEXT': {
        // Find and return the best policy text block on this page
        const selectors = [
          'main', 'article',
          '[id*="policy"]', '[class*="policy"]',
          '[id*="privacy"]', '[class*="privacy"]',
          '[id*="terms"]',  '[class*="terms"]',
        ];
        let text = '';
        for (const sel of selectors) {
          const el = document.querySelector(sel);
          if (el) {
            text = el.innerText.trim();
            if (text.length > 200) break;
          }
        }
        if (!text) text = document.body.innerText.trim().slice(0, 50000);
        sendResponse({ text, url: window.location.href });
        break;
      }

      default:
        sendResponse({ error: 'Unknown message' });
    }
    return true; // keep channel open
  });

  // ── Auto-request cached result on load (non-blocking) ─────────────────────
  chrome.runtime.sendMessage(
    { type: 'GET_CACHED_RESULT', url: window.location.href },
    (result) => {
      if (result && result.risk_score != null) {
        injectRiskIndicator(result.risk_score, result.risk_label || 'moderate');
      }
    }
  );

})();