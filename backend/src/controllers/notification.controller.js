import Notification from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const { recipient } = req.query;
  const filter = {};

  if (recipient === 'admin') {
    // Only admins and staff can query the admin notification feed
    if (!req.user || !['admin', 'manager', 'support'].includes(req.user.role)) {
      throw new ApiError(403, 'Access denied: Admin privileges required.');
    }
    filter.recipient = 'admin';
  } else {
    // Customers see only their own notifications
    filter.recipient = 'customer';
    filter.userId = String(req.user._id);
  }

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return res.status(200).json(
    new ApiResponse(200, notifications, 'Notifications fetched successfully')
  );
});

export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const notification = await Notification.findById(id);
  if (!notification) throw new ApiError(404, 'Notification not found.');

  // Owners or staff can mark read
  const isStaff = ['admin', 'manager', 'support'].includes(req.user.role);
  if (!isStaff && String(notification.userId) !== String(req.user._id)) {
    throw new ApiError(403, 'Access denied.');
  }

  await Notification.findByIdAndUpdate(id, { isRead: true });
  return res.status(200).json(
    new ApiResponse(200, null, 'Notification marked as read')
  );
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  const filter = {};
  if (['admin', 'manager', 'support'].includes(req.user.role)) {
    filter.recipient = 'admin';
  } else {
    filter.recipient = 'customer';
    filter.userId = String(req.user._id);
  }
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
