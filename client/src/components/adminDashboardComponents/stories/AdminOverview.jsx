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

import CommonModal from "../../commonComponents/CommonModelComponents";
import LoadingModal from "../../commonComponents/CommonLoadingModal";
import DeleteConfirmationModal from "../../commonComponents/DeleteConfirmationModal";
import { createStory, getAllStories, deleteStory } from "../../../config/api";
import StoriesList from "./getAllStories";
import { uploadToCloudinary } from "../../../services/cloudinaryUpload";

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

  // Process and Sequentially Upload Asset Files straight to Cloudinary
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
        const res = await uploadToCloudinary(coverImage, (percent) => {
          setModalMessage(`Uploading cover image (${percent}%)...`);
        });
        uploadedCoverImageUrl = res.secure_url;
      }

      // 2. Audio File Upload
      let uploadedAudioUrl = "";
      if (audio) {
        setModalMessage("Uploading background audio (0%)...");
        const res = await uploadToCloudinary(audio, (percent) => {
          setModalMessage(`Uploading background audio (${percent}%)...`);
        });
        uploadedAudioUrl = res.secure_url;
      }

      // 3. Gallery Images Upload
      const uploadedGalleryImages = [];
      for (let i = 0; i < galleryImages.length; i++) {
        setModalMessage(`Uploading gallery image ${i + 1}/${galleryImages.length} (0%)...`);
        const res = await uploadToCloudinary(galleryImages[i], (percent) => {
          setModalMessage(`Uploading gallery image ${i + 1}/${galleryImages.length} (${percent}%)...`);
        });
        uploadedGalleryImages.push(res.secure_url);
      }

      // 4. Gallery Videos Upload
      const uploadedGalleryVideos = [];
      for (let i = 0; i < galleryVideos.length; i++) {
        setModalMessage(`Uploading video memory ${i + 1}/${galleryVideos.length} (0%)...`);
        const res = await uploadToCloudinary(galleryVideos[i], (percent) => {
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
    <div className="flex flex-col h-full w-full bg-[#F7F9F4] text-[#3B4953]">
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

      {/* Fixed Header & Tabs */}
      <div className="flex-shrink-0 mt-5">
        <div className="border-b border-[#DDE7D8]">
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-4 mx-auto px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex-1 sm:flex-none px-4 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-semibold rounded-t-lg rounded-b-none uppercase tracking-[1px] sm:tracking-[3px] transition-all duration-200 ${
                activeTab === "upload"
                  ? "bg-[#5A7863] text-white shadow-md"
                  : "text-[#3B4953] border-b-2 border-transparent hover:text-[#5A7863] hover:bg-[#EBF4DD]"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Upload size={14} className="sm:w-4 sm:h-4" />
                Upload Story
              </span>
            </button>

            <button
              onClick={() => setActiveTab("view")}
              className={`flex-1 sm:flex-none px-4 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-semibold rounded-t-lg rounded-b-none uppercase tracking-[1px] sm:tracking-[3px] transition-all duration-200 ${
                activeTab === "view"
                  ? "bg-[#5A7863] text-white shadow-md"
                  : "text-[#3B4953] border-b-2 border-transparent hover:text-[#5A7863] hover:bg-[#EBF4DD]"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Grid3x3 size={14} className="sm:w-4 sm:h-4" />
                View Stories
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="max-w-7xl mx-auto mt-6">
          {activeTab === "upload" && (
            <div className="bg-white rounded-2xl shadow-xl border border-[#DDE7D8] p-6 sm:p-8 transition-all hover:shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-6 text-[#3B4953]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#3B4953] mb-1.5">
                      Story Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full bg-white border border-[#90AB8B] rounded-xl p-3 text-[#3B4953] focus:ring-2 focus:ring-[#5A7863] focus:border-[#5A7863] outline-none transition"
                      placeholder="e.g., A Timeless Love"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#3B4953] mb-1.5">
                      Couple Name
                    </label>
                    <input
                      type="text"
                      name="couple"
                      value={formData.couple}
                      onChange={handleChange}
                      className="w-full bg-white border border-[#90AB8B] rounded-xl p-3 text-[#3B4953] focus:ring-2 focus:ring-[#5A7863] focus:border-[#5A7863] outline-none transition"
                      placeholder="e.g., Emily & James"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#3B4953] mb-1.5">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full bg-white border border-[#90AB8B] rounded-xl p-3 text-[#3B4953] focus:ring-2 focus:ring-[#5A7863] focus:border-[#5A7863] outline-none transition"
                      placeholder="e.g., Paris, France"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#3B4953] mb-1.5">
                      Wedding Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full bg-white border border-[#90AB8B] rounded-xl p-3 text-[#3B4953] focus:ring-2 focus:ring-[#5A7863] focus:border-[#5A7863] outline-none transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#3B4953] mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full bg-white border border-[#90AB8B] rounded-xl p-3 text-[#3B4953] focus:ring-2 focus:ring-[#5A7863] focus:border-[#5A7863] outline-none transition"
                    placeholder="Share the beautiful journey and memories..."
                    required
                  />
                </div>

                {/* Cover Image */}
                <div className="bg-[#F7F9F4] rounded-xl p-5 border border-[#DDE7D8]">
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#3B4953] mb-3">
                    <Image size={18} className="text-[#5A7863]" /> Cover Image
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="cursor-pointer bg-white border border-[#90AB8B] rounded-lg px-4 py-2 text-sm font-medium text-[#3B4953] hover:bg-[#EBF4DD] transition flex items-center gap-2">
                      <Plus size={16} /> Choose Image
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
                        className="text-red-600 hover:text-red-700 transition text-sm flex items-center gap-1 font-medium"
                      >
                        <Trash2 size={16} /> Remove
                      </button>
                    )}
                  </div>
                  {coverPreview && (
                    <div className="mt-4">
                      <img
                        src={coverPreview}
                        className="w-40 h-40 object-cover rounded-lg shadow-sm border border-[#DDE7D8]"
                        alt="cover preview"
                      />
                    </div>
                  )}
                </div>

                {/* Audio */}
                <div className="bg-[#F7F9F4] rounded-xl p-5 border border-[#DDE7D8]">
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#3B4953] mb-3">
                    <Music size={18} className="text-[#5A7863]" /> Background Audio (optional)
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="cursor-pointer bg-white border border-[#90AB8B] rounded-lg px-4 py-2 text-sm font-medium text-[#3B4953] hover:bg-[#EBF4DD] transition flex items-center gap-2">
                      <Plus size={16} /> Upload Audio
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
                        className="text-red-600 hover:text-red-700 transition text-sm font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {audioPreview && (
                    <div className="mt-4">
                      <audio controls className="w-full max-w-md">
                        <source src={audioPreview} />
                      </audio>
                    </div>
                  )}
                </div>

                {/* Gallery Images */}
                <div className="bg-[#F7F9F4] rounded-xl p-5 border border-[#DDE7D8]">
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#3B4953] mb-3">
                    <Image size={18} className="text-[#5A7863]" /> Gallery Images (max 10)
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {galleryImages.map((img, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={URL.createObjectURL(img)}
                          className="w-20 h-20 object-cover rounded-lg shadow-sm border border-[#DDE7D8]"
                          alt="gallery"
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(i)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-500 transition"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <label className="w-20 h-20 bg-white border-2 border-dashed border-[#90AB8B] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#5A7863] hover:bg-[#EBF4DD] transition">
                      <Plus size={20} className="text-[#5A7863]" />
                      <span className="text-xs text-[#5A7863] mt-1 font-medium">Add</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryImagesChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-[#5A7863] mt-2 font-medium">{galleryImages.length}/10 images</p>
                </div>

                {/* Gallery Videos */}
                <div className="bg-[#F7F9F4] rounded-xl p-5 border border-[#DDE7D8]">
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#3B4953] mb-3">
                    <Video size={18} className="text-[#5A7863]" /> Gallery Videos (optional)
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {galleryVideos.map((vid, i) => (
                      <div key={i} className="relative w-40 rounded-lg overflow-hidden shadow-sm bg-white border border-[#DDE7D8]">
                        <video
                          src={videoPreviews[vid.name]}
                          className="w-full h-24 object-cover"
                          controls
                          controlsList="nodownload"
                        />
                        <div className="p-1 flex justify-between items-center bg-[#F7F9F4]">
                          <span className="text-xs truncate w-28 text-[#3B4953] font-medium">{vid.name}</span>
                          <button
                            type="button"
                            onClick={() => removeGalleryVideo(i)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <label className="w-40 h-40 bg-white border-2 border-dashed border-[#90AB8B] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#5A7863] hover:bg-[#EBF4DD] transition">
                      <Video size={24} className="text-[#5A7863]" />
                      <span className="text-xs text-[#5A7863] mt-2 font-medium">Add Video</span>
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

                <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-[#DDE7D8]">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-2.5 border border-[#90AB8B] text-[#5A7863] rounded-lg hover:bg-[#EBF4DD] transition font-semibold"
                  >
                    Clear All
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-[#5A7863] hover:bg-[#4B6654] text-white rounded-lg font-semibold transition shadow-md disabled:opacity-70 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
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
            <div className="space-y-6">
              {viewError && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                  <p className="text-red-600 mb-4 font-medium">{viewError}</p>
                  <button
                    onClick={fetchStories}
                    className="text-[#5A7863] hover:text-[#4B6654] font-bold underline"
                  >
                    Try Again →
                  </button>
                </div>
              )}

              {!viewError && (
                <div className="relative">
                  {stories.length === 0 && !viewLoading && (
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-[#DDE7D8]">
                      <div className="w-16 h-16 bg-[#EBF4DD] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8 text-[#5A7863]" />
                      </div>
                      <p className="text-[#3B4953] font-medium">No stories found. Create your first story!</p>
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
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-[#5A7863] border-t-transparent rounded-full animate-spin" />
                        <span className="text-[#5A7863] font-semibold text-sm">
                          {stories.length > 0 ? "Updating stories..." : "Loading stories..."}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Story Details Modal – uses CommonModal */}
      <CommonModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="Story Details"
        size="xl"
      >
        {selectedStory && (
          <div className="space-y-6 sm:space-y-8 bg-white text-[#3B4953]">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img
                src={selectedStory.coverImage || "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200"}
                alt={selectedStory.title}
                className="w-full h-64 sm:h-72 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md">{selectedStory.title}</h2>
                <p className="text-gray-100 text-base sm:text-lg mt-1 font-medium drop-shadow-sm">{selectedStory.couple}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 sm:gap-6 justify-center text-center border-b border-[#DDE7D8] pb-6">
              <div className="flex items-center gap-2 text-[#3B4953] font-medium">
                <Calendar size={18} className="text-[#5A7863]" />
                <span>{formatDate(selectedStory.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-[#3B4953] font-medium">
                <MapPin size={18} className="text-[#5A7863]" />
                <span>{selectedStory.location}</span>
              </div>
            </div>

            <div className="bg-[#EBF4DD] rounded-2xl p-4 sm:p-6 border border-[#DDE7D8]">
              <p className="text-[#3B4953] leading-relaxed text-center text-base sm:text-lg italic font-medium">
                "{selectedStory.description}"
              </p>
            </div>

            {selectedStory.audio && (
              <div className="bg-[#F7F9F4] border border-[#DDE7D8] rounded-xl p-4 shadow-sm">
                <label className="flex items-center gap-2 mb-2 font-bold text-[#3B4953]">
                  <Music size={18} className="text-[#5A7863]" /> Background Melody
                </label>
                <audio controls className="w-full">
                  <source src={selectedStory.audio} type="audio/mpeg" />
                </audio>
              </div>
            )}

            {selectedStory.galleryImages && selectedStory.galleryImages.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-[#3B4953] mb-4 flex items-center gap-2">
                  <Image size={20} className="text-[#5A7863]" /> Photo Gallery
                  <span className="text-sm font-medium text-[#5A7863]">({selectedStory.galleryImages.length})</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {selectedStory.galleryImages.map((img, idx) => (
                    <div key={idx} className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition border border-[#DDE7D8]">
                      <img
                        src={img}
                        alt={`gallery-${idx}`}
                        className="w-full h-40 sm:h-48 object-cover hover:scale-105 transition duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedStory.galleryVideos && selectedStory.galleryVideos.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-[#3B4953] mb-4 flex items-center gap-2">
                  <Video size={20} className="text-[#5A7863]" /> Video Memories
                  <span className="text-sm font-medium text-[#5A7863]">({selectedStory.galleryVideos.length})</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {selectedStory.galleryVideos.map((vid, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden shadow-lg bg-[#3B4953]">
                      <video
                        src={vid}
                        controls
                        controlsList="nodownload"
                        className="w-full h-56 sm:h-64 object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <Play className="text-white w-12 h-12 sm:w-14 sm:h-14 drop-shadow-xl opacity-80" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-[#DDE7D8]">
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="px-5 py-2 bg-[#F7F9F4] hover:bg-[#EBF4DD] rounded-lg text-[#3B4953] border border-[#90AB8B] font-semibold transition"
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