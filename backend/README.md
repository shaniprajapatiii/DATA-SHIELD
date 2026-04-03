# DataShield Backend

Complete backend infrastructure for DataShield privacy analysis platform, featuring a dual-tier architecture: Node.js API gateway + Python NLP engine.

## Architecture Overview

```
┌─────────────────────┐
│   Frontend (React)  │
└──────────┬──────────┘
           │ HTTP/REST
           ↓
┌─────────────────────────────────┐
│   Node.js API Gateway           │
│ • Auth (JWT + bcrypt)           │
│ • User Management               │
│ • Scan Orchestration            │
│ • MongoDB Integration           │
│ • Rate Limiting & Security      │
└─────────────┬───────────────────┘
              │ HTTP
              ↓
┌─────────────────────────────────┐
│   Python NLP Engine (FastAPI)   │
│ • Web Scraping                  │
│ • Policy Analysis               │
│ • Permission Detection          │
│ • Sentiment Analysis            │
│ • Risk Scoring                  │
└─────────────────────────────────┘
```

## Table of Contents

- [Quick Start](#quick-start)
- [Node.js Backend Setup](#nodejs-backend-setup)
- [Python Backend Setup](#python-backend-setup)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Development](#development)
- [Deployment](#deployment)

## Quick Start

### Prerequisites

- **Node.js**: v18+ ([Download](https://nodejs.org/))
- **Python**: v3.9+ ([Download](https://www.python.org/))
- **MongoDB**: v5+ (Local or Atlas)
- **npm** or **yarn**

### 1. Setup Node.js Backend

```bash
cd backend/node

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your configuration
nano .env

# Start development server
npm run dev

# Or production
npm start
```

### 2. Setup Python Backend

```bash
cd backend/python

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Create .env file
cp .env.example .env

# Start uvicorn server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Node.js Backend Setup

### File Structure

```
node/
├── config/
│   └── constants.js          # Configuration constants
├── controllers/
│   └── scanController.js     # Business logic for scans
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── models/
│   ├── User.js              # User schema
│   └── Scan.js              # Scan results schema
├── routes/
│   ├── auth.js              # Authentication endpoints
│   ├── scan.js              # Scan management endpoints
│   └── policy.js            # Policy analysis endpoints
├── utils/
│   └── helpers.js           # Utility functions
├── server.js                # Express app entry point
├── package.json             # Dependencies (latest versions)
└── .env                     # Environment configuration
```

### Dependencies (package.json)

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.18.2 | Web framework |
| mongoose | ^8.0.3 | MongoDB ODM |
| jsonwebtoken | ^9.1.2 | JWT authentication |
| bcryptjs | ^2.4.3 | Password hashing |
| cors | ^2.8.5 | Cross-Origin Resource Sharing |
| helmet | ^7.1.0 | Security headers |
| express-rate-limit | ^7.1.5 | Rate limiting |
| morgan | ^1.10.0 | HTTP logging |
| express-validator | ^7.0.0 | Input validation |
| dotenv | ^16.3.1 | Environment variables |
| axios | ^1.6.2 | HTTP client |

### Key Features

- **Authentication**: JWT-based with bcrypt password hashing
- **Authorization**: Role-based access control (user, admin, enterprise)
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configurable origin whitelist
- **Security**: Helmet.js for secure HTTP headers
- **Data Validation**: express-validator for input sanitization
- **Error Handling**: Global error handler with proper HTTP status codes

### API Endpoints

#### Authentication

```bash
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh-token
POST /api/auth/forgot-password
POST /api/auth/reset-password/:token
```

#### Scans

```bash
POST   /api/scan/url          # Scan a website
POST   /api/scan/text         # Analyze policy text
POST   /api/scan/compare      # Compare two URLs
GET    /api/scan/history      # Get user's scan history
GET    /api/scan/:scanId      # Get scan details
DELETE /api/scan/:scanId      # Delete a scan
```

#### Policy Analysis

```bash
GET    /api/policy/summary/:scanId    # Get AI summary
POST   /api/policy/live-summary       # Quick analysis
POST   /api/policy/track              # Subscribe to policy tracking
GET    /api/policy/tracked            # View tracked policies
```

## Python Backend Setup

### File Structure

```
python/
├── main.py                  # FastAPI app initialization
├── routers/
│   ├── analyze.py          # Full pipeline endpoints
│   └── scan.py             # Permission scanning endpoints
├── services/
│   ├── scraper.py          # Web scraping & permission detection
│   ├── nlp-engine.py       # NLP analysis & red-flag detection
│   └── scorer.py           # Risk scoring algorithm
├── requirements.txt        # Python dependencies
└── .env                    # Environment configuration
```

### Dependencies (requirements.txt)

| Package | Version | Purpose |
|---------|---------|---------|
| fastapi | 0.104.1 | Web framework |
| uvicorn | 0.24.0 | ASGI server |
| pydantic | 2.5.0 | Data validation |
| requests | 2.31.0 | HTTP client |
| beautifulsoup4 | 4.12.2 | HTML parsing |
| spacy | 3.7.2 | NLP pipelines |
| transformers | 4.35.2 | BERT models |
| torch | 2.1.1 | ML framework |
| vaderSentiment | 3.3.2 | Sentiment analysis |

### Key Features

- **Web Scraping**: Extracts policy text and HTML permission signals
- **NLP Analysis**: Detects red-flag clauses using regex + spaCy
- **Sentiment Analysis**: BERT transformers with VADER fallback
- **Permission Detection**: Camera, microphone, location, clipboard, etc.
- **Risk Scoring**: Weighted multi-factor algorithm
- **Async Processing**: Non-blocking I/O with asyncio
- **Error Handling**: Graceful fallbacks for missing ML models

## Environment Variables

### Node.js (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017/datashield

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# CORS
CLIENT_URL=http://localhost:3000

# Python Engine
PYTHON_ENGINE_URL=http://localhost:8000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Python (.env)

```env
# Server
HOST=0.0.0.0
PORT=8000
ENV=development

# Logging
LOG_LEVEL=INFO

# Scraping
REQUEST_TIMEOUT=15
MAX_REQUESTS_PER_MINUTE=30

# ML Model Fallback
USE_SPACY=true
USE_TRANSFORMERS=true
USE_VADER=true
```

## Database Schema

### User Collection

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String, // 'user' | 'admin' | 'enterprise'
  plan: String, // 'free' | 'pro' | 'enterprise'
  avatar: String,
  isVerified: Boolean,
  preferences: {
    notifications: Boolean,
    riskAlertThreshold: Number,
    theme: String,
    autoScan: Boolean
  },
  apiUsage: {
    scansThisMonth: Number,
    totalScans: Number,
    lastReset: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Scan Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  targetUrl: String,
  riskScore: Number (0-100),
  riskLabel: String,
  scoreBreakdown: {
    permissionScore: Number,
    sentimentScore: Number,
    redFlagScore: Number,
    transparencyScore: Number
  },
  permissions: [{
    name: String,
    risk: String,
    detected: Boolean,
    description: String
  }],
  redFlags: [{
    category: String,
    severity: String,
    clause: String,
    explanation: String,
    lineRef: Number
  }],
  policyFindings: {
    dataCollected: [String],
    sharedWith: [String],
    retentionDays: Number,
    gdprCompliant: Boolean,
    ccpaCompliant: Boolean
  },
  sentiment: {
    score: Number,
    label: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Development

### Running Both Services

**Terminal 1 - Node Backend:**

```bash
cd backend/node
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 - Python Backend:**

```bash
cd backend/python
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn main:app --reload --port 8000
# Runs on http://localhost:8000/docs (Swagger UI)
```

**Terminal 3 - Frontend (optional):**

```bash
cd frontend
npm start
# Runs on http://localhost:3000
```

### Testing

```bash
# Node tests
cd backend/node
npm test

# Python tests
cd backend/python
pytest --cov
```

### Linting

```bash
# Node
npm run lint

# Python
pylint services/ routers/
flake8 .
mypy .
```

## Deployment

### Docker

```dockerfile
# Node
FROM node:18-alpine
WORKDIR /app
COPY backend/node .
RUN npm install --production
EXPOSE 5000
CMD ["npm", "start"]
```

```dockerfile
# Python
FROM python:3.11-slim
WORKDIR /app
COPY backend/python .
RUN pip install -r requirements.txt && python -m spacy download en_core_web_sm
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Setup for Production

1. Use MongoDB Atlas instead of local MongoDB
2. Set `NODE_ENV=production` and `ENV=production`
3. Generate strong `JWT_SECRET`
4. Configure production `CLIENT_URL` CORS origin
5. Enable HTTPS/TLS
6. Set up monitoring and logging (e.g., CloudWatch, DataDog)
7. Use environment secrets management (AWS Secrets Manager, etc.)

## Troubleshooting

### MongoDB Connection Failed

```bash
# Check local MongoDB is running
mongod --version
# Or use MongoDB Atlas URI in .env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/datashield
```

### Python Model Download Issues

```bash
# Manually download spaCy model
python -m spacy download en_core_web_sm

# Verify installation
python -c "import spacy; nlp = spacy.load('en_core_web_sm'); print('✅ spaCy ready')"
```

### Port Already in Use

```bash
# Node (5000)
lsof -i :5000
kill -9 <PID>

# Python (8000)
lsof -i :8000
kill -9 <PID>
```

### CORS Errors

Check that `CLIENT_URL` in Node `.env` matches your frontend origin, and that Python backend includes Node gateway in `allow_origins`.

## Performance Optimization

- **Caching**: Redis for session tokens and policy cache
- **Pagination**: Implement cursor-based pagination for scan history
- **Async**: Use connection pooling for MongoDB
- **Timeouts**: Configure reasonable HTTP timeouts (30-60s for scraping)
- **Monitoring**: Add APM tools (New Relic, DataDog)

## Security Best Practices

✅ HTTPS/TLS in production  
✅ JWT expiration (7 days)  
✅ Password hashing (bcryptjs)  
✅ Rate limiting (100/15min)  
✅ CORS whitelist  
✅ Helmet security headers  
✅ Input validation (express-validator)  
✅ SQL injection prevention (Mongoose ORM)  
✅ Environment secrets (dotenv)  
✅ OWASP Top 10 compliance  

## Support

For issues, questions, or contributions, please refer to the main [README.md](../README.md) in the root directory.

---

**Last Updated**: April 2026  
**Node Version**: v18+  
**Python Version**: v3.9+  
**MongoDB**: v5+
