import React, { useEffect, useState } from "react";
import { Plus, Upload, Trash2, Eye, Image as ImageIcon, Video, X } from "lucide-react";
import { uploadToCloudinary } from "../../../services/cloudinaryUpload";
import { createHeroSection, getAllHeroSections, deleteHeroSection } from "../../../config/api";
import LoadingModal from "../../commonComponents/CommonLoadingModal";
import DeleteConfirmationModal from "../../../components/commonComponents/DeleteConfirmationModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const HeroManager = () => {
  // ==============================
  // STATE
  // ==============================
  const [activeTab, setActiveTab] = useState("create");
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
      const result = await uploadToCloudinary(selectedFile, (percent) => setUploadProgress(percent));
      const { secure_url, public_id } = result;
      
      await createHeroSection({
        mediaUrl: secure_url,
        mediaType: selectedFile.type.startsWith("video/") ? "video" : "image",
        public_id,
      });

      toast.success(" Hero media uploaded successfully!", {
        style: {
          background: "#1a7d4a",
          color: "#fff",
          borderRadius: "12px",
          padding: "16px 24px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        
        },
        progressClassName: "bg-white/30",
       
      });

      setSelectedFile(null);
      setPreviewUrl(null);
      fetchHeroes();
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
    try {
      await deleteHeroSection(heroToDelete._id);
      toast.success(" Hero media deleted.", {
        style: {
          background: "#1a7d4a",
          color: "#fff",
          borderRadius: "12px",
          padding: "16px 24px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        },
      });
      fetchHeroes();
      setDeleteModalOpen(false);
    } catch (error) {
      toast.error("Delete failed.", {
        style: {
          background: "#b91c1c",
          color: "#fff",
          borderRadius: "12px",
          padding: "16px 24px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        },
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#F7F9F4] text-[#3B4953] min-h-screen">
      {/* Custom styled Toast Container */}
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
      <div className="px-4 mt-4">
        <div className="max-w-7xl mx-auto border-b border-[#DDE7D8] bg-white rounded-t-xl overflow-hidden shadow-sm flex flex-wrap">
          {["create", "all"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[120px] px-4 py-4 text-[10px] sm:text-xs font-bold uppercase tracking-[2px] transition-all flex items-center justify-center gap-2 ${
                activeTab === tab
                  ? "bg-[#EBF4DD] text-[#5A7863] border-b-2 border-[#5A7863]"
                  : "text-[#3B4953]/70 hover:bg-[#F7F9F4]"
              }`}
            >
              {tab === "create" ? <Plus size={14} /> : <ImageIcon size={14} />}
              {tab === "create" ? "Upload" : "All Media"}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          {activeTab === "create" ? (
            <div className="bg-white rounded-2xl border border-[#DDE7D8] p-6 shadow-sm">
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="relative border-2 border-dashed border-[#90AB8B]/40 rounded-xl p-4 sm:p-10 flex flex-col items-center text-center">
                  <input type="file" accept="image/*,video/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  {previewUrl ? (
                    <div className="w-full max-w-sm">
                      {fileType === "video" ? <video src={previewUrl} className="rounded-lg w-full" controls /> : <img src={previewUrl} className="rounded-lg w-full max-h-60 object-contain" alt="Preview" />}
                    </div>
                  ) : (
                    <div className="py-10 text-[#3B4953]/60">
                      <Upload size={32} className="mx-auto mb-2" />
                      <p className="text-sm font-bold">Select Media</p>
                    </div>
                  )}
                </div>
                <button type="submit" disabled={uploading || !selectedFile} className="w-full bg-[#5A7863] text-white py-4 rounded-xl font-bold uppercase tracking-[2px] text-xs disabled:opacity-50">
                  {uploading ? `Uploading ${uploadProgress}%` : "Publish"}
                </button>
              </form>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {heroes.map((hero) => (
                <div key={hero._id} className="bg-white rounded-xl border border-[#DDE7D8] p-3 flex flex-col gap-3">
                  <div className="h-48 bg-[#F7F9F4] rounded-lg overflow-hidden relative">
                    {hero.mediaType === "video" ? <video src={hero.mediaUrl} className="w-full h-full object-cover" /> : <img src={hero.mediaUrl} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setSelectedHero(hero); setLightboxOpen(true); }} className="flex-1 bg-[#F7F9F4] text-[#5A7863] py-2 rounded-lg text-xs font-bold uppercase">Inspect</button>
                    <button onClick={() => { setHeroToDelete(hero); setDeleteModalOpen(true); }} className="px-4 bg-red-50 text-red-600 rounded-lg"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-5 right-5 text-white" onClick={() => setLightboxOpen(false)}><X size={30} /></button>
          {selectedHero.mediaType === "video" ? <video src={selectedHero.mediaUrl} controls className="max-w-full max-h-[80vh]" /> : <img src={selectedHero.mediaUrl} className="max-w-full max-h-[80vh] object-contain" />}
        </div>
      )}

      <LoadingModal isLoading={uploading} message="Uploading..." />
      <DeleteConfirmationModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={handleConfirmDelete} />

      {/* Optional: global style for toast (if you want to override default classes) */}
      <style jsx global>{`
        .custom-toast {
          border-radius: 12px !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;
        }
        .custom-progress {
          background: rgba(255,255,255,0.3) !important;
          height: 3px !important;
        }
      `}</style>
    </div>
  );
};

export default HeroManager;