import mongoose from 'mongoose';
import { NOTIFICATION_RECIPIENT, NOTIFICATION_TYPE } from '../constants/enums.js';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: String,
    enum: Object.values(NOTIFICATION_RECIPIENT),
    default: NOTIFICATION_RECIPIENT.ADMIN
  },
  userId: { type: String, default: null },
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: Object.values(NOTIFICATION_TYPE),
    default: NOTIFICATION_TYPE.MATERIAL_REQUEST
  },
  referenceId: { type: String, default: '' },
  link: { type: String, default: '' },
  isRead: { type: Boolean, default: false }
}, {
  timestamps: true,
  minimize: false
});

// Appendix C indexes
notificationSchema.index({ recipient: 1, userId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

export default Notification;
export { Notification };
