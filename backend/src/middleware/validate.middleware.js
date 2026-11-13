/**
 * validate.middleware.js
 * Rejects requests whose query string or body contain MongoDB operator injection
 * (keys starting with $). express-mongo-sanitize handles most cases but this
 * provides an explicit 400 for operator-injected query params.
 */

/**
 * validateQuery — rejects any query param that is an object (i.e., contained an operator).
 * After express-mongo-sanitize, operator keys are replaced with '_', but the
 * value will still be an object. We also need to reject non-string scalars for
 * fields expected to be strings.
 */
export function rejectOperatorInjection(req, res, next) {
  for (const [key, val] of Object.entries(req.query)) {
    if (val !== null && typeof val === 'object') {
      return res.status(400).json({
        success: false,
        message: `Invalid query parameter: '${key}' must be a string, not an object.`
      });
    }
  }
  next();
}

/**
 * escapeRegExp — safely escapes user input before it's used in a $regex.
 */
export function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

