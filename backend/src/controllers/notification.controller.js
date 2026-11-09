import Notification from '../models/Notification.js';
import { asyncHandler, ApiResponse } from '../utils/index.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const { recipient } = req.query;
  const filter = {};
  if (recipient) filter.recipient = recipient;
  if (recipient === 'customer' && req.user) {
    filter.userId = String(req.user._id);
  }

  const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(30);
  return res.status(200).json(
    new ApiResponse(200, notifications, 'Notifications fetched successfully')
  );
});

export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await Notification.findByIdAndUpdate(id, { isRead: true });
  return res.status(200).json(
    new ApiResponse(200, null, 'Notification marked as read')
  );
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  const { recipient } = req.body;
  const filter = {};
  if (recipient) filter.recipient = recipient;
  await Notification.updateMany(filter, { isRead: true });
  return res.status(200).json(
    new ApiResponse(200, null, 'All notifications marked as read')
  );
});

export default {
  getNotifications,
  markAsRead,
  markAllAsRead
};
