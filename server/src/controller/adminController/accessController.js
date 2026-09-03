
import User from "../../model/authModel.js";

// ==========================
// Get All Editors
// ==========================

export const getAllEditors =
  async (req, res) => {

    try {

      const editors =
        await User.find({
          role: "EDITOR",
        }).select("-password");

      res.status(200).json({
        success: true,
        editors,
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

// ==========================
// Update Permissions
// ==========================

export const updatePermissions = async (req, res) => {
  try {
    const { userId, permissions, role } = req.body;
    const updateData = {};
    if (permissions !== undefined) updateData.permissions = permissions;
    if (role !== undefined) updateData.role = role;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Permissions and Role Updated Successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};