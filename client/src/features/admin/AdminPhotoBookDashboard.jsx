// WeddingStoryDashboard.jsx - Light Nature Theme with Auto-Compression & Fixed Slider
import React, { useEffect, useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import imageCompression from "browser-image-compression";
import { uploadToDrive } from "../../services/driveUpload";
import {
  createWeddingStory,
  getAllWeddingStories,
  deleteWeddingStory,
} from "../../config/api";
import {
  FaImages,
  FaTrash,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaTimes,
} from "react-icons/fa";
import LoadingModal from "../../components/feedback/CommonLoadingModal";
import DeleteConfirmationModal from "../../components/feedback/DeleteConfirmationModal";

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

  // Compression Options Definition (Max 2MB per image)
  const compressionOptions = {
    maxSizeMB: 2,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };

  /* =========================
      CREATE STORY (Direct Frontend Google Drive Upload Flow with Auto-Compression)
  ========================= */
  const handleCreateStory = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Compress & Upload Cover Image
      setModalMessage("Compressing cover image...");
      let finalCover = coverImage;
      if (coverImage.size > 2 * 1024 * 1024) {
        finalCover = await imageCompression(coverImage, compressionOptions);
      }

      setModalMessage("Uploading cover image to Google Drive... 0%");
      const coverUploadResponse = await uploadToDrive(finalCover, (percent) => {
        setModalMessage(`Uploading cover image to Google Drive... ${percent}%`);
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
        const galleryUploadResponse = await uploadToDrive(finalGalleryImg, (percent) => {
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
      toast.success("✅ Wedding Story Created Successfully", {
        style: { background: "#1a7d4a", color: "#fff", borderRadius: "12px", padding: "16px 24px" },
        icon: false,
      });

      // Reset Form States
      setTitle("");
      setDescription("");
      setCoverImage(null);
      setGalleryImages([]);
      setActiveTab("stories");
      getStories(true);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong during upload", {
        style: { background: "#b91c1c", color: "#fff", borderRadius: "12px", padding: "16px 24px" },
      });
    } finally {
      setLoading(false);
    }
  };

  /* =========================
      GET STORIES
  ========================= */
  const getStories = async (forceFresh = false) => {
    try {
      const response = await getAllWeddingStories(forceFresh);
      setStories(response?.data?.data || []);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load stories", {
        style: { background: "#b91c1c", color: "#fff", borderRadius: "12px", padding: "16px 24px" },
      });
    }
  };

  useEffect(() => {
    getStories(true);
  }, []);

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
    const targetId = itemToDelete.id;
    setLoading(true);
    setModalMessage("Deleting story...");
    try {
      await deleteWeddingStory(targetId);
      toast.success("🗑️ Story deleted successfully", {
        style: { background: "#1a7d4a", color: "#fff", borderRadius: "12px", padding: "16px 24px" },
        icon: false,
      });
    } catch (error) {
      if (error?.response?.status === 404) {
        toast.info("Story was already removed from database.");
      } else {
        console.log(error);
        toast.error(error?.response?.data?.message || "Failed to delete", {
          style: { background: "#b91c1c", color: "#fff", borderRadius: "12px", padding: "16px 24px" },
        });
      }
    } finally {
      setStories((prev) => (prev ? prev.filter((s) => s._id !== targetId) : []));
      setLoading(false);
      setDeleteModalOpen(false);
      setItemToDelete(null);
      getStories(true);
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
      OPEN SLIDER (FIXED)
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
    if (!selectedStory) return;
    const images = getSliderImages(selectedStory);
    if (images.length === 0) return;
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    if (!selectedStory) return;
    const images = getSliderImages(selectedStory);
    if (images.length === 0) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  /* =========================
      HELPER: Get images for slider (gallery or cover fallback)
  ========================= */
  const getSliderImages = (story) => {
    if (story?.galleryImages?.length > 0) {
      return story.galleryImages;
    }
    // Fallback: use cover image if gallery is empty
    return story?.coverImage ? [story.coverImage] : [];
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
      FILE SIZE VALIDATION HANDLERS
  ========================= */
  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (500MB limit)
    const maxSize = 500 * 1024 * 1024; // 500MB in bytes
    if (file.size > maxSize) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      toast.error(`File size is ${fileSizeMB}MB. You can only upload files up to 500MB.`, {
        style: { background: "#b91c1c", color: "#fff", borderRadius: "12px", padding: "16px 24px" },
      });
      return;
    }

    setCoverImage(file);
  };

  const handleGalleryImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

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

    setGalleryImages([...files]);
  };

  /* =========================
      INITIAL LOAD
  ========================= */
  useEffect(() => {
    getStories();
  }, []);

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
          onClick={() => setActiveTab("create")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
            activeTab === "create"
              ? "bg-blue-600 text-white shadow-2xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Create Story
        </button>
        <button
          onClick={() => setActiveTab("stories")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
            activeTab === "stories"
              ? "bg-blue-600 text-white shadow-2xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          All Wedding Stories ({stories.length})
        </button>
      </div>

      {/* CREATE TAB */}
      {activeTab === "create" && (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-2xs">
              <form onSubmit={handleCreateStory} className="space-y-4">
                {/* TITLE */}
                <div>
                  <label className="block mb-1.5 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] font-bold">
                    Couple / Story Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Sarah & Michael - Elegant Estate Wedding"
                    className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 sm:p-3 text-slate-800 dark:text-slate-100 font-medium placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-xs sm:text-sm"
                    required
                  />
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className="block mb-1.5 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] font-bold">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Share the narrative, details, and mood of this beautiful day..."
                    className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 sm:p-3 text-slate-800 dark:text-slate-100 font-medium placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-xs sm:text-sm resize-none"
                  />
                </div>

                {/* IMAGE ROW SECTIONS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* COVER IMAGE */}
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-700">
                    <label className="block mb-2 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] font-bold">
                      Cover Image
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="cursor-pointer bg-white dark:bg-slate-800 hover:bg-blue-50 text-blue-600 dark:text-blue-400 font-bold px-3.5 py-1.5 rounded-lg border border-blue-200 dark:border-blue-900 transition text-xs flex items-center gap-1.5 shadow-2xs">
                        <FaPlus size={10} /> Choose Cover
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverImageChange}
                          className="hidden"
                          required
                        />
                      </label>
                      {coverImage && (
                        <span className="text-[11px] bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold px-2.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-900 truncate max-w-[180px]">
                          {coverImage.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* GALLERY IMAGES */}
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-700">
                    <label className="block mb-2 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] font-bold">
                      Gallery Images
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="cursor-pointer bg-white dark:bg-slate-800 hover:bg-blue-50 text-blue-600 dark:text-blue-400 font-bold px-3.5 py-1.5 rounded-lg border border-blue-200 dark:border-blue-900 transition text-xs flex items-center gap-1.5 shadow-2xs">
                        <FaImages size={12} /> Select Album Photos
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleGalleryImagesChange}
                          className="hidden"
                        />
                      </label>
                      {galleryImages.length > 0 && (
                        <span className="text-[11px] bg-blue-600 text-white font-bold px-2.5 py-0.5 rounded-md shadow-2xs">
                          {galleryImages.length} Frame(s) Loaded
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700/80">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 sm:px-6 py-2.5 rounded-lg uppercase tracking-wider text-xs font-bold transition-all duration-200 shadow-xs hover:shadow disabled:opacity-50"
                  >
                    <FaPlus size={10} />
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
                <div className="text-center py-16 bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700 px-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 dark:bg-blue-950/50 rounded-full mb-3 border border-blue-200 dark:border-blue-900">
                    <FaImages size={18} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 text-base font-bold mb-1">No collections logged</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">Create your first cinematic wedding story structure.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {stories.map((story) => (
                    <div
                      key={story._id}
                      className="group bg-white dark:bg-slate-800/90 rounded-xl overflow-hidden shadow-xs hover:shadow-md border border-slate-200 dark:border-slate-700/80 transition-all duration-300 flex flex-col"
                    >
                      {/* Cover Image Wrapper */}
                      <div className="relative overflow-hidden h-44 sm:h-48 bg-slate-100 dark:bg-slate-900">
                        <img
                          src={story.coverImage}
                          alt={story.title}
                          className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 rounded border border-white/10 flex items-center gap-1 text-[10px] font-bold text-white">
                          <FaImages size={10} className="text-blue-400" />
                          <span>{story.galleryImages?.length || 0} Frames</span>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-3.5 flex-1 flex flex-col justify-between">
                        <div>
                          <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide line-clamp-1 mb-1">
                            {story.title}
                          </h2>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 font-medium mb-3">
                            {story.description || "No narrative snippet summary detailed."}
                          </p>
                        </div>

                        {/* Action Layouts */}
                        <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/80">
                          <button
                            onClick={() => openSlider(story)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 py-1.5 sm:py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200"
                          >
                            <FaEye size={11} />
                            View
                          </button>

                          <button
                            onClick={() => handleDeleteClick(story._id, story.title)}
                            className="inline-flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:hover:bg-red-900/50 dark:text-red-400 border border-red-200 dark:border-red-800/60 p-2 rounded-lg transition-all duration-200"
                            title="Delete Collection"
                          >
                            <FaTrash size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

      {/* =========================================================
          FULLSCREEN PREVIEW ALBUM SLIDER – FIXED (with fallback)
      ========================================================= */}
      {selectedStory && (
        <div
          className="fixed inset-0 z-[999] bg-slate-950/90 backdrop-blur-xs overflow-hidden flex items-center justify-center"
          onClick={closeSlider}
        >
          <button
            onClick={closeSlider}
            className="absolute top-4 right-4 z-50 text-white/80 hover:text-white bg-black/60 hover:bg-black/80 p-2 rounded-full transition"
            aria-label="Close Preview"
          >
            <FaTimes size={16} />
          </button>

          <div className="absolute top-4 left-4 right-16 z-40 text-white">
            <h1 className="text-base md:text-lg font-bold uppercase tracking-wider truncate">
              {selectedStory.title}
            </h1>
            <p className="text-[11px] text-slate-300 tracking-wider font-light mt-0.5">
              {getSliderImages(selectedStory).length === 1 && !selectedStory.galleryImages?.length
                ? "Cover Image (No gallery frames)"
                : `Gallery Slider • ${getSliderImages(selectedStory).length} frames`
              }
            </p>
          </div>

          {/* Main Image Area */}
          <div
            className="h-screen flex items-center justify-center relative px-8 w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const images = getSliderImages(selectedStory);
              if (images.length === 0) {
                return (
                  <div className="text-white/80 text-center">
                    <FaImages size={40} className="mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-semibold tracking-wide">No media available for this story.</p>
                  </div>
                );
              }

              return (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-3 z-40 w-9 h-9 bg-black/60 backdrop-blur-xs rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-black/80 transition"
                    aria-label="Previous View"
                  >
                    <FaChevronLeft size={14} />
                  </button>

                  <img
                    src={images[currentImageIndex]}
                    alt={`${selectedStory.title} - Frame ${currentImageIndex + 1}`}
                    className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl border border-white/5"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/800x600?text=Image+Not+Found";
                    }}
                  />

                  <button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute right-4 z-40 w-11 h-11 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-white/20 transition"
                    aria-label="Next View"
                  >
                    <FaChevronRight size={16} />
                  </button>
                </>
              );
            })()}
          </div>

          {/* Thumbnail Strip (only if more than 1 image) */}
          {getSliderImages(selectedStory).length > 1 && (
            <div
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex gap-2 px-4 py-2 bg-black/40 backdrop-blur-sm rounded-full overflow-x-auto max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              {getSliderImages(selectedStory).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-10 h-10 rounded-md overflow-hidden border-2 transition-all flex-shrink-0 ${currentImageIndex === idx
                    ? "border-white scale-110"
                    : "border-white/30 hover:border-white/60"
                    }`}
                >
                  <img
                    src={img}
                    alt={`Thumb ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
              <span className="text-white/80 text-xs font-bold px-2">
                {currentImageIndex + 1} / {getSliderImages(selectedStory).length}
              </span>
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

      {/* Global style for toast – consistent width and shadow */}
      <style jsx global>{`
        .custom-toast {
          border-radius: 12px !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;
          width: 420px !important;
          max-width: 100vw !important;
        }
        .custom-progress {
          background: rgba(255,255,255,0.3) !important;
          height: 3px !important;
        }
      `}</style>
    </div>
  );
};

export default WeddingStoryDashboard;