{
  "manifest_version": 3,
  "name": "DataShield – Privacy Analyzer",
  "short_name": "DataShield",
  "version": "1.0.0",
  "description": "Real-time privacy risk scoring for every website you visit. Powered by AI.",

  "icons": {
    "16":  "icons/icon16.png",
    "32":  "icons/icon32.png",
    "48":  "icons/icon48.png",
    "128": "icons/icon128.png"
  },

  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16":  "icons/icon16.png",
      "32":  "icons/icon32.png",
      "48":  "icons/icon48.png",
      "128": "icons/icon128.png"
    },
    "default_title": "DataShield – Click to scan this page"
  },

  "background": {
    "service_worker": "background.js",
    "type": "module"
  },

  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_idle",
      "all_frames": false
    }
  ],

  "permissions": [
    "activeTab",
    "storage",
    "tabs",
    "webRequest",
    "notifications",
    "cookies"
  ],

  "host_permissions": [
    "<all_urls>"
  ],

  "web_accessible_resources": [
    {
      "resources": ["icons/*", "popup.html"],
      "matches": ["<all_urls>"]
    }
  ],

  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  },

  "commands": {
    "scan-current-tab": {
      "suggested_key": {
        "default": "Ctrl+Shift+S",
        "mac":     "Command+Shift+S"
      },
      "description": "Scan the current tab with DataShield"
    }
  }
}