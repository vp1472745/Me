// StoryManager.jsx
import React, { useState, useEffect } from "react";
import { Plus, Trash2, Image, Music, Video, X, Play } from "lucide-react";
import CommonModal from "../../commonComponents/modelCommonComponents";
import { createStory, getAllStories } from "../../../config/api";
import StoriesList from "./getAllStories";

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

  useEffect(() => {
    if (activeTab === "view") {
      fetchStories();
    }
  }, [activeTab]);

  const fetchStories = async () => {
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
  };

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
      alert(response.data.message);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf8f0] to-[#f4ede3] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="border-t border-[#cfc6bb] pt-10">
          <h1 className="text-center tracking-[10px] text-3xl text-[#6f655d] font-light">
            STORIES
          </h1>
          <p className="text-center italic text-[#b1a79d] mt-4 text-lg">
            Delve deeper into our world of story-telling!
          </p>
          <div className="border-b border-[#cfc6bb] mt-10"></div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-8 mt-8 border-b border-[#cfc6bb]">
          <button
            onClick={() => setActiveTab("upload")}
            className={`pb-3 px-6 text-lg font-medium transition-all ${
              activeTab === "upload"
                ? "text-[#6d645b] border-b-2 border-[#6d645b]"
                : "text-[#b1a79d] hover:text-[#6d645b]"
            }`}
          >
            📤 Upload Story
          </button>
          <button
            onClick={() => setActiveTab("view")}
            className={`pb-3 px-6 text-lg font-medium transition-all ${
              activeTab === "view"
                ? "text-[#6d645b] border-b-2 border-[#6d645b]"
                : "text-[#b1a79d] hover:text-[#6d645b]"
            }`}
          >
            📖 View Stories
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-12">
          {activeTab === "upload" && (
            <div className="bg-white/30 rounded-2xl p-6 shadow-sm text-center">
              <button
                onClick={() => setOpenModal(true)}
                className="group relative overflow-hidden bg-gradient-to-r from-[#8b7355] to-[#6b5b4b] hover:from-[#7a6348] hover:to-[#5a4a3a] text-white px-10 py-5 rounded-2xl text-lg font-semibold transition-all duration-500 shadow-xl"
              >
                ✨ Create New Story
              </button>
            </div>
          )}

          {activeTab === "view" && (
            <StoriesList
              stories={stories}
              loading={viewLoading}
              error={viewError}
              onRetry={fetchStories}
              onStoryClick={openStoryDetails}
            />
          )}
        </div>
      </div>

      {/* Upload Modal (Complete Form) */}
      <CommonModal
        isOpen={openModal}
        onClose={() => {
          resetForm();
          setOpenModal(false);
        }}
        title="Craft Your Wedding Story"
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 font-semibold">Story Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Couple Name</label>
            <input
              type="text"
              name="couple"
              value={formData.couple}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Wedding Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Description</label>
            <textarea
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
              required
            />
          </div>

          {/* Cover Image */}
          <div className="bg-white/50 p-4 rounded-xl">
            <label className="flex gap-2">📷 Cover Image</label>
            <div className="flex gap-2 mt-2">
              <label className="cursor-pointer bg-gray-200 px-4 py-2 rounded">
                <Plus size={16} /> Choose
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
                  className="text-red-500"
                >
                  <Trash2 />
                </button>
              )}
            </div>
            {coverPreview && (
              <img
                src={coverPreview}
                className="mt-2 w-32 h-32 object-cover rounded"
                alt="cover preview"
              />
            )}
          </div>

          {/* Audio */}
          <div className="bg-white/50 p-4 rounded-xl">
            <label className="flex gap-2">🎵 Audio (optional)</label>
            <div className="flex gap-2 mt-2">
              <label className="cursor-pointer bg-gray-200 px-4 py-2 rounded">
                <Plus size={16} /> Choose
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
                  className="text-red-500"
                >
                  <Trash2 />
                </button>
              )}
            </div>
            {audioPreview && (
              <audio controls className="mt-2 w-full">
                <source src={audioPreview} />
              </audio>
            )}
          </div>

          {/* Gallery Images */}
          <div className="bg-white/50 p-4 rounded-xl">
            <label>🖼️ Gallery Images (max 10)</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {galleryImages.map((img, i) => (
                <div key={i} className="relative w-20 h-20">
                  <img
                    src={URL.createObjectURL(img)}
                    className="w-full h-full object-cover rounded"
                    alt="gallery"
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(i)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <label className="w-20 h-20 bg-gray-200 flex items-center justify-center rounded cursor-pointer">
                <Plus />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryImagesChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs mt-1">{galleryImages.length}/10</p>
          </div>

          {/* Gallery Videos */}
          <div className="bg-white/50 p-4 rounded-xl">
            <label>🎬 Gallery Videos (optional)</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {galleryVideos.map((vid, i) => (
                <div key={i} className="relative w-40 p-1 bg-white rounded shadow">
                  <video
                    src={videoPreviews[vid.name]}
                    className="w-full h-24 object-cover rounded"
                    controls
                    controlsList="nodownload"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs truncate w-28">{vid.name}</span>
                    <button
                      type="button"
                      onClick={() => removeGalleryVideo(i)}
                      className="text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
              <label className="w-40 h-40 bg-gray-200 flex flex-col items-center justify-center rounded cursor-pointer">
                <Plus size={24} />
                <span className="text-xs">Add Video</span>
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

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setOpenModal(false);
              }}
              className="px-6 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#8b7355] text-white rounded"
            >
              {loading ? "Uploading..." : "Publish"}
            </button>
          </div>
        </form>
      </CommonModal>

      {/* Story Details Modal */}
      <CommonModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="Story Details"
        size="xl"
      >
        {selectedStory && (
          <div className="space-y-6">
            <div className="rounded-xl overflow-hidden">
              <img
                src={selectedStory.coverImage || "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200"}
                alt={selectedStory.title}
                className="w-full h-64 object-cover"
              />
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-light text-[#6d645b] uppercase tracking-wider">
                {selectedStory.title}
              </h2>
              <p className="text-xl text-[#8c8177] mt-2">{selectedStory.couple}</p>
              <p className="text-[#a09589] mt-1">
                {formatDate(selectedStory.date)} | {selectedStory.location}
              </p>
            </div>
            <div className="bg-white/30 p-5 rounded-xl">
              <p className="text-[#7d7369] leading-relaxed text-center">
                {selectedStory.description}
              </p>
            </div>
            {selectedStory.audio && (
              <div className="bg-white/50 p-4 rounded-xl">
                <label className="flex items-center gap-2 mb-2 font-semibold">
                  <Music size={18} /> Background Audio
                </label>
                <audio controls className="w-full">
                  <source src={selectedStory.audio} type="audio/mpeg" />
                </audio>
              </div>
            )}
            {selectedStory.galleryImages && selectedStory.galleryImages.length > 0 && (
              <div>
                <label className="flex items-center gap-2 mb-3 font-semibold">
                  <Image size={18} /> Gallery Images ({selectedStory.galleryImages.length})
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {selectedStory.galleryImages.map((img, idx) => (
                    <div key={idx} className="overflow-hidden rounded-lg shadow-md">
                      <img
                        src={img}
                        alt={`gallery-${idx}`}
                        className="w-full h-40 object-cover hover:scale-105 transition"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selectedStory.galleryVideos && selectedStory.galleryVideos.length > 0 && (
              <div>
                <label className="flex items-center gap-2 mb-3 font-semibold">
                  <Video size={18} /> Gallery Videos ({selectedStory.galleryVideos.length})
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedStory.galleryVideos.map((vid, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden shadow-md">
                      <video
                        src={vid}
                        controls
                        controlsList="nodownload"
                        className="w-full h-56 object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <Play className="text-white w-12 h-12 drop-shadow-lg opacity-70" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CommonModal>
    </div>
  );
};

export default StoryManager;