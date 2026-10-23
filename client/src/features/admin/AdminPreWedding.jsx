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
import { toast, Toaster } from "react-hot-toast";

// ✅ Import the Google Drive upload helper
import { uploadToDrive } from "../../services/driveUpload";

// ✅ API calls – these must now accept JSON (not FormData)
import {
  createPreWeddingStory,
  getAllPreWeddingStories,
  deletePreWeddingStory,
} from "../../config/api";

// ✅ Common Modals
import LoadingModal from "../../components/feedback/CommonLoadingModal";
import DeleteConfirmationModal from "../../components/feedback/DeleteConfirmationModal";

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

  // ======================================================
  // UPLOAD PROGRESS & LOADING STATE
  // ======================================================
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [modalMessage, setModalMessage] = useState("Uploading...");

  // ======================================================
  // GET ALL STATES
  // ======================================================
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  // ======================================================
  // MODAL STATES (Lightbox)
  // ======================================================
  const [selectedStory, setSelectedStory] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // ======================================================
  // DELETE MODAL STATE
  // ======================================================
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ======================================================
  // FETCH STORIES
  // ======================================================
  const fetchStories = async (forceFresh = false) => {
    try {
      const response = await getAllPreWeddingStories(forceFresh);
      setStories(response?.data?.data || []);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load stories");
    }
  };

  useEffect(() => {
    fetchStories(true);
  }, []);

  // ======================================================
  // REMOVE COVER IMAGE
  // ======================================================
  const removeCoverImage = () => {
    setCoverImage(null);
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress.cover;
      return newProgress;
    });
  };

  // ======================================================
  // FILE SIZE VALIDATION HANDLERS
  // ======================================================
  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (500MB limit)
    const maxSize = 500 * 1024 * 1024; // 500MB in bytes
    if (file.size > maxSize) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      toast.error(`File size is ${fileSizeMB}MB. You can only upload files up to 500MB.`);
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
      toast.error(`File size is ${fileSizeMB}MB. You can only upload files up to 500MB.`);
      return;
    }

    setGalleryImages(files);
    setUploadProgress({});
  };

  // ======================================================
  // REMOVE GALLERY IMAGE
  // ======================================================
  const removeGalleryImage = (index) => {
    const newGallery = [...galleryImages];
    newGallery.splice(index, 1);
    setGalleryImages(newGallery);

    // Remove progress entry for this image
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[`gallery-${index}`];
      // Optionally re-index remaining progress keys (not strictly necessary)
      return newProgress;
    });
  };

  // ======================================================
  // CREATE STORY – with client‑side Google Drive upload + progress
  // ======================================================
  const handleCreateStory = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a story title.");
      return;
    }
    if (!coverImage) {
      toast.error("Please select a cover image.");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress({});
      setModalMessage("Preparing upload...");

      // 1️⃣ Upload cover image with progress
      const coverResult = await new Promise((resolve, reject) => {
        uploadToDrive(coverImage, (percent) => {
          setUploadProgress((prev) => ({ ...prev, cover: percent }));
          setModalMessage(`Uploading cover image... ${percent}%`);
        })
          .then(resolve)
          .catch(reject);
      });
      const coverUrl = coverResult.secure_url;
      setUploadProgress((prev) => ({ ...prev, cover: 100 }));

      // 2️⃣ Upload all gallery images with progress
      const galleryResults = [];
      for (let i = 0; i < galleryImages.length; i++) {
        const file = galleryImages[i];
        setModalMessage(`Uploading gallery image ${i + 1} of ${galleryImages.length}...`);
        const result = await new Promise((resolve, reject) => {
          uploadToDrive(file, (percent) => {
            setUploadProgress((prev) => ({
              ...prev,
              [`gallery-${i}`]: percent,
            }));
            setModalMessage(
              `Uploading gallery image ${i + 1} of ${galleryImages.length}... ${percent}%`
            );
          })
            .then(resolve)
            .catch(reject);
        });
        galleryResults.push(result);
        setUploadProgress((prev) => ({ ...prev, [`gallery-${i}`]: 100 }));
      }


      const galleryUrls = galleryResults.map((res) => res.secure_url);

      // 3️⃣ Send URLs to backend (as JSON)
      setModalMessage("Saving story to database...");
      const payload = {
        title: title.trim(),
        description: description.trim(),
        coverImage: coverUrl,
        galleryImages: galleryUrls,
      };

      await createPreWeddingStory(payload);

      toast.success(" Pre-Wedding Story Created Successfully");

      // Reset form
      setTitle("");
      setDescription("");
      setCoverImage(null);
      setGalleryImages([]);
      setUploadProgress({});
      fetchStories(true);
      setActiveTab("all");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error?.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setModalMessage("Uploading...");
    }
  };

  // ======================================================
  // DELETE STORY – with confirmation modal
  // ======================================================
  const handleDeleteClick = (story) => {
    setStoryToDelete(story);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!storyToDelete) return;
    const targetId = storyToDelete._id;
    setIsDeleting(true);
    try {
      await deletePreWeddingStory(targetId);
      toast.success("Story deleted successfully");
    } catch (error) {
      if (error?.response?.status === 404) {
        toast.info("Story was already removed from database.");
      } else {
        console.log(error);
        toast.error("Delete failed");
      }
    } finally {
      setStories((prev) => prev.filter((s) => s._id !== targetId));
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setStoryToDelete(null);
      fetchStories(true);
    }
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setStoryToDelete(null);
  };

  // ======================================================
  // MODAL FUNCTIONS (Lightbox)
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

  // ======================================================
  // HELPER: Compute overall progress
  // ======================================================
  const getOverallProgress = () => {
    const values = Object.values(uploadProgress);
    if (values.length === 0) return 0;
    const total = values.reduce((acc, val) => acc + val, 0);
    return Math.round(total / values.length);
  };

  // ======================================================
  // RENDER
  // ======================================================
  return (
    <div className="animate-fade-in text-xs sm:text-sm space-y-4">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: "#1e293b", color: "#fff", borderRadius: "10px", padding: "12px", fontSize: "13px" },
          success: { style: { background: "#059669" } },
          error: { style: { background: "#dc2626" } },
        }}
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
          <Plus size={13} />
          Create Story
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
            activeTab === "all"
              ? "bg-blue-600 text-white shadow-2xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <ImageIcon size={13} />
          All Stories ({stories.length})
        </button>
      </div>

      {/* ---- CREATE TAB ---- */}
      {activeTab === "create" && (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-2xs">
              <form onSubmit={handleCreateStory} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Story Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Eternal Love at Sunset"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-2.5 sm:p-3 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-xs sm:text-sm"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Share the beautiful journey..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-2.5 sm:p-3 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-xs sm:text-sm resize-none"
                  />
                </div>

                {/* Cover & Gallery row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Cover Image */}
                  <div>
                    <label className="block mb-1.5 uppercase tracking-wider text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Cover Image
                    </label>
                    <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-slate-50 dark:bg-slate-900/40 rounded-xl p-4 sm:p-5 text-center transition group min-h-[120px]">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        required={!coverImage}
                      />
                      <div className="flex flex-col items-center pointer-events-none space-y-1.5">
                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <Plus size={14} />
                        </div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          {coverImage ? "Change Cover Frame" : "Assign Banner Frame"}
                        </p>
                      </div>
                    </div>
                    {coverImage && (
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-md inline-block truncate max-w-[70%] border border-blue-200 dark:border-blue-900">
                          ✓ Banner: {coverImage.name}
                          {uploadProgress.cover !== undefined && uploadProgress.cover < 100 && (
                            <span className="ml-1 text-xs">({Math.round(uploadProgress.cover)}%)</span>
                          )}
                        </p>
                        {!uploading && (
                          <button
                            type="button"
                            onClick={removeCoverImage}
                            className="p-1 text-red-500 hover:text-red-700 rounded-full transition-colors"
                            title="Remove cover image"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Gallery Images */}
                  <div>
                    <label className="block mb-1.5 uppercase tracking-wider text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Gallery Bundles (Multiple)
                    </label>
                    <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-slate-50 dark:bg-slate-900/40 rounded-xl p-4 sm:p-5 text-center transition group min-h-[120px]">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryImagesChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex flex-col items-center pointer-events-none space-y-1.5">
                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <ImageIcon size={14} />
                        </div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Select Images Bundle</p>
                      </div>
                    </div>
                    {galleryImages.length > 0 && (
                      <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-md mt-2 inline-block border border-blue-200 dark:border-blue-900">
                        ✓ {galleryImages.length} Matrix Frame(s) Staged
                      </p>
                    )}
                  </div>
                </div>

                {/* Local Previews with Progress Overlays & Remove Icons */}
                {galleryImages.length > 0 && (
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Matrix Stream Preview</p>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                      {galleryImages.map((img, idx) => {
                        const progress = uploadProgress[`gallery-${idx}`] ?? 0;
                        const isUploading = uploading && progress > 0 && progress < 100;
                        return (
                          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 group">
                            <img
                              src={URL.createObjectURL(img)}
                              alt="preview"
                              className="w-full h-full object-cover"
                            />
                            {/* Remove button – hidden during upload */}
                            {!uploading && (
                              <button
                                type="button"
                                onClick={() => removeGalleryImage(idx)}
                                className="absolute top-1 right-1 p-0.5 bg-red-500 rounded-full text-white"
                                title="Remove image"
                              >
                                <X size={12} />
                              </button>
                            )}
                            {/* Progress overlay during upload */}
                            {isUploading && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <div className="w-full h-full relative">
                                  <div
                                    className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                  />
                                  <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold">
                                    {Math.round(progress)}%
                                  </span>
                                </div>
                              </div>
                            )}
                            {/* Done badge – only if upload completed and not uploading anymore */}
                            {progress === 100 && !uploading && (
                              <div className="absolute top-1 right-1 bg-emerald-500 text-white text-[8px] px-1 py-0.2 rounded-full font-bold">
                                ✓
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Submit */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700/80 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 sm:px-6 py-2.5 rounded-lg uppercase tracking-wider text-xs font-bold transition-all duration-200 shadow-xs hover:shadow disabled:opacity-50"
                  >
                    <Upload size={12} />
                    {uploading
                      ? `Publishing... ${getOverallProgress()}%`
                      : "Publish Wedding Story"}
                  </button>
                  {uploading && (
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                      {getOverallProgress()}% complete
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* ---- ALL STORIES TAB ---- */}
          {activeTab === "all" && (
            <>
              {loading ? (
                <div className="flex justify-center items-center h-48 bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : stories.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700 px-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 dark:bg-blue-950/50 rounded-full mb-3 border border-blue-200 dark:border-blue-900">
                    <Heart size={18} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 text-base font-bold mb-1">No stories found</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">Create your first pre‑wedding story using the create tab.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {stories.map((story) => (
                    <div
                      key={story._id}
                      className="group bg-white dark:bg-slate-800/90 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col"
                    >
                      {/* Cover */}
                      <div className="relative h-44 sm:h-48 bg-slate-100 dark:bg-slate-900 overflow-hidden">
                        <img
                          src={story.coverImage}
                          alt={story.title}
                          className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                        <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 rounded border border-white/10 flex items-center gap-1 text-[10px] font-bold text-white">
                          <ImageIcon size={10} className="text-blue-400" />
                          <span>{story.galleryImages?.length || 0} Frames</span>
                        </div>
                        <div className="absolute bottom-2.5 left-3 right-3">
                          <h2 className="text-sm font-bold text-white tracking-wide line-clamp-1">
                            {story.title}
                          </h2>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                        <p className="text-slate-600 dark:text-slate-300 text-xs tracking-wide leading-relaxed line-clamp-2 min-h-[32px]">
                          {story.description || "No narrative summary provided."}
                        </p>
                        <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/80">
                          <button
                            onClick={() => openModal(story)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 py-1.5 sm:py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200"
                          >
                            <Eye size={12} /> Inspect
                          </button>
                          <button
                            onClick={() => handleDeleteClick(story)}
                            className="inline-flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:hover:bg-red-900/50 dark:text-red-400 border border-red-200 dark:border-red-800/60 p-2 rounded-lg transition-all duration-200"
                            title="Delete Story"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

      {/* ===== LIGHTBOX MODAL ===== */}
      {selectedStory && (
        <div className="fixed inset-0 z-[999] bg-slate-950/90 backdrop-blur-xs overflow-hidden">
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 z-50 text-white/80 hover:text-white bg-black/60 hover:bg-black/80 p-2 rounded-full transition"
            aria-label="Close Lightbox"
          >
            <X size={16} />
          </button>

          <div className="absolute top-4 left-4 z-40 text-white max-w-[calc(100%-100px)]">
            <h1 className="text-base font-bold uppercase tracking-wider line-clamp-1">{selectedStory.title}</h1>
            <p className="text-xs text-slate-300 font-light mt-0.5 line-clamp-1">{selectedStory.description}</p>
          </div>

          <div className="h-[80vh] flex items-center justify-center relative px-8 mt-[8vh]">
            {selectedStory?.galleryImages?.length > 1 && (
              <button
                onClick={prevImage}
                className="absolute left-3 z-40 w-9 h-9 bg-black/60 backdrop-blur-xs rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-black/80 transition"
              >
                <ChevronLeft size={16} />
              </button>
            )}

            <img
              src={selectedStory.galleryImages?.[currentImageIndex] || selectedStory.coverImage}
              alt={selectedStory.title}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-white/5"
            />

            {selectedStory?.galleryImages?.length > 1 && (
              <button
                onClick={nextImage}
                className="absolute right-3 z-40 w-9 h-9 bg-black/60 backdrop-blur-xs rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-black/80 transition"
              >
                <ChevronRight size={16} />
              </button>
            )}
          </div>

          {selectedStory?.galleryImages?.length > 0 && (
            <div className="absolute bottom-0 inset-x-0 bg-black/40 border-t border-white/10 py-3 backdrop-blur-xs flex flex-col items-center space-y-2">
              <div className="flex gap-2 px-4 overflow-x-auto max-w-3xl no-scrollbar">
                {selectedStory.galleryImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt="thumbnail"
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-14 h-10 object-cover rounded cursor-pointer transition-all duration-200 flex-shrink-0 ${
                      currentImageIndex === idx
                        ? "ring-2 ring-blue-500 scale-105 opacity-100"
                        : "opacity-40 hover:opacity-80"
                    }`}
                  />
                ))}
              </div>
              <div className="text-white/90 font-bold text-[10px] tracking-wider bg-black/40 border border-white/10 px-2.5 py-0.5 rounded-full">
                {currentImageIndex + 1} / {selectedStory.galleryImages.length}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== LOADING MODAL ===== */}
      <LoadingModal
        null
      />

      {/* ===== DELETE CONFIRMATION MODAL ===== */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete Story"
        message={`Are you sure you want to delete "${storyToDelete?.title || 'this story'}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default PreWedding;