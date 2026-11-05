const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const { recipient } = req.query;
    const filter = {};
    if (recipient) filter.recipient = recipient;
    if (recipient === 'customer' && req.user) {
      filter.userId = String(req.user._id);
    }

    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(30);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notifications', error: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating notification', error: err.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const { recipient } = req.body;
    const filter = {};
    if (recipient) filter.recipient = recipient;
    await Notification.updateMany(filter, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Error marking notifications as read', error: err.message });
  }
};

