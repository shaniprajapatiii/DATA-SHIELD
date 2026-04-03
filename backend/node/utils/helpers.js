/**
 * Utility Functions
 * Common helper functions used across the application
 */

/**
 * Format error response
 */
const formatError = (status, message) => ({
  status,
  message,
  timestamp: new Date().toISOString(),
});

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email);
};

/**
 * Sanitize user object (remove sensitive fields)
 */
const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;
  delete userObj.resetPasswordToken;
  delete userObj.resetPasswordExpires;
  delete userObj.verificationToken;
  return userObj;
};

/**
 * Sleep utility for delays
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate random string
 */
const generateRandomString = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

module.exports = {
  formatError,
  isValidEmail,
  sanitizeUser,
  sleep,
  generateRandomString,
};
