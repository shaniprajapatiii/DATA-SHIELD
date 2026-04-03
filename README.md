# DataShield Features

## Intro
**DataShield** is not just another privacy tool - it is a **CATEGORY-DEFINING PRIVACY INTELLIGENCE PLATFORM** built to lead the next generation of digital safety.

This project is a unique, all-in-one privacy layer that combines **POLICY INTELLIGENCE**, **REAL-TIME PERMISSION VISIBILITY**, and **ACTIONABLE RISK SCORING** in one unified system. Instead of dumping legal complexity, DataShield converts hidden threats into instant, clear decisions users can take.

From scanner to extension to live monitoring and alerts, DataShield is engineered as one complete ecosystem with one mission: make privacy simple, transparent, powerful, and proactive.

## Highlighted Power Features
- **BROWSER EXTENSION (REAL-TIME + LIVE TIME):** Monitors permission behavior live while users browse.
- **INSTANT USER NOTIFICATIONS:** Detects risky activity and immediately notifies users.
- **URL-BASED MONITORING:** Enter any URL and get privacy and risk intelligence.
- **LIVE TRACKING:** Track policy behavior and risk evolution over time.
- **UNIFIED RISK SCORE (0-100):** One clear metric to understand safety instantly.
- **SMART PRIVACY EXPLANATION:** Converts legal and technical complexity into readable, practical guidance.
- **PROACTIVE PRIVACY DEFENSE:** Not just analysis - recommendations and alert-driven action.

## Added Important Features
- **RISK EVOLUTION TIMELINE:** Visual history of how a website/app risk score changes over days and weeks.
- **PRIVACY CHANGE DIFF VIEW:** Highlights exactly what changed in policy updates (added/removed risky clauses).
- **ONE-CLICK SAFETY ACTIONS:** Recommended privacy actions users can apply instantly.
- **ALERT SEVERITY TIERS:** Critical, high, medium, and informational alert channels.
- **HIGH-RISK AUTO WATCHLIST:** Automatically tracks domains/apps with repeated risky behavior.
- **TRUST PROFILE SNAPSHOT:** Quick card showing data collection intensity, sharing level, and retention posture.
- **FAST SAFE-ALTERNATIVE DISCOVERY:** Compare risky platform vs safer alternative in one view.
- **MULTI-SOURCE ANALYSIS INPUT:** URL scan, pasted policy text, and browser behavioral signal fusion.

## Powerful Features (Next Level)
- **EXPLAINABLE AI RISK ENGINE:** Every score includes evidence and explanation, not a black-box number.
- **REAL-TIME THREAT INTEL ENRICHMENT:** Correlate detected signals with known tracker and abuse patterns.
- **PREDICTIVE PRIVACY RISK FORECASTING:** Predict risk trend before major policy shifts impact users.
- **LIVE KILL-SWITCH WORKFLOWS:** Trigger immediate block/disable actions on risky permission activity.
- **ORG COMPLIANCE COMMAND CENTER:** Team dashboards for policy risk, audit logs, and compliance status.
- **WEBHOOK + API ALERT DELIVERY:** Push real-time risk events to Slack, SIEM, SOC, or custom pipelines.
- **ENTERPRISE POLICY GOVERNANCE MODE:** Global guardrails, exceptions, approvals, and risk threshold policies.
- **MODEL-CONFIDENCE SCORING:** Confidence values for policy extraction, sentiment, and risk outputs.

## Core Privacy Analysis Features
- Website URL scanning for privacy risk detection
- Privacy policy and terms extraction from target websites
- NLP-based legal text analysis
- Red-flag clause detection from policy text
- Policy sentiment classification (Hostile, Neutral, Protective)
- Unified 0-100 privacy risk score generation
- Risk label mapping (safe, low, moderate, high, critical)
- Score breakdown output for risk components
- Actionable summary output (TL;DR + bullet points)
- Policy findings extraction (data collection, sharing, retention signals)

## Permission Intelligence Features
- Permission/API signal detection from page content
- Permission category support: camera
- Permission category support: microphone
- Permission category support: location
- Permission category support: clipboard
- Permission category support: contacts
- Permission category support: storage
- Permission category support: notifications
- Permission category support: sensors
- Permission category support: bluetooth
- Permission category support: USB
- Permission-level risk tagging
- Permission-only risk fallback when policy is unavailable
- Mock NLP permission-risk fallback when live fetching fails

## Scanning and Fallback Features
- Full live scan flow (policy + permissions + score)
- Text-based policy analysis endpoint (paste policy text)
- Automatic policy-missing fallback to permission scan
- Explicit permissions-only scan endpoint
- Partial-result mode with fallback reason metadata
- Scan result persistence for authenticated users
- User scan history pagination and retrieval
- Single scan lookup and scan deletion

## Policy Management Features
- Fetch summary for saved scan
- Live policy summary endpoint
- Track policy changes by URL
- List tracked policy URLs
- Remove tracked URL
- Aggregate red-flag analytics by category

## Authentication and User Features
- User registration with validation
- User login with JWT token generation
- Authenticated profile endpoint (`/me`)
- Token refresh endpoint
- Logout endpoint
- Token-protected scan/policy routes
- Extension auth token sync from web app login state
- Extension auth token clear on logout

## Browser Extension Features
- **CHROME EXTENSION (MANIFEST V3)** architecture
- **REFACTORED MODULAR DESIGN** with separated `utils`, `services`, and popup UI layers
- **BACKGROUND SERVICE WORKER FLOW** for scan orchestration and lifecycle handling
- **CONTENT SCRIPT PAGE EXTRACTION** for DOM, metadata, policy links, and permission signals
- **POPUP RISK DASHBOARD UI** with score ring, permission list, red flags, and summary tabs
- **AUTO-SCAN ON NAVIGATION** (config driven)
- **KEYBOARD SHORTCUT SCAN** for current active tab
- **RISK BADGE SYSTEM** for instant severity visibility on extension icon
- **DESKTOP NOTIFICATION ALERTS** for high-risk results
- **DOMAIN-LEVEL CACHE (TTL)** with auto-cleanup strategy
- **CACHE MANAGEMENT CONTROLS** including clear/reset support
- **AUTH TOKEN MANAGEMENT** (set/get/clear) through extension messaging
- **WEB-TO-EXTENSION TOKEN SYNC** from app login state to extension storage
- **UNAUTHENTICATED STATE HANDLING** in popup and scan responses
- **PERMISSION API DETECTION** from inline scripts and page patterns
- **COOKIE BANNER DETECTION** for privacy-consent visibility signals
- **POLICY LINK DISCOVERY** directly from page anchors
- **PAGE PARSING UTILITIES** for HTML capture, title, metadata, and policy text extraction
- **FLOATING RISK OVERLAY INJECTION** on visited pages
- **CONFIGURABLE NOTIFICATION THRESHOLD** and extension settings persistence
- **SCANNABLE URL VALIDATION** for safe endpoint targeting
- **POPUP CSS/LOGIC SEPARATION** for maintainable UI architecture

## Extension Module Features
- **UTIL: DOM-SCANNER** detects permission APIs and cookie consent banners
- **UTIL: PAGE-PARSER** extracts page title, URL, HTML, metadata, and policy text blocks
- **UTIL: POLICY-FINDER** discovers privacy/terms links with keyword matching
- **UTIL: RISK-OVERLAY** injects and manages floating on-page risk indicator UI
- **SERVICE: AUTH-SERVICE** manages JWT token lifecycle in `chrome.storage`
- **SERVICE: BADGE-SERVICE** maps risk score to color/text badge states
- **SERVICE: CACHE-SERVICE** provides per-domain caching with TTL and entry limits
- **SERVICE: NOTIFICATION-SERVICE** sends high-risk desktop notifications
- **SERVICE: SCAN-SERVICE** handles API scan calls, auth headers, and response normalization
- **SERVICE: STORAGE-SERVICE** manages extension settings and local storage operations

## Frontend Application Features
- Scanner page with URL input and result visualization
- Real-time styled scan progress stages
- Risk score UI component with animated gauge
- **Permission feed cards with status states**
- Policy findings and score-breakdown panels
- Policy-missing fallback indicator in scan results
- **Live monitor page for permission activity**
- **Alert panel for active risky events**
- Block action UI for active permission events
- Dashboard page with risk/trend widgets
- Authentication pages (login/register)

## Chatbot Features
- Platform Q&A chatbot UI
- Suggested prompt support
- Dynamic response path via backend chat route
- External LLM integration support (Anthropic)
- Local fallback chatbot responses when LLM key is unavailable

## Data and Platform Features
- MongoDB persistence for users and scans
- Scan model with permissions, red flags, findings, sentiment, summary
- Rate limiting and security middleware on Node API
- CORS and cookie support
- Health check endpoints for Node and Python services
- Python engine request timing metadata
