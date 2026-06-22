// ======================================================
// FILE: AdminSettings.jsx
// ======================================================
import  { useEffect, useState } from "react";
import { createVideo, getAllVideos, deleteVideo } from "../../../config/api";
import { FaPlay, FaTrash, FaTimes, FaVideo, FaPlus, FaYoutube } from "react-icons/fa";
import LoadingModal from "../../commonComponents/LoadingModal"; // Importing your modular loader

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
    try {
      setLoadingMessage("Adding stream reference into tracking database...");
      setLoading(true);
      
      const formData = new FormData();
      formData.append("category", category);
      formData.append("youtubeUrl", youtubeUrl);
      
      await createVideo(formData);
      
      // Reset operational states
      setCategory("");
      setYoutubeUrl("");
      await fetchVideos();
      setActiveTab("all");
    } catch (error) {
      console.error("Video submission sequence interrupted:", error);
      alert(error.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // DELETE VIDEO RESOURCE
  // ==========================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to completely erase this video resource?")) return;
    try {
      setLoadingMessage("Purging stream asset mappings...");
      setLoading(true);
      await deleteVideo(id);
      await fetchVideos();
    } catch (error) {
      console.error("Deletion lifecycle failure:", error);
      alert("Failed to delete video resource.");
    } finally {
      setLoading(false);
    }
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
    <div className="flex flex-col h-full w-full bg-[#F7F9F4] text-[#3B4953]">
      
      {/* Structural Navigation Tabs Module */}
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
              Create Video
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`px-8 py-4 text-xs font-semibold uppercase tracking-[3px] transition-all duration-200 ${
                activeTab === "all"
                  ? "bg-[#EBF4DD] text-[#5A7863] border-b-2 border-b-[#5A7863]"
                  : "text-[#3B4953]/70 hover:bg-[#F7F9F4] hover:text-[#3B4953]"
              }`}
            >
              All Videos
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Content Stream Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-10 pb-6">
        <div className="max-w-7xl mx-auto mt-6">
          
          {/* CREATE TAB */}
          {activeTab === "create" && (
            <div className="bg-white rounded-2xl border border-[#DDE7D8] p-5 sm:p-6 md:p-8 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Category Input Selection Box */}
                <div>
                  <label className="block mb-2 uppercase tracking-[2px] text-[11px] font-bold text-[#3B4953]/80">
                    Video Category / Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Wedding Teaser, Highlights, Cinematic Film"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#F7F9F4] border border-[#DDE7D8] text-[#3B4953] rounded-xl p-4 placeholder-[#3B4953]/40 focus:outline-none focus:border-[#5A7863] transition text-sm"
                  />
                </div>

                {/* YouTube Link Destination Entry Field */}
                <div>
                  <label className="block mb-2 uppercase tracking-[2px] text-[11px] font-bold text-[#3B4953]/80">
                    YouTube Video URL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-red-600">
                      <FaYoutube size={16} />
                    </div>
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="w-full bg-[#F7F9F4] border border-[#DDE7D8] text-[#3B4953] rounded-xl p-4 pl-11 placeholder-[#3B4953]/40 focus:outline-none focus:border-[#5A7863] transition text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Processing Controls System Commit Trigger */}
                <div className="pt-4 border-t border-[#DDE7D8]">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 bg-[#5A7863] hover:bg-[#4a6352] text-white px-8 py-3.5 rounded-xl uppercase tracking-[2px] text-xs font-semibold transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    <FaPlus size={11} />
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
                <div className="text-center py-20 bg-white rounded-2xl border border-[#DDE7D8] px-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F7F9F4] rounded-full mb-4 border border-[#DDE7D8]">
                    <FaVideo size={22} className="text-[#90AB8B]" />
                  </div>
                  <p className="text-[#3B4953] text-lg font-semibold mb-1">No stream assets found</p>
                  <p className="text-[#3B4953]/60 text-sm">Deploy standalone cloud-linked stream objects here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map((video) => {
                    const embedUrl = getEmbedUrl(video.youtubeUrl);
                    const videoId = embedUrl.includes("/embed/") ? embedUrl.split("/embed/")[1] : "";
                    
                    return (
                      <div
                        key={video._id}
                        className="group bg-white rounded-xl overflow-hidden border border-[#DDE7D8] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
                      >
                        {/* Dynamic Stream Image Thumbnail Layout */}
                        {video.youtubeUrl && videoId && (
                          <div className="relative overflow-hidden h-52 bg-black cursor-pointer" onClick={() => setSelectedVideo(video)}>
                            <img
                              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                              alt={video.title || "Cinema Feed"}
                              className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                              onError={(e) => {
                                e.target.onerror = null; // Prevent infinite fallback loops
                                e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                              }}
                            />
                            {/* Floating Overlay Meta Elements */}
                            {video.category && (
                              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md border border-[#DDE7D8] text-[10px] font-bold uppercase tracking-[1px] text-[#3B4953]">
                                {video.category}
                              </div>
                            )}
                            {/* Play HUD Centered Target Icon */}
                            <div className="absolute inset-0 flex items-center justify-center bg-[#3B4953]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#5A7863] shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                                <FaPlay size={14} className="ml-0.5" />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Video Item Action Control Center Footer */}
                        <div className="p-4 bg-white border-t border-[#DDE7D8] flex gap-2.5 mt-auto">
                          <button
                            onClick={() => setSelectedVideo(video)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#F7F9F4] hover:bg-[#EBF4DD]/60 text-[#5A7863] border border-[#DDE7D8] py-2.5 rounded-lg text-xs font-bold uppercase tracking-[1px] transition-all duration-200"
                          >
                            <FaPlay size={10} /> Stream
                          </button>
                          <button
                            onClick={() => handleDelete(video._id)}
                            className="inline-flex items-center justify-center bg-red-50 hover:bg-red-100/80 text-red-600 border border-red-200/60 p-2.5 rounded-lg transition-all duration-200"
                            title="Erase Stream Resource"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ==========================
          FULLSCREEN VIDEO MODAL (YouTube embed)
      ========================== */}
      {selectedVideo && selectedVideo.youtubeUrl && (
        <div
          className="fixed inset-0 z-[999] bg-[#3B4953]/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl border border-[#DDE7D8]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dismiss Modal Floating Control */}
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 z-50 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 p-2.5 rounded-full transition shadow-md"
              aria-label="Close Playback"
            >
              <FaTimes size={14} />
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
              <div className="p-5 text-center bg-[#F7F9F4] border-t border-[#DDE7D8]">
                {selectedVideo.title && (
                  <h3 className="text-lg font-bold text-[#3B4953] tracking-wide">{selectedVideo.title}</h3>
                )}
                {selectedVideo.category && (
                  <p className="text-[#5A7863] text-xs font-semibold uppercase tracking-[1.5px] mt-1">
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
    </div>
  );
}

export default AdminFilms;