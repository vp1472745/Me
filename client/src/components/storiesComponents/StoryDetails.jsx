// StoryDetails.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { getSingleStory } from "../../config/api";
import { Music, ArrowLeft } from "lucide-react";

const StoryDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [story, setStory] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!story && id) {
      const fetchStory = async () => {
        setLoading(true);
        try {
          const response = await getSingleStory(id);
          setStory(response.data.story);
        } catch (err) {
          console.error(err);
          setError(err?.response?.data?.message || "Story not found");
        } finally {
          setLoading(false);
        }
      };
      fetchStory();
    }
  }, [id, story]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="bg-[#f5f1eb] min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#6d645b] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="bg-[#f5f1eb] min-h-screen flex flex-col items-center justify-center px-4">
        <div className="bg-white/80 p-8 rounded-2xl text-center max-w-md">
          <p className="text-red-500 mb-4">{error || "Story not found"}</p>
          <button
            onClick={() => navigate("/stories")}
            className="inline-flex items-center gap-2 border border-[#6d645b] px-6 py-2 hover:bg-[#6d645b] hover:text-white transition rounded-full"
          >
            <ArrowLeft size={16} /> Back to Stories
          </button>
        </div>
      </div>
    );
  }

  const {
    title,
    couple,
    location: storyLocation,
    date,
    coverImage,
    description,
    audio,
    galleryImages = [],
    galleryVideos = [],
  } = story;

  // Combine media
  const allMedia = [
    ...galleryImages.map((src, idx) => ({ type: "image", src, id: idx })),
    ...galleryVideos.map((src, idx) => ({ type: "video", src, id: idx })),
  ];

  // Responsive gallery layout: on mobile simple grid, on desktop alternating pattern
  const renderGallery = () => {
    if (allMedia.length === 0) return null;

    // For mobile: simple 2-column grid
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      return (
        <div className="grid grid-cols-2 gap-3">
          {allMedia.map((media, idx) => (
            <div key={idx} className="aspect-square overflow-hidden rounded-xl shadow-md">
              {media.type === "image" ? (
                <img src={media.src} alt="" className="w-full h-full object-cover" />
              ) : (
                <video src={media.src} controls className="w-full h-full object-cover" />
              )}
            </div>
          ))}
        </div>
      );
    }

    // Desktop: alternating full‑width and two‑column sections
    const items = [];
    for (let i = 0; i < allMedia.length; i++) {
      if (i % 3 === 0 && i + 1 < allMedia.length) {
        // two side‑by‑side
        items.push(
          <div key={`pair-${i}`} className="grid grid-cols-2 gap-6 my-6">
            <div className="aspect-[4/3] overflow-hidden rounded-2xl shadow-lg">
              {renderMediaItem(allMedia[i])}
            </div>
            <div className="aspect-[4/3] overflow-hidden rounded-2xl shadow-lg">
              {renderMediaItem(allMedia[i + 1])}
            </div>
          </div>
        );
        i++;
      } else {
        // full width
        items.push(
          <div key={`full-${i}`} className="my-6">
            <div className="aspect-[16/9] overflow-hidden rounded-2xl shadow-lg">
              {renderMediaItem(allMedia[i])}
            </div>
          </div>
        );
      }
    }
    return items;
  };

  const renderMediaItem = (media) => {
    if (media.type === "image") {
      return <img src={media.src} alt="" className="w-full h-full object-cover" />;
    } else {
      return <video src={media.src} controls className="w-full h-full object-cover" />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#fdf8f0] to-[#f4ede3] min-h-screen">
      {/* Back button */}
      <div className="px-4 sm:px-8 lg:px-20 pt-8">
        <button
          onClick={() => navigate("/stories")}
          className="inline-flex items-center gap-2 text-[#8b7355] hover:text-[#6b5b4b] transition"
        >
          <ArrowLeft size={20} /> Back to all stories
        </button>
      </div>

      <div className="px-4 sm:px-8 lg:px-20 py-6">
        {/* Title section */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-[4px] text-[#6d645b] uppercase">
            {title}
          </h1>
          <p className="mt-4 text-[#8c8177] text-lg sm:text-xl">{couple}</p>
          <p className="mt-2 text-[#a09589] text-base">
            {formatDate(date)} | {storyLocation}
          </p>
        </div>

        {/* Cover image – landscape on desktop, auto on mobile */}
        <div className="max-w-6xl mx-auto mt-12">
          <div className="aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-2xl shadow-2xl">
            <img
              src={coverImage || "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600"}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Description */}
        <div className="max-w-6xl mx-auto mt-16 text-center">
          <div className="bg-white/40 backdrop-blur-sm p-8 rounded-2xl">
            <p className="text-[#7d7369] leading-relaxed text-base md:text-lg font-light">
              {description}
            </p>
          </div>
        </div>

        {/* Audio player */}
        {audio && (
          <div className="max-w-2xl mx-auto mt-12">
            <div className="bg-white/60 rounded-full px-6 py-3 flex items-center gap-4 shadow-md">
              <Music className="text-[#8b7355]" size={24} />
              <audio controls className="flex-1">
                <source src={audio} type="audio/mpeg" />
              </audio>
            </div>
          </div>
        )}

        {/* Gallery */}
        {allMedia.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-light text-[#6d645b] text-center mb-8 tracking-wide">
              Gallery
            </h2>
            {renderGallery()}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryDetails;