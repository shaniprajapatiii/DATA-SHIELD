/**
 * Page Parser Utility
 * Extracts metadata and privacy-related information from the page
 */

const pageParser = {
  /**
   * Get privacy-related meta tags
   * @returns {Object} Meta tags related to privacy
   */
  getPrivacyMeta() {
    const meta = {};
    const relevantNames = ['robots', 'referrer', 'content-security-policy'];

    document.querySelectorAll('meta').forEach((m) => {
      const name = (m.getAttribute('name') || m.getAttribute('http-equiv') || '').toLowerCase();
      if (relevantNames.some((n) => name.includes(n))) {
        meta[name] = m.getAttribute('content') || '';
      }
    });

    return meta;
  },

  /**
   * Extract policy text from article or main sections
   * @returns {String} Extracted policy text
   */
  extractPolicyText() {
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
    return text;
  },

  /**
   * Get page title
   * @returns {String} Page title
   */
  getPageTitle() {
    return document.title;
  },

  /**
   * Get current page URL
   * @returns {String} Current page URL
   */
  getCurrentUrl() {
    return window.location.href;
  },

  /**
   * Capture page HTML (capped at 200KB)
   * @returns {String} Page HTML content
   */
  getPageHtml() {
    return document.documentElement.outerHTML.slice(0, 200_000);
  },

  /**
   * Get timestamp
   * @returns {Number} Current timestamp
   */
  getTimestamp() {
    return Date.now();
  },
};

if (typeof globalThis !== 'undefined') {
  globalThis.pageParser = pageParser;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = pageParser;
}
