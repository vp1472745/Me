// import express from "express";

// import {
//   createStory,
//   getAllStories,
//   getSingleStory,
//   deleteStory,
// } from "../controller/storyController.js";

// import multer from "multer";

// import {
//   CloudinaryStorage,
// } from "multer-storage-cloudinary";

// import cloudinary from "../config/cloudinary.js";


// const router =
//   express.Router();


// // STORAGE

// const storage =
//   new CloudinaryStorage({
//     cloudinary,

//     params: async (
//       req,
//       file
//     ) => {

//       // VIDEO
//       if (
//         file.mimetype.startsWith(
//           "video"
//         )
//       ) {
//         return {
//           folder:
//             "stories/videos",

//           resource_type:
//             "video",
//         };
//       }

//       // AUDIO
//       if (
//         file.mimetype.startsWith(
//           "audio"
//         )
//       ) {
//         return {
//           folder:
//             "stories/audio",

//           resource_type:
//             "video",
//         };
//       }

//       // IMAGE
//       return {
//         folder:
//           "stories/images",

//         resource_type:
//           "image",
//       };
//     },
//   });


// // MULTER

// const upload = multer({
//   storage,
// });


// // ==========================
// // CREATE STORY
// // ==========================

// router.post(
//   "/create",

//   upload.fields([
//     {
//       name: "coverImage",
//       maxCount: 1,
//     },

//     {
//       name: "galleryImages",
//       maxCount: 20,
//     },

//     {
//       name: "galleryVideos",
//       maxCount: 20,
//     },

//     {
//       name: "audio",
//       maxCount: 1,
//     },
//   ]),

//   createStory
// );


// // ==========================
// // GET ALL STORIES
// // ==========================

// router.get(
//   "/all",
//   getAllStories
// );


// // ==========================
// // GET SINGLE STORY
// // ==========================

// router.get(
//   "/:id",
//   getSingleStory
// );


// // ==========================
// // DELETE STORY
// // ==========================

// router.delete(
//   "/delete/:id",
//   deleteStory
// );

// export default router;




import express from "express";

import {
  createStory,
  getAllStories,
  getSingleStory,
  deleteStory,
} from "../controller/storyController.js";

import multer from "multer";

import {
  CloudinaryStorage,
} from "multer-storage-cloudinary";

import cloudinary from "../config/cloudinary.js";

const router =
  express.Router();


// ==========================
// CLOUDINARY STORAGE
// ==========================

const storage =
  new CloudinaryStorage({
    cloudinary,

    params: async (
      req,
      file
    ) => {

      // VIDEO

      if (
        file.mimetype.startsWith(
          "video"
        )
      ) {
        return {
          folder:
            "stories/videos",

          resource_type:
            "video",
        };
      }


      // AUDIO

      if (
        file.mimetype.startsWith(
          "audio"
        )
      ) {
        return {
          folder:
            "stories/audio",

          resource_type:
            "video",
        };
      }


      // IMAGE

      return {
        folder:
          "stories/images",

        resource_type:
          "image",
      };
    },
  });


// ==========================
// MULTER
// ==========================

const upload = multer({
  storage,
});


// ==========================
// CREATE STORY
// ==========================

router.post(

  "/create",

  upload.fields([

    // COVER IMAGE

    {
      name: "coverImage",
    },


    // GALLERY IMAGES

    {
      name: "galleryImages",
    },


    // GALLERY VIDEOS

    {
      name: "galleryVideos",
    },


    // AUDIO

    {
      name: "audio",
    },

  ]),

  createStory
);


// ==========================
// GET ALL STORIES
// ==========================

router.get(
  "/all",
  getAllStories
);


// ==========================
// GET SINGLE STORY
// ==========================

router.get(
  "/:id",
  getSingleStory
);


// ==========================
// DELETE STORY
// ==========================

router.delete(
  "/delete/:id",
  deleteStory
);

export default router;