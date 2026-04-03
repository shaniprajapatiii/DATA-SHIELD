/**
 * Policy Finder Utility
 * Finds and extracts privacy policy related links from the page
 */

const policyFinder = {
  /**
   * Keywords associated with privacy policies and legal documents
   */
  POLICY_KEYWORDS: ['privacy', 'terms', 'legal', 'cookie', 'gdpr', 'data-policy'],

  /**
   * Find privacy policy / TOS links in the page
   * @returns {Array} Array of found policy links
   */
  getPrivacyLinks() {
    const links = [];

    document.querySelectorAll('a[href]').forEach((a) => {
      const href = a.href.toLowerCase();
      const text = a.textContent.trim().toLowerCase();
      if (this.POLICY_KEYWORDS.some((k) => href.includes(k) || text.includes(k))) {
        links.push({ href: a.href, text: a.textContent.trim().slice(0, 60) });
      }
    });

    // Deduplicate by href
    const seen = new Set();
    return links.filter(({ href }) => {
      if (seen.has(href)) return false;
      seen.add(href);
      return true;
    }).slice(0, 10); // Return top 10 links
  },

  /**
   * Auto-discover privacy policy link on the page
   * @returns {String|null} URL of privacy policy link
   */
  findPolicyLink() {
    const links = this.getPrivacyLinks();
    if (links.length > 0) {
      return links[0].href;
    }
    return null;
  },
};

if (typeof globalThis !== 'undefined') {
  globalThis.policyFinder = policyFinder;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = policyFinder;
}
