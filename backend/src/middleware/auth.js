'use strict';
const jwt = require('jsonwebtoken');

/**
 * PUBLIC_INTERFACE
 * authMiddleware
 *   Express middleware to verify JWT and attach user info to request.
 */
function authMiddleware(req, res, next) {
  /** This is a public function that validates JWT token and attaches req.user. */
  // Expect frontend to send standard bearer token:
  // Authorization: Bearer <JWT>
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: { code: 'AUTH_REQUIRED', message: 'Authorization token required' } });
  }
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: { code: 'CONFIG_ERROR', message: 'JWT secret not configured' } });
    }
    const payload = jwt.verify(token, secret);
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch (e) {
    return res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' } });
  }
}

module.exports = {
  // PUBLIC_INTERFACE
  authMiddleware,
};
