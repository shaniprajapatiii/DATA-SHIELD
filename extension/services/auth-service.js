/**
 * Authentication Service
 * Manages authentication tokens and user sessions
 */

const authService = {
  /**
   * Get current auth token
   * @returns {Promise<String|null>} Auth token or null
   */
  async getToken() {
    return new Promise((resolve) => {
      chrome.storage.local.get('authToken', ({ authToken }) => {
        resolve(authToken || null);
      });
    });
  },

  /**
   * Set auth token
   * @param {String} token - JWT token
   * @returns {Promise<void>}
   */
  async setToken(token) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ authToken: token }, resolve);
    });
  },

  /**
   * Clear auth token (logout)
   * @returns {Promise<void>}
   */
  async clearToken() {
    return new Promise((resolve) => {
      chrome.storage.local.remove('authToken', resolve);
    });
  },

  /**
   * Check if user is authenticated
   * @returns {Promise<Boolean>} True if authenticated
   */
  async isAuthenticated() {
    const token = await this.getToken();
    return !!token;
  },

  /**
   * Get auth header for API requests
   * @returns {Promise<Object>} Auth header object
   */
  async getAuthHeader() {
    const token = await this.getToken();
    return {
      'Authorization': `Bearer ${token}`,
    };
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = authService;
}
