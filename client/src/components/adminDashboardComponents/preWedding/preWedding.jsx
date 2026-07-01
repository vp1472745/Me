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

// ✅ Import the Cloudinary upload helper
import { uploadToCloudinary } from "../../../services/cloudinaryUpload";

// ✅ API calls – these must now accept JSON (not FormData)
import {
  createPreWeddingStory,
  getAllPreWeddingStories,
  deletePreWeddingStory,
} from "../../../config/api";

// ✅ Common Modals
import LoadingModal from "../../commonComponents/CommonLoadingModal";
import DeleteConfirmationModal from "../../commonComponents/DeleteConfirmationModal";

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
  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await getAllPreWeddingStories();
      setStories(response?.data?.data || []);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load stories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
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
  // CREATE STORY – with client‑side Cloudinary upload + progress
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
        uploadToCloudinary(coverImage, (percent) => {
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
          uploadToCloudinary(file, (percent) => {
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
      fetchStories();
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
    setIsDeleting(true);
    try {
      await deletePreWeddingStory(storyToDelete._id);
      toast.success("Story deleted successfully");
      fetchStories();
    } catch (error) {
      console.log(error);
      toast.error("Delete failed");
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setStoryToDelete(null);
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
    <div className="flex flex-col h-full w-full bg-[#F7F9F4] text-[#3B4953]">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: "#2d3748", color: "#fff", borderRadius: "12px", padding: "16px" },
          success: { style: { background: "#1a7d4a" } },
          error: { style: { background: "#b91c1c" } },
        }}
      />

      {/* ===== TABS ===== */}
      <div className="flex-shrink-0 px-4 mt-4">
        <div className="max-w-7xl mx-auto border-b border-[#DDE7D8] bg-white rounded-t-xl overflow-hidden shadow-sm">
          <div className="flex">
            <button
              onClick={() => setActiveTab("create")}
              className={`px-8 py-4 text-xs font-semibold uppercase tracking-[3px] transition-all duration-200 border-r border-[#DDE7D8] flex items-center gap-2 ${
                activeTab === "create"
                  ? "bg-[#EBF4DD] text-[#5A7863] border-b-2 border-b-[#5A7863]"
                  : "text-[#3B4953]/70 hover:bg-[#F7F9F4] hover:text-[#3B4953]"
              }`}
            >
              <Plus size={14} />
              Create Story
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`px-8 py-4 text-xs font-semibold uppercase tracking-[3px] transition-all duration-200 flex items-center gap-2 ${
                activeTab === "all"
                  ? "bg-[#EBF4DD] text-[#5A7863] border-b-2 border-b-[#5A7863]"
                  : "text-[#3B4953]/70 hover:bg-[#F7F9F4] hover:text-[#3B4953]"
              }`}
            >
              <ImageIcon size={14} />
              All Stories
            </button>
          </div>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-10 pb-6">
        <div className="max-w-7xl mx-auto mt-6">
          {/* ---- CREATE TAB ---- */}
          {activeTab === "create" && (
            <div className="bg-white rounded-2xl border border-[#DDE7D8] p-5 sm:p-6 md:p-8 shadow-sm">
              <form onSubmit={handleCreateStory} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block mb-2 uppercase tracking-[2px] text-[11px] font-bold text-[#3B4953]/80">
                    Story Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Eternal Love at Sunset"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#F7F9F4] border border-[#DDE7D8] text-[#3B4953] rounded-xl p-4 placeholder-[#3B4953]/40 focus:outline-none focus:border-[#5A7863] transition text-sm"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block mb-2 uppercase tracking-[2px] text-[11px] font-bold text-[#3B4953]/80">
                    Description
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Share the beautiful journey..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#F7F9F4] border border-[#DDE7D8] text-[#3B4953] rounded-xl p-4 placeholder-[#3B4953]/40 focus:outline-none focus:border-[#5A7863] transition text-sm resize-none"
                  />
                </div>

                {/* Cover & Gallery row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Cover Image */}
                  <div>
                    <label className="block mb-2 uppercase tracking-[2px] text-[11px] font-bold text-[#3B4953]/80">
                      Cover Image
                    </label>
                    <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-[#90AB8B]/40 hover:border-[#5A7863] bg-[#F7F9F4] rounded-xl p-6 text-center transition group min-h-[140px]">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        required={!coverImage}
                      />
                      <div className="flex flex-col items-center pointer-events-none space-y-2">
                        <div className="w-10 h-10 rounded-full bg-white border border-[#DDE7D8] flex items-center justify-center text-[#5A7863]">
                          <Plus size={16} />
                        </div>
                        <p className="text-xs font-bold text-[#3B4953]">
                          {coverImage ? "Change Cover Frame" : "Assign Banner Frame"}
                        </p>
                      </div>
                    </div>
                    {coverImage && (
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-[11px] font-bold text-[#5A7863] bg-[#EBF4DD] px-3 py-1 rounded-md inline-block truncate max-w-[70%] shadow-xs">
                          ✓ Banner: {coverImage.name}
                          {uploadProgress.cover !== undefined && uploadProgress.cover < 100 && (
                            <span className="ml-2 text-xs">({Math.round(uploadProgress.cover)}%)</span>
                          )}
                        </p>
                        {!uploading && (
                          <button
                            type="button"
                            onClick={removeCoverImage}
                            className="p-1 text-red-500  rounded-full transition-colors"
                            title="Remove cover image"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Gallery Images */}
                  <div>
                    <label className="block mb-2 uppercase tracking-[2px] text-[11px] font-bold text-[#3B4953]/80">
                      Gallery Bundles (Multiple)
                    </label>
                    <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-[#90AB8B]/40 hover:border-[#5A7863] bg-[#F7F9F4] rounded-xl p-6 text-center transition group min-h-[140px]">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryImagesChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex flex-col items-center pointer-events-none space-y-2">
                        <div className="w-10 h-10 rounded-full bg-white border border-[#DDE7D8] flex items-center justify-center text-[#5A7863]">
                          <ImageIcon size={16} />
                        </div>
                        <p className="text-xs font-bold text-[#3B4953]">Select Bundle Matrix</p>
                      </div>
                    </div>
                    {galleryImages.length > 0 && (
                      <p className="text-[11px] font-bold text-[#5A7863] bg-[#EBF4DD] px-3 py-1 rounded-md mt-2 inline-block shadow-xs">
                        ✓ {galleryImages.length} Matrix Frame(s) Staged
                      </p>
                    )}
                  </div>
                </div>

                {/* Local Previews with Progress Overlays & Remove Icons */}
                {galleryImages.length > 0 && (
                  <div className="p-4 bg-[#F7F9F4] border border-[#DDE7D8] rounded-xl">
                    <p className="text-[10px] font-bold uppercase tracking-[1px] text-[#3B4953]/60 mb-2">Matrix Stream Preview</p>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
                      {galleryImages.map((img, idx) => {
                        const progress = uploadProgress[`gallery-${idx}`] ?? 0;
                        const isUploading = uploading && progress > 0 && progress < 100;
                        return (
                          <div key={idx} className="relative aspect-square rounded-md overflow-hidden bg-white border border-[#DDE7D8] group">
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
                                className="absolute top-1 right-1 p-1 bg-red-500/60 rounded-full text-white "
                                title="Remove image"
                              >
                                <X size={14} />
                              </button>
                            )}
                            {/* Progress overlay during upload */}
                            {isUploading && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="w-full h-full relative">
                                  <div
                                    className="absolute bottom-0 left-0 h-1 bg-[#5A7863] transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                  />
                                  <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                                    {Math.round(progress)}%
                                  </span>
                                </div>
                              </div>
                            )}
                            {/* Done badge – only if upload completed and not uploading anymore */}
                            {progress === 100 && !uploading && (
                              <div className="absolute top-1 right-1 bg-green-500/80 text-white text-[8px] px-1.5 py-0.5 rounded-full">
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
                <div className="pt-4 border-t border-[#DDE7D8]">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="inline-flex items-center gap-2 bg-[#5A7863] hover:bg-[#4a6352] text-white px-8 py-3.5 rounded-xl uppercase tracking-[2px] text-xs font-semibold transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    <Upload size={12} />
                    {uploading
                      ? `Publishing... ${getOverallProgress()}%`
                      : "Publish Wedding Story"}
                  </button>
                  {uploading && (
                    <span className="ml-4 text-xs text-[#5A7863] font-medium">
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
                <div className="flex justify-center items-center h-64 bg-white rounded-2xl border border-[#DDE7D8]">
                  <div className="w-9 h-9 border-2 border-[#5A7863] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : stories.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-[#DDE7D8] px-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F7F9F4] rounded-full mb-4 border border-[#DDE7D8]">
                    <Heart size={22} className="text-[#90AB8B]" />
                  </div>
                  <p className="text-[#3B4953] text-lg font-semibold mb-1">No stories found</p>
                  <p className="text-[#3B4953]/60 text-sm">Deploy your first pre‑wedding story now.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stories.map((story) => (
                    <div
                      key={story._id}
                      className="group bg-white rounded-xl overflow-hidden border border-[#DDE7D8] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
                    >
                      {/* Cover */}
                      <div className="relative h-52 bg-[#F7F9F4] overflow-hidden">
                        <img
                          src={story.coverImage}
                          alt={story.title}
                          className="w-full h-full object-cover transition duration-500 group-hover:scale-102"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md border border-[#DDE7D8] flex items-center gap-1.5 text-[10px] font-bold text-[#3B4953]">
                          <ImageIcon size={10} className="text-[#5A7863]" />
                          <span>{story.galleryImages?.length || 0} Frames</span>
                        </div>
                        <div className="absolute bottom-3 left-4 right-4">
                          <h2 className="text-base font-bold text-white tracking-wide line-clamp-1">
                            {story.title}
                          </h2>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                        <p className="text-[#3B4953]/70 text-xs tracking-wide leading-relaxed line-clamp-2 min-h-[36px]">
                          {story.description || "No narrative summary provided."}
                        </p>
                        <div className="flex gap-2.5 pt-1 border-t border-[#DDE7D8]/60">
                          <button
                            onClick={() => openModal(story)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#F7F9F4] hover:bg-[#EBF4DD]/60 text-[#5A7863] border border-[#DDE7D8] py-2.5 rounded-lg text-xs font-bold uppercase tracking-[1px] transition-all duration-200"
                          >
                            <Eye size={12} /> Inspect
                          </button>
                          <button
                            onClick={() => handleDeleteClick(story)}
                            className="inline-flex items-center justify-center bg-red-50 hover:bg-red-100/80 text-red-600 border border-red-200/60 p-2.5 rounded-lg transition-all duration-200"
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
        </div>
      </div>

      {/* ===== LIGHTBOX MODAL ===== */}
      {selectedStory && (
        <div className="fixed inset-0 z-[999] bg-[#3B4953]/95 backdrop-blur-md overflow-hidden">
          <button
            onClick={closeModal}
            className="absolute top-6 right-6 z-50 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
            aria-label="Close Lightbox"
          >
            <X size={18} />
          </button>

          <div className="absolute top-6 left-6 z-40 text-white max-w-[calc(100%-120px)]">
            <h1 className="text-lg font-bold uppercase tracking-[2px] line-clamp-1">{selectedStory.title}</h1>
            <p className="text-xs text-white/60 tracking-wide font-light mt-0.5 line-clamp-1">{selectedStory.description}</p>
          </div>

          <div className="h-[82vh] flex items-center justify-center relative px-12 mt-[8vh]">
            {selectedStory?.galleryImages?.length > 1 && (
              <button
                onClick={prevImage}
                className="absolute left-4 z-40 w-11 h-11 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-white/20 transition"
              >
                <ChevronLeft size={18} />
              </button>
            )}

            <img
              src={selectedStory.galleryImages?.[currentImageIndex] || selectedStory.coverImage}
              alt={selectedStory.title}
              className="max-w-full max-h-full object-contain rounded shadow-2xl border border-white/5"
            />

            {selectedStory?.galleryImages?.length > 1 && (
              <button
                onClick={nextImage}
                className="absolute right-4 z-40 w-11 h-11 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-white/20 transition"
              >
                <ChevronRight size={18} />
              </button>
            )}
          </div>

          {selectedStory?.galleryImages?.length > 0 && (
            <div className="absolute bottom-0 inset-x-0 bg-black/20 border-t border-white/5 py-4 backdrop-blur-xs flex flex-col items-center space-y-2">
              <div className="flex gap-2 px-6 overflow-x-auto max-w-4xl no-scrollbar">
                {selectedStory.galleryImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt="thumbnail"
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-16 h-12 md:w-20 md:h-14 object-cover rounded-md cursor-pointer transition-all duration-200 flex-shrink-0 ${
                      currentImageIndex === idx
                        ? "ring-2 ring-[#90AB8B] scale-102 opacity-100"
                        : "opacity-40 hover:opacity-80"
                    }`}
                  />
                ))}
              </div>
              <div className="text-white/80 font-bold text-[10px] tracking-[2px] bg-white/10 border border-white/10 px-3 py-1 rounded-full">
                {currentImageIndex + 1} / {selectedStory.galleryImages.length}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== LOADING MODAL ===== */}
      <LoadingModal
        isLoading={uploading || loading}
        message={uploading ? modalMessage : "Loading stories..."}
        showProgress={uploading}
        progress={getOverallProgress()}
        variant="spinner"
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