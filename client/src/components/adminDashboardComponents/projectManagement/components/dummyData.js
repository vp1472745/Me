// components/dummyData.js
export const DELIVERABLE_CATEGORIES = {
  IMAGES: {
    id: "images",
    label: "📸 Images",
    subCategories: [
      "Bride Photos",
      "Groom Photos",
      "Couple Photos",
      "Family Photos",
      "Group Photos",
      "Candid Photos",
      "Ceremony Photos",
      "Reception Photos",
    ],
  },
  VIDEOS_RAW: {
    id: "videos_raw",
    label: "🎥 Raw Videos",
    subCategories: [
      "Full Ceremony Video",
      "Baraat Video",
      "Haldi Video",
      "Mehendi Video",
      "Sangeet Video",
      "Reception Video",
      "Raw Camera Footage",
    ],
  },
  CINEMATIC_FILM: {
    id: "cinematic_film",
    label: "🎬 Cinematic Film",
    subCategories: [
      "Wedding Film (10-20 Min)",
      "Cinematic Highlights",
      "Love Story Film",
    ],
  },
  HIGHLIGHT_VIDEO: {
    id: "highlight_video",
    label: "🎞️ Highlight Video",
    subCategories: ["1 Minute", "3 Minutes", "5 Minutes"],
  },
  REELS: {
    id: "reels",
    label: "📱 Reels / Shorts",
    subCategories: [
      "Bride Entry Reel",
      "Groom Entry Reel",
      "Couple Reel",
      "Dance Reel",
      "Trending Song Reel",
    ],
  },
  PHOTOBOOK: {
    id: "photobook",
    label: "📖 Photobook / Album",
    subCategories: ["Album Design", "Album Pages", "HD Images"],
  },
  TEASER: {
    id: "teaser",
    label: "🎵 Teaser",
    subCategories: ["30 Second Teaser", "60 Second Teaser"],
  },
  RAW_DATA: {
    id: "raw_data",
    label: "☁️ Raw Data",
    subCategories: ["Raw Images", "Raw Videos"],
  },
  EDITED_IMAGES: {
    id: "edited_images",
    label: "🖼️ Edited Images",
    subCategories: ["Color Corrected", "Retouched", "Final Delivery"],
  },
};

export const DUMMY_FOLDERS = [
  {
    id: "1",
    name: "Sharma Wedding",
    clientName: "Vineet & Priya Sharma",
    weddingDate: "2024-12-15",
    assignedEditors: ["editor1", "editor2"],
    deliverables: {
      images: {
        "Bride Photos": [],
        "Groom Photos": [],
        "Couple Photos": [],
        "Family Photos": [],
        "Group Photos": [],
        "Candid Photos": [],
        "Ceremony Photos": [],
        "Reception Photos": [],
      },
      videos_raw: {
        "Full Ceremony Video": [],
        "Baraat Video": [],
        "Haldi Video": [],
        "Mehendi Video": [],
        "Sangeet Video": [],
        "Reception Video": [],
        "Raw Camera Footage": [],
      },
      cinematic_film: {
        "Wedding Film (10-20 Min)": [],
        "Cinematic Highlights": [],
        "Love Story Film": [],
      },
      highlight_video: {
        "1 Minute": [],
        "3 Minutes": [],
        "5 Minutes": [],
      },
      reels: {
        "Bride Entry Reel": [],
        "Groom Entry Reel": [],
        "Couple Reel": [],
        "Dance Reel": [],
        "Trending Song Reel": [],
      },
      photobook: {
        "Album Design": [],
        "Album Pages": [],
        "HD Images": [],
      },
      teaser: {
        "30 Second Teaser": [],
        "60 Second Teaser": [],
      },
      raw_data: {
        "Raw Images": [],
        "Raw Videos": [],
      },
      edited_images: {
        "Color Corrected": [],
        "Retouched": [],
        "Final Delivery": [],
      },
    },
  },
  {
    id: "2",
    name: "Singh Wedding",
    clientName: "Raj & Simran Singh",
    weddingDate: "2025-01-20",
    assignedEditors: ["editor2"],
    deliverables: {
      images: {
        "Bride Photos": [],
        "Groom Photos": [],
        "Couple Photos": [],
        "Family Photos": [],
        "Group Photos": [],
        "Candid Photos": [],
        "Ceremony Photos": [],
        "Reception Photos": [],
      },
      videos_raw: {
        "Full Ceremony Video": [],
        "Baraat Video": [],
        "Haldi Video": [],
        "Mehendi Video": [],
        "Sangeet Video": [],
        "Reception Video": [],
        "Raw Camera Footage": [],
      },
      cinematic_film: {
        "Wedding Film (10-20 Min)": [],
        "Cinematic Highlights": [],
        "Love Story Film": [],
      },
      highlight_video: {
        "1 Minute": [],
        "3 Minutes": [],
        "5 Minutes": [],
      },
      reels: {
        "Bride Entry Reel": [],
        "Groom Entry Reel": [],
        "Couple Reel": [],
        "Dance Reel": [],
        "Trending Song Reel": [],
      },
      photobook: {
        "Album Design": [],
        "Album Pages": [],
        "HD Images": [],
      },
      teaser: {
        "30 Second Teaser": [],
        "60 Second Teaser": [],
      },
      raw_data: {
        "Raw Images": [],
        "Raw Videos": [],
      },
      edited_images: {
        "Color Corrected": [],
        "Retouched": [],
        "Final Delivery": [],
      },
    },
  },
];

export const DUMMY_EDITORS = [
  { id: "editor1", name: "Priya Singh", email: "priya@studio.com" },
  { id: "editor2", name: "Rahul Verma", email: "rahul@studio.com" },
  { id: "editor3", name: "Ananya Gupta", email: "ananya@studio.com" },
];