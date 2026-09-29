const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/response');

class NotificationController {
  static async listUserNotifications(req, res, next) {
    try {
      const notifications = await Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(50);

      const unreadCount = await Notification.countDocuments({
        user: req.user._id,
        read: false,
      });

      return successResponse(res, {
        notifications,
        unreadCount,
      });
    } catch (err) {
      next(err);
    }
  }

  static async markAsRead(req, res, next) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { read: true },
        { new: true }
      );

      if (!notification) {
        return errorResponse(res, 'Notification not found', 404, 'NOT_FOUND');
      }

      return successResponse(res, notification, 200, 'Notification marked as read');
    } catch (err) {
      next(err);
    }
  }

  static async markAllAsRead(req, res, next) {
    try {
      await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
      return successResponse(res, null, 200, 'All notifications marked as read');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = NotificationController;
