// StoryManager.jsx - Matches Wedding Dashboard UI (Pill Tabs + Inline Form)
import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
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
  User,
  ChevronRight,
  Eye,
  Grid3x3,
} from "lucide-react";
// ✅ Import restored
import CommonModal from "../../commonComponents/modelCommonComponents";
import LoadingModal from "../../commonComponents/LoadingModal";
import { createStory, getAllStories, deleteStory } from "../../../config/api";
import StoriesList from "./getAllStories";

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
      toast.error(err?.response?.data?.message || "Failed to load stories");
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
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (audioPreview) URL.revokeObjectURL(audioPreview);
      setAudio(file);
      setAudioPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (galleryImages.length + files.length > 10) {
      toast.warning("Maximum 10 images allowed");
      return;
    }
    setGalleryImages((prev) => [...prev, ...files]);
  };

  const handleGalleryVideosChange = (e) => {
    const files = Array.from(e.target.files);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setModalMessage("Publishing story...");
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("couple", formData.couple);
      data.append("location", formData.location);
      data.append("date", formData.date);
      data.append("description", formData.description);
      if (coverImage) data.append("coverImage", coverImage);
      if (audio) data.append("audio", audio);
      galleryImages.forEach((img) => data.append("galleryImages", img));
      galleryVideos.forEach((vid) => data.append("galleryVideos", vid));

      const response = await createStory(data);
      toast.success(response.data.message || "Story created successfully!");
      resetForm();
      if (activeTab === "view") fetchStories();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
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

  const handleDeleteStory = async (id) => {
  
    setViewLoading(true);
    setModalMessage("Deleting story...");
    try {
      await deleteStory(id);
      setStories((prev) => prev.filter((s) => s._id !== id));
      toast.success("Story deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to delete story");
    } finally {
      setViewLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full  text-gray-800">
      {/* Fixed Header & Tabs – matches Wedding Dashboard */}
      <div className="flex-shrink-0 ">


        {/* Tabs – pill style, exactly like wedding dashboard */}
<div className="border-b border-gray-300  ">
  <div className="flex items-center gap-4 max-w-7xl mx-auto ">
    <button
      onClick={() => setActiveTab("upload")}
className={`px-8 py-4 text-sm font-semibold rounded-t-lg rounded-b-none uppercase tracking-[3px] transition-all duration-200 ${
        activeTab === "upload"
          ? "bg-blue-600 text-white shadow-md"
          : "text-gray-700 hover:text-blue-600"
      }`}
    >
      <span className="flex items-center gap-2">
        <Upload size={16} />
        Upload Story
      </span>
    </button>

    <button
      onClick={() => setActiveTab("view")}
className={`px-8 py-4 text-sm font-semibold rounded-t-lg rounded-b-none uppercase tracking-[3px] transition-all duration-200 ${
        activeTab === "view"
          ? "bg-blue-600 text-white shadow-md"
          : "text-gray-700 hover:text-blue-600"
      }`}
    >
      <span className="flex items-center gap-2">
        <Grid3x3 size={16} />
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
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 transition-all hover:shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-6 text-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Story Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="e.g., A Timeless Love"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Couple Name
                    </label>
                    <input
                      type="text"
                      name="couple"
                      value={formData.couple}
                      onChange={handleChange}
                      className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="e.g., Emily & James"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="e.g., Paris, France"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Wedding Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Share the beautiful journey and memories..."
                    required
                  />
                </div>

                {/* Cover Image */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Image size={18} className="text-blue-500" /> Cover Image
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="cursor-pointer bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition flex items-center gap-2">
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
                        className="text-red-500 hover:text-red-700 transition text-sm flex items-center gap-1"
                      >
                        <Trash2 size={16} /> Remove
                      </button>
                    )}
                  </div>
                  {coverPreview && (
                    <div className="mt-4">
                      <img
                        src={coverPreview}
                        className="w-40 h-40 object-cover rounded-lg shadow-sm border border-gray-200"
                        alt="cover preview"
                      />
                    </div>
                  )}
                </div>

                {/* Audio */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Music size={18} className="text-blue-500" /> Background Audio (optional)
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="cursor-pointer bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition flex items-center gap-2">
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
                        className="text-red-500 hover:text-red-700 transition text-sm"
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
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Image size={18} className="text-blue-500" /> Gallery Images (max 10)
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {galleryImages.map((img, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={URL.createObjectURL(img)}
                          className="w-20 h-20 object-cover rounded-lg shadow-sm border border-gray-200"
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
                    <label className="w-20 h-20 bg-white border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition">
                      <Plus size={20} className="text-gray-400" />
                      <span className="text-xs text-gray-400 mt-1">Add</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryImagesChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{galleryImages.length}/10 images</p>
                </div>

                {/* Gallery Videos */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Video size={18} className="text-blue-500" /> Gallery Videos (optional)
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {galleryVideos.map((vid, i) => (
                      <div key={i} className="relative w-40 rounded-lg overflow-hidden shadow-sm bg-white border border-gray-200">
                        <video
                          src={videoPreviews[vid.name]}
                          className="w-full h-24 object-cover"
                          controls
                          controlsList="nodownload"
                        />
                        <div className="p-1 flex justify-between items-center bg-gray-50">
                          <span className="text-xs truncate w-28 text-gray-700">{vid.name}</span>
                          <button
                            type="button"
                            onClick={() => removeGalleryVideo(i)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <label className="w-40 h-40 bg-white border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition">
                      <Video size={24} className="text-gray-400" />
                      <span className="text-xs text-gray-400 mt-2">Add Video</span>
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

                <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium"
                  >
                    Clear All
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition shadow-sm disabled:opacity-70 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        Publishing...
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
                  <p className="text-red-600 mb-4">{viewError}</p>
                  <button
                    onClick={fetchStories}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Try Again →
                  </button>
                </div>
              )}

              {!viewError && (
                <div className="relative">
                  {stories.length === 0 && !viewLoading && (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8 text-blue-500" />
                      </div>
                      <p className="text-gray-500">No stories found. Create your first story!</p>
                    </div>
                  )}

                  {stories.length > 0 && (
                    <StoriesList
                      stories={stories}
                      onStoryClick={openStoryDetails}
                      onDeleteStory={handleDeleteStory}
                    />
                  )}

                  {viewLoading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-blue-600 font-medium text-sm">
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
          <div className="space-y-6 sm:space-y-8 bg-white text-gray-800">
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              <img
                src={selectedStory.coverImage || "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200"}
                alt={selectedStory.title}
                className="w-full h-64 sm:h-72 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">{selectedStory.title}</h2>
                <p className="text-gray-200 text-base sm:text-lg mt-1">{selectedStory.couple}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 sm:gap-6 justify-center text-center border-b border-gray-200 pb-6">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={18} className="text-blue-500" />
                <span>{formatDate(selectedStory.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={18} className="text-blue-500" />
                <span>{selectedStory.location}</span>
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-4 sm:p-6">
              <p className="text-gray-700 leading-relaxed text-center text-base sm:text-lg italic">
                "{selectedStory.description}"
              </p>
            </div>

            {selectedStory.audio && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">
                <label className="flex items-center gap-2 mb-2 font-semibold text-gray-700">
                  <Music size={18} className="text-blue-500" /> Background Melody
                </label>
                <audio controls className="w-full">
                  <source src={selectedStory.audio} type="audio/mpeg" />
                </audio>
              </div>
            )}

            {selectedStory.galleryImages && selectedStory.galleryImages.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Image size={20} className="text-blue-500" /> Photo Gallery
                  <span className="text-sm text-gray-400">({selectedStory.galleryImages.length})</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {selectedStory.galleryImages.map((img, idx) => (
                    <div key={idx} className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition">
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
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Video size={20} className="text-blue-500" /> Video Memories
                  <span className="text-sm text-gray-400">({selectedStory.galleryVideos.length})</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {selectedStory.galleryVideos.map((vid, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden shadow-lg bg-gray-900">
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

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </CommonModal>

      {/* Global Loading Modal */}
      <LoadingModal
        isLoading={loading || (viewLoading && stories.length === 0)}
        message={modalMessage}
        variant="spinner"
        showProgress={false}
      />
    </div>
  );
};

export default StoryManager;