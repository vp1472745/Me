// WeddingStoryDashboard.jsx - Light Nature Theme with Auto-Compression
import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import imageCompression from "browser-image-compression"; // 1. Import compression library
import { uploadToCloudinary } from "../../../services/cloudinaryUpload";
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
import DeleteConfirmationModal from "../../commonComponents/DeleteConfirmationModal";

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
  const [itemToDelete, setItemToDelete] = useState(null);

  /* =========================
      REF FOR SCROLL CONTAINER
  ========================= */
  const scrollContainerRef = useRef(null);

  // 2. Compression Options Definition (Max 2MB per image)
  const compressionOptions = {
    maxSizeMB: 2,          // Image ko compress karke 2MB se chhota banayega
    maxWidthOrHeight: 1920, // Full HD resolution dimensions maintain rakhega
    useWebWorker: true,
  };

  /* =========================
      CREATE STORY (Direct Frontend Cloudinary Upload Flow with Auto-Compression)
  ========================= */
  const handleCreateStory = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Compress & Upload Cover Image
      setModalMessage("Compressing cover image...");
      let finalCover = coverImage;
      if (coverImage.size > 2 * 1024 * 1024) { // Agar 2MB se badi hai to compress karo
        finalCover = await imageCompression(coverImage, compressionOptions);
      }

      setModalMessage("Uploading cover image to Cloudinary... 0%");
      const coverUploadResponse = await uploadToCloudinary(finalCover, (percent) => {
        setModalMessage(`Uploading cover image to Cloudinary... ${percent}%`);
      });
      const coverImageUrl = coverUploadResponse.secure_url;

      // 2. Compress & Upload Gallery Images sequentially
      const uploadedGalleryUrls = [];
      for (let i = 0; i < galleryImages.length; i++) {
        setModalMessage(`Compressing gallery frame ${i + 1} of ${galleryImages.length}...`);
        
        let finalGalleryImg = galleryImages[i];
        if (galleryImages[i].size > 2 * 1024 * 1024) {
          finalGalleryImg = await imageCompression(galleryImages[i], compressionOptions);
        }

        setModalMessage(`Uploading gallery frame ${i + 1} of ${galleryImages.length}... 0%`);
        const galleryUploadResponse = await uploadToCloudinary(finalGalleryImg, (percent) => {
          setModalMessage(
            `Uploading gallery frame ${i + 1} of ${galleryImages.length}... ${percent}%`
          );
        });
        
        uploadedGalleryUrls.push(galleryUploadResponse.secure_url);
      }

      // 3. Send final JSON URLs payload to Database
      setModalMessage("Saving collection data to database...");
      const finalPayload = {
        title,
        description,
        coverImage: coverImageUrl,
        galleryImages: uploadedGalleryUrls,
      };

      await createWeddingStory(finalPayload);
      toast.success("Wedding Story Created Successfully");
      
      // Reset Form States
      setTitle("");
      setDescription("");
      setCoverImage(null);
      setGalleryImages([]);
      setActiveTab("stories");
      getStories();
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong during upload");
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
      INITIAL LOAD
  ========================= */
  useEffect(() => {
    getStories();
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-[#F7F9F4] text-[#3B4953]">
      {/* Fixed Header & Tabs */}
      <div className="flex-shrink-0 px-4 mt-4">
        <div className="max-w-7xl mx-auto border-b border-[#DDE7D8] bg-white rounded-t-xl overflow-hidden shadow-sm">
          <div className="flex">
            <button
              onClick={() => setActiveTab("create")}
              className={`px-8 py-4 text-xs font-semibold uppercase tracking-[3px] transition-all duration-200 border-r border-[#DDE7D8] ${
                activeTab === "create"
                  ? "bg-[#EBF4DD] text-[#5A7863] border-b-2 border-b-[#5A7863]"
                  : "text-[#3B4953]/70 hover:bg-[#F7F9F4] hover:text-[#3B4953]"
              }`}
            >
              Create Story
            </button>
            <button
              onClick={() => setActiveTab("stories")}
              className={`px-8 py-4 text-xs font-semibold uppercase tracking-[3px] transition-all duration-200 ${
                activeTab === "stories"
                  ? "bg-[#EBF4DD] text-[#5A7863] border-b-2 border-b-[#5A7863]"
                  : "text-[#3B4953]/70 hover:bg-[#F7F9F4] hover:text-[#3B4953]"
              }`}
            >
              All Wedding Stories
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content Container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-10 pb-6"
      >
        <div className="max-w-7xl mx-auto mt-6">
          {/* CREATE TAB */}
          {activeTab === "create" && (
            <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 md:p-8 border border-[#DDE7D8]">
              <form onSubmit={handleCreateStory} className="space-y-6 md:space-y-8">
                {/* TITLE */}
                <div>
                  <label className="block mb-2 text-[#3B4953]/80 uppercase tracking-[2px] text-[11px] font-bold">
                    Couple / Story Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Sarah & Michael - Elegant Estate Wedding"
                    className="w-full bg-[#F7F9F4] border border-[#DDE7D8] rounded-xl px-5 py-3 text-[#3B4953] font-medium placeholder-[#3B4953]/40 outline-none focus:border-[#90AB8B] focus:ring-2 focus:ring-[#90AB8B]/20 transition"
                    required
                  />
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className="block mb-2 text-[#3B4953]/80 uppercase tracking-[2px] text-[11px] font-bold">
                    Description
                  </label>
                  <textarea
                    rows="4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Share the narrative, details, and mood of this beautiful day..."
                    className="w-full bg-[#F7F9F4] border border-[#DDE7D8] rounded-xl px-5 py-3 text-[#3B4953] font-medium placeholder-[#3B4953]/40 outline-none focus:border-[#90AB8B] focus:ring-2 focus:ring-[#90AB8B]/20 transition"
                  />
                </div>

                {/* IMAGE ROW SECTIONS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* COVER IMAGE */}
                  <div className="p-5 bg-[#F7F9F4] rounded-xl border border-[#DDE7D8]">
                    <label className="block mb-3 text-[#3B4953]/80 uppercase tracking-[2px] text-[11px] font-bold">
                      Cover Image
                    </label>
                    <div className="flex flex-wrap items-center gap-4">
                      <label className="cursor-pointer bg-white hover:bg-[#EBF4DD]/40 text-[#5A7863] font-semibold px-5 py-2.5 rounded-xl border border-[#DDE7D8] transition-all duration-200 text-sm flex items-center gap-2 shadow-sm">
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
                        <span className="text-xs bg-[#EBF4DD] text-[#5A7863] font-medium px-3 py-1 rounded-full border border-[#90AB8B]/30 truncate max-w-[200px]">
                          {coverImage.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* GALLERY IMAGES */}
                  <div className="p-5 bg-[#F7F9F4] rounded-xl border border-[#DDE7D8]">
                    <label className="block mb-3 text-[#3B4953]/80 uppercase tracking-[2px] text-[11px] font-bold">
                      Gallery Images
                    </label>
                    <div className="flex flex-wrap items-center gap-4">
                      <label className="cursor-pointer bg-white hover:bg-[#EBF4DD]/40 text-[#5A7863] font-semibold px-5 py-2.5 rounded-xl border border-[#DDE7D8] transition-all duration-200 text-sm flex items-center gap-2 shadow-sm">
                        <FaImages size={14} /> Select Album Photos
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => setGalleryImages([...e.target.files])}
                          className="hidden"
                        />
                      </label>
                      {galleryImages.length > 0 && (
                        <span className="text-xs bg-[#5A7863] text-white font-semibold px-3 py-1 rounded-full shadow-sm">
                          {galleryImages.length} Frame(s) Loaded
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <div className="pt-4 border-t border-[#DDE7D8]">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 bg-[#5A7863] hover:bg-[#4a6352] text-white px-8 py-3.5 rounded-xl uppercase tracking-[2px] text-xs font-semibold transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    <FaPlus size={12} />
                    {loading ? "Publishing Album..." : "Publish Story"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STORIES TAB */}
          {activeTab === "stories" && (
            <>
              {stories.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-[#DDE7D8] px-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F7F9F4] rounded-full mb-4 border border-[#DDE7D8]">
                    <FaImages size={24} className="text-[#90AB8B]" />
                  </div>
                  <p className="text-[#3B4953] text-lg font-semibold mb-1">No collections logged</p>
                  <p className="text-[#3B4953]/60 text-sm">Create your first cinematic wedding story structure.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stories.map((story) => (
                    <div
                      key={story._id}
                      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-[#DDE7D8] transition-all duration-300 flex flex-col"
                    >
                      {/* Cover Image Wrapper */}
                      <div className="relative overflow-hidden h-52 bg-[#F7F9F4]">
                        <img
                          src={story.coverImage}
                          alt={story.title}
                          className="w-full h-full object-cover transition duration-500 group-hover:scale-102"
                        />
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md border border-[#DDE7D8] flex items-center gap-1.5 text-[11px] font-bold text-[#3B4953]">
                          <FaImages size={11} className="text-[#5A7863]" />
                          <span>{story.galleryImages?.length || 0} Frames</span>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h2 className="text-base font-bold text-[#3B4953] uppercase tracking-[0.5px] line-clamp-1 mb-1">
                            {story.title}
                          </h2>
                          <p className="text-xs text-[#3B4953]/70 line-clamp-2 font-medium mb-4">
                            {story.description || "No narrative snippet summary detailed."}
                          </p>
                        </div>

                        {/* Action Layouts */}
                        <div className="flex gap-2.5 pt-3 border-t border-[#DDE7D8]/60">
                          <button
                            onClick={() => openSlider(story)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#F7F9F4] hover:bg-[#EBF4DD]/60 text-[#5A7863] border border-[#DDE7D8] py-2 rounded-lg text-xs font-bold uppercase tracking-[1px] transition-all duration-200"
                          >
                            <FaEye size={12} />
                            View
                          </button>

                          <button
                            onClick={() => handleDeleteClick(story._id, story.title)}
                            className="inline-flex items-center justify-center bg-red-50 hover:bg-red-100/80 text-red-600 border border-red-200/60 p-2 rounded-lg transition-all duration-200"
                            title="Delete Collection"
                          >
                            <FaTrash size={12} />
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

      {/* FULLSCREEN PREVIEW ALBUM SLIDER */}
      {selectedStory && (
        <div className="fixed inset-0 z-[999] bg-[#3B4953]/95 backdrop-blur-md overflow-hidden">
          <button
            onClick={closeSlider}
            className="absolute top-6 right-6 z-50 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
            aria-label="Close Preview"
          >
            <FaTimes size={18} />
          </button>

          <div className="absolute top-6 left-6 right-16 z-40 text-white">
            <h1 className="text-lg md:text-xl font-bold uppercase tracking-[2px] truncate">
              {selectedStory.title}
            </h1>
            <p className="text-xs text-white/60 tracking-wider font-light mt-0.5">Gallery Slider Review</p>
          </div>

          <div className="h-screen flex items-center justify-center relative px-12">
            <button
              onClick={prevImage}
              className="absolute left-4 z-40 w-11 h-11 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-white/20 transition"
              aria-label="Previous View"
            >
              <FaChevronLeft size={16} />
            </button>

            {selectedStory.galleryImages?.length > 0 ? (
              <img
                src={selectedStory.galleryImages[currentImageIndex]}
                alt={`${selectedStory.title} - Frame index ${currentImageIndex + 1}`}
                className="max-w-full max-h-[82vh] object-contain rounded shadow-2xl border border-white/5"
              />
            ) : (
              <div className="text-white/80 text-center">
                <FaImages size={40} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm font-semibold tracking-wide">No frames inside this gallery collection context.</p>
              </div>
            )}

            <button
              onClick={nextImage}
              className="absolute right-4 z-40 w-11 h-11 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-white/20 transition"
              aria-label="Next View"
            >
              <FaChevronRight size={16} />
            </button>
          </div>

          {selectedStory.galleryImages?.length > 0 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white font-bold text-xs tracking-[2px] z-40 bg-white/10 border border-white/10 px-4 py-1.5 rounded-full">
              {currentImageIndex + 1} / {selectedStory.galleryImages.length}
            </div>
          )}
        </div>
      )}

      {/* Global Dashboard Processing Modal */}
      <LoadingModal
        isLoading={loading}
        message={modalMessage}
        variant="spinner"
        showProgress={false}
      />

      {/* System Modal Delete Confirmation Integration */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete Wedding Collection"
        message={`Are you sure you want to permanently erase "${itemToDelete?.title || 'this story'}" from the portfolio log entries?`}
        itemName={itemToDelete?.title}
      />
    </div>
  );
};

export default WeddingStoryDashboard;