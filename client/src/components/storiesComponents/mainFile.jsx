// Stories.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllStories } from "../../config/api";
import { Calendar, MapPin, Users, Music, Video } from "lucide-react";
import Navbar from "../homeComponents/navbarHomeComponents";

const Stories = () => {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllStories();
      let storiesArray = [];
      if (response.data?.stories) storiesArray = response.data.stories;
      else if (response.data?.data?.stories) storiesArray = response.data.data.stories;
      else if (Array.isArray(response.data)) storiesArray = response.data;
      setStories(storiesArray);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to load stories");
    } finally {
      setLoading(false);
    }
  };

  const handleReadMore = (story) => {
    navigate(`/story/${story._id}`, { state: story });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="bg-[#f5f1eb] min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#e0d6cc] border-t-[#8b7355] rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-[#8b7355]/20 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#f5f1eb] min-h-screen flex flex-col items-center justify-center">
        <div className="bg-white/60 p-8 rounded-2xl text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchStories}
            className="px-6 py-2 bg-[#8b7355] text-white rounded-full hover:bg-[#6b5b4b] transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
       <Navbar />
    <div className="bg-gradient-to-br from-[#fdf8f0] to-[#f4ede3] min-h-screen px-4 sm:px-8 lg:px-20 py-16">

   
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="border-t border-[#cfc6bb] w-24 mx-auto"></div>
          <h1 className="text-4xl md:text-5xl font-light tracking-[8px] text-[#6f655d] mt-6">
            STORIES
          </h1>
          <p className="text-[#b1a79d] italic mt-3 text-lg max-w-2xl mx-auto">
            Delve deeper into our world of story‑telling
          </p>
          <div className="border-b border-[#cfc6bb] w-24 mx-auto mt-6"></div>
        </div>

        {/* Stories Grid – 2 cols on mobile, 3 on tablet, 4 on desktop */}
        {stories.length === 0 ? (
          <div className="text-center py-20 bg-white/30 rounded-2xl backdrop-blur-sm">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#e8dfd1] rounded-full mb-4">
              <svg className="w-10 h-10 text-[#8b7355]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-[#8b7355] text-xl font-light">No stories yet</p>
            <p className="text-[#b1a79d]">Be the first to share a beautiful wedding story</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7">
            {stories.map((story) => (
              <div
                key={story._id}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                onClick={() => handleReadMore(story)}
              >
                {/* Cover Image – landscape crop on desktop, auto on mobile */}
                <div className="relative overflow-hidden aspect-[4/3] md:aspect-[16/10]">
                  <img
                    src={story.coverImage || "https://images.unsplash.com/photo-1519741497674-611481863552?w=800"}
                    alt={story.title}
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/800x600?text=No+Image";
                    }}
                  />
                  {/* Media badge */}
                  {(story.audio || (story.galleryVideos?.length > 0)) && (
                    <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1 text-[10px] text-white">
                      {story.audio && <Music size={10} />}
                      {story.galleryVideos?.length > 0 && <Video size={10} />}
                      <span>Media</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-light text-[#6d645b] tracking-wide truncate">
                    {story.title || "Untitled"}
                  </h3>
                  <div className="flex items-center gap-1 text-[#b0a69b] text-xs mt-2">
                    <Users size={12} />
                    <span className="truncate">{story.couple || "Couple"}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#b0a69b] text-xs mt-1">
                    <MapPin size={12} />
                    <span className="truncate">{story.location || "Location"}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#b0a69b] text-xs mt-1">
                    <Calendar size={12} />
                    <span>{formatDate(story.date)}</span>
                  </div>
                  <div className="mt-4 pt-2 border-t border-[#e8dfd1] text-center">
                    <span className="text-[#8b7355] text-sm font-medium opacity-0 group-hover:opacity-100 transition">
                      Read story →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default Stories;