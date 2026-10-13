// ======================================================
// FILE: AdminFilms.jsx
// ======================================================
import React, { useEffect, useState } from "react";
import { createVideo, getAllVideos, deleteVideo } from "../../config/api";
import { FaPlay, FaTrash, FaTimes, FaVideo, FaPlus, FaYoutube } from "react-icons/fa";
import { toast, Toaster } from "react-hot-toast";
import LoadingModal from "../../components/feedback/CommonLoadingModal";
import DeleteConfirmationModal from "../../components/feedback/DeleteConfirmationModal";

function AdminFilms() {
  // ==========================
  // STATES
  // ==========================
  const [activeTab, setActiveTab] = useState("create");
  const [category, setCategory] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Processing...");
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ==========================
  // FETCH VIDEOS
  // ==========================
  const fetchVideos = async () => {
    try {
      const res = await getAllVideos();
      setVideos(Array.isArray(res?.data?.videos) ? res.data.videos : []);
    } catch (error) {
      console.error("Error fetching video assets:", error);
      setVideos([]);
      toast.error("Failed to load videos");
    }
  };

  // ==========================
  // USE EFFECT
  // ==========================
  useEffect(() => {
    fetchVideos();
  }, []);

  // ==========================
  // CREATE VIDEO (YouTube URL Handler)
  // ==========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category.trim()) {
      toast.error("Please enter a category");
      return;
    }
    if (!youtubeUrl.trim()) {
      toast.error("Please enter a YouTube URL");
      return;
    }

    try {
      setLoadingMessage("Adding stream reference into tracking database...");
      setLoading(true);

      const formData = new FormData();
      formData.append("category", category);
      formData.append("youtubeUrl", youtubeUrl);

      await createVideo(formData);

      toast.success("Video added successfully!");
      setCategory("");
      setYoutubeUrl("");
      await fetchVideos();
      setActiveTab("all");
    } catch (error) {
      console.error("Video submission sequence interrupted:", error);
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // DELETE VIDEO – open modal
  // ==========================
  const handleDeleteClick = (video) => {
    setVideoToDelete(video);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!videoToDelete) return;
    setIsDeleting(true);
    try {
      setLoadingMessage("Purging stream asset mappings...");
      setLoading(true);
      await deleteVideo(videoToDelete._id);
      toast.success("Video deleted successfully");
      await fetchVideos();
    } catch (error) {
      console.error("Deletion lifecycle failure:", error);
      toast.error("Failed to delete video resource.");
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setVideoToDelete(null);
      setLoading(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setVideoToDelete(null);
  };

  // ==========================
  // PARSER HELPER: Extract YouTube ID & Build Clean Embed Path
  // ==========================
  const getEmbedUrl = (url) => {
    if (!url) return "";
    let videoId = "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    } else {
      return url;
    }
    return `https://www.youtube.com/embed/${videoId}`;
  };

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
          <FaPlus size={11} />
          Create Video
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
            activeTab === "all"
              ? "bg-blue-600 text-white shadow-2xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <FaVideo size={11} />
          All Videos ({videos.length})
        </button>
      </div>

      {/* CREATE TAB */}
      {activeTab === "create" && (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-2xs">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category Input Selection Box */}
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Video Category / Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Wedding Teaser, Highlights, Cinematic Film"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-2.5 sm:p-3 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-xs sm:text-sm"
                  />
                </div>

                {/* YouTube Link Destination Entry Field */}
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    YouTube Video URL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-red-600">
                      <FaYoutube size={15} />
                    </div>
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-2.5 sm:p-3 pl-10 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-xs sm:text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Processing Controls System Commit Trigger */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700/80 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 sm:px-6 py-2.5 rounded-lg uppercase tracking-wider text-xs font-bold transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50"
                  >
                    <FaPlus size={10} />
                    {loading ? "Adding Track..." : "Add Video Resource"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ALL VIDEOS INDEX GRID VIEWS */}
          {activeTab === "all" && (
            <>
              {videos.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700/80 px-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 dark:bg-blue-950/50 rounded-full mb-3 border border-blue-200 dark:border-blue-900">
                    <FaVideo size={18} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 text-base font-bold mb-1">No video assets found</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">Add your first YouTube video link using the create tab above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {videos.map((video) => {
                    const embedUrl = getEmbedUrl(video.youtubeUrl);
                    const videoId = embedUrl.includes("/embed/") ? embedUrl.split("/embed/")[1] : "";

                    return (
                      <div
                        key={video._id}
                        className="group bg-white dark:bg-slate-800/90 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col"
                      >
                        {/* Dynamic Stream Image Thumbnail Layout */}
                        {video.youtubeUrl && videoId && (
                          <div
                            className="relative overflow-hidden h-44 sm:h-48 bg-black cursor-pointer"
                            onClick={() => setSelectedVideo(video)}
                          >
                            <img
                              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                              alt={video.title || "Cinema Feed"}
                              className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                              }}
                            />
                            {/* Floating Overlay Meta Elements */}
                            {video.category && (
                              <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">
                                {video.category}
                              </div>
                            )}
                            {/* Play HUD Centered Target Icon */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                                <FaPlay size={12} className="ml-0.5" />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Video Item Action Control Center Footer */}
                        <div className="p-3 bg-white dark:bg-slate-800/90 border-t border-slate-100 dark:border-slate-700/80 flex items-center gap-2 mt-auto">
                          <button
                            onClick={() => setSelectedVideo(video)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 py-1.5 sm:py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200"
                          >
                            <FaPlay size={9} /> Play
                          </button>
                          <button
                            onClick={() => handleDeleteClick(video)}
                            className="inline-flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:hover:bg-red-900/50 dark:text-red-400 border border-red-200 dark:border-red-800/60 p-2 rounded-lg transition-all duration-200"
                            title="Delete Video"
                          >
                            <FaTrash size={11} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

      {/* ==========================
          FULLSCREEN VIDEO MODAL (YouTube embed)
      ========================== */}
      {selectedVideo && selectedVideo.youtubeUrl && (
        <div
          className="fixed inset-0 z-[999] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="relative w-full max-w-3xl bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dismiss Modal Floating Control */}
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-3 right-3 z-50 text-white/80 hover:text-white bg-black/60 hover:bg-black/80 p-2 rounded-full transition shadow-md"
              aria-label="Close Playback"
            >
              <FaTimes size={13} />
            </button>

            {/* Embed Stream Window Aspect Frame */}
            <div className="aspect-video w-full bg-black">
              <iframe
                src={`${getEmbedUrl(selectedVideo.youtubeUrl)}?autoplay=1`}
                title={selectedVideo.title || "Dynamic Feed Player"}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            {/* Meta Segment Display Footnote */}
            {(selectedVideo.title || selectedVideo.category) && (
              <div className="p-3.5 text-center bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-700">
                {selectedVideo.title && (
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-wide">{selectedVideo.title}</h3>
                )}
                {selectedVideo.category && (
                  <p className="text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mt-0.5">
                    {selectedVideo.category}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dynamic Modular Loader Injection */}
      <LoadingModal
        isLoading={loading}
        message={loadingMessage}
        showProgress={false}
        variant="dots"
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete Video"
        message={`Are you sure you want to delete "${videoToDelete?.category || 'this video'}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default AdminFilms;