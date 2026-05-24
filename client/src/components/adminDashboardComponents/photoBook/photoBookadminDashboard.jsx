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
// missing but needed for API – added to fix error
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
    if (window.confirm("Delete this story? This action cannot be undone.")) {
      try {
        await deleteWeddingStory(id);
        getStories();
      } catch (error) {
        console.log(error);
      }
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
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 md:px-10 py-8 md:py-10">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto text-center mt-10">
        <h1 className="text-3xl md:text-4xl font-light text-white uppercase tracking-[4px]">
          PhotoBook
        </h1>
        <div className="w-20 h-px bg-gray-700 mx-auto mt-3 mb-2"></div>
        <p className="text-gray-400 text-sm">Curate timeless memories</p>
      </div>

      {/* TABS - Responsive with dark theme */}
      <div className="max-w-7xl mx-auto mt-8 flex flex-wrap gap-2 border-b border-gray-800">
        <button
          onClick={() => setActiveTab("create")}
          className={`px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm uppercase tracking-[3px] font-medium transition-all duration-300 rounded-t-lg ${
            activeTab === "create"
              ? "bg-gray-800 text-white shadow-md"
              : "text-gray-400 hover:text-white hover:bg-gray-800/50"
          }`}
        >
          Create Story
        </button>
        <button
          onClick={() => setActiveTab("stories")}
          className={`px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm uppercase tracking-[3px] font-medium transition-all duration-300 rounded-t-lg ${
            activeTab === "stories"
              ? "bg-gray-800 text-white shadow-md"
              : "text-gray-400 hover:text-white hover:bg-gray-800/50"
          }`}
        >
          All Wedding Stories
        </button>
      </div>

      <div className="max-w-7xl mx-auto mt-8 md:mt-10">
        {/* CREATE TAB */}
        {activeTab === "create" && (
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl p-5 sm:p-6 md:p-8 border border-gray-800">
            <form onSubmit={handleCreateStory} className="space-y-6 md:space-y-8">
              {/* TITLE */}
              <div>
                <label className="block mb-2 text-gray-300 uppercase tracking-[2px] text-xs font-semibold">
                  Couple / Story Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., A Royal Love Affair"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-5 py-3 text-white outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition"
                  required
                />
              </div>



              {/* COVER IMAGE */}
              <div>
                <label className="block mb-2 text-gray-300 uppercase tracking-[2px] text-xs font-semibold">
                  Cover Image
                </label>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-gray-200 px-5 py-2 rounded-xl border border-gray-700 transition text-sm flex items-center gap-2">
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
                    <span className="text-sm text-gray-400 truncate max-w-[200px]">
                      {coverImage.name}
                    </span>
                  )}
                </div>
              </div>

              {/* GALLERY IMAGES */}
              <div>
                <label className="block mb-2 text-gray-300 uppercase tracking-[2px] text-xs font-semibold">
                  Gallery Images (multiple)
                </label>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-gray-200 px-5 py-2 rounded-xl border border-gray-700 transition text-sm flex items-center gap-2">
                    <FaImages size={14} /> Select Images
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => setGalleryImages([...e.target.files])}
                      className="hidden"
                    />
                  </label>
                  {galleryImages.length > 0 && (
                    <span className="text-sm text-gray-400">
                      {galleryImages.length} file(s) selected
                    </span>
                  )}
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 sm:px-8 py-3 rounded-xl uppercase tracking-[2px] text-xs sm:text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
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
              <div className="text-center py-16 sm:py-20 bg-gray-900/40 rounded-2xl backdrop-blur-sm border border-gray-800 px-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-800 rounded-full mb-4">
                  <FaImages size={32} className="text-gray-500" />
                </div>
                <p className="text-gray-300 text-xl font-light mb-2">No stories yet</p>
                <p className="text-gray-500">Create your first wedding story</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
                {stories.map((story) => (
                  <div
                    key={story._id}
                    className="group bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 border border-gray-800"
                  >
                    <div className="relative overflow-hidden h-64 sm:h-72">
                      <img
                        src={story.coverImage}
                        alt={story.title}
                        className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5 sm:p-6">
                      <h2 className="text-xl sm:text-2xl text-white uppercase tracking-[2px] font-light truncate">
                        {story.title}
                      </h2>
                
                      <div className="flex items-center gap-2 mt-4 text-gray-400 text-sm">
                        <FaImages size={16} />
                        <span>{story.galleryImages?.length || 0} Images in gallery</span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        <button
                          onClick={() => openSlider(story)}
                          className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl uppercase tracking-[1px] text-sm transition-all duration-300"
                        >
                          <FaEye size={14} />
                          View Gallery
                        </button>
                        <button
                          onClick={() => handleDelete(story._id)}
                          className="flex-1 inline-flex items-center justify-center gap-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-800 px-4 py-2 rounded-xl uppercase tracking-[1px] text-sm transition-all duration-300"
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

      {/* FULLSCREEN SLIDER MODAL - Dark theme + responsive */}
      {selectedStory && (
        <div className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-md overflow-hidden">
          <button
            onClick={closeSlider}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 text-gray-400 hover:text-white text-2xl sm:text-3xl transition"
            aria-label="Close"
          >
            <FaTimes />
          </button>

          <h1 className="absolute top-4 left-4 right-4 sm:top-6 sm:left-1/2 sm:-translate-x-1/2 z-40 text-white text-lg sm:text-2xl md:text-3xl uppercase tracking-[2px] sm:tracking-[4px] font-light text-center truncate px-4">
            {selectedStory.title}
          </h1>

          <div className="h-screen flex items-center justify-center relative">
            <button
              onClick={prevImage}
              className="absolute left-2 sm:left-4 md:left-8 z-40 w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-base sm:text-xl md:text-2xl hover:bg-white/30 transition"
              aria-label="Previous"
            >
              <FaChevronLeft />
            </button>

            {selectedStory.galleryImages?.length > 0 ? (
              <img
                src={selectedStory.galleryImages[currentImageIndex]}
                alt={`${selectedStory.title} - ${currentImageIndex + 1}`}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-white text-center px-4">
                <FaImages size={48} className="mx-auto mb-4 opacity-50" />
                <p>No images in this gallery</p>
              </div>
            )}

            <button
              onClick={nextImage}
              className="absolute right-2 sm:right-4 md:right-8 z-40 w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-base sm:text-xl md:text-2xl hover:bg-white/30 transition"
              aria-label="Next"
            >
              <FaChevronRight />
            </button>
          </div>

          {selectedStory.galleryImages?.length > 0 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-gray-300 text-xs sm:text-sm md:text-base tracking-wide z-40 bg-black/60 px-3 py-1 rounded-full">
              {currentImageIndex + 1} / {selectedStory.galleryImages.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WeddingStoryDashboard;