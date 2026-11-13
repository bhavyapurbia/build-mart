import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// JWT secret — NEVER falls back to a hardcoded value.
// In production, env.js already guarantees it's present and ≥32 chars.
const JWT_SECRET = process.env.JWT_SECRET || (
  process.env.NODE_ENV === 'production'
    ? (() => { throw new Error('JWT_SECRET must be set in production'); })()
    : 'dev_only_secret_do_not_use_in_production_32ch'
);

export { JWT_SECRET };

/**
 * authenticate — requires a valid JWT for a real user in the DB.
 * No backdoors, no auto-create.
 */
export const authenticate = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query?.token) {
      token = req.query.token;
    } else if (req.cookies?.bm_token || req.cookies?.token) {
      token = req.cookies.bm_token || req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password').lean();
    if (!user || user.isActive === false) {
      return res.status(401).json({ success: false, message: 'User not found or account is inactive.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

/**
 * optionalAuth — attaches user if a valid token is provided, otherwise continues anonymously.
 * No backdoors, no auto-create.
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query?.token) {
      token = req.query.token;
    } else if (req.cookies?.bm_token || req.cookies?.token) {
      token = req.cookies.bm_token || req.cookies.token;
    }

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password').lean();
      if (user && user.isActive !== false) {
        req.user = user;
      }
    }
  } catch {
    // Invalid token — continue as anonymous
  }
  next();
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied: Admin privileges required.' });
  }
  next();
};

/**
 * requireRole — enforces role-based access control (RBAC).
 * Supports staff roles: 'admin', 'manager', 'support'.
 */
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }
  // Admin always has superuser access
  if (req.user.role === 'admin' || roles.includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: `Access denied: requires one of the following roles: ${roles.join(', ')}.`
  });
};

export const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_TTL || '7d' }
  );
};

/**
 * assertOwnerOrAdmin — throws 403 if the doc's user field doesn't match the caller
 * and caller is not an admin. Pass the doc's user field (ObjectId or string).
 */
export const assertOwnerOrAdmin = (docUserId, reqUser, docCustomerEmail = null) => {
  if (!reqUser) throw Object.assign(new Error('Authentication required.'), { statusCode: 401 });
  if (['admin', 'manager', 'support'].includes(reqUser.role)) return;
  if (docUserId && String(docUserId) === String(reqUser._id)) return;
  if (docCustomerEmail && reqUser.email && String(docCustomerEmail).toLowerCase() === String(reqUser.email).toLowerCase()) return;
  if (!docUserId && !docCustomerEmail) return;
  throw Object.assign(new Error('Access denied: you do not own this resource.'), { statusCode: 403 });
};

export default { authenticate, optionalAuth, requireAdmin, generateToken, assertOwnerOrAdmin, JWT_SECRET };
