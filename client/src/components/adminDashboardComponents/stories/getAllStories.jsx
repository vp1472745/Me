// StoriesList.jsx - Light theme preserved, fully responsive
import React from "react";
import { Calendar, MapPin, Users, Music, Video, Image as ImageIcon, Trash2 } from "lucide-react";

const StoriesList = ({ stories, loading, error, onRetry, onStoryClick, onDeleteStory }) => {
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
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#e0d6cc] border-t-[#8b7355] rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-[#8b7355]/20 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="mt-4 text-[#8b7355] font-medium text-center">Loading beautiful stories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-white/40 rounded-2xl backdrop-blur-sm px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-500 mb-4 text-lg">{error}</p>
        <button
          onClick={onRetry}
          className="px-6 py-2.5 bg-[#8b7355] text-white rounded-full hover:bg-[#6b5b4b] transition shadow-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="text-center py-20 bg-white/30 rounded-2xl backdrop-blur-sm px-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#e8dfd1] rounded-full mb-4">
          <ImageIcon size={32} className="text-[#8b7355]" />
        </div>
        <p className="text-[#8b7355] text-xl font-light mb-2">No stories yet</p>
        <p className="text-[#b1a79d]">Be the first to share a beautiful wedding story!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 px-4 sm:px-0">
      {stories.map((story, index) => (
        <div
          key={story._id}
          onClick={() => onStoryClick(story)}
          className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Image Container */}
          <div className="relative overflow-hidden h-56 sm:h-64 md:h-72">
            <img
              src={story.coverImage || "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop"}
              alt={story.title}
              className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
              onError={(e) => { e.target.src = "https://via.placeholder.com/400x500?text=No+Image"; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>
            
            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onDeleteStory) onDeleteStory(story._id);
              }}
              className="absolute top-3 left-3 bg-red-600/90 hover:bg-red-700 text-white p-2 rounded-full flex items-center justify-center z-20"
              title="Delete Story"
            >
              <Trash2 size={14} />
            </button>

            {/* Media Badge */}
            {(story.audio || (story.galleryVideos?.length > 0)) && (
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                {story.audio && <Music size={12} className="text-white" />}
                {story.galleryVideos?.length > 0 && <Video size={12} className="text-white" />}
                <span className="text-white text-xs font-medium">Media</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 sm:p-5">
            <h3 className="text-lg sm:text-xl font-light text-[#6d645b] tracking-wide mb-1 line-clamp-1">
              {story.title || "Untitled"}
            </h3>
            <div className="flex items-center gap-1 text-[#b0a69b] text-xs sm:text-sm mt-2">
              <Users size={14} />
              <span>{story.couple || "Couple"}</span>
            </div>
            <div className="flex items-center gap-1 text-[#b0a69b] text-xs sm:text-sm mt-1">
              <MapPin size={14} />
              <span>{story.location || "Location"}</span>
            </div>
            <div className="flex items-center gap-1 text-[#b0a69b] text-xs sm:text-sm mt-1">
              <Calendar size={14} />
              <span>{formatDate(story.date)}</span>
            </div>
            <div className="w-12 h-px bg-[#d4c5b3] mx-auto mt-4 transition-all duration-300 group-hover:w-20 group-hover:bg-[#8b7355]"></div>
          </div>

          {/* Hover Reveal Button */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-white to-white/90">
            <button className="w-full py-2 text-[#8b7355] border border-[#8b7355] rounded-full hover:bg-[#8b7355] hover:text-white transition text-sm font-medium">
              View Story
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StoriesList;