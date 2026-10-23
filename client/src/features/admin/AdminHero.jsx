import React, { useEffect, useState } from "react";
import {
  Plus,
  Upload,
  Trash2,
  Eye,
  Image as ImageIcon,
  Video,
  X,
  Home,
  BookOpen,
  Film,
  HelpCircle,
  Layers,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { uploadToDrive } from "../../services/driveUpload";
import { getCleanMediaUrl } from "../../utils/cleanUrl";
import {
  createHeroSection,
  getAllHeroSections,
  deleteHeroSection,
} from "../../config/api";
import LoadingModal from "../../components/feedback/CommonLoadingModal";
import DeleteConfirmationModal from "../../components/feedback/DeleteConfirmationModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ─── Categories Configuration ─────────────────────────────────────
export const HERO_CATEGORIES = [
  {
    id: "home",
    label: "Home Page",
    badge: "HOME",
    desc: "Main website hero banner carousel",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    activeColor: "border-emerald-600 bg-emerald-50 text-emerald-900",
    icon: Home,
  },
  {
    id: "stories",
    label: "Stories",
    badge: "STORIES",
    desc: "Stories page header background",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    activeColor: "border-amber-600 bg-amber-50 text-amber-900",
    icon: BookOpen,
  },
  {
    id: "images",
    label: "Images",
    badge: "IMAGES",
    desc: "Gallery & Images page header",
    color: "bg-sky-100 text-sky-800 border-sky-200",
    activeColor: "border-sky-600 bg-sky-50 text-sky-900",
    icon: ImageIcon,
  },
  {
    id: "films",
    label: "Films",
    badge: "FILMS",
    desc: "Films / Cinematic videos page header",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    activeColor: "border-purple-600 bg-purple-50 text-purple-900",
    icon: Film,
  },
  {
    id: "faq",
    label: "FAQ",
    badge: "FAQ",
    desc: "Frequently asked questions page banner",
    color: "bg-rose-100 text-rose-800 border-rose-200",
    activeColor: "border-rose-600 bg-rose-50 text-rose-900",
    icon: HelpCircle,
  },
];

// ─── Skeleton Card ──────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200/80 dark:border-slate-800 p-3 flex flex-col gap-3 shadow-2xs animate-pulse">
    <div className="h-44 bg-slate-100 dark:bg-slate-800 rounded-lg" />
    <div className="flex gap-2">
      <div className="flex-1 h-9 bg-slate-100 dark:bg-slate-800 rounded-lg" />
      <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-lg" />
    </div>
  </div>
);

