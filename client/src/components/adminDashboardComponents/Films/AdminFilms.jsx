import React, { useEffect, useState } from "react";
import {
  createVideo,
  getAllVideos,
  deleteVideo,
} from "../../../config/api";

function AdminSettings() {
  // ==========================
  // STATES
  // ==========================
  const [activeTab, setActiveTab] = useState("create");
 
  const [category, setCategory] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // ==========================
  // FETCH VIDEOS
  // ==========================
  const fetchVideos = async () => {
    try {
      const res = await getAllVideos();
      setVideos(Array.isArray(res?.data?.videos) ? res.data.videos : []);
    } catch (error) {
      console.log(error);
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
  // CREATE VIDEO (only YouTube URL)
  // ==========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
     
      formData.append("category", category);
      formData.append("youtubeUrl", youtubeUrl);
      await createVideo(formData);
      alert("Video added successfully!");
      setTitle("");
      setCategory("");
      setYoutubeUrl("");
      fetchVideos();
      setActiveTab("all");
    } catch (error) {
      console.log(error);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // DELETE VIDEO
  // ==========================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this video?")) return;
    try {
      await deleteVideo(id);
      fetchVideos();
    } catch (error) {
      console.log(error);
    }
  };

  // Helper: extract YouTube embed URL
  const getEmbedUrl = (url) => {
    if (!url) return "";
    let videoId = "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    } else {
      // if already embed format or invalid, return as is
      return url;
    }
    return `https://www.youtube.com/embed/${videoId}`;
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 md:px-10 py-8 md:py-10">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="border-t border-gray-800 mb-6" />
        <h1 className="text-3xl md:text-5xl tracking-[12px] uppercase text-white font-light">
          INSTACUTS
        </h1>
        <div className="border-t border-gray-800 mt-6" />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        <button
          onClick={() => setActiveTab("create")}
          className={`px-6 sm:px-8 py-2.5 rounded-full uppercase tracking-[2px] text-sm font-medium transition-all ${
            activeTab === "create"
              ? "bg-gray-800 text-white shadow-md"
              : "bg-gray-900 border border-gray-700 text-gray-300 hover:bg-gray-800"
          }`}
        >
          Create Video
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`px-6 sm:px-8 py-2.5 rounded-full uppercase tracking-[2px] text-sm font-medium transition-all ${
            activeTab === "all"
              ? "bg-gray-800 text-white shadow-md"
              : "bg-gray-900 border border-gray-700 text-gray-300 hover:bg-gray-800"
          }`}
        >
          All Videos
        </button>
      </div>

      {/* CREATE TAB */}
      {activeTab === "create" && (
        <div className="max-w-3xl mx-auto bg-gray-900 rounded-2xl border border-gray-800 p-6 sm:p-10 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">



            <div>
              <label className="block mb-2 text-gray-300 uppercase tracking-[2px] text-xs">
                YouTube Video URL
              </label>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-xl uppercase tracking-[4px] text-sm font-medium transition-all disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Video"}
            </button>
          </form>
        </div>
      )}

      {/* ALL VIDEOS TAB */}
      {activeTab === "all" && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 sm:p-10">
          {videos.length === 0 ? (
            <div className="text-center text-gray-400 text-xl py-20">
              No videos found. Create your first video.
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {videos.map((video) => (
                <div
                  key={video._id}
                  className="break-inside-avoid bg-gray-800 rounded-xl overflow-hidden shadow-lg transition-transform hover:-translate-y-1"
                >
                  {/* Thumbnail from YouTube (using maxresdefault or hqdefault) */}
                  {video.youtubeUrl && (
                    <img
                      src={`https://img.youtube.com/vi/${getEmbedUrl(video.youtubeUrl).split("/embed/")[1]}/maxresdefault.jpg`}
                      alt={video.title}
                      className="w-full h-56 object-cover cursor-pointer"
                      onClick={() => setSelectedVideo(video)}
                      onError={(e) => {
                        e.target.src = `https://img.youtube.com/vi/${getEmbedUrl(video.youtubeUrl).split("/embed/")[1]}/hqdefault.jpg`;
                      }}
                    />
                  )}
                  <div className="p-5">
              
                   
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => setSelectedVideo(video)}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg uppercase tracking-[1px] text-sm transition"
                      >
                        ▶ Watch
                      </button>
                      <button
                        onClick={() => handleDelete(video._id)}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-red-900/40 hover:bg-red-800/60 text-red-300 border border-red-800 py-2 rounded-lg uppercase tracking-[1px] text-sm transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIDEO MODAL (YouTube embed) */}
      {selectedVideo && selectedVideo.youtubeUrl && (
        <div
          className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="relative w-full max-w-5xl bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-3 right-3 z-10 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition"
            >
              ✕
            </button>
            <div className="aspect-video w-full">
              <iframe
                src={getEmbedUrl(selectedVideo.youtubeUrl)}
                title={selectedVideo.title}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="p-5 text-center">
              <h3 className="text-2xl font-semibold text-white">{selectedVideo.title}</h3>
              <p className="text-gray-400 mt-1">{selectedVideo.category}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSettings;