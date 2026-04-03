# 🛡️ DataShield — Smart Privacy Analysis Frontend

> Reclaim your digital identity. Real-time privacy scanning, risk scoring, and permission monitoring.

---

## 📁 Folder Structure

```
datashield/
├── public/                    # Static HTML shell
│   └── index.html
├── src/
│   ├── App.js                 # Router + layout wrapper
│   ├── index.js               # React entry point
│   ├── index.css              # Global styles + Tailwind
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.js      # Fixed nav with auth state
│   │   │   └── Footer.js      # Footer with links
│   │   ├── ui/
│   │   │   ├── RiskScore.js   # Animated 0-100 ring gauge
│   │   │   ├── PermissionBadge.js  # Live permission indicator
│   │   │   ├── TypeWriter.js  # Animated typing effect
│   │   │   └── ScanLine.js    # Ambient scan line overlay
│   │   ├── sections/
│   │   │   ├── HeroSection.js     # 3D orb + particle field hero
│   │   │   ├── PrivacyGapSection.js  # 3-crisis stats
│   │   │   ├── FeaturesSection.js    # Interactive feature explorer
│   │   │   ├── RiskDemoSection.js    # Live demo with real scores
│   │   │   └── CTASection.js         # Conversion CTA
│   │   └── chatbot/
│   │       └── Chatbot.js     # AI chatbot (Claude-powered)
│   ├── pages/
│   │   ├── Home.js            # Landing page
│   │   ├── Scanner.js         # URL scanner with progress
│   │   ├── Monitor.js         # Live permission monitor
│   │   ├── Dashboard.js       # User dashboard + charts
│   │   ├── Login.js           # Auth login page
│   │   └── Register.js        # Auth register page
│   ├── context/
│   │   └── AuthContext.js     # Global auth state
│   ├── hooks/
│   │   ├── useScanner.js      # Scan logic + progress simulation
│   │   └── useMonitor.js      # Live permission event stream
│   └── utils/
│       └── api.js             # Axios API client + free APIs
├── extension/
│   ├── manifest.json          # Chrome Extension Manifest v3
│   ├── popup.html             # Extension popup UI
│   ├── popup.js               # Popup logic
│   ├── background.js          # Service worker
│   └── content.js             # Page injection script
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Start development server
```bash
npm start
```
App runs at `http://localhost:3000`

### 3. Environment variables
Create `.env` in root:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 |
| Styling | Tailwind CSS + Custom CSS |
| Animation | CSS Keyframes + Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| Routing | React Router v6 |
| State | React Context + Zustand |
| HTTP | Axios |
| Notifications | React Hot Toast |
| AI Chatbot | Anthropic Claude API |
| Fonts | Orbitron + JetBrains Mono + DM Sans |

---

## 🌐 Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, features, demo |
| `/scanner` | Paste any URL for full privacy scan |
| `/monitor` | Live permission feed with kill-switch |
| `/dashboard` | Personal dashboard + scan history |
| `/login` | Authentication |
| `/register` | Account creation |

---

## 🔌 Backend Integration

The frontend calls your Node.js API (see backend folder):

```
POST /api/scan/website    → Full site scan
POST /api/scan/policy     → TOS-only scan
POST /api/scan/compare    → Compare 2 URLs
GET  /api/monitor/permissions → Live permissions
POST /api/auth/login      → JWT login
POST /api/auth/register   → Register
```

---

## 🧩 Browser Extension

Located in `/extension/`. To install:

1. Open Chrome → `chrome://extensions`
2. Enable **Developer Mode**
3. Click **Load unpacked**
4. Select the `/extension` folder

### Extension Features:
- **Popup**: Shows risk score for current tab
- **Background**: Auto-scans on navigation, shows badge score
- **Content Script**: Intercepts `getUserMedia`, `clipboard`, `geolocation` calls in real-time

---

## 🎨 Design System

```css
/* Colors */
--accent:  #00f5ff  /* Cyan — primary actions */
--green:   #00ff88  /* Safe / low risk */
--red:     #ff2d55  /* Danger / high risk */
--orange:  #ff6b00  /* Medium risk */
--bg-900:  #030712  /* Darkest background */
--bg-800:  #0a0f1e  /* Card backgrounds */

/* Fonts */
Orbitron     → Headings, logos, scores (display)
JetBrains Mono → Code, labels, terminal (mono)
DM Sans      → Body copy, descriptions
```

---

## 🤖 AI Chatbot

The chatbot calls the Anthropic Claude API directly from the browser with a DataShield-specific system prompt. It explains features, answers privacy questions, and provides platform guidance.

> ⚠️ In production, proxy this through your Node.js backend to protect your API key.

---

## 🔑 Free APIs Used

| API | Purpose |
|-----|---------|
| Anthropic Claude | AI chatbot |
| `api.whois.vu` | Domain WHOIS lookup |
| `api.ssllabs.com` | SSL certificate check |
| Google Fonts | Typography |

---

## 📦 Build for Production

```bash
npm run build
```

Output in `/build` — deploy to Vercel, Netlify, or serve via Nginx.

---

## 🗺️ Full Project Roadmap

```
Phase 1 (Current)  → React Frontend + Chrome Extension
Phase 2            → Node.js API Gateway + MongoDB
Phase 3            → Python FastAPI NLP Engine (spaCy/HuggingFace)
Phase 4            → Enterprise Dashboard + Public REST API
Phase 5            → Mobile App (React Native)
```

---

*DataShield — Making Privacy Simple, Transparent, and Actionable.*
