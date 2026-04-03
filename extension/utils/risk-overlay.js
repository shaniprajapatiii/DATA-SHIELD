/**
 * Risk Overlay Utility
 * Handles the visual floating indicator showing risk score
 */

const riskOverlay = {
  // ── Risk level to color mapping ────────────────────────────────────────────
  COLORS: {
    safe:     '#22c55e',
    low:      '#84cc16',
    moderate: '#eab308',
    high:     '#f97316',
    critical: '#ef4444',
  },

  ELEMENT_ID: '__datashield_indicator',
  AUTO_HIDE_DELAY: 8000, // 8 seconds

  /**
   * Inject floating risk indicator on the page
   * @param {Number} score - Risk score (0-100)
   * @param {String} label - Risk label (safe, low, moderate, high, critical)
   */
  injectIndicator(score, label) {
    // Remove any existing indicator
    document.getElementById(this.ELEMENT_ID)?.remove();

    const color = this.COLORS[label] || '#38bdf8';
    const el = document.createElement('div');
    el.id = this.ELEMENT_ID;
    el.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 2147483647;
      background: rgba(10,14,26,0.95);
      border: 1px solid ${color};
      border-radius: 12px;
      padding: 10px 14px;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4), 0 0 12px ${color}33;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(8px);
    `;

    el.innerHTML = `
      <div style="
        width: 36px; height: 36px;
        border-radius: 50%;
        background: ${color}22;
        border: 2px solid ${color};
        display: flex; align-items: center; justify-content: center;
        font-size: 14px; font-weight: 800; color: ${color};
      ">${score}</div>
      <div>
        <div style="font-weight:700; font-size:11px; color:${color}; text-transform:uppercase; letter-spacing:0.5px;">
          DataShield
        </div>
        <div style="color:#94a3b8; font-size:11px; margin-top:1px;">
          ${label.charAt(0).toUpperCase() + label.slice(1)} Risk
        </div>
      </div>
      <div style="color:#64748b; font-size:16px; margin-left:4px;">×</div>
    `;

    // Close button handler
    el.querySelector('div:last-child').addEventListener('click', (e) => {
      e.stopPropagation();
      el.remove();
    });

    // Click to open popup
    el.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'OPEN_POPUP' });
    });

    // Add to page and auto-hide
    document.body.appendChild(el);
    setTimeout(() => el?.remove(), this.AUTO_HIDE_DELAY);
  },

  /**
   * Remove the risk indicator
   */
  removeIndicator() {
    document.getElementById(this.ELEMENT_ID)?.remove();
  },
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = riskOverlay;
}
