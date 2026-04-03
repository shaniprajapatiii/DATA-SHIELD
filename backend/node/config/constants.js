// Environment configuration
module.exports = {
  // MongoDB
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/datashield',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'datashield_secret_key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // Server
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // CORS
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',

  // Python Engine
  PYTHON_ENGINE_URL: process.env.PYTHON_ENGINE_URL || 'http://localhost:8000',

  // Security
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,

  // Scan Limits by Plan
  SCAN_LIMITS: {
    free: 10,
    pro: 200,
    enterprise: Infinity,
  },
};
