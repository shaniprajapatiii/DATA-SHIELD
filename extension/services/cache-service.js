/**
 * Cache Service
 * Manages caching of scan results
 */

const cacheService = {
  CACHE_TTL_MS: 30 * 60 * 1000, // 30 minutes
  MAX_CACHE_ENTRIES: 100,

  /**
   * Get cached result for a URL
   * @param {String} url - URL to check cache for
   * @returns {Promise<Object|null>} Cached result or null
   */
  async getCachedResult(url) {
    const domain = this.extractDomain(url);
    const { scanCache = {} } = await chrome.storage.local.get('scanCache');
    const entry = scanCache[domain];

    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.CACHE_TTL_MS) return null;

    return entry.data;
  },

  /**
   * Cache a scan result
   * @param {String} url - URL of the scan
   * @param {Object} data - Scan result data
   * @returns {Promise<void>}
   */
  async cacheResult(url, data) {
    const domain = this.extractDomain(url);
    const { scanCache = {} } = await chrome.storage.local.get('scanCache');

    scanCache[domain] = {
      data,
      timestamp: Date.now(),
    };

    // Cleanup: only keep 100 most recent entries
    const keys = Object.keys(scanCache);
    if (keys.length > this.MAX_CACHE_ENTRIES) {
      const oldest = keys.sort(
        (a, b) => scanCache[a].timestamp - scanCache[b].timestamp
      )[0];
      delete scanCache[oldest];
    }

    await chrome.storage.local.set({ scanCache });
  },

  /**
   * Clear all cached results
   * @returns {Promise<void>}
   */
  async clearCache() {
    await chrome.storage.local.set({ scanCache: {} });
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

  /**
   * Get cache statistics
   * @returns {Promise<Object>} Cache stats
   */
  async getCacheStats() {
    const { scanCache = {} } = await chrome.storage.local.get('scanCache');
    const keys = Object.keys(scanCache);
    return {
      entries: keys.length,
      maxEntries: this.MAX_CACHE_ENTRIES,
      oldest: keys.length ? Math.min(...keys.map(k => scanCache[k].timestamp)) : null,
      newest: keys.length ? Math.max(...keys.map(k => scanCache[k].timestamp)) : null,
    };
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = cacheService;
}
