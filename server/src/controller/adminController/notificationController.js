import Notification from "../../model/notificationModel.js";

// 1. Get notifications for the logged-in user
export const getNotifications = async (req, res) => {
  try {
    const filter = {
      $or: [
        { recipient: req.user._id },
        { recipientRole: req.user.role },
        { recipientRole: "ALL" },
      ],
    };

    const notifications = await Notification.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, notifications });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Mark specific notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({ success: true, message: "Notification marked as read." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const filter = {
      $or: [
        { recipient: req.user._id },
        { recipientRole: req.user.role },
        { recipientRole: "ALL" },
      ],
    };

    await Notification.updateMany(filter, { isRead: true });

    return res.status(200).json({ success: true, message: "All notifications marked as read." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
