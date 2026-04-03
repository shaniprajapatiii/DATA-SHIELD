const jwt  = require('jsonwebtoken');
const User = require('../models/User');

/**
 * authMiddleware
 * Verifies the Bearer JWT (or cookie) and attaches req.user.
 * Returns 401 on any failure.
 */
const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // 1. Check Authorization header  (Bearer <token>)
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 2. Fall back to httpOnly cookie
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // 3. Verify signature & expiry
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'datashield_secret_key'
    );

    // 4. Confirm user still exists
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    // 5. Check scan quota (non-blocking — just attach info)
    req.user        = user;
    req.canScan     = user.canScan();

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Authentication error' });
  }
};

module.exports = authMiddleware;
