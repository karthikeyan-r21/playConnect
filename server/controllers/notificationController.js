const Notification = require("../models/notification");

// Helper function to create a notification
exports.createNotification = async (userId, message, reason = null) => {
  try {
    const notification = new Notification({
      user: userId,
      message,
      reason,
      isRead: false
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    // Check if the notification belongs to the current user
    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false }, 
      { isRead: true }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    // Check if the notification belongs to the current user
    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: "Notification deleted" });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: "Server error" });
  }
};