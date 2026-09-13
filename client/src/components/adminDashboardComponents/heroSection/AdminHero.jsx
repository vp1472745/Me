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
import { uploadToDrive } from "../../../services/driveUpload";
import { getCleanMediaUrl } from "../../../utils/cleanUrl";
import {
  createHeroSection,
  getAllHeroSections,
  deleteHeroSection,
} from "../../../config/api";
import LoadingModal from "../../commonComponents/CommonLoadingModal";
import DeleteConfirmationModal from "../../../components/commonComponents/DeleteConfirmationModal";
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
  <div className="bg-white rounded-xl border border-[#DDE7D8] p-3 flex flex-col gap-3 shadow-sm animate-pulse">
    <div className="h-48 bg-[#F7F9F4] rounded-lg" />
    <div className="flex gap-2">
      <div className="flex-1 h-10 bg-[#F7F9F4] rounded-lg" />
      <div className="w-10 h-10 bg-[#F7F9F4] rounded-lg" />
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
  const fetchHeroes = async () => {
    try {
      setLoading(true);
      const res = await getAllHeroSections();
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
    fetchHeroes();
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
      fetchHeroes();
      setSelectedFilterCategory(category);
      setActiveTab("all");
    } catch (error) {
      toast.error("Upload failed. Please try again.", {
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
      fetchHeroes();
      setDeleteModalOpen(false);
      setHeroToDelete(null);
    } catch (error) {
      if (error?.response?.status === 404) {
        setHeroes((prev) => prev.filter((h) => h._id !== deletedId));
        fetchHeroes();
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
    <div className="flex flex-col h-full w-full bg-[#F7F9F4] text-[#3B4953]">
      {/* Toast Container */}
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

      {/* ===== FIXED HEADER (Tabs) ===== */}
      <div className="sticky top-0 z-20 bg-[#F7F9F4] px-3 sm:px-4 pt-3 sm:pt-4 pb-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-1 bg-white rounded-t-xl overflow-hidden shadow-sm border border-[#DDE7D8]">
            {["create", "all"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-[100px] sm:min-w-[120px] px-3 sm:px-4 py-3 sm:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-[2px] transition-all flex items-center justify-center gap-2 ${
                  activeTab === tab
                    ? "bg-[#EBF4DD] text-[#5A7863] border-b-2 border-[#5A7863]"
                    : "text-[#3B4953]/70 hover:bg-[#F7F9F4]"
                }`}
              >
                {tab === "create" ? <Plus size={14} /> : <ImageIcon size={14} />}
                {tab === "create" ? "+ Upload Hero Banner" : `All Media (${heroes.length})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== SCROLLABLE CONTENT ===== */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          {activeTab === "create" ? (
            // ─── UPLOAD FORM ──────────────────────────────
            <div className="bg-white rounded-2xl border border-[#DDE7D8] p-5 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#2A382C] flex items-center gap-2">
                  <Sparkles size={18} className="text-[#5A7863]" />
                  Select Page Category
                </h2>
                <p className="text-xs text-[#3B4953]/70 mt-1">
                  Choose which website page or section this Hero Banner should appear on.
                </p>
              </div>

              {/* Category Selector Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {HERO_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-3.5 rounded-xl border-2 text-left transition-all duration-200 flex flex-col justify-between relative overflow-hidden group ${
                        isSelected
                          ? "border-[#5A7863] bg-[#EBF4DD]/60 shadow-sm"
                          : "border-[#DDE7D8] bg-[#F7F9F4]/40 hover:border-[#5A7863]/40 hover:bg-white"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 text-[#5A7863]">
                          <CheckCircle2 size={16} />
                        </div>
                      )}
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2.5 transition-colors ${
                          isSelected
                            ? "bg-[#5A7863] text-white"
                            : "bg-white text-[#5A7863] border border-[#DDE7D8]"
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-[#2A382C]">
                          {cat.label}
                        </div>
                        <div className="text-[10px] text-[#3B4953]/60 leading-tight mt-0.5 line-clamp-2">
                          {cat.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Form Upload */}
              <form onSubmit={handleCreate} className="space-y-5 sm:space-y-6 pt-2">
                <div className="relative border-2 border-dashed border-[#90AB8B]/40 rounded-xl p-6 sm:p-10 flex flex-col items-center text-center transition-colors hover:border-[#5A7863]/60 bg-[#F7F9F4]/30">
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
                          className="rounded-lg w-full max-h-64 object-cover shadow-sm"
                          controls
                        />
                      ) : (
                        <img
                          src={previewUrl}
                          className="rounded-lg w-full max-h-64 object-contain shadow-sm"
                          alt="Preview"
                        />
                      )}
                      <p className="mt-2 text-xs text-[#3B4953]/70 font-medium">
                        {selectedFile?.name} ({Math.round(selectedFile?.size / 1024)} KB)
                      </p>
                    </div>
                  ) : (
                    <div className="py-8 sm:py-12 text-[#3B4953]/60">
                      <Upload size={40} className="mx-auto mb-3 text-[#5A7863] opacity-80" />
                      <p className="text-sm font-bold text-[#2A382C]">
                        Tap or click to select media for{" "}
                        <span className="text-[#5A7863]">
                          {HERO_CATEGORIES.find((c) => c.id === category)?.label}
                        </span>
                      </p>
                      <p className="text-xs mt-1">Supports high-res Images & 4K Videos</p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="w-full bg-[#5A7863] text-white py-4 sm:py-4.5 rounded-xl font-bold uppercase tracking-[2px] text-xs disabled:opacity-50 transition hover:bg-[#4A6853] active:scale-[0.98] shadow-sm flex items-center justify-center gap-2"
                >
                  <Upload size={16} />
                  {uploading
                    ? `Uploading to Google Drive ${uploadProgress}%...`
                    : `Publish to ${HERO_CATEGORIES.find((c) => c.id === category)?.label} Hero`}
                </button>
              </form>
            </div>
          ) : (
            // ─── MEDIA GRID ──────────────────────────────
            <div className="space-y-5">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => setSelectedFilterCategory("all")}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    selectedFilterCategory === "all"
                      ? "bg-[#5A7863] text-white shadow-sm"
                      : "bg-white text-[#3B4953]/80 border border-[#DDE7D8] hover:bg-[#F7F9F4]"
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
                      className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        isActive
                          ? "bg-[#5A7863] text-white shadow-sm"
                          : "bg-white text-[#3B4953]/80 border border-[#DDE7D8] hover:bg-[#F7F9F4]"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : filteredHeroes.length === 0 ? (
                // Empty state
                <div className="bg-white rounded-2xl border border-[#DDE7D8] text-center py-16 sm:py-24 text-[#3B4953]/50 p-6">
                  <ImageIcon size={56} className="mx-auto mb-4 opacity-30 text-[#5A7863]" />
                  <p className="text-base font-semibold text-[#2A382C]">
                    No hero banners found for{" "}
                    {selectedFilterCategory === "all"
                      ? "any category"
                      : HERO_CATEGORIES.find((c) => c.id === selectedFilterCategory)?.label}.
                  </p>
                  <p className="text-xs sm:text-sm mt-1 text-[#3B4953]/70">
                    Switch to the "Upload" tab to add a hero banner for this section.
                  </p>
                  <button
                    onClick={() => {
                      if (selectedFilterCategory !== "all") {
                        setCategory(selectedFilterCategory);
                      }
                      setActiveTab("create");
                    }}
                    className="mt-5 inline-flex items-center gap-2 bg-[#5A7863] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#4A6853] transition"
                  >
                    <Plus size={14} /> Upload Banner
                  </button>
                </div>
              ) : (
                // Media cards
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredHeroes.map((hero) => {
                    const catMeta = getCategoryMeta(hero.category);
                    const CatIcon = catMeta.icon;
                    return (
                      <div
                        key={hero._id}
                        className="bg-white rounded-xl border border-[#DDE7D8] p-3 flex flex-col gap-3 shadow-sm hover:shadow-md transition duration-200"
                      >
                        <div className="relative h-48 bg-[#111] rounded-lg overflow-hidden group">
                          {hero.mediaType === "video" ? (
                            <video
                              src={hero.mediaUrl}
                              className="w-full h-full object-cover"
                              muted
                            />
                          ) : (
                            <img
                              src={hero.mediaUrl}
                              className="w-full h-full object-cover"
                              alt="Hero media"
                            />
                          )}

                          {/* Category Badge overlay */}
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                            <span
                              className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider border shadow-sm flex items-center gap-1 ${catMeta.color}`}
                            >
                              <CatIcon size={11} />
                              {catMeta.badge}
                            </span>
                          </div>

                          {/* Media Type Badge overlay */}
                          <div className="absolute top-2.5 right-2.5">
                            <span className="bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
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
                          <span className="text-[11px] font-bold text-[#5A7863] flex items-center gap-1">
                            <CatIcon size={12} />
                            {catMeta.label}
                          </span>
                          <span className="text-[10px] text-[#3B4953]/50">
                            {new Date(hero.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedHero(hero);
                              setLightboxOpen(true);
                            }}
                            className="flex-1 bg-[#F7F9F4] text-[#5A7863] py-2.5 rounded-lg text-xs font-bold uppercase hover:bg-[#EBF4DD] transition flex items-center justify-center gap-1.5 border border-[#DDE7D8]"
                          >
                            <Eye size={14} /> Preview
                          </button>
                          <button
                            onClick={() => {
                              setHeroToDelete(hero);
                              setDeleteModalOpen(true);
                            }}
                            className="px-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition flex items-center justify-center border border-red-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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
                className="max-w-full max-h-[75vh] rounded-xl shadow-2xl"
                autoPlay
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