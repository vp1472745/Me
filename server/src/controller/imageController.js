// ==============================
// controller/galleryController.js
// ==============================

import Gallery from "../model/imageModel.js";


// ==============================
// CREATE GALLERY
// ==============================

export const createGallery =
  async (req, res) => {

    try {

      const { title } = req.body;

      // MULTIPLE IMAGES

      const images =
        req.files?.map(
          (file) => file.path
        ) || [];

      const gallery =
        await Gallery.create({
          title,
          images,
        });

      return res.status(201).json({
        success: true,
        message:
          "Gallery Created Successfully",
        data: gallery,
      });

    } catch (error) {

      console.log(error);

      return res.status(500).json({
        success: false,
        message:
          "Internal Server Error",
      });
    }
  };


// ==============================
// GET ALL GALLERIES
// ==============================

export const getAllGalleries =
  async (req, res) => {

    try {

      const galleries =
        await Gallery.find()
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        success: true,
        data: galleries,
      });

    } catch (error) {

      console.log(error);

      return res.status(500).json({
        success: false,
        message:
          "Internal Server Error",
      });
    }
  };


// ==============================
// GET SINGLE GALLERY
// ==============================

export const getSingleGallery =
  async (req, res) => {

    try {

      const gallery =
        await Gallery.findById(
          req.params.id
        );

      if (!gallery) {
        return res.status(404).json({
          success: false,
          message:
            "Gallery Not Found",
        });
      }

      return res.status(200).json({
        success: true,
        data: gallery,
      });

    } catch (error) {

      console.log(error);

      return res.status(500).json({
        success: false,
        message:
          "Internal Server Error",
      });
    }
  };


// ==============================
// DELETE GALLERY
// ==============================

export const deleteGallery =
  async (req, res) => {

    try {

      const gallery =
        await Gallery.findByIdAndDelete(
          req.params.id
        );

      if (!gallery) {
        return res.status(404).json({
          success: false,
          message:
            "Gallery Not Found",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Gallery Deleted Successfully",
      });

    } catch (error) {

      console.log(error);

      return res.status(500).json({
        success: false,
        message:
          "Internal Server Error",
      });
    }
  };