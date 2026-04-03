/**
 * Scan Service
 * Handles scan requests to the Node backend
 */

const scanService = {
  API_BASE: 'http://localhost:5000/api',

  /**
   * Send scan request to backend
   * @param {String} url - URL to scan
   * @param {String|null} html - Optional HTML content
   * @returns {Promise<Object>} Scan result
   */
  async requestScan(url, html = null) {
    try {
      // Get auth token
      const { authToken } = await chrome.storage.local.get('authToken');
      if (!authToken) {
        return { error: 'Not authenticated', unauthenticated: true };
      }

      const payload = { url };
      if (html) payload.html = html;

      const resp = await fetch(`${this.API_BASE}/scan/url`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        let err = {};
        try {
          err = await resp.json();
        } catch {
          err = { error: 'Scan failed' };
        }

        if (resp.status === 401 || resp.status === 403) {
          return {
            error: err.error || 'Not authenticated',
            unauthenticated: true,
          };
        }

        return { error: err.error || 'Scan failed' };
      }

      const result = await resp.json();
      return result;
    } catch (err) {
      return { error: err.message };
    }
  },

  /**
   * Get page data from content script
   * @param {Number} tabId - Active tab ID
   * @returns {Promise<Object>} Page data
   */
  async getPageDataFromTab(tabId) {
    try {
      const response = await chrome.tabs.sendMessage(tabId, { type: 'GET_PAGE_DATA' });
      return response;
    } catch (err) {
      return { error: err.message };
    }
  },

  /**
   * Extract policy text from content script
   * @param {Number} tabId - Active tab ID
   * @returns {Promise<Object>} Policy text and URL
   */
  async extractPolicyTextFromTab(tabId) {
    try {
      const response = await chrome.tabs.sendMessage(tabId, { type: 'EXTRACT_POLICY_TEXT' });
      return response;
    } catch (err) {
      return { error: err.message };
    }
  },

  /**
   * Validate if URL is scannable
   * @param {String} url - URL to validate
   * @returns {Boolean} True if scannable
   */
  isScannable(url) {
    if (!url) return false;
    if (url.startsWith('chrome://')) return false;
    if (url.startsWith('chrome-extension://')) return false;
    if (url.startsWith('edge://')) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
};

if (typeof globalThis !== 'undefined') {
  globalThis.scanService = scanService;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = scanService;
}
