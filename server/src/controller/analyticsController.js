import User from "../model/authModel.js";
import Work from "../model/workModel.js";
import Correction from "../model/correctionModel.js";
import Notification from "../model/notificationModel.js";

// Get dashboard statistics depending on role
export const getAnalyticsStats = async (req, res) => {
  try {
    const role = req.user.role;

    if (role === "ADMIN") {
      const totalUsers = await User.countDocuments({ role: "USER" });
      const pendingUsers = await User.countDocuments({ role: "USER", status: "PENDING" });
      const approvedUsers = await User.countDocuments({ role: "USER", status: "APPROVED" });
      const totalEditors = await User.countDocuments({ role: "EDITOR" });

      const totalProjects = await Work.countDocuments();
      const completedProjects = await Work.countDocuments({ status: "COMPLETED" });
      const pendingProjects = await Work.countDocuments({
        status: { $in: ["WAITING_FOR_EDITOR", "WAITING_FOR_ADMIN_APPROVAL", "IN_PROGRESS", "NEEDS_CORRECTION"] },
      });

      const connectedDriveUsers = await User.countDocuments({
        role: "USER",
        "googleDrive.connected": true,
      });

      const totalCorrections = await Correction.countDocuments();

      // Aggregate uploads count and storage sizes
      const allProjects = await Work.find();
      let totalUploads = 0;
      let totalStorageSize = 0; // In Bytes

      allProjects.forEach((proj) => {
        totalUploads += proj.deliverables.length;
        proj.deliverables.forEach((item) => {
          totalStorageSize += item.size || 0;
        });
      });

      return res.status(200).json({
        success: true,
        stats: {
          users: totalUsers,
          pendingUsers,
          approvedUsers,
          editors: totalEditors,
          projects: totalProjects,
          completedProjects,
          pendingProjects,
          googleDriveConnectedUsers: connectedDriveUsers,
          corrections: totalCorrections,
          uploads: totalUploads,
          storage: totalStorageSize, // In Bytes
        },
      });
    } else if (role === "EDITOR") {
      const assignedProjects = await Work.countDocuments({ editor: req.user._id });
      const pendingDuration = await Work.countDocuments({
        editor: req.user._id,
        status: "WAITING_FOR_EDITOR",
      });
      const inProgress = await Work.countDocuments({
        editor: req.user._id,
        status: "IN_PROGRESS",
      });
      const completed = await Work.countDocuments({
        editor: req.user._id,
        status: "COMPLETED",
      });

      // Find corrections count for projects assigned to this Editor
      const editorProjects = await Work.find({ editor: req.user._id }).select("_id deliverables");
      const projectIds = editorProjects.map((p) => p._id);
      const correctionsCount = await Correction.countDocuments({
        workId: { $in: projectIds },
      });

      // Today's uploads
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      let todaysUploadsCount = 0;

      editorProjects.forEach((proj) => {
        proj.deliverables.forEach((item) => {
          if (item.uploadedBy === "Editor" && item.uploadedAt >= startOfDay) {
            todaysUploadsCount++;
          }
        });
      });

      return res.status(200).json({
        success: true,
        stats: {
          assignedProjects,
          pendingDuration,
          inProgress,
          completed,
          corrections: correctionsCount,
          todaysUploads: todaysUploadsCount,
        },
      });
    } else if (role === "USER") {
      const projects = await Work.countDocuments({ client: req.user._id });

      const userProjects = await Work.find({ client: req.user._id }).select("_id deliverables");
      const projectIds = userProjects.map((p) => p._id);

      // Counts of albums subfolders
      let albumsCount = 0;
      userProjects.forEach((proj) => {
        proj.deliverables.forEach((item) => {
          if (item.category === "Albums") {
            albumsCount++;
          }
        });
      });

      // Pending corrections for this user
      const pendingCorrections = await Correction.countDocuments({
        workId: { $in: projectIds },
        status: { $in: ["Pending", "Accepted", "In Progress"] },
      });

      // Notifications unread count
      const unreadNotifications = await Notification.countDocuments({
        $or: [{ recipient: req.user._id }, { recipientRole: "USER" }, { recipientRole: "ALL" }],
        isRead: false,
      });

      return res.status(200).json({
        success: true,
        stats: {
          projects,
          downloads: 12, // mock download tracker or similar action log
          albums: albumsCount,
          pendingCorrections,
          unreadNotifications,
        },
      });
    } else {
      return res.status(400).json({ success: false, message: "Invalid user role" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
