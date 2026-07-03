import User from "../model/authModel.js";

// ===============================
// Create Family Access Request
// ===============================

export const createFamilyRequest = async (req, res) => {
  try {
    const { memberName, relation, reason } = req.body;

    if (!memberName || !relation) {
      return res.status(400).json({
        success: false,
        message: "Member name and relation are required.",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.familyRequests.push({
      memberName,
      relation,
      reason,
      status: "PENDING",
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "Family access request sent successfully.",
      data: user.familyRequests[user.familyRequests.length - 1],
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Get Logged In User Requests
// ===============================

export const getMyFamilyRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("familyRequests");

    res.status(200).json({
      success: true,
      data: user.familyRequests,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Admin Get All Requests
// ===============================

export const getAllFamilyRequests = async (req, res) => {
  try {
    const users = await User.find().select(
      "name familyRequests"
    );

    const requests = [];

    users.forEach((user) => {
      user.familyRequests.forEach((request) => {
        requests.push({
          requestId: request._id,
          userId: user._id,
          userName: user.name,
          memberName: request.memberName,
          relation: request.relation,
          reason: request.reason,
          status: request.status,
          approvedBy: request.approvedBy,
          approvedAt: request.approvedAt,
          createdAt: request.createdAt,
        });
      });
    });

    res.status(200).json({
      success: true,
      total: requests.length,
      data: requests,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Approve Request
// ===============================

export const approveFamilyRequest = async (req, res) => {
  try {

    const { userId, requestId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const request = user.familyRequests.id(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found.",
      });
    }

    request.status = "APPROVED";
    request.approvedBy = req.user.id;
    request.approvedAt = new Date();

    await user.save();

    res.status(200).json({
      success: true,
      message: "Request approved successfully.",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Reject Request
// ===============================

export const rejectFamilyRequest = async (req, res) => {
  try {

    const { userId, requestId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const request = user.familyRequests.id(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found.",
      });
    }

    request.status = "REJECTED";
    request.approvedBy = req.user.id;
    request.approvedAt = new Date();

    await user.save();

    res.status(200).json({
      success: true,
      message: "Request rejected successfully.",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};