// StoryManager.jsx - Fully Responsive (Dark theme unchanged)
import React, { useState, useEffect, useCallback } from "react";
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
import CommonModal from "../../commonComponents/modelCommonComponents";
import { createStory, getAllStories, deleteStory } from "../../../config/api";

const StoryManager = () => {
  const [activeTab, setActiveTab] = useState("upload");

  // Upload state
  const [openModal, setOpenModal] = useState(false);
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
      alert("Maximum 10 images allowed");
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
      alert(response.data.message || "Story created successfully!");
      resetForm();
      setOpenModal(false);
      if (activeTab === "view") fetchStories();
    } catch (error) {
      alert(error?.response?.data?.message || "Something went wrong");
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
    if (!window.confirm("Delete this story? This action cannot be undone.")) return;
    setViewLoading(true);
    try {
      await deleteStory(id);
      setStories((prev) => prev.filter((s) => s._id !== id));
      alert("Story deleted successfully");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to delete story");
    } finally {
      setViewLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
   
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">



         <div className="max-w-7xl mx-auto text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-light mt-5 text-white uppercase tracking-[4px]">
                Story Manager
              </h1>
              <div className="w-20 h-px bg-gray-700 mx-auto mt-3 mb-2"></div>
              <p className="text-gray-400 text-sm">Curate timeless memories</p>
            </div>

        {/* Tabs - Responsive: wrap on small screens */}
        <div className="flex justify-center">
          <div className="bg-gray-900 rounded-full p-1 shadow-sm inline-flex flex-wrap justify-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab("upload")}
              className={`px-4 sm:px-8 py-2 rounded-full text-sm sm:text-base font-medium transition-all duration-200 ${
                activeTab === "upload"
                  ? "bg-gray-800 text-white shadow-md"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              <span className="flex items-center gap-2">
                <Upload size={18} />
                Upload Story
              </span>
            </button>
            <button
              onClick={() => setActiveTab("view")}
              className={`px-4 sm:px-8 py-2 rounded-full text-sm sm:text-base font-medium transition-all duration-200 ${
                activeTab === "view"
                  ? "bg-gray-800 text-white shadow-md"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              <span className="flex items-center gap-2">
                <Grid3x3 size={18} />
                View Stories
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-8 sm:mt-12">
          {activeTab === "upload" && (
            <div className="bg-gray-900 rounded-2xl shadow-xl border border-gray-800 p-6 sm:p-12 text-center transition-all">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-gray-400 mb-8">
                  Share beautiful moments, photos, and the unique journey of each couple
                </p>
                <button
                  onClick={() => setOpenModal(true)}
                  className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 sm:px-8 py-3 rounded-xl font-medium transition-all shadow-lg"
                >
                  <Plus size={20} />
                  Create New Story
                </button>
              </div>
            </div>
          )}

          {activeTab === "view" && (
            <div className="space-y-6">
              {viewLoading && (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500"></div>
                </div>
              )}

              {viewError && (
                <div className="bg-red-900/20 border border-red-800 rounded-2xl p-8 text-center">
                  <p className="text-red-400 mb-4">{viewError}</p>
                  <button
                    onClick={fetchStories}
                    className="text-gray-300 hover:text-white font-medium"
                  >
                    Try Again →
                  </button>
                </div>
              )}

              {!viewLoading && !viewError && (
                <>
                  {stories.length === 0 ? (
                    <div className="bg-gray-900 rounded-2xl shadow-sm p-12 text-center border border-gray-800">
                      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8 text-gray-500" />
                      </div>
                      <p className="text-gray-400">No stories found. Create your first story!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                      {stories.map((story) => (
                        <div
                          key={story._id}
                          className="group bg-gray-900 rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-800"
                        >
                          <div
                            className="relative h-56 bg-gray-800 cursor-pointer overflow-hidden"
                            onClick={() => openStoryDetails(story)}
                          >
                            <img
                              src={story.coverImage || "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop"}
                              alt={story.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute bottom-3 right-3  backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Eye size={16} className="text-white" />
                            </div>
                          </div>

                          <div className="p-5">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-bold text-xl text-white line-clamp-1">
                                  {story.title}
                                </h3>
                                <p className="text-gray-400 text-sm mt-1 flex items-center gap-1">
                                  <User size={14} />
                                  {story.couple}
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteStory(story._id);
                                }}
                                className="text-gray-500 hover:text-red-400 transition-colors p-1"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>

                            <div className="mt-3 space-y-1.5">
                              <p className="text-gray-400 text-sm flex items-center gap-1.5">
                                <MapPin size={14} className="flex-shrink-0" />
                                <span className="line-clamp-1">{story.location}</span>
                              </p>
                              <p className="text-gray-400 text-sm flex items-center gap-1.5">
                                <Calendar size={14} className="flex-shrink-0" />
                                {formatDate(story.date)}
                              </p>
                            </div>

                            <p className="text-gray-300 text-sm mt-3 line-clamp-2">
                              {story.description}
                            </p>

                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-800">
                              <div className="flex gap-2">
                                {story.galleryImages?.length > 0 && (
                                  <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full flex items-center gap-1">
                                    <Image size={12} /> {story.galleryImages.length}
                                  </span>
                                )}
                                {story.galleryVideos?.length > 0 && (
                                  <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full flex items-center gap-1">
                                    <Video size={12} /> {story.galleryVideos.length}
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => openStoryDetails(story)}
                                className="text-gray-300 hover:text-white text-sm font-medium flex items-center gap-1"
                              >
                                Read Story <ChevronRight size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal - Dark theme (already responsive thanks to CommonModal) */}
      <CommonModal
        isOpen={openModal}
        onClose={() => {
          resetForm();
          setOpenModal(false);
        }}
        title="Craft Your Wedding Story"
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6  text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                Story Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition"
                placeholder="e.g., A Timeless Love"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                Couple Name
              </label>
              <input
                type="text"
                name="couple"
                value={formData.couple}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition"
                placeholder="e.g., Emily & James"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition"
                placeholder="e.g., Paris, France"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                Wedding Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1.5">
              Description
            </label>
            <textarea
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition"
              placeholder="Share the beautiful journey and memories..."
              required
            />
          </div>

          {/* Cover Image */}
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
              <Image size={18} className="text-gray-400" /> Cover Image
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <label className="cursor-pointer bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm font-medium text-gray-200 hover:bg-gray-700 transition flex items-center gap-2">
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
                  className="text-red-400 hover:text-red-300 transition text-sm flex items-center gap-1"
                >
                  <Trash2 size={16} /> Remove
                </button>
              )}
            </div>
            {coverPreview && (
              <div className="mt-4">
                <img
                  src={coverPreview}
                  className="w-40 h-40 object-cover rounded-lg shadow-sm border border-gray-700"
                  alt="cover preview"
                />
              </div>
            )}
          </div>

          {/* Audio */}
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
              <Music size={18} className="text-gray-400" /> Background Audio (optional)
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <label className="cursor-pointer bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm font-medium text-gray-200 hover:bg-gray-700 transition flex items-center gap-2">
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
                  className="text-red-400 hover:text-red-300 transition text-sm"
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
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
              <Image size={18} className="text-gray-400" /> Gallery Images (max 10)
            </label>
            <div className="flex flex-wrap gap-3">
              {galleryImages.map((img, i) => (
                <div key={i} className="relative group">
                  <img
                    src={URL.createObjectURL(img)}
                    className="w-20 h-20 object-cover rounded-lg shadow-sm border border-gray-700"
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
              <label className="w-20 h-20 bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 transition">
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
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
              <Video size={18} className="text-gray-400" /> Gallery Videos (optional)
            </label>
            <div className="flex flex-wrap gap-4">
              {galleryVideos.map((vid, i) => (
                <div key={i} className="relative w-40 rounded-lg overflow-hidden shadow-sm bg-gray-800 border border-gray-700">
                  <video
                    src={videoPreviews[vid.name]}
                    className="w-full h-24 object-cover"
                    controls
                    controlsList="nodownload"
                  />
                  <div className="p-1 flex justify-between items-center bg-gray-900">
                    <span className="text-xs truncate w-28 text-gray-300">{vid.name}</span>
                    <button
                      type="button"
                      onClick={() => removeGalleryVideo(i)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
              <label className="w-40 h-40 bg-gray-800 border-2 border-dashed border-gray-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 transition">
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

          <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setOpenModal(false);
              }}
              className="px-5 py-2.5 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition shadow-sm disabled:opacity-70 flex items-center gap-2"
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
      </CommonModal>

      {/* Story Details Modal - Dark theme */}
      <CommonModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="Story Details"
        size="xl"
      >
        {selectedStory && (
          <div className="space-y-6 sm:space-y-8 bg-gray-900 text-white">
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              <img
                src={selectedStory.coverImage || "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200"}
                alt={selectedStory.title}
                className="w-full h-64 sm:h-72 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">{selectedStory.title}</h2>
                <p className="text-gray-200 text-base sm:text-lg mt-1">{selectedStory.couple}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 sm:gap-6 justify-center text-center border-b border-gray-800 pb-6">
              <div className="flex items-center gap-2 text-gray-300">
                <Calendar size={18} className="text-gray-400" />
                <span>{formatDate(selectedStory.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <MapPin size={18} className="text-gray-400" />
                <span>{selectedStory.location}</span>
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl p-4 sm:p-6">
              <p className="text-gray-200 leading-relaxed text-center text-base sm:text-lg italic">
                "{selectedStory.description}"
              </p>
            </div>

            {selectedStory.audio && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-sm">
                <label className="flex items-center gap-2 mb-2 font-semibold text-gray-200">
                  <Music size={18} className="text-gray-400" /> Background Melody
                </label>
                <audio controls className="w-full">
                  <source src={selectedStory.audio} type="audio/mpeg" />
                </audio>
              </div>
            )}

            {selectedStory.galleryImages && selectedStory.galleryImages.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Image size={20} className="text-gray-400" /> Photo Gallery
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
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Video size={20} className="text-gray-400" /> Video Memories
                  <span className="text-sm text-gray-400">({selectedStory.galleryVideos.length})</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {selectedStory.galleryVideos.map((vid, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden shadow-lg ">
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

            <div className="flex justify-end pt-4 border-t border-gray-800">
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="px-5 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </CommonModal>
    </div>
  );
};

export default StoryManager;