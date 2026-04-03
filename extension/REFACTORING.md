# DataShield Browser Extension – Refactored Structure

## 📁 Folder Organization

```
extension/
├── css/
│   └── popup.css                 # Popup styling (separated from HTML)
├── utils/
│   ├── dom-scanner.js           # Permission API & cookie banner detection
│   ├── page-parser.js           # Extract page metadata and content
│   ├── policy-finder.js         # Find privacy policy links
│   └── risk-overlay.js          # Risk indicator UI injection
├── services/
│   ├── auth-service.js          # Token management
│   ├── badge-service.js         # Extension icon badge updates
│   ├── cache-service.js         # Result caching with TTL
│   ├── notification-service.js  # Desktop notifications
│   ├── scan-service.js          # API scan requests
│   └── storage-service.js       # Chrome storage management
├── content.js                   # (OLD - Use content-refactored.js)
├── background.js                # (OLD - Use background-refactored.js)
├── content-refactored.js        # NEW - Uses utility modules
├── background-refactored.js     # NEW - Uses service modules
├── popup.html                   # Popup UI (now references external CSS & JS)
├── popup.js                     # Popup logic (separated from HTML)
├── manifest.json                # MV3 manifest
└── README.md                    # Extension documentation
```

## 🔄 Migration Guide

### To Use Refactored Files

1. **Update manifest.json** to reference new files:
   ```json
   {
     "content_scripts": [
       {
         "matches": ["<all_urls>"],
         "js": [
           "utils/dom-scanner.js",
           "utils/page-parser.js",
           "utils/policy-finder.js",
           "utils/risk-overlay.js",
           "content-refactored.js"
         ],
         "run_at": "document_idle"
       }
     ],
     "background": {
       "service_worker": "background-refactored.js",
       "type": "module"
     }
   }
   ```

2. **Update popup.html** to reference external CSS:
   ```html
   <link rel="stylesheet" href="css/popup.css" />
   <script src="popup.js"></script>
   ```

3. **Add service scripts to manifest**:
   ```json
   {
     "background": {
       "service_worker": "background-refactored.js",
       "scripts": [
         "services/auth-service.js",
         "services/badge-service.js",
         "services/cache-service.js",
         "services/notification-service.js",
         "services/scan-service.js",
         "services/storage-service.js"
       ]
     }
   }
   ```

## 📦 Module Organization

### Utils (DOM & Page Manipulation)
- **dom-scanner.js** - Detects permission API calls and cookie banners
- **page-parser.js** - Extracts page metadata, HTML, and text
- **policy-finder.js** - Finds privacy policy links
- **risk-overlay.js** - Manages visual risk indicators

### Services (Business Logic)
- **auth-service.js** - Manages JWT tokens
- **badge-service.js** - Updates extension icon badge
- **cache-service.js** - Caches scan results (30-min TTL)
- **notification-service.js** - Sends desktop notifications
- **scan-service.js** - Communicates with backend API
- **storage-service.js** - Manages chrome.storage operations

### Views
- **popup.html** + **popup.js** + **css/popup.css** - Separated concerns
- **content-refactored.js** - Uses utility modules
- **background-refactored.js** - Uses service modules

## 🚀 Features

### Automatic Scanning
- Auto-scans pages on navigation (configurable)
- Caches results for 30 minutes per domain
- Updates icon badge with risk level

### Risk Display
- Floating overlay indicator on page
- Animated score ring in popup
- Permission badges and red-flag cards
- AI-generated summary bullets

### Notifications
- Desktop notifications for high-risk sites
- Configurable risk threshold
- Quick link to dashboard

### Caching & Performance
- 30-minute TTL per domain
- Max 100 cached entries (auto-cleanup)
- Non-blocking background updates

## 🔒 Security Features
- JWT authentication
- Secure token storage in chrome.storage
- HTTPS only API communication
- XSS prevention in DOM parsing
- CSP compliance

## 📝 Configuration

Settings stored in `chrome.storage.local`:
```json
{
  "settings": {
    "autoScan": true,               // Auto-scan on navigation
    "notifyThreshold": 70,          // Alert when risk > 70
    "notificationsEnabled": true    // Desktop notifications
  },
  "scanCache": {
    "domain.com": {
      "data": { /* scan result */ },
      "timestamp": 1234567890
    }
  }
}
```

## 🛠 Development

### Adding a New Utility
1. Create file in `utils/` folder
2. Implement module functions
3. Export for use in content.js

### Adding a New Service
1. Create file in `services/` folder
2. Implement service methods
3. Include script in manifest background section

### Testing
- Load extension as unpacked from this folder
- Open DevTools on extension pages
- Check Service Worker console for background.js errors
- Check content script console for content.js errors
