import { useEffect, useState } from "react";

import {
  createWeddingStory,
  getAllWeddingStories,
  deleteWeddingStory,
} from "../../../config/api";

import {
  FaImages,
  FaTrash,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaTimes,
} from "react-icons/fa";

const WeddingStoryDashboard = () => {
  /* =========================
     TAB STATE
  ========================= */
  const [activeTab, setActiveTab] = useState("create");

  /* =========================
     FORM STATE
  ========================= */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);

  /* =========================
     STORIES
  ========================= */
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);

  /* =========================
     SLIDER STATE
  ========================= */
  const [selectedStory, setSelectedStory] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  /* =========================
     CREATE STORY
  ========================= */
  const handleCreateStory = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("coverImage", coverImage);
      for (let i = 0; i < galleryImages.length; i++) {
        formData.append("galleryImages", galleryImages[i]);
      }
      await createWeddingStory(formData);
      alert("Wedding Story Created Successfully");
      setTitle("");
      setDescription("");
      setCoverImage(null);
      setGalleryImages([]);
      getStories();
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     GET STORIES
  ========================= */
  const getStories = async () => {
    try {
      const response = await getAllWeddingStories();
      setStories(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  /* =========================
     DELETE
  ========================= */
  const handleDelete = async (id) => {
    try {
      await deleteWeddingStory(id);
      getStories();
    } catch (error) {
      console.log(error);
    }
  };

  /* =========================
     OPEN SLIDER
  ========================= */
  const openSlider = (story) => {
    setSelectedStory(story);
    setCurrentImageIndex(0);
    document.body.style.overflow = "hidden";
  };

  /* =========================
     CLOSE SLIDER
  ========================= */
  const closeSlider = () => {
    setSelectedStory(null);
    document.body.style.overflow = "auto";
  };

  /* =========================
     NEXT / PREV IMAGE
  ========================= */
  const nextImage = () => {
    if (selectedStory) {
      setCurrentImageIndex((prev) =>
        prev === selectedStory.galleryImages?.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedStory) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedStory.galleryImages?.length - 1 : prev - 1
      );
    }
  };

  /* =========================
     KEYBOARD NAVIGATION
  ========================= */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedStory) return;
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "Escape") closeSlider();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedStory]);

  /* =========================
     USE EFFECT
  ========================= */
  useEffect(() => {
    getStories();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf8f0] to-[#f4ede3] px-4 md:px-10 py-10">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto">
        <div className="border-t border-[#cfc6bb] w-20 mb-6"></div>
        <h1 className="text-4xl md:text-5xl tracking-[6px] text-[#6f655d] font-light uppercase">
          Wedding Stories
        </h1>
        <p className="text-[#b1a79d] mt-3 max-w-xl leading-relaxed">
          Craft and manage cinematic wedding galleries — each story is a timeless treasure.
        </p>
        <div className="border-b border-[#cfc6bb] w-full mt-6"></div>
      </div>

      {/* TABS */}
      <div className="max-w-7xl mx-auto mt-8 flex gap-2 border-b border-[#e0d6cc]">
        <button
          onClick={() => setActiveTab("create")}
          className={`px-6 py-3 text-sm uppercase tracking-[3px] font-medium transition-all duration-300 rounded-t-lg ${
            activeTab === "create"
              ? "bg-white text-[#6f655d] shadow-md"
              : "text-[#b1a79d] hover:text-[#6f655d]"
          }`}
        >
          Create Story
        </button>
        <button
          onClick={() => setActiveTab("stories")}
          className={`px-6 py-3 text-sm uppercase tracking-[3px] font-medium transition-all duration-300 rounded-t-lg ${
            activeTab === "stories"
              ? "bg-white text-[#6f655d] shadow-md"
              : "text-[#b1a79d] hover:text-[#6f655d]"
          }`}
        >
          All Wedding Stories
        </button>
      </div>

      <div className="max-w-7xl mx-auto mt-10">
        {/* CREATE TAB */}
        {activeTab === "create" && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 border border-[#e8dfd1]">
            <form onSubmit={handleCreateStory} className="space-y-8">
              {/* TITLE */}
              <div>
                <label className="block mb-2 text-[#6f655d] uppercase tracking-[2px] text-xs font-semibold">
                  Story Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., A Royal Love Affair"
                  className="w-full border border-[#d4c5b3] rounded-xl px-5 py-3 outline-none focus:border-[#8b7355] focus:ring-1 focus:ring-[#8b7355]/30 transition bg-white/90"
                  required
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="block mb-2 text-[#6f655d] uppercase tracking-[2px] text-xs font-semibold">
                  Description
                </label>
                <textarea
                  rows="5"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write a beautiful description of the wedding story..."
                  className="w-full border border-[#d4c5b3] rounded-xl px-5 py-3 outline-none focus:border-[#8b7355] focus:ring-1 focus:ring-[#8b7355]/30 transition bg-white/90 resize-none"
                />
              </div>

              {/* COVER IMAGE */}
              <div>
                <label className="block mb-2 text-[#6f655d] uppercase tracking-[2px] text-xs font-semibold">
                  Cover Image
                </label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer bg-[#f4ede3] hover:bg-[#e8dfd1] text-[#6f655d] px-5 py-2 rounded-xl border border-[#d4c5b3] transition text-sm flex items-center gap-2">
                    <FaPlus size={12} /> Choose Cover
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setCoverImage(e.target.files[0])}
                      className="hidden"
                      required
                    />
                  </label>
                  {coverImage && (
                    <span className="text-sm text-[#8b7355] truncate max-w-[200px]">
                      {coverImage.name}
                    </span>
                  )}
                </div>
              </div>

              {/* GALLERY IMAGES */}
              <div>
                <label className="block mb-2 text-[#6f655d] uppercase tracking-[2px] text-xs font-semibold">
                  Gallery Images (multiple)
                </label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer bg-[#f4ede3] hover:bg-[#e8dfd1] text-[#6f655d] px-5 py-2 rounded-xl border border-[#d4c5b3] transition text-sm flex items-center gap-2">
                    <FaImages size={14} /> Select Images
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => setGalleryImages(e.target.files)}
                      className="hidden"
                    />
                  </label>
                  {galleryImages.length > 0 && (
                    <span className="text-sm text-[#8b7355]">
                      {galleryImages.length} file(s) selected
                    </span>
                  )}
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#8b7355] to-[#6b5b4b] hover:from-[#7a6348] hover:to-[#5a4a3a] text-white px-8 py-3 rounded-xl uppercase tracking-[2px] text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
              >
                <FaPlus size={14} />
                {loading ? "Creating..." : "Publish Story"}
              </button>
            </form>
          </div>
        )}

        {/* STORIES TAB */}
        {activeTab === "stories" && (
          <>
            {stories.length === 0 ? (
              <div className="text-center py-20 bg-white/30 rounded-2xl backdrop-blur-sm">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-[#e8dfd1] rounded-full mb-4">
                  <FaImages size={32} className="text-[#8b7355]" />
                </div>
                <p className="text-[#8b7355] text-xl font-light mb-2">No stories yet</p>
                <p className="text-[#b1a79d]">Create your first wedding story</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {stories.map((story) => (
                  <div
                    key={story._id}
                    className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1"
                  >
                    <div className="relative overflow-hidden h-72">
                      <img
                        src={story.coverImage}
                        alt={story.title}
                        className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <h2 className="text-2xl text-[#6f655d] uppercase tracking-[2px] font-light truncate">
                        {story.title}
                      </h2>
                      <p className="mt-3 text-[#9b9187] leading-relaxed line-clamp-3">
                        {story.description}
                      </p>
                      <div className="flex items-center gap-2 mt-5 text-[#8b7355] text-sm">
                        <FaImages size={16} />
                        <span>{story.galleryImages?.length || 0} Images in gallery</span>
                      </div>
                      <div className="flex gap-3 mt-6">
                        {/* VIEW GALLERY BUTTON */}
                        <button
                          onClick={() => openSlider(story)}
                          className="flex-1 inline-flex items-center justify-center gap-2 bg-[#8b7355] hover:bg-[#6b5b4b] text-white px-4 py-2 rounded-xl uppercase tracking-[1px] text-sm transition-all duration-300"
                        >
                          <FaEye size={14} />
                          View Gallery
                        </button>
                        {/* DELETE BUTTON */}
                        <button
                          onClick={() => handleDelete(story._id)}
                          className="flex-1 inline-flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-xl uppercase tracking-[1px] text-sm transition-all duration-300"
                        >
                          <FaTrash size={14} />
                          Delete
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

      {/* FULLSCREEN SLIDER MODAL */}
      {selectedStory && (
        <div className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-md overflow-hidden">
          {/* Close button */}
          <button
            onClick={closeSlider}
            className="absolute top-6 right-6 z-50 text-white/80 hover:text-white text-3xl transition"
            aria-label="Close"
          >
            <FaTimes />
          </button>

          {/* Title */}
          <h1 className="absolute top-6 left-1/2 -translate-x-1/2 z-40 text-white text-2xl md:text-3xl uppercase tracking-[4px] font-light text-center whitespace-nowrap">
            {selectedStory.title}
          </h1>

          {/* Description (optional) */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 text-white/80 text-sm text-center max-w-2xl px-4">
            {selectedStory.description}
          </div>

          <div className="h-screen flex items-center justify-center relative">
            {/* Previous button */}
            <button
              onClick={prevImage}
              className="absolute left-4 md:left-8 z-40 w-10 h-10 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl md:text-2xl hover:bg-white/40 transition"
              aria-label="Previous"
            >
              <FaChevronLeft />
            </button>

            {/* Current image */}
            {selectedStory.galleryImages?.length > 0 ? (
              <img
                src={selectedStory.galleryImages[currentImageIndex]}
                alt={`${selectedStory.title} - ${currentImageIndex + 1}`}
                className="w-full h-screen object-contain md:object-cover"
              />
            ) : (
              <div className="text-white text-center">
                <FaImages size={64} className="mx-auto mb-4 opacity-50" />
                <p>No images in this gallery</p>
              </div>
            )}

            {/* Next button */}
            <button
              onClick={nextImage}
              className="absolute right-4 md:right-8 z-40 w-10 h-10 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl md:text-2xl hover:bg-white/40 transition"
              aria-label="Next"
            >
              <FaChevronRight />
            </button>
          </div>

          {/* Image counter */}
          {selectedStory.galleryImages?.length > 0 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/80 text-sm md:text-base tracking-wide z-40">
              {currentImageIndex + 1} / {selectedStory.galleryImages.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WeddingStoryDashboard;