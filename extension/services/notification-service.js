/**
 * Notification Service
 * Manages desktop notifications for high-risk sites
 */

const notificationService = {
  /**
   * Send notification for high-risk scan result
   * @param {Object} tab - Chrome tab object
   * @param {Object} result - Scan result
   * @param {Object} settings - User settings
   */
  async notifyIfNeeded(tab, result, settings) {
    if (!settings?.notificationsEnabled) return;
    if (result.risk_score < (settings.notifyThreshold || 70)) return;

    const domain = this.extractDomain(tab.url);
    const tldr = result.summary?.tldr || 'High-risk privacy policy detected';

    chrome.notifications.create(`scan-${tab.id}`, {
      type:    'basic',
      iconUrl: 'icons/icon48.png',
      title:   '⚠ DataShield – High Risk Detected',
      message: `${domain} scored ${result.risk_score}/100. ${tldr}`,
      buttons: [{ title: 'View Full Report' }],
      priority: 2,
    });
  },

  /**
   * Send generic notification
   * @param {String} title - Notification title
   * @param {String} message - Notification message
   * @param {Object} options - Additional options
   */
  notify(title, message, options = {}) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title,
      message,
      ...options,
    });
  },

  /**
   * Extract domain from URL
   * @param {String} url - Full URL
   * @returns {String} Domain name
   */
  extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  },
};

// Setup notification button click listener
chrome.notifications.onButtonClicked.addListener((_notifId) => {
  chrome.tabs.create({ url: 'http://localhost:3000/dashboard' });
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = notificationService;
}
