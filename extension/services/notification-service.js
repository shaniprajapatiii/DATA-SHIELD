/**
 * Notification Service
 * Manages desktop notifications for high-risk sites
 */

const DATA_SHIELD_ICON_URL = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0ea5e9"/>
      <stop offset="100%" stop-color="#6366f1"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="16" fill="#0a0e1a"/>
  <path d="M32 10L14 18v13c0 12.5 8.8 22.6 18 26 9.2-3.4 18-13.5 18-26V18L32 10z" fill="url(#g)" opacity="0.18" stroke="url(#g)" stroke-width="2.5"/>
  <path d="M26 32l4.5 4.5L39 28" fill="none" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`)}`;

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
      iconUrl: DATA_SHIELD_ICON_URL,
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
      iconUrl: DATA_SHIELD_ICON_URL,
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

if (typeof globalThis !== 'undefined') {
  globalThis.notificationService = notificationService;
}

// Setup notification button click listener
chrome.notifications.onButtonClicked.addListener((_notifId) => {
  chrome.tabs.create({ url: 'http://localhost:3000/dashboard' });
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = notificationService;
}
