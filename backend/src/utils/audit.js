import AuditLog from '../models/AuditLog.js';

/**
 * Records an immutable audit log entry for admin actions, price/stock changes, refunds, and settings updates.
 */
export const recordAuditLog = async ({
  actor,
  action,
  entity,
  entityId,
  before = null,
  after = null,
  req = null
}) => {
  try {
    const actorInfo = {
      userId: actor?._id ? String(actor._id) : (actor?.userId || null),
      email: actor?.email || 'system',
      role: actor?.role || 'system'
    };

    const ip = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '') : '';
    const userAgent = req ? (req.headers['user-agent'] || '') : '';

    await AuditLog.create({
      actor: actorInfo,
      action,
      entity,
      entityId: String(entityId),
      before,
      after,
      ip: String(ip),
      userAgent: String(userAgent)
    });
  } catch (err) {
    console.error('[Audit Log] Failed to record audit log:', err.message);
  }
};

export default { recordAuditLog };

