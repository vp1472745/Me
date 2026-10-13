// StoryManager.jsx - Matches Wedding Dashboard UI (Pill Tabs + Inline Form)
import React, { useState, useEffect, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Plus,
  Trash2,
  Image,
  Music,
  Video,
  X,
  Play,
  Upload,
  Heart,
  MapPin,
  Calendar,
  Grid3x3,
} from "lucide-react";

import CommonModal from "../../components/feedback/CommonModelComponents";
import LoadingModal from "../../components/feedback/CommonLoadingModal";
import DeleteConfirmationModal from "../../components/feedback/DeleteConfirmationModal";
import { createStory, getAllStories, deleteStory } from "../../config/api";
import StoriesList from "./AllStoriesGrid";
import { uploadToDrive } from "../../services/driveUpload";

const StoryManager = () => {
  const [activeTab, setActiveTab] = useState("upload");

  // Upload state
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    couple: "",
    location: "",
    date: "",
    description: "",
  });
  const [coverImage, setCoverImage] = useState(null);
  const [audio, setAudio] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryVideos, setGalleryVideos] = useState([]);
  const [coverPreview, setCoverPreview] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [videoPreviews, setVideoPreviews] = useState({});

  // View state
  const [stories, setStories] = useState([]);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState(null);
  const [modalMessage, setModalMessage] = useState("Loading...");

  // Modal for story details
  const [selectedStory, setSelectedStory] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      if (audioPreview) URL.revokeObjectURL(audioPreview);
      Object.values(videoPreviews).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [coverPreview, audioPreview, videoPreviews]);

  const fetchStories = useCallback(async () => {
    setViewLoading(true);
    setModalMessage("Fetching stories...");
    setViewError(null);
    try {
      const response = await getAllStories();
      let storiesArray = [];
      if (response.data?.stories) {
        storiesArray = response.data.stories;
      } else if (response.data?.data?.stories) {
        storiesArray = response.data.data.stories;
      } else if (Array.isArray(response.data)) {
        storiesArray = response.data;
      }
      setStories(storiesArray);
    } catch (err) {
      console.error(err);
      setViewError(err?.response?.data?.message || "Failed to load stories");
      toast.error(err?.response?.data?.message || "Failed to load stories", {
        style: { background: "#b91c1c", color: "#fff", borderRadius: "12px", padding: "16px 24px" },
      });
    } finally {
      setViewLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "view") {
      fetchStories();
    }
  }, [activeTab, fetchStories]);

  // Upload handlers
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (500MB limit)
      const maxSize = 500 * 1024 * 1024; // 500MB in bytes
      if (file.size > maxSize) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        toast.error(`File size is ${fileSizeMB}MB. You can only upload files up to 500MB.`, {
          style: { background: "#b91c1c", color: "#fff", borderRadius: "12px", padding: "16px 24px" },
        });
        return;
      }
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (500MB limit)
      const maxSize = 500 * 1024 * 1024; // 500MB in bytes
      if (file.size > maxSize) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        toast.error(`File size is ${fileSizeMB}MB. You can only upload files up to 500MB.`, {
          style: { background: "#b91c1c", color: "#fff", borderRadius: "12px", padding: "16px 24px" },
        });
        return;
      }
      if (audioPreview) URL.revokeObjectURL(audioPreview);
      setAudio(file);
      setAudioPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (galleryImages.length + files.length > 10) {
      toast.warning("Maximum 10 images allowed", {
        style: { background: "#d97706", color: "#fff", borderRadius: "12px", padding: "16px 24px" },
      });
      return;
    }

    // Validate file size (500MB limit per file)
    const maxSize = 500 * 1024 * 1024; // 500MB in bytes
    const oversizedFiles = files.filter(file => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      const fileSizeMB = (oversizedFiles[0].size / (1024 * 1024)).toFixed(2);
      toast.error(`File size is ${fileSizeMB}MB. You can only upload files up to 500MB.`, {
        style: { background: "#b91c1c", color: "#fff", borderRadius: "12px", padding: "16px 24px" },
      });
      return;
    }

    setGalleryImages((prev) => [...prev, ...files]);
  };

  const handleGalleryVideosChange = (e) => {
    const files = Array.from(e.target.files);
    if (galleryVideos.length + files.length > 5) {
      toast.warning("Maximum 5 videos allowed", {
        style: { background: "#d97706", color: "#fff", borderRadius: "12px", padding: "16px 24px" },
      });
      return;
    }

    // Validate file size (500MB limit per file)
    const maxSize = 500 * 1024 * 1024; // 500MB in bytes
    const oversizedFiles = files.filter(file => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      const fileSizeMB = (oversizedFiles[0].size / (1024 * 1024)).toFixed(2);
      toast.error(`File size is ${fileSizeMB}MB. You can only upload files up to 500MB.`, {
        style: { background: "#b91c1c", color: "#fff", borderRadius: "12px", padding: "16px 24px" },
      });
      return;
    }

    setGalleryVideos((prev) => [...prev, ...files]);
    files.forEach((file) => {
      setVideoPreviews((prev) => ({
        ...prev,
        [file.name]: URL.createObjectURL(file),
      }));
    });
  };

  const removeGalleryImage = (idx) =>
    setGalleryImages((prev) => prev.filter((_, i) => i !== idx));

  const removeGalleryVideo = (idx) => {
    const vid = galleryVideos[idx];
    if (vid && videoPreviews[vid.name]) {
      URL.revokeObjectURL(videoPreviews[vid.name]);
      const newPreviews = { ...videoPreviews };
      delete newPreviews[vid.name];
      setVideoPreviews(newPreviews);
    }
    setGalleryVideos((prev) => prev.filter((_, i) => i !== idx));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      couple: "",
      location: "",
      date: "",
      description: "",
    });
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    if (audioPreview) URL.revokeObjectURL(audioPreview);
    Object.values(videoPreviews).forEach((url) => URL.revokeObjectURL(url));
    setCoverImage(null);
    setAudio(null);
    setGalleryImages([]);
    setGalleryVideos([]);
    setCoverPreview(null);
    setAudioPreview(null);
    setVideoPreviews({});
  };

  // Process and Sequentially Upload Asset Files straight to Google Drive
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submission started");
    console.log("Form data:", formData);
    console.log("Cover image:", coverImage);
    console.log("Audio:", audio);
    console.log("Gallery images:", galleryImages);
    console.log("Gallery videos:", galleryVideos);

    setLoading(true);

    try {
      // 1. Cover Image Upload
      let uploadedCoverImageUrl = "";
      if (coverImage) {
        setModalMessage("Uploading cover image (0%)...");
        const res = await uploadToDrive(coverImage, (percent) => {
          setModalMessage(`Uploading cover image (${percent}%)...`);
        });
        uploadedCoverImageUrl = res.secure_url;
      }

      // 2. Audio File Upload
      let uploadedAudioUrl = "";
      if (audio) {
        setModalMessage("Uploading background audio (0%)...");
        const res = await uploadToDrive(audio, (percent) => {
          setModalMessage(`Uploading background audio (${percent}%)...`);
        });
        uploadedAudioUrl = res.secure_url;
      }

      // 3. Gallery Images Upload
      const uploadedGalleryImages = [];
      for (let i = 0; i < galleryImages.length; i++) {
        setModalMessage(`Uploading gallery image ${i + 1}/${galleryImages.length} (0%)...`);
        const res = await uploadToDrive(galleryImages[i], (percent) => {
          setModalMessage(`Uploading gallery image ${i + 1}/${galleryImages.length} (${percent}%)...`);
        });
        uploadedGalleryImages.push(res.secure_url);
      }

      // 4. Gallery Videos Upload
      const uploadedGalleryVideos = [];
      for (let i = 0; i < galleryVideos.length; i++) {
        setModalMessage(`Uploading video memory ${i + 1}/${galleryVideos.length} (0%)...`);
        const res = await uploadToDrive(galleryVideos[i], (percent) => {
          setModalMessage(`Uploading video memory ${i + 1}/${galleryVideos.length} (${percent}%)...`);
        });
        uploadedGalleryVideos.push(res.secure_url);
      }


      // 5. Build clean JSON payload structure for Backend API endpoint
      setModalMessage("Saving story details to server...");
      const payload = {
        title: formData.title,
        couple: formData.couple,
        location: formData.location,
        date: formData.date,
        description: formData.description,
        coverImage: uploadedCoverImageUrl,
        audio: uploadedAudioUrl,
        galleryImages: uploadedGalleryImages,
        galleryVideos: uploadedGalleryVideos,
      };

      const response = await createStory(payload);
      console.log("Story creation response:", response);
      toast.success(response.data?.message || " Story created successfully!", {
        style: { background: "#1a7d4a", color: "#fff", borderRadius: "12px", padding: "16px 24px" },

      });
      resetForm();
      if (activeTab === "view") fetchStories();
    } catch (error) {
      console.error("Submission Error:", error);
      console.error("Error response:", error?.response);
      console.error("Error status:", error?.response?.status);
      console.error("Error data:", error?.response?.data);
      toast.error(error?.response?.data?.message || error?.message || `Upload failed: ${error?.response?.status || 'Network error'}`, {
        style: { background: "#b91c1c", color: "#fff", borderRadius: "12px", padding: "16px 24px" },
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const openStoryDetails = (story) => {
    setSelectedStory(story);
    setDetailsModalOpen(true);
  };

  // ✅ FIXED: handleDeleteClick now accepts a story ID, finds the full story from state
  const handleDeleteClick = (storyId) => {
    const story = stories.find((s) => s._id === storyId);
    if (story) {
      setStoryToDelete(story);
      setDeleteModalOpen(true);
    } else {
      toast.error("Story not found", {
        style: { background: "#b91c1c", color: "#fff", borderRadius: "12px", padding: "16px 24px" },
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!storyToDelete) return;
    setIsDeleting(true);
    try {
      await deleteStory(storyToDelete._id);
      setStories((prev) => prev.filter((s) => s._id !== storyToDelete._id));
      toast.success(" Story deleted successfully!", {
        style: { background: "#1a7d4a", color: "#fff", borderRadius: "12px", padding: "16px 24px" },

      });
      setDeleteModalOpen(false);
      setStoryToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to delete story", {
        style: { background: "#b91c1c", color: "#fff", borderRadius: "12px", padding: "16px 24px" },
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setStoryToDelete(null);
  };

  return (
    <div className="animate-fade-in text-xs sm:text-sm space-y-4">
      {/* Custom Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        toastClassName="custom-toast"
        progressClassName="custom-progress"
      />

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200/80 dark:border-slate-800 pb-2.5">
        <button
          onClick={() => setActiveTab("upload")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
            activeTab === "upload"
              ? "bg-blue-600 text-white shadow-2xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Upload size={13} />
          Upload Story
        </button>

        <button
          onClick={() => setActiveTab("view")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
            activeTab === "view"
              ? "bg-blue-600 text-white shadow-2xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Grid3x3 size={13} />
          View Stories ({stories.length})
        </button>
      </div>

      {activeTab === "upload" && (
            <div className="bg-white dark:bg-slate-800/90 rounded-xl shadow-xs border border-slate-200 dark:border-slate-700/80 p-4 sm:p-5">
              <form onSubmit={handleSubmit} className="space-y-4 text-slate-800 dark:text-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Story Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      placeholder="e.g., A Timeless Love"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Couple Name
                    </label>
                    <input
                      type="text"
                      name="couple"
                      value={formData.couple}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      placeholder="e.g., Emily & James"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      placeholder="e.g., Udaipur, Rajasthan"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Wedding Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="Share the beautiful journey and memories..."
                    required
                  />
                </div>

                {/* Cover Image */}
                <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2.5">
                    <Image size={15} className="text-blue-600 dark:text-blue-400" /> Cover Image
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="cursor-pointer bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-800 rounded-lg px-3.5 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 transition flex items-center gap-1.5">
                      <Plus size={14} /> Choose Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageChange}
                        className="hidden"
                        required={!coverImage}
                      />
                    </label>
                    {coverImage && (
                      <button
                        type="button"
                        onClick={() => {
                          setCoverImage(null);
                          if (coverPreview) URL.revokeObjectURL(coverPreview);
                          setCoverPreview(null);
                        }}
                        className="text-red-600 hover:text-red-700 transition text-xs flex items-center gap-1 font-semibold"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    )}
                  </div>
                  {coverPreview && (
                    <div className="mt-3">
                      <img
                        src={coverPreview}
                        className="w-32 h-32 object-cover rounded-lg shadow-xs border border-slate-200 dark:border-slate-700"
                        alt="cover preview"
                      />
                    </div>
                  )}
                </div>

                {/* Audio */}
                <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2.5">
                    <Music size={15} className="text-blue-600 dark:text-blue-400" /> Background Audio (optional)
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="cursor-pointer bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-800 rounded-lg px-3.5 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 transition flex items-center gap-1.5">
                      <Plus size={14} /> Upload Audio
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioChange}
                        className="hidden"
                      />
                    </label>
                    {audio && (
                      <button
                        type="button"
                        onClick={() => {
                          setAudio(null);
                          if (audioPreview) URL.revokeObjectURL(audioPreview);
                          setAudioPreview(null);
                        }}
                        className="text-red-600 hover:text-red-700 transition text-xs font-semibold"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {audioPreview && (
                    <div className="mt-3">
                      <audio controls className="w-full max-w-md">
                        <source src={audioPreview} />
                      </audio>
                    </div>
                  )}
                </div>

                {/* Gallery Images */}
                <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2.5">
                    <Image size={15} className="text-blue-600 dark:text-blue-400" /> Gallery Images (max 10)
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {galleryImages.map((img, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={URL.createObjectURL(img)}
                          className="w-16 h-16 object-cover rounded-lg shadow-xs border border-slate-200 dark:border-slate-700"
                          alt="gallery"
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(i)}
                          className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5 shadow-md hover:bg-red-500 transition"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                    <label className="w-16 h-16 bg-white dark:bg-slate-800 border-2 border-dashed border-blue-300 dark:border-blue-800 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700 transition">
                      <Plus size={16} className="text-blue-600 dark:text-blue-400" />
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5 font-bold">Add</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryImagesChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1.5 font-semibold">{galleryImages.length}/10 images selected</p>
                </div>

                {/* Gallery Videos */}
                <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2.5">
                    <Video size={15} className="text-blue-600 dark:text-blue-400" /> Gallery Videos (optional)
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {galleryVideos.map((vid, i) => (
                      <div key={i} className="relative w-36 rounded-lg overflow-hidden shadow-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <video
                          src={videoPreviews[vid.name] ? `${videoPreviews[vid.name]}#t=0.001` : ""}
                          className="w-full h-20 object-cover"
                          controls
                          controlsList="nodownload"
                          preload="auto"
                          playsInline
                        />
                        <div className="p-1 flex justify-between items-center bg-slate-100 dark:bg-slate-700">
                          <span className="text-[10px] truncate w-24 text-slate-700 dark:text-slate-200 font-medium">{vid.name}</span>
                          <button
                            type="button"
                            onClick={() => removeGalleryVideo(i)}
                            className="text-red-600 hover:text-red-700 p-0.5"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <label className="w-36 h-28 bg-white dark:bg-slate-800 border-2 border-dashed border-blue-300 dark:border-blue-800 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700 transition">
                      <Video size={18} className="text-blue-600 dark:text-blue-400" />
                      <span className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-bold">Add Video</span>
                      <input
                        type="file"
                        accept="video/*"
                        multiple
                        onChange={handleGalleryVideosChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-700/80">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition text-xs font-bold uppercase tracking-wider"
                  >
                    Clear All
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-xs disabled:opacity-70 flex items-center gap-1.5"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                        Processing...
                      </>
                    ) : (
                      "Publish Story"
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "view" && (
            <div className="space-y-4">
              {viewError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                  <p className="text-red-600 mb-3 text-xs sm:text-sm font-medium">{viewError}</p>
                  <button
                    onClick={fetchStories}
                    className="text-blue-600 hover:text-blue-700 font-bold text-xs underline"
                  >
                    Try Again →
                  </button>
                </div>
              )}

              {!viewError && (
                <div className="relative">
                  {stories.length === 0 && !viewLoading && (
                    <div className="bg-white dark:bg-slate-800/90 rounded-xl shadow-xs p-10 text-center border border-slate-200 dark:border-slate-700">
                      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/50 rounded-full flex items-center justify-center mx-auto mb-3 border border-blue-200 dark:border-blue-900">
                        <Heart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 text-sm font-semibold">No stories found. Create your first story!</p>
                    </div>
                  )}

                  {stories.length > 0 && (
                    <StoriesList
                      stories={stories}
                      onStoryClick={openStoryDetails}
                      onDeleteStory={handleDeleteClick}
                    />
                  )}

                  {viewLoading && (
                    <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs flex items-center justify-center rounded-xl z-10 min-h-[200px]">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-blue-600 dark:text-blue-400 font-bold text-xs">
                          {stories.length > 0 ? "Updating stories..." : "Loading stories..."}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

      {/* Story Details Modal – uses CommonModal */}
      <CommonModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="Story Details"
        size="xl"
      >
        {selectedStory && (
          <div className="space-y-4 sm:space-y-6 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
            <div className="relative rounded-xl overflow-hidden shadow-sm">
              <img
                src={selectedStory.coverImage || "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200"}
                alt={selectedStory.title}
                className="w-full h-52 sm:h-60 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white drop-shadow-md">{selectedStory.title}</h2>
                <p className="text-gray-200 text-sm mt-0.5 font-semibold drop-shadow-sm">{selectedStory.couple}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 sm:gap-6 justify-center text-center border-b border-slate-100 dark:border-slate-700/80 pb-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Calendar size={15} className="text-blue-600 dark:text-blue-400" />
                <span>{formatDate(selectedStory.date)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <MapPin size={15} className="text-blue-600 dark:text-blue-400" />
                <span>{selectedStory.location}</span>
              </div>
            </div>

            <div className="bg-blue-50/60 dark:bg-blue-950/40 rounded-xl p-3 sm:p-4 border border-blue-200 dark:border-blue-900/60">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-center text-xs sm:text-sm italic font-medium">
                "{selectedStory.description}"
              </p>
            </div>

            {selectedStory.audio && (
              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-xs">
                <label className="flex items-center gap-1.5 mb-1.5 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <Music size={15} className="text-blue-600 dark:text-blue-400" /> Background Melody
                </label>
                <audio controls className="w-full">
                  <source src={selectedStory.audio} type="audio/mpeg" />
                </audio>
              </div>
            )}

            {selectedStory.galleryImages && selectedStory.galleryImages.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2.5 flex items-center gap-1.5">
                  <Image size={16} className="text-blue-600 dark:text-blue-400" /> Photo Gallery
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">({selectedStory.galleryImages.length})</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {selectedStory.galleryImages.map((img, idx) => (
                    <div key={idx} className="rounded-lg overflow-hidden shadow-xs hover:shadow-md transition border border-slate-200 dark:border-slate-700">
                      <img
                        src={img}
                        alt={`gallery-${idx}`}
                        className="w-full h-28 sm:h-32 object-cover hover:scale-105 transition duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedStory.galleryVideos && selectedStory.galleryVideos.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2.5 flex items-center gap-1.5">
                  <Video size={16} className="text-blue-600 dark:text-blue-400" /> Video Memories
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">({selectedStory.galleryVideos.length})</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {selectedStory.galleryVideos.map((vid, idx) => (
                    <div key={idx} className="relative rounded-lg overflow-hidden shadow-xs bg-black">
                      <video
                        src={`${vid}#t=0.001`}
                        controls
                        controlsList="nodownload"
                        preload="auto"
                        playsInline
                        className="w-full h-44 sm:h-48 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-700/80">
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="px-4 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-slate-700 dark:text-slate-200 text-xs font-bold uppercase tracking-wider transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </CommonModal>

      {/* Global Loading Modal */}
      <LoadingModal
        isLoading={loading || viewLoading}
        message={modalMessage}
        variant="spinner"
        showProgress={false}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete Story"
        message={`Are you sure you want to delete "${storyToDelete?.title || 'this story'}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />

      {/* Optional global style for toast */}
      <style jsx global>{`
        .custom-toast {
          border-radius: 12px !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;
        }
        .custom-progress {
          background: rgba(255,255,255,0.3) !important;
          height: 3px !important;
        }
      `}</style>
    </div>
  );
};

export default StoryManager;