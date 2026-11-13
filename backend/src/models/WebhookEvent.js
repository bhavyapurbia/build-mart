import mongoose from 'mongoose';

const webhookEventSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true, trim: true },
  eventType: { type: String, required: true },
  payload: { type: mongoose.Schema.Types.Mixed },
  processedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  minimize: false
});

const WebhookEvent = mongoose.models.WebhookEvent || mongoose.model('WebhookEvent', webhookEventSchema);

export default WebhookEvent;
export { WebhookEvent };
