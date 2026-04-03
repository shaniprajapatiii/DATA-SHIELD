/**
 * Chrome Storage Service
 * Manages all chrome.storage operations
 */

const storageService = {
  // ── Storage Keys ───────────────────────────────────────────────────────────
  KEYS: {
    SETTINGS: 'settings',
    AUTH_TOKEN: 'authToken',
    SCAN_CACHE: 'scanCache',
  },

  /**
   * Get settings from storage
   * @returns {Promise<Object>} Settings object
   */
  async getSettings() {
    const { settings } = await chrome.storage.local.get(this.KEYS.SETTINGS);
    return settings || {
      autoScan: true,
      notifyThreshold: 70,
      notificationsEnabled: true,
    };
  },

  /**
   * Update settings in storage
   * @param {Object} updates - Settings to update
   * @returns {Promise<void>}
   */
  async updateSettings(updates) {
    const currentSettings = await this.getSettings();
    await chrome.storage.local.set({
      [this.KEYS.SETTINGS]: { ...currentSettings, ...updates },
    });
  },

  /**
   * Initialize default storage on install
   * @returns {Promise<void>}
   */
  async initializeOnInstall() {
    await chrome.storage.local.set({
      [this.KEYS.SETTINGS]: {
        autoScan: true,
        notifyThreshold: 70,
        notificationsEnabled: true,
      },
      [this.KEYS.SCAN_CACHE]: {},
    });
  },

  /**
   * Clear all storage
   * @returns {Promise<void>}
   */
  async clearAll() {
    await chrome.storage.local.clear();
  },

  /**
   * Get all storage data (useful for debugging)
   * @returns {Promise<Object>} All storage data
   */
  async getAllData() {
    return new Promise((resolve) => {
      chrome.storage.local.get(null, (items) => {
        resolve(items);
      });
    });
  },
};

if (typeof globalThis !== 'undefined') {
  globalThis.storageService = storageService;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = storageService;
}