// ─── Main Component ─────────────────────────────────────────────
const HeroManager = () => {
  // ==============================
  // STATE
  // ==============================
  const [activeTab, setActiveTab] = useState("create");
  const [category, setCategory] = useState("home");
  const [selectedFilterCategory, setSelectedFilterCategory] = useState("all");

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileType, setFileType] = useState("image");

  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedHero, setSelectedHero] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [heroToDelete, setHeroToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ==============================
  // FETCH HEROES
  // ==============================
  const fetchHeroes = async (forceFresh = false) => {
    try {
      setLoading(true);
      const res = await getAllHeroSections({}, forceFresh);
      const rawHeroes = res?.data?.data || [];
      const cleanHeroes = rawHeroes.map((hero) => ({
        ...hero,
        category: hero.category || "home",
        mediaUrl: getCleanMediaUrl(hero.mediaUrl),
      }));
      setHeroes(cleanHeroes);
    } catch (error) {
      console.error("Fetch heroes error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroes(true);
  }, []);

  // ==============================
  // HANDLERS
  // ==============================
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.warning("Please select a file first.");
      return;
    }

    try {
      setUploading(true);
      const result = await uploadToDrive(selectedFile, (percent) =>
        setUploadProgress(percent)
      );
      const { secure_url, public_id } = result;

      await createHeroSection({
        mediaUrl: secure_url,
        mediaType: selectedFile.type.startsWith("video/") ? "video" : "image",
        public_id,
        category,
      });

      toast.success(
        `Hero banner for "${
          HERO_CATEGORIES.find((c) => c.id === category)?.label || category
        }" uploaded successfully!`,
        {
          style: {
            background: "#1a7d4a",
            color: "#fff",
            borderRadius: "12px",
            padding: "16px 24px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          },
          progressClassName: "bg-white/30",
        }
      );

      setSelectedFile(null);
      setPreviewUrl(null);
      fetchHeroes(true);
      setSelectedFilterCategory(category);
      setActiveTab("all");
    } catch (error) {
      const errorMsg = error?.response?.data?.message || error?.message || "Upload failed. Please try again.";
      toast.error(errorMsg, {
        style: {
          background: "#b91c1c",
          color: "#fff",
          borderRadius: "12px",
          padding: "16px 24px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        },
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setFileType(file.type.startsWith("video/") ? "video" : "image");
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleConfirmDelete = async () => {
    if (!heroToDelete) return;
    setIsDeleting(true);
    const deletedId = heroToDelete._id;
    try {
      await deleteHeroSection(deletedId);
      toast.success("Hero media deleted successfully.", {
        style: {
          background: "#1a7d4a",
          color: "#fff",
          borderRadius: "12px",
          padding: "16px 24px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        },
      });
      setHeroes((prev) => prev.filter((h) => h._id !== deletedId));
      fetchHeroes(true);
      setDeleteModalOpen(false);
      setHeroToDelete(null);
    } catch (error) {
      if (error?.response?.status === 404) {
        setHeroes((prev) => prev.filter((h) => h._id !== deletedId));
        fetchHeroes(true);
        setDeleteModalOpen(false);
        setHeroToDelete(null);
        toast.info("Media was already removed from database.");
      } else {
        toast.error("Delete failed. Please try again.", {
          style: {
            background: "#b91c1c",
            color: "#fff",
            borderRadius: "12px",
            padding: "16px 24px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          },
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered heroes for "All Media" tab
  const filteredHeroes =
    selectedFilterCategory === "all"
      ? heroes
      : heroes.filter(
          (h) => (h.category || "home").toLowerCase() === selectedFilterCategory
        );

  const getCategoryMeta = (catId) => {
    return (
      HERO_CATEGORIES.find(
        (c) => c.id === (catId || "home").toLowerCase()
      ) || {
        id: catId,
        label: catId,
        badge: (catId || "HOME").toUpperCase(),
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: Layers,
      }
    );
  };

  return (
    <div className="animate-fade-in text-xs sm:text-sm space-y-4">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3500}
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

      {/* ===== TABS ===== */}
      <div className="flex items-center gap-1.5 border-b border-slate-200/80 dark:border-slate-800 pb-2.5">
        {["create", "all"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
              activeTab === tab
                ? "bg-blue-600 text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {tab === "create" ? <Plus size={13} /> : <ImageIcon size={13} />}
            {tab === "create" ? "+ Upload Hero Banner" : `All Media (${heroes.length})`}
          </button>
        ))}
      </div>

      {activeTab === "create" ? (
            // ─── UPLOAD FORM ──────────────────────────────
            <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-5 shadow-2xs space-y-4">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Sparkles size={16} className="text-blue-600 dark:text-blue-400" />
                  Select Page Category
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Choose which website page or section this Hero Banner should appear on.
                </p>
              </div>

              {/* Category Selector Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
                {HERO_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-2.5 sm:p-3 rounded-lg border text-left transition-all duration-150 flex flex-col justify-between relative overflow-hidden group ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/70 text-blue-950 dark:border-blue-500 dark:bg-blue-950/50 dark:text-blue-200 shadow-2xs ring-1 ring-blue-500/20"
                          : "border-slate-200/80 bg-slate-50/50 hover:border-blue-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900/30 dark:hover:border-slate-700 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 text-blue-600 dark:text-blue-400">
                          <CheckCircle2 size={15} />
                        </div>
                      )}
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center mb-2 transition-colors ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-2xs"
                            : "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-200/80 dark:border-slate-700"
                        }`}
                      >
                        <Icon size={15} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {cat.label}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 line-clamp-1">
                          {cat.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Form Upload */}
              <form onSubmit={handleCreate} className="space-y-4 pt-1">
                <div className="relative border-2 border-dashed border-blue-200 dark:border-blue-900/50 rounded-xl p-4 sm:p-6 flex flex-col items-center text-center transition-colors hover:border-blue-400 dark:hover:border-blue-700 bg-blue-50/20 dark:bg-blue-950/10">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {previewUrl ? (
                    <div className="w-full max-w-sm mx-auto">
                      {fileType === "video" ? (
                        <video
                          src={previewUrl}
                          className="rounded-lg w-full max-h-56 object-cover shadow-2xs"
                          controls
                        />
                      ) : (
                        <img
                          src={previewUrl}
                          className="rounded-lg w-full max-h-56 object-contain shadow-2xs"
                          alt="Preview"
                        />
                      )}
                      <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                        {selectedFile?.name} ({Math.round(selectedFile?.size / 1024)} KB)
                      </p>
                    </div>
                  ) : (
                    <div className="py-5 sm:py-7 text-slate-500 dark:text-slate-400">
                      <Upload size={28} className="mx-auto mb-2 text-blue-600 dark:text-blue-400 opacity-90" />
                      <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                        Tap or click to select media for{" "}
                        <span className="text-blue-600 dark:text-blue-400">
                          {HERO_CATEGORIES.find((c) => c.id === category)?.label}
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Supports high-res Images & 4K Videos</p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 sm:py-3 rounded-lg font-bold uppercase tracking-wider text-xs disabled:opacity-50 transition active:scale-[0.99] shadow-xs flex items-center justify-center gap-2"
                >
                  <Upload size={14} />
                  {uploading
                    ? `Uploading to Google Drive ${uploadProgress}%...`
                    : `Publish to ${HERO_CATEGORIES.find((c) => c.id === category)?.label} Hero`}
                </button>
              </form>
            </div>
          ) : (
            // ─── MEDIA GRID ──────────────────────────────
            <div className="space-y-4">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => setSelectedFilterCategory("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    selectedFilterCategory === "all"
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <Layers size={13} />
                  All ({heroes.length})
                </button>

                {HERO_CATEGORIES.map((cat) => {
                  const count = heroes.filter(
                    (h) => (h.category || "home").toLowerCase() === cat.id
                  ).length;
                  const Icon = cat.icon;
                  const isActive = selectedFilterCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedFilterCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        isActive
                          ? "bg-blue-600 text-white shadow-2xs"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      }`}
                    >
                      <Icon size={13} />
                      {cat.label} ({count})
                    </button>
                  );
                })}
              </div>

              {loading ? (
                // Skeleton loading
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : filteredHeroes.length === 0 ? (
                // Empty state
                <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200/80 dark:border-slate-800 text-center py-12 sm:py-16 text-slate-400 p-5 shadow-2xs">
                  <ImageIcon size={44} className="mx-auto mb-3 opacity-30 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    No hero banners found for{" "}
                    {selectedFilterCategory === "all"
                      ? "any category"
                      : HERO_CATEGORIES.find((c) => c.id === selectedFilterCategory)?.label}.
                  </p>
                  <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">
                    Switch to the "Upload" tab to add a hero banner for this section.
                  </p>
                  <button
                    onClick={() => {
                      if (selectedFilterCategory !== "all") {
                        setCategory(selectedFilterCategory);
                      }
                      setActiveTab("create");
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition shadow-xs"
                  >
                    <Plus size={13} /> Upload Banner
                  </button>
                </div>
              ) : (
                // Media cards
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {filteredHeroes.map((hero) => {
                    const catMeta = getCategoryMeta(hero.category);
                    const CatIcon = catMeta.icon;
                    return (
                      <div
                        key={hero._id}
                        className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200/80 dark:border-slate-800 p-2.5 sm:p-3 flex flex-col gap-2.5 shadow-2xs hover:shadow-xs transition duration-150"
                      >
                        <div className="relative h-40 bg-slate-900 rounded-lg overflow-hidden group">
                          {hero.mediaType === "video" ? (
                            <video
                              src={`${hero.mediaUrl}#t=0.001`}
                              className="w-full h-full object-cover"
                              autoPlay
                              loop
                              muted
                              playsInline
                              preload="auto"
                            />
                          ) : (
                            <img
                              src={hero.mediaUrl}
                              className="w-full h-full object-cover"
                              alt="Hero media"
                            />
                          )}

                          {/* Category Badge overlay */}
                          <div className="absolute top-2 left-2 flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border shadow-2xs flex items-center gap-1 ${catMeta.color}`}
                            >
                              <CatIcon size={11} />
                              {catMeta.badge}
                            </span>
                          </div>

                          {/* Media Type Badge overlay */}
                          <div className="absolute top-2 right-2">
                            <span className="bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                              {hero.mediaType === "video" ? (
                                <>
                                  <Video size={10} /> VIDEO
                                </>
                              ) : (
                                <>
                                  <ImageIcon size={10} /> IMAGE
                                </>
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between px-1">
                          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                            <CatIcon size={12} />
                            {catMeta.label}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">
                            {new Date(hero.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedHero(hero);
                              setLightboxOpen(true);
                            }}
                            className="flex-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 py-1.5 rounded-md text-xs font-bold uppercase hover:bg-blue-100 dark:hover:bg-blue-900/40 transition flex items-center justify-center gap-1.5 border border-blue-200/60 dark:border-blue-900/60"
                          >
                            <Eye size={13} /> Preview
                          </button>
                          <button
                            onClick={() => {
                              setHeroToDelete(hero);
                              setDeleteModalOpen(true);
                            }}
                            className="px-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-md hover:bg-rose-100 dark:hover:bg-rose-900/40 transition flex items-center justify-center border border-rose-200/60 dark:border-rose-900/60"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

      {/* ===== LIGHTBOX ===== */}
      {lightboxOpen && selectedHero && (
        <div
          className="fixed inset-0 z-[1000] bg-black/90 flex items-center justify-center p-3 sm:p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white hover:text-gray-300 transition p-2"
            onClick={() => setLightboxOpen(false)}
          >
            <X size={30} />
          </button>
          <div
            className="max-w-full max-h-[80vh] w-auto h-auto flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3">
              <span
                className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${
                  getCategoryMeta(selectedHero.category).color
                }`}
              >
                {getCategoryMeta(selectedHero.category).label} Hero Banner
              </span>
            </div>
            {selectedHero.mediaType === "video" ? (
              <video
                src={selectedHero.mediaUrl}
                controls
                autoPlay
                playsInline
                preload="auto"
                className="max-w-full max-h-[75vh] rounded-xl shadow-2xl"
              />
            ) : (
              <img
                src={selectedHero.mediaUrl}
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
                alt="Hero full view"
              />
            )}
          </div>
        </div>
      )}

      {/* ===== MODALS ===== */}
      <LoadingModal isLoading={uploading} message="Uploading to Google Drive..." />
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Hero Media"
        message="Are you sure you want to delete this hero media? This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
};

export default HeroManager;