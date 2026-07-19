
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

export const updatePermissions =
  async (req, res) => {

    try {

      const {
        userId,
        permissions,
      } = req.body;

      await User.findByIdAndUpdate(
        userId,
        {
          permissions,
        },
      );

      res.status(200).json({
        success: true,
        message:
          "Permissions Updated",
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };