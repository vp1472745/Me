import React, { useEffect, useState } from "react";
import {
  Plus,
  Upload,
  Trash2,
  Eye,
  Image as ImageIcon,
  Video,
  X,
} from "lucide-react";

// ✅ Cloudinary upload helper (client‑side)
import { uploadToCloudinary } from "../../../services/cloudinaryUpload";

// ✅ API functions (from your config/api.js)
import {
  createHeroSection,
  getAllHeroSections,
  deleteHeroSection,
} from "../../../config/api";

// ✅ Common Loading Modal (adjust path to your project)
import LoadingModal from "../../../components/commonComponents/LoadingModal";

const HeroManager = () => {
  // ==============================
  // STATE
  // ==============================
  const [activeTab, setActiveTab] = useState("create");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Create form
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileType, setFileType] = useState("image");

  // Listing
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lightbox
  const [selectedHero, setSelectedHero] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // ==============================
  // FETCH HEROES
  // ==============================
  const fetchHeroes = async () => {
    try {
      setLoading(true);
      const res = await getAllHeroSections();
      setHeroes(res?.data?.data || []);
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
  // CREATE HERO (client‑side upload)
  // ==============================
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please select a media file.");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // 1. Upload directly to Cloudinary with progress
      const result = await uploadToCloudinary(selectedFile, (percent) => {
        setUploadProgress(percent);
      });

      const { secure_url, public_id } = result;
      const mediaType = selectedFile.type.startsWith("video/") ? "video" : "image";

      // 2. Send URL to backend (JSON)
      await createHeroSection({
        mediaUrl: secure_url,
        mediaType,
        public_id,
      });

      alert("✅ Hero media uploaded successfully!");
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadProgress(0);
      fetchHeroes();
      setActiveTab("all");
    } catch (error) {
      console.error("Upload error:", error);
      alert(error?.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  // ==============================
  // DELETE HERO
  // ==============================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this hero media?")) return;
    try {
      await deleteHeroSection(id);
      fetchHeroes();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Delete failed.");
    }
  };

  // ==============================
  // LIGHTBOX
  // ==============================
  const openLightbox = (hero) => {
    setSelectedHero(hero);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setSelectedHero(null);
    document.body.style.overflow = "auto";
  };

  // ==============================
  // HANDLE FILE SELECTION
  // ==============================
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setFileType(file.type.startsWith("video/") ? "video" : "image");
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // ==============================
  // RENDER
  // ==============================
  return (
    <div className="flex flex-col h-full w-full bg-[#F7F9F4] text-[#3B4953]">
      {/* Tabs */}
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
              Upload Hero
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
              All Heroes
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-10 pb-6">
        <div className="max-w-7xl mx-auto mt-6">
          {/* ---- CREATE TAB ---- */}
          {activeTab === "create" && (
            <div className="bg-white rounded-2xl border border-[#DDE7D8] p-5 sm:p-6 md:p-8 shadow-sm">
              <form onSubmit={handleCreate} className="space-y-6">
                <div>
                  <label className="block mb-2 uppercase tracking-[2px] text-[11px] font-bold text-[#3B4953]/80">
                    Select Media (Image or Video)
                  </label>
                  <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-[#90AB8B]/40 hover:border-[#5A7863] bg-[#F7F9F4] rounded-xl p-6 text-center transition group min-h-[200px]">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      required={!selectedFile}
                    />
                    <div className="flex flex-col items-center pointer-events-none space-y-2">
                      {previewUrl ? (
                        <>
                          {fileType === "video" ? (
                            <video
                              src={previewUrl}
                              className="max-h-48 rounded-lg"
                              controls
                            />
                          ) : (
                            <img
                              src={previewUrl}
                              alt="Preview"
                              className="max-h-48 rounded-lg object-contain"
                            />
                          )}
                          <p className="text-xs text-[#5A7863] font-medium">
                            {selectedFile?.name} ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="w-14 h-14 rounded-full bg-white border border-[#DDE7D8] flex items-center justify-center text-[#5A7863]">
                            <Upload size={20} />
                          </div>
                          <p className="text-xs font-bold text-[#3B4953]">
                            Drop or click to select
                          </p>
                          <p className="text-[10px] text-[#3B4953]/50">
                            Supports JPG, PNG, WEBP, MP4, MOV, WEBM
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#DDE7D8]">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="inline-flex items-center gap-2 bg-[#5A7863] hover:bg-[#4a6352] text-white px-8 py-3.5 rounded-xl uppercase tracking-[2px] text-xs font-semibold transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    <Upload size={12} />
                    {uploading ? `Uploading... ${uploadProgress}%` : "Publish Hero Media"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ---- ALL HEROES TAB ---- */}
          {activeTab === "all" && (
            <>
              {loading ? (
                <div className="flex justify-center items-center h-64 bg-white rounded-2xl border border-[#DDE7D8]">
                  <div className="w-9 h-9 border-2 border-[#5A7863] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : heroes.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-[#DDE7D8] px-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F7F9F4] rounded-full mb-4 border border-[#DDE7D8]">
                    <ImageIcon size={22} className="text-[#90AB8B]" />
                  </div>
                  <p className="text-[#3B4953] text-lg font-semibold mb-1">No hero media found</p>
                  <p className="text-[#3B4953]/60 text-sm">Upload your first hero image or video now.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {heroes.map((hero) => (
                    <div
                      key={hero._id}
                      className="group bg-white rounded-xl overflow-hidden border border-[#DDE7D8] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
                    >
                      <div className="relative h-52 bg-[#F7F9F4] overflow-hidden">
                        {hero.mediaType === "video" ? (
                          <video
                            src={hero.mediaUrl}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                          />
                        ) : (
                          <img
                            src={hero.mediaUrl}
                            alt="Hero"
                            className="w-full h-full object-cover transition duration-500 group-hover:scale-102"
                          />
                        )}
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5">
                          {hero.mediaType === "video" ? (
                            <Video size={12} />
                          ) : (
                            <ImageIcon size={12} />
                          )}
                          {hero.mediaType}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-4 right-4 flex justify-between items-center">
                          <span className="text-white text-xs opacity-80">
                            {new Date(hero.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 flex gap-2.5 pt-4 border-t border-[#DDE7D8]/60">
                        <button
                          onClick={() => openLightbox(hero)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#F7F9F4] hover:bg-[#EBF4DD]/60 text-[#5A7863] border border-[#DDE7D8] py-2.5 rounded-lg text-xs font-bold uppercase tracking-[1px] transition-all duration-200"
                        >
                          <Eye size={12} /> Inspect
                        </button>
                        <button
                          onClick={() => handleDelete(hero._id)}
                          className="inline-flex items-center justify-center bg-red-50 hover:bg-red-100/80 text-red-600 border border-red-200/60 p-2.5 rounded-lg transition-all duration-200"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
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
      {lightboxOpen && selectedHero && (
        <div
          className="fixed inset-0 z-[999] bg-[#3B4953]/95 backdrop-blur-md overflow-hidden flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 z-50 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
          >
            <X size={18} />
          </button>

          <div
            className="max-w-5xl max-h-[90vh] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedHero.mediaType === "video" ? (
              <video
                src={selectedHero.mediaUrl}
                className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
                controls
                autoPlay
              />
            ) : (
              <img
                src={selectedHero.mediaUrl}
                alt="Hero"
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              />
            )}
          </div>
        </div>
      )}

      {/* ===== LOADING MODAL ===== */}
      <LoadingModal
        isLoading={loading || uploading}
        message={uploading ? `Uploading hero media... ${uploadProgress}%` : "Loading heroes..."}
        showProgress={uploading}
        progress={uploadProgress}
        variant="spinner"
      />
    </div>
  );
};

export default HeroManager;