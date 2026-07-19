import Work from "../../model/workModel.js";
import History from "../../model/historyModel.js";
import Notification from "../../model/notificationModel.js";
import User from "../../model/authModel.js";

// 1. Create Work Assignment (ADMIN ONLY)
export const createWork = async (req, res) => {
  try {
    const { client, editor, category, priority, deliveryDate } = req.body;

    if (!client || !editor || !category || !deliveryDate) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const clientUser = await User.findById(client);
    const editorUser = await User.findById(editor);

    if (!clientUser || clientUser.role !== "USER") {
      return res.status(400).json({ success: false, message: "Invalid client selected" });
    }
    if (!editorUser || editorUser.role !== "EDITOR") {
      return res.status(400).json({ success: false, message: "Invalid editor selected" });
    }

    const work = await Work.create({
      client,
      editor,
      category,
      priority: priority || "MEDIUM",
      deliveryDate,
      status: "WAITING_FOR_EDITOR",
    });

    // Create Notification for Editor
    await Notification.create({
      recipient: editor,
      message: `New project '${category}' has been assigned to you. Please submit estimated duration.`,
      type: "PROJECT_ASSIGNED",
      link: `/dashboard/posts`,
    });

    // Log History
    await History.create({
      workId: work._id,
      action: "Work Assigned",
      performedBy: req.user._id,
      role: req.user.role,
      remarks: `Assigned project '${category}' to client ${clientUser.name} and editor ${editorUser.name}`,
    });

    return res.status(201).json({
      success: true,
      message: "Work assigned successfully.",
      work,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Submit Duration by Editor (EDITOR ONLY)
export const submitDuration = async (req, res) => {
  try {
    const { workId, estimatedDuration, expectedCompletionDate, notes } = req.body;

    if (!workId || !estimatedDuration || !expectedCompletionDate) {
      return res.status(400).json({ success: false, message: "Missing duration details" });
    }

    const work = await Work.findById(workId);
    if (!work) {
      return res.status(404).json({ success: false, message: "Work assignment not found" });
    }

    if (work.editor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized editor" });
    }

    work.duration = {
      estimated: estimatedDuration,
      expectedCompletionDate,
      notes: notes || "",
    };
    work.status = "WAITING_FOR_ADMIN_APPROVAL";
    await work.save();

    // Notify Admins
    await Notification.create({
      recipientRole: "ADMIN",
      message: `Editor ${req.user.name} submitted a duration estimate for project '${work.category}'.`,
      type: "DURATION_PENDING",
      link: `/dashboard/assign-work`,
    });

    // Log History
    await History.create({
      workId: work._id,
      action: "Duration Submitted",
      performedBy: req.user._id,
      role: req.user.role,
      remarks: `Submitted duration estimate: ${estimatedDuration}, expected completion: ${expectedCompletionDate}`,
    });

    return res.status(200).json({
      success: true,
      message: "Estimated duration submitted successfully. Awaiting Admin approval.",
      work,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Approve / Reject / Modify Duration by Admin (ADMIN ONLY)
export const approveDuration = async (req, res) => {
  try {
    const { workId, action, estimatedDuration, expectedCompletionDate, notes } = req.body;

    if (!workId || !action) {
      return res.status(400).json({ success: false, message: "Work ID and action are required" });
    }

    const work = await Work.findById(workId);
    if (!work) {
      return res.status(404).json({ success: false, message: "Work assignment not found" });
    }

    if (action === "APPROVE") {
      work.status = "IN_PROGRESS";
      await work.save();

      // Notify Editor
      await Notification.create({
        recipient: work.editor,
        message: `Admin approved your duration estimate for project '${work.category}'. You can now upload files.`,
        type: "DURATION_APPROVED",
        link: `/dashboard/posts`,
      });

      // Log History
      await History.create({
        workId: work._id,
        action: "Duration Approved",
        performedBy: req.user._id,
        role: req.user.role,
        remarks: "Approved estimated duration",
      });

      return res.status(200).json({ success: true, message: "Duration approved successfully.", work });
    } else if (action === "REJECT") {
      work.status = "WAITING_FOR_EDITOR";
      await work.save();

      // Notify Editor
      await Notification.create({
        recipient: work.editor,
        message: `Admin rejected your duration estimate for project '${work.category}'. Please submit a revised estimate.`,
        type: "DURATION_REJECTED",
        link: `/dashboard/posts`,
      });

      // Log History
      await History.create({
        workId: work._id,
        action: "Duration Rejected",
        performedBy: req.user._id,
        role: req.user.role,
        remarks: "Rejected estimated duration",
      });

      return res.status(200).json({ success: true, message: "Duration rejected. Editor will resubmit.", work });
    } else if (action === "MODIFY") {
      if (!estimatedDuration || !expectedCompletionDate) {
        return res.status(400).json({ success: false, message: "Missing modification values" });
      }

      work.duration = {
        estimated: estimatedDuration,
        expectedCompletionDate,
        notes: notes || work.duration.notes,
      };
      work.status = "IN_PROGRESS";
      await work.save();

      // Notify Editor
      await Notification.create({
        recipient: work.editor,
        message: `Admin modified and approved your duration estimate for project '${work.category}'.`,
        type: "DURATION_APPROVED",
        link: `/dashboard/posts`,
      });

      // Log History
      await History.create({
        workId: work._id,
        action: "Duration Modified",
        performedBy: req.user._id,
        role: req.user.role,
        remarks: `Modified duration to: ${estimatedDuration}, expected completion: ${expectedCompletionDate}`,
      });

      return res.status(200).json({ success: true, message: "Duration modified and approved.", work });
    } else {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Editor completes work (EDITOR ONLY)
export const completeWork = async (req, res) => {
  try {
    const { workId } = req.body;
    const work = await Work.findById(workId);
    if (!work) {
      return res.status(404).json({ success: false, message: "Work not found" });
    }

    if (work.editor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized editor" });
    }

    work.status = "COMPLETED";
    await work.save();

    // Notify Admin
    await Notification.create({
      recipientRole: "ADMIN",
      message: `Editor ${req.user.name} marked project '${work.category}' as completed.`,
      type: "PROJECT_COMPLETED",
      link: `/dashboard/assign-work`,
    });

    // Notify Client User
    await Notification.create({
      recipient: work.client,
      message: `Your project '${work.category}' is completed. Check your gallery for the final delivery!`,
      type: "PROJECT_COMPLETED",
      link: `/dashboard/gallery`,
    });

    // Log History
    await History.create({
      workId: work._id,
      action: "Work Completed",
      performedBy: req.user._id,
      role: req.user.role,
      remarks: "Marked work as completed",
    });

    return res.status(200).json({ success: true, message: "Work marked as completed.", work });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Get Work List (Depends on role: ADMIN sees all, EDITOR sees assigned, USER sees theirs)
export const getWorkList = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === "EDITOR") {
      filter.editor = req.user._id;
    } else if (req.user.role === "USER") {
      filter.client = req.user._id;
    }

    const projects = await Work.find(filter)
      .populate("client", "name email googleDrive")
      .populate("editor", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, projects });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Get History logs (ADMIN/EDITOR/USER)
export const getHistoryLogs = async (req, res) => {
  try {
    const { workId } = req.query;
    const filter = {};
    if (workId) filter.workId = workId;

    // Filter by user role permissions
    if (req.user.role === "USER") {
      const userProjects = await Work.find({ client: req.user._id }).select("_id");
      const projectIds = userProjects.map((p) => p._id);
      filter.workId = { $in: projectIds };
    } else if (req.user.role === "EDITOR") {
      const editorProjects = await Work.find({ editor: req.user._id }).select("_id");
      const projectIds = editorProjects.map((p) => p._id);
      filter.workId = { $in: projectIds };
    }

    const logs = await History.find(filter)
      .populate("performedBy", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Mute Project Alarm (ADMIN ONLY)
export const muteProjectAlarm = async (req, res) => {
  try {
    const { workId, type } = req.body;
    console.log("MUTING ALARM ENDPOINT HIT WITH:", { workId, type });
    if (!workId || !type) {
      return res.status(400).json({ success: false, message: "Work ID and Type are required" });
    }

    const work = await Work.findById(workId);
    if (!work) {
      return res.status(404).json({ success: false, message: "Work assignment not found" });
    }

    if (type === "ADMIN") {
      work.adminAlarmMuted = !work.adminAlarmMuted;
    } else if (type === "EDITOR") {
      work.editorAlarmMuted = !work.editorAlarmMuted;
    } else {
      return res.status(400).json({ success: false, message: "Invalid mute type" });
    }

    await work.save();

    const isCurrentlyMuted = type === "ADMIN" ? work.adminAlarmMuted : work.editorAlarmMuted;

    // Log History
    await History.create({
      workId: work._id,
      action: isCurrentlyMuted ? `Alarm Muted for ${type}` : `Alarm Unmuted for ${type}`,
      performedBy: req.user._id,
      role: req.user.role,
      remarks: `Admin ${isCurrentlyMuted ? "muted" : "unmuted"} the alarm for ${type} on project '${work.category}'`,
    });

    console.log("MUTED ALARM SAVED SUCCESSFULLY:", work);
    return res.status(200).json({ 
      success: true, 
      message: `Project alarm for ${type} ${isCurrentlyMuted ? "muted" : "unmuted"} successfully.`, 
      work 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

