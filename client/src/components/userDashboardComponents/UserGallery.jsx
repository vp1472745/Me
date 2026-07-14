import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getGalleryDeliverables,
  toggleFavoriteGalleryFile,
  createCorrectionRequest,
  approveCorrectedImage,
  getCorrectionRequestHistory,
} from "../../config/api";
import {
  FaHeart,
  FaRegHeart,
  FaDownload,
  FaEye,
  FaWrench,
  FaCheck,
  FaHistory,
  FaSpinner,
  FaPhotoVideo,
  FaSearchPlus,
} from "react-icons/fa";
import CommonModal from "../commonComponents/CommonModelComponents";

const UserGallery = () => {
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  // Modal / Preview states
  const [previewItem, setPreviewItem] = useState(null);
  const [zoom, setZoom] = useState(false);
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [correctionText, setCorrectionText] = useState("");
  const [selectedFileForCorrection, setSelectedFileForCorrection] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLogs, setHistoryLogs] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchGallery = async () => {
    try {
      const response = await getGalleryDeliverables();
      if (response.data.success) {
        setDeliverables(response.data.deliverables);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load gallery items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const categories = ["All", ...new Set(deliverables.map((d) => d.category).filter(Boolean))];

  const filteredDeliverables = deliverables.filter((item) => {
    if (activeCategory === "All") return true;
    return item.category === activeCategory;
  });

  const handleFavorite = async (item) => {
    try {
      const response = await toggleFavoriteGalleryFile({
        workId: item.projectId,
        fileId: item.fileId,
      });
      if (response.data.success) {
        setDeliverables((prev) =>
          prev.map((d) =>
            d.fileId === item.fileId ? { ...d, favorite: response.data.deliverable.favorite } : d
          )
        );
        toast.success(
          response.data.deliverable.favorite ? "Added to favorites" : "Removed from favorites"
        );
      }
    } catch (error) {
      toast.error("Could not update favorite status.");
    }
  };

  const handleApproveImage = async (item) => {
    try {
      const response = await approveCorrectedImage({
        workId: item.projectId,
        fileId: item.fileId,
        action: "APPROVE",
      });
      if (response.data.success) {
        setDeliverables((prev) =>
          prev.map((d) => (d.fileId === item.fileId ? { ...d, status: "APPROVED" } : d))
        );
        toast.success("Image approved successfully!");
      }
    } catch (error) {
      toast.error("Failed to approve image.");
    }
  };

  const handleOpenCorrection = (item) => {
    setSelectedFileForCorrection(item);
    setCorrectionText("");
    setCorrectionOpen(true);
  };

  const handleSendCorrection = async (e) => {
    e.preventDefault();
    if (!correctionText.trim()) return;

    try {
      const response = await createCorrectionRequest({
        workId: selectedFileForCorrection.projectId,
        fileId: selectedFileForCorrection.fileId,
        fileName: selectedFileForCorrection.name,
        userComment: correctionText,
      });
      if (response.data.success) {
        setDeliverables((prev) =>
          prev.map((d) =>
            d.fileId === selectedFileForCorrection.fileId ? { ...d, status: "NEEDS_CORRECTION" } : d
          )
        );
        toast.success("Correction request submitted!");
        setCorrectionOpen(false);
      }
    } catch (error) {
      toast.error("Failed to send correction request.");
    }
  };

  const handleOpenHistory = async (item) => {
    setHistoryLoading(true);
    setHistoryOpen(true);
    try {
      const response = await getCorrectionRequestHistory(item.fileId);
      if (response.data.success) {
        setHistoryLogs(response.data.correction);
      }
    } catch (error) {
      toast.error("Failed to load edit history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  const getMediaUrl = (item) => {
    return `http://localhost:5000/api/gallery/download?fileId=${item.fileId}&workId=${item.projectId}`;
  };

  const getCategoryColor = (cat) => {
    const tones = {
      "Edited Photos": "bg-[#EBF4DD] text-[#5A7863]",
      "RAW Photos": "bg-slate-100 text-slate-700",
      Videos: "bg-sky-50 text-sky-700",
      Albums: "bg-purple-50 text-purple-700",
      "Final Delivery": "bg-emerald-50 text-emerald-700",
    };
    return tones[cat] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <FaSpinner className="text-[#5A7863] animate-spin text-3xl" />
        <p className="text-sm text-[#3B4953]/60">Fetching media files...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DDE7D8] pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-[#3B4953] tracking-tight">
            My Gallery
          </h2>
          <p className="text-sm text-[#3B4953]/60 mt-1">
            Browse and download photos, videos, and albums, request edits, or log approvals.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#DDE7D8] pb-px">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all duration-200 ${
              activeCategory === cat
                ? "border-[#5A7863] text-[#5A7863]"
                : "border-transparent text-[#3B4953]/60 hover:text-[#5A7863]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredDeliverables.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#DDE7D8] p-16 text-center max-w-lg mx-auto">
          <FaPhotoVideo className="text-5xl text-[#D5E0D0] mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#3B4953]">Empty folder category</h3>
          <p className="text-sm text-[#3B4953]/60 mt-1">
            No files have been uploaded under this category yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDeliverables.map((item) => (
            <div key={item.fileId} className="bg-white border border-[#DDE7D8] rounded-3xl overflow-hidden group shadow-sm flex flex-col justify-between">
              {/* Media Preview Area */}
              <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
                {item.category === "Videos" ? (
                  <video
                    src={getMediaUrl(item)}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={getMediaUrl(item)}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    loading="lazy"
                  />
                )}

                {/* Overlays */}
                <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                  <span className={`text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider rounded ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                  <span className="text-[10px] bg-slate-800/80 text-white px-2 py-0.5 font-bold rounded">
                    V{item.version}
                  </span>
                  {item.status && (
                    <span className={`text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider rounded ${
                      item.status === "APPROVED" ? "bg-green-500 text-white" : "bg-rose-500 text-white"
                    }`}>
                      {item.status}
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={() => handleFavorite(item)}
                    className="w-8 h-8 rounded-full bg-white/95 text-rose-500 flex items-center justify-center shadow-sm hover:scale-110 transition"
                  >
                    {item.favorite ? <FaHeart /> : <FaRegHeart className="text-slate-400" />}
                  </button>
                </div>

                {item.category !== "Videos" && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center gap-4">
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="w-10 h-10 rounded-full bg-white/90 text-slate-800 flex items-center justify-center hover:scale-110 transition shadow-md"
                      title="Preview Photo"
                    >
                      <FaEye />
                    </button>
                    <a
                      href={getMediaUrl(item)}
                      download
                      className="w-10 h-10 rounded-full bg-white/90 text-slate-800 flex items-center justify-center hover:scale-110 transition shadow-md"
                      title="Download Photo"
                    >
                      <FaDownload />
                    </a>
                  </div>
                )}
              </div>

              {/* Descriptions & Actions */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-extrabold text-[#3B4953] text-sm truncate">{item.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Uploaded by {item.uploadedBy} on {new Date(item.uploadedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-1.5 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenCorrection(item)}
                    className="flex items-center justify-center gap-1.5 py-2 px-1 text-slate-600 bg-slate-50 hover:bg-slate-100 text-xs font-semibold rounded-xl border border-slate-200 transition"
                  >
                    <FaWrench size={11} /> Edit
                  </button>
                  <button
                    onClick={() => handleOpenHistory(item)}
                    className="flex items-center justify-center gap-1.5 py-2 px-1 text-slate-600 bg-slate-50 hover:bg-slate-100 text-xs font-semibold rounded-xl border border-slate-200 transition"
                  >
                    <FaHistory size={11} /> History
                  </button>
                  {item.status !== "APPROVED" ? (
                    <button
                      onClick={() => handleApproveImage(item)}
                      className="flex items-center justify-center gap-1.5 py-2 px-1 text-white bg-green-600 hover:bg-green-700 text-xs font-semibold rounded-xl transition"
                    >
                      <FaCheck size={11} /> Approve
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-1 py-2 px-1 text-green-700 bg-green-50 text-[10px] font-bold rounded-xl border border-green-200">
                      Approved
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== PREVIEW IMAGE MODAL ===== */}
      <CommonModal
        isOpen={!!previewItem}
        onClose={() => { setPreviewItem(null); setZoom(false); }}
        title={previewItem?.name || "Photo Preview"}
        size="lg"
      >
        {previewItem && (
          <div className="space-y-4 flex flex-col items-center">
            <div className={`relative overflow-hidden w-full max-h-[70vh] bg-slate-900 rounded-2xl flex items-center justify-center ${zoom ? "cursor-zoom-out" : "cursor-zoom-in"}`}
                 onClick={() => setZoom(!zoom)}>
              <img
                src={getMediaUrl(previewItem)}
                alt={previewItem.name}
                className={`max-w-full max-h-[60vh] object-contain transition-transform duration-350 ${zoom ? "scale-150" : "scale-100"}`}
              />
            </div>
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-500 font-semibold uppercase">Category: {previewItem.category}</span>
              <button
                onClick={() => setZoom(!zoom)}
                className="flex items-center gap-1 text-xs text-[#5A7863] bg-[#EBF4DD] px-3 py-1.5 rounded-xl font-bold hover:bg-[#EBF4DD]/80 transition"
              >
                <FaSearchPlus /> {zoom ? "Zoom Out" : "Zoom In"}
              </button>
            </div>
          </div>
        )}
      </CommonModal>

      {/* ===== REQUEST CORRECTION MODAL ===== */}
      <CommonModal
        isOpen={correctionOpen}
        onClose={() => setCorrectionOpen(false)}
        title="Submit Correction Request"
        size="md"
      >
        {selectedFileForCorrection && (
          <form onSubmit={handleSendCorrection} className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 font-semibold mb-2">IMAGE FILE:</p>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <img
                  src={getMediaUrl(selectedFileForCorrection)}
                  alt="Thumbnail"
                  className="w-12 h-12 object-cover rounded-xl"
                />
                <span className="text-sm font-semibold text-slate-700 truncate">{selectedFileForCorrection.name}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Correction Instructions <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={correctionText}
                onChange={(e) => setCorrectionText(e.target.value)}
                placeholder="e.g. Please remove the background person, brighten the face and reduce warm tones..."
                rows={4}
                className="w-full p-4 text-sm rounded-2xl border border-slate-200 outline-none focus:border-[#5A7863] focus:ring-4 focus:ring-[#5A7863]/10 transition resize-none"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCorrectionOpen(false)}
                className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-2xl bg-[#5A7863] text-white hover:bg-[#4A6853] font-semibold text-xs uppercase tracking-wider"
              >
                Send Request
              </button>
            </div>
          </form>
        )}
      </CommonModal>

      {/* ===== EDIT HISTORY MODAL ===== */}
      <CommonModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        title="Revision History Logs"
        size="md"
      >
        {historyLoading ? (
          <div className="flex justify-center py-10">
            <FaSpinner className="animate-spin text-[#5A7863] text-2xl" />
          </div>
        ) : !historyLogs || historyLogs.history?.length === 0 && !historyLogs.userComment ? (
          <p className="text-center text-sm text-slate-500 py-8 font-medium">
            No revision correction logs exist for this file.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-[#EBF4DD]/40 border border-[#EBF4DD] rounded-2xl">
              <h5 className="font-extrabold text-[#5A7863] text-xs uppercase">Current Version (V{historyLogs.version})</h5>
              <p className="text-sm text-slate-700 mt-1.5 font-medium">"{historyLogs.userComment}"</p>
              {historyLogs.editorNotes && (
                <p className="text-xs text-slate-500 mt-1 italic">Editor feedback: {historyLogs.editorNotes}</p>
              )}
              <span className="text-[10px] bg-[#5A7863] text-white px-2 py-0.5 rounded uppercase font-bold mt-2.5 inline-block">
                Status: {historyLogs.status}
              </span>
            </div>

            {historyLogs.history && historyLogs.history.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400 font-semibold uppercase">Previous revisions:</p>
                {historyLogs.history.map((hist, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>Version V{hist.version}</span>
                      <span className="uppercase text-[9px] px-2 bg-slate-200 text-slate-600 rounded">{hist.status}</span>
                    </div>
                    {hist.userComment && <p className="text-slate-600 mt-1">Comment: "{hist.userComment}"</p>}
                    {hist.editorNotes && <p className="text-slate-500 italic mt-0.5">Notes: {hist.editorNotes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CommonModal>
    </div>
  );
};

export default UserGallery;
