/**
 * Badge Service
 * Manages extension icon badge updates
 */

const badgeService = {
  /**
   * Risk score to badge mapping
   */
  BADGE_CONFIG: {
    safe:     { color: '#22c55e', text: '✓' },
    low:      { color: '#84cc16', text: 'L' },
    moderate: { color: '#eab308', text: '!' },
    high:     { color: '#f97316', text: '!!' },
    critical: { color: '#ef4444', text: '!!!' },
  },

  /**
   * Update badge based on risk score
   * @param {Number} tabId - Tab ID
   * @param {Number} score - Risk score (0-100)
   */
  updateBadge(tabId, score) {
    if (score == null) return;

    let label, text;
    if      (score <= 20) label = 'safe';
    else if (score <= 40) label = 'low';
    else if (score <= 60) label = 'moderate';
    else if (score <= 80) label = 'high';
    else                  label = 'critical';

    const config = this.BADGE_CONFIG[label];

    chrome.action.setBadgeText({ text: config.text, tabId });
    chrome.action.setBadgeBackgroundColor({ color: config.color, tabId });
  },

  /**
   * Clear badge
   * @param {Number} tabId - Tab ID
   */
  clearBadge(tabId) {
    chrome.action.setBadgeText({ text: '', tabId });
  },

  /**
   * Get badge for a risk label
   * @param {String} label - Risk label
   * @returns {Object} Badge configuration
   */
  getBadgeForLabel(label) {
    return this.BADGE_CONFIG[label] || this.BADGE_CONFIG.moderate;
  },
};

if (typeof globalThis !== 'undefined') {
  globalThis.badgeService = badgeService;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = badgeService;
}
