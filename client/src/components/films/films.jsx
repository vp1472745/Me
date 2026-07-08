import React, { useEffect, useState } from "react";
import { getAllVideos } from "../../config/api";
import Navbar from "../homeComponents/navbarHomeComponents";
import FlimHeroSection from "./flimsHeroSection";

function InstaCuts() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper: YouTube embed URL (for direct iframe)
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes("/embed/")) return url;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;
    }
    return url;
  };

  const fetchVideos = async () => {
    try {
      const res = await getAllVideos();
      console.log("VIDEOS:", res.data);
      setVideos(Array.isArray(res?.data?.videos) ? res.data.videos : []);
    } catch (error) {
      console.log(error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f1ea]">
        <h1 className="text-3xl text-gray-600">Loading...</h1>
      </div>
    );
  }

  return (
    <>
   < Navbar textColor="text-black/50" />
    <FlimHeroSection />
      <div className="min-h-screen px-5 md:px-16 ">
        {/* HEADER */}
        <div className="text-center mb-20">
          <div className="border-t border-gray-300 mb-10" />
          <h1 className="text-3xl md:text-2xl tracking-[12px] text-gray-600 uppercase font-light">
            INSTACUTS
          </h1>
          <div className="border-t border-gray-300 mt-10" />
        </div>

        {/* VIDEO GRID – no overlays, just direct video players */}
        <div className="columns-1 md:columns-3 gap-8 space-y-8">
          {videos.map((video, index) => {
            const sizeClass = index % 3 === 0 ? "h-[300px]" : "h-[300px]";

            return (
              <div key={video._id} className="relative mb-8 break-inside-avoid">
                {video.youtubeUrl ? (
                  // YouTube: direct iframe player
                  <iframe
                    className={`w-full ${sizeClass} rounded-2xl bg-black`}
                    src={getYouTubeEmbedUrl(video.youtubeUrl)}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  // MP4 video: direct video element with controls
                  <video
                    controls
                    playsInline
                    preload="metadata"
                    className={`w-full ${sizeClass} rounded-2xl object-cover bg-black`}
                    poster={video.thumbnail || `https://via.placeholder.com/800x600?text=${video.title}`}
                  >
                    <source src={video.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default InstaCuts;