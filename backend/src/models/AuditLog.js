import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  actor: {
    userId: { type: String, default: null },
    email: { type: String, default: 'system' },
    role: { type: String, default: 'system' }
  },
  action: { type: String, required: true },
  entity: { type: String, required: true },
  entityId: { type: String, required: true },
  before: { type: mongoose.Schema.Types.Mixed, default: null },
  after: { type: mongoose.Schema.Types.Mixed, default: null },
  diff: { type: mongoose.Schema.Types.Mixed, default: null },
  ip: { type: String, default: '' },
  userAgent: { type: String, default: '' }
}, {
  timestamps: true,
  minimize: false
});

auditLogSchema.index({ 'actor.userId': 1, createdAt: -1 });
auditLogSchema.index({ entity: 1, entityId: 1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
export { AuditLog };

