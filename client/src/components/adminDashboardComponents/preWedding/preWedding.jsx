// ======================================================
// FILE: PreWedding.jsx - Professional UI (Dark Theme)
// ======================================================

import React, { useEffect, useState } from "react";

import {
  Heart,
  Trash2,
  Eye,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Upload,
} from "lucide-react";

import {
  createPreWeddingStory,
  getAllPreWeddingStories,
  deletePreWeddingStory,
} from "../../../config/api";

const PreWedding = () => {
  // ======================================================
  // TAB STATE
  // ======================================================
  const [activeTab, setActiveTab] = useState("create");

  // ======================================================
  // CREATE STATES
  // ======================================================
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  // ======================================================
  // GET ALL STATES
  // ======================================================
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  // ======================================================
  // MODAL STATES
  // ======================================================
  const [selectedStory, setSelectedStory] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // ======================================================
  // FETCH STORIES
  // ======================================================
  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await getAllPreWeddingStories();
      setStories(response?.data?.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  // ======================================================
  // CREATE STORY
  // ======================================================
  const handleCreateStory = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      if (coverImage) formData.append("coverImage", coverImage);
      galleryImages.forEach((img) => formData.append("galleryImages", img));
      await createPreWeddingStory(formData);
      alert("Pre-Wedding Story Created Successfully");
      setTitle("");
      setDescription("");
      setCoverImage(null);
      setGalleryImages([]);
      fetchStories();
      setActiveTab("all");
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Something went wrong");
    } finally {
      setUploading(false);
    }
  };

  // ======================================================
  // DELETE STORY
  // ======================================================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete?");
    if (!confirmDelete) return;
    try {
      await deletePreWeddingStory(id);
      fetchStories();
    } catch (error) {
      console.log(error);
    }
  };

  // ======================================================
  // MODAL FUNCTIONS
  // ======================================================
  const openModal = (story) => {
    setSelectedStory(story);
    setCurrentImageIndex(0);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setSelectedStory(null);
    document.body.style.overflow = "auto";
  };

  const nextImage = () => {
    if (selectedStory?.galleryImages?.length) {
      setCurrentImageIndex((prev) =>
        prev === selectedStory.galleryImages.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedStory?.galleryImages?.length) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedStory.galleryImages.length - 1 : prev - 1
      );
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedStory) return;
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedStory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="max-w-7xl mx-auto text-center mt-10 mb-10">
        <h1 className="text-3xl md:text-4xl font-light text-white uppercase tracking-[4px]">
        Create Pre-Wedding Stories
        </h1>
        <div className="w-20 h-px bg-gray-700 mx-auto mt-3 mb-2"></div>
        <p className="text-gray-400 text-sm">Curate timeless memories</p>
      </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-4 mb-10 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab("create")}
            className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeTab === "create"
                ? "bg-pink-600 text-white shadow-lg shadow-pink-600/20"
                : "text-gray-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Plus size={18} />
            Create Story
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeTab === "all"
                ? "bg-pink-600 text-white shadow-lg shadow-pink-600/20"
                : "text-gray-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <ImageIcon size={18} />
            All Stories
          </button>
        </div>

        {/* CREATE TAB */}
        {activeTab === "create" && (
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl">
            <form onSubmit={handleCreateStory} className="space-y-7">
              {/* Title */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Story Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Eternal Love"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-800/80 border border-gray-700 rounded-xl px-5 py-4 text-white placeholder-gray-500 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Description
                </label>
                <textarea
                  rows="4"
                  placeholder="Share the beautiful journey..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-800/80 border border-gray-700 rounded-xl px-5 py-4 text-white placeholder-gray-500 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition"
                />
              </div>

              {/* Cover Image */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Cover Image
                </label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl px-5 py-3 text-sm font-medium transition flex items-center gap-2">
                    <Plus size={16} /> Choose Cover
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setCoverImage(e.target.files[0])}
                      className="hidden"
                      required
                    />
                  </label>
                  {coverImage && (
                    <span className="text-sm text-gray-400 truncate">
                      {coverImage.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Gallery Images */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Gallery Images (multiple)
                </label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl px-5 py-3 text-sm font-medium transition flex items-center gap-2">
                    <ImageIcon size={16} /> Select Images
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => setGalleryImages(Array.from(e.target.files))}
                      className="hidden"
                    />
                  </label>
                  {galleryImages.length > 0 && (
                    <span className="text-sm text-gray-400">
                      {galleryImages.length} file(s) selected
                    </span>
                  )}
                </div>
                {/* Image previews */}
                {galleryImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-4">
                    {galleryImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={URL.createObjectURL(img)}
                        alt="preview"
                        className="h-24 w-full object-cover rounded-lg border border-gray-700"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={uploading}
                className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-3 transition-all shadow-lg shadow-pink-600/20 disabled:opacity-50"
              >
                <Upload size={20} />
                {uploading ? "Creating..." : "Publish Story"}
              </button>
            </form>
          </div>
        )}

        {/* ALL STORIES TAB */}
        {activeTab === "all" && (
          <>
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : stories.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 text-center bg-gray-900/30 rounded-3xl border border-gray-800">
                <ImageIcon size={64} className="text-gray-600 mb-4" />
                <h3 className="text-2xl font-light text-gray-400">No stories yet</h3>
                <p className="text-gray-500 mt-2">Create your first pre‑wedding story</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {stories.map((story) => (
                  <div
                    key={story._id}
                    className="group bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={story.coverImage}
                        alt={story.title}
                        className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h2 className="text-xl font-bold text-white line-clamp-1">
                          {story.title}
                        </h2>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-gray-300 text-sm line-clamp-2 min-h-[44px]">
                        {story.description}
                      </p>
                      <div className="flex items-center gap-3 mt-5">
                        <button
                          onClick={() => openModal(story)}
                          className="flex-1 bg-pink-600 hover:bg-pink-700 text-white py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition"
                        >
                          <Eye size={16} /> View
                        </button>
                        <button
                          onClick={() => handleDelete(story._id)}
                          className="bg-red-600/80 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl transition"
                        >
                          <Trash2 size={16} />
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

      {/* FULLSCREEN MODAL / LIGHTBOX */}
      {selectedStory && (
        <div className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-6xl bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-50 bg-black/60 hover:bg-red-600 p-2.5 rounded-full transition-all"
            >
              <X size={20} />
            </button>

            {/* Main Image Area */}
            <div className="relative h-[70vh] md:h-[80vh] bg-black">
              <img
                src={
                  selectedStory.galleryImages?.[currentImageIndex] ||
                  selectedStory.coverImage
                }
                alt="gallery"
                className="w-full h-full object-contain"
              />

              {/* Navigation Buttons */}
              {selectedStory?.galleryImages?.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-3 rounded-full transition"
                  >
                    <ChevronLeft size={28} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-3 rounded-full transition"
                  >
                    <ChevronRight size={28} />
                  </button>
                </>
              )}

              {/* Overlay Text */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  {selectedStory.title}
                </h2>
                <p className="text-gray-200 mt-2 text-sm md:text-base line-clamp-2">
                  {selectedStory.description}
                </p>
              </div>
            </div>

            {/* Thumbnails */}
            {selectedStory?.galleryImages?.length > 0 && (
              <div className="flex gap-3 overflow-x-auto p-4 bg-gray-900/80 border-t border-gray-800">
                {selectedStory.galleryImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt="thumb"
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-20 h-16 object-cover rounded-lg cursor-pointer transition-all duration-200 ${
                      currentImageIndex === idx
                        ? "ring-2 ring-pink-500 scale-105"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PreWedding;