// WeddingStoryDashboard.jsx - Light Theme with Delete Confirmation Modal
import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
import LoadingModal from "../../commonComponents/LoadingModal";
import DeleteConfirmationModal from "../../commonComponents/DeleteConfirmationModal"; // ✅ Import

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
  const [modalMessage, setModalMessage] = useState("Loading...");

  /* =========================
     SLIDER STATE
  ========================= */
  const [selectedStory, setSelectedStory] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  /* =========================
     DELETE CONFIRMATION STATE
  ========================= */
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // { id, title }

  /* =========================
     REF FOR SCROLL CONTAINER
  ========================= */
  const scrollContainerRef = useRef(null);

  /* =========================
     CREATE STORY
  ========================= */
  const handleCreateStory = async (e) => {
    e.preventDefault();
    setLoading(true);
    setModalMessage("Publishing wedding story...");
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("coverImage", coverImage);
      for (let i = 0; i < galleryImages.length; i++) {
        formData.append("galleryImages", galleryImages[i]);
      }
      await createWeddingStory(formData);
      toast.success("Wedding Story Created Successfully");
      setTitle("");
      setDescription("");
      setCoverImage(null);
      setGalleryImages([]);
      getStories();
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
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
      toast.error("Failed to load stories");
    }
  };

  /* =========================
     DELETE – OPEN CONFIRMATION
  ========================= */
  const handleDeleteClick = (id, title) => {
    setItemToDelete({ id, title });
    setDeleteModalOpen(true);
  };

  /* =========================
     CONFIRM DELETE
  ========================= */
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setLoading(true);
    setModalMessage("Deleting story...");
    try {
      await deleteWeddingStory(itemToDelete.id);
      toast.success("Story deleted successfully");
      getStories();
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to delete");
    } finally {
      setLoading(false);
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  /* =========================
     CLOSE DELETE MODAL
  ========================= */
  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
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
     SCROLL RESET ON TAB CHANGE
  ========================= */
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  /* =========================
     USE EFFECT
  ========================= */
  useEffect(() => {
    getStories();
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 text-gray-800">
      {/* Fixed Header & Tabs */}
      <div className="flex-shrink-0 px-4 ">
        {/* Tabs */}
        <div className="max-w-7xl mx-auto  border-b border-gray-300 bg-white">
          <div className="flex">
            <button
              onClick={() => setActiveTab("create")}
              className={`px-8 py-4 text-sm font-semibold rounded-t-lg rounded-b-none uppercase tracking-[3px] transition-all duration-200 ${
                activeTab === "create"
                  ? "bg-blue-600 text-white"
                  : "text-slate-700"
              }`}
            >
              Create Story
            </button>
            <button
              onClick={() => setActiveTab("stories")}
              className={`px-8 py-4 text-sm font-semibold rounded-t-lg rounded-b-none uppercase tracking-[3px] transition-all duration-200 ${
                activeTab === "stories"
                  ? "bg-blue-600 text-white"
                  : "text-slate-700"
              }`}
            >
              All Wedding Stories
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content – with ref */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-10 pb-6"
      >
        <div className="max-w-7xl mx-auto mt-6 md:mt-8">
          {/* CREATE TAB */}
          {activeTab === "create" && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-5 sm:p-6 md:p-8 border border-gray-200">
              <form onSubmit={handleCreateStory} className="space-y-6 md:space-y-8">
                {/* TITLE */}
                <div>
                  <label className="block mb-2 text-gray-700 uppercase tracking-[2px] text-xs font-semibold">
                    Couple / Story Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., A Royal Love Affair"
                    className="w-full bg-white border border-gray-300 rounded-xl px-5 py-3 text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition"
                    required
                  />
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className="block mb-2 text-gray-700 uppercase tracking-[2px] text-xs font-semibold">
                    Description
                  </label>
                  <textarea
                    rows="4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Share the beautiful story..."
                    className="w-full bg-white border border-gray-300 rounded-xl px-5 py-3 text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                {/* COVER IMAGE */}
                <div>
                  <label className="block mb-2 text-gray-700 uppercase tracking-[2px] text-xs font-semibold">
                    Cover Image
                  </label>
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-xl border border-gray-300 transition text-sm flex items-center gap-2">
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
                      <span className="text-sm text-gray-600 truncate max-w-[200px]">
                        {coverImage.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* GALLERY IMAGES */}
                <div>
                  <label className="block mb-2 text-gray-700 uppercase tracking-[2px] text-xs font-semibold">
                    Gallery Images (multiple)
                  </label>
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-xl border border-gray-300 transition text-sm flex items-center gap-2">
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
                      <span className="text-sm text-gray-600">
                        {galleryImages.length} file(s) selected
                      </span>
                    )}
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 rounded-xl uppercase tracking-[2px] text-xs sm:text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
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
                <div className="text-center py-16 sm:py-20 bg-white/60 rounded-2xl backdrop-blur-sm border border-gray-200 px-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                    <FaImages size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-700 text-xl font-light mb-2">No stories yet</p>
                  <p className="text-gray-400">Create your first wedding story</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {stories.map((story) => (
                    <div
                      key={story._id}
                      className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200"
                    >
                      {/* Image */}
                      <div className="relative overflow-hidden h-44 sm:h-52">
                        <img
                          src={story.coverImage}
                          alt={story.title}
                          className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h2 className="text-lg font-medium text-gray-800 uppercase tracking-[1px] truncate">
                          {story.title}
                        </h2>

                        <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
                          <FaImages size={14} />
                          <span>{story.galleryImages?.length || 0} Images</span>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => openSlider(story)}
                            className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs uppercase tracking-[1px] transition-all duration-300"
                          >
                            <FaEye size={12} />
                            View
                          </button>

                          <button
                            onClick={() => handleDeleteClick(story._id, story.title)}
                            className="flex-1 inline-flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-2 rounded-lg text-xs uppercase tracking-[1px] transition-all duration-300"
                          >
                            <FaTrash size={12} />
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
      </div>

      {/* FULLSCREEN SLIDER MODAL */}
      {selectedStory && (
        <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-md overflow-hidden">
          <button
            onClick={closeSlider}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 text-gray-300 hover:text-white text-2xl sm:text-3xl transition"
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

      {/* Global Loading Modal */}
      <LoadingModal
        isLoading={loading}
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
        message={`Are you sure you want to delete "${itemToDelete?.title || 'this story'}"?`}
        itemName={itemToDelete?.title}
        isLoading={loading}
      />
    </div>
  );
};

export default WeddingStoryDashboard;