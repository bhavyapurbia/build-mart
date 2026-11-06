import { createUnifiedModel } from './dbAdapter.js';

const Notification = createUnifiedModel('Notification', {
  recipient: { type: String, enum: ['admin', 'customer'], default: 'admin' },
  userId: { type: String },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['material_request', 'quotation', 'order', 'labour', 'bulk', 'stock'],
    default: 'material_request'
  },
  referenceId: { type: String },
  link: { type: String },
  isRead: { type: Boolean, default: false }
});

export default Notification;
export { Notification };

