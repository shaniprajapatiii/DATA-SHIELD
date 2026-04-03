/**
 * DOM Scanner Utility
 * Detects permission APIs and cookie banners in the DOM
 */

const domScanner = {
  // ── Permission APIs mapping ────────────────────────────────────────────────
  PERM_APIS: {
    microphone:    ['getUserMedia', 'AudioContext', 'MediaRecorder'],
    camera:        ['getUserMedia', 'ImageCapture', 'facingMode'],
    location:      ['geolocation', 'getCurrentPosition', 'watchPosition'],
    clipboard:     ['navigator.clipboard', 'readText', 'writeText'],
    notifications: ['Notification.requestPermission', 'pushManager'],
    sensors:       ['DeviceMotionEvent', 'DeviceOrientationEvent', 'Accelerometer'],
    bluetooth:     ['navigator.bluetooth'],
    usb:           ['navigator.usb'],
  },

  // ── Cookie banner selectors ────────────────────────────────────────────────
  COOKIE_BANNER_SELECTORS: [
    '[id*="cookie"]', '[class*="cookie"]',
    '[id*="consent"]', '[class*="consent"]',
    '[id*="gdpr"]', '[class*="gdpr"]',
    '[id*="privacy-banner"]', '[class*="privacy-notice"]',
  ],

  /**
   * Detect permission APIs in inline scripts and DOM
   * @returns {Array} Array of detected permissions
   */
  detectPermissions() {
    const scripts = Array.from(document.querySelectorAll('script:not([src])'))
      .map((s) => s.textContent)
      .join('\n');

    const detected = [];

    for (const [perm, apis] of Object.entries(this.PERM_APIS)) {
      for (const api of apis) {
        if (scripts.includes(api) || document.documentElement.innerHTML.includes(api)) {
          detected.push({ name: perm, source: 'inline-js', api });
          break;
        }
      }
    }

    return detected;
  },

  /**
   * Detect cookie consent banners in the page
   * @returns {Object} Cookie banner info
   */
  detectCookieBanner() {
    for (const selector of this.COOKIE_BANNER_SELECTORS) {
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
  },
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = domScanner;
}
