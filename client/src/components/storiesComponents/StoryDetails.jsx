// StoryDetails.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { getSingleStory } from "../../config/api"; // adjust path

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

  if (loading) {
    return (
      <div className="bg-[#f5f1eb] min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#6d645b] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="bg-[#f5f1eb] min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error || "Story not found"}</p>
        <button
          onClick={() => navigate("/stories")}
          className="border border-[#6d645b] px-6 py-2 hover:bg-[#6d645b] hover:text-white transition"
        >
          Go Back
        </button>
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

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Combine images and videos for gallery (videos shown with video tag)
  const allMedia = [
    ...galleryImages.map((src, idx) => ({ type: "image", src, id: idx })),
    ...galleryVideos.map((src, idx) => ({ type: "video", src, id: idx })),
  ];

  // Helper to render media items in a pattern: two side-by-side, one full-width, etc.
  const renderGallery = () => {
    if (allMedia.length === 0) return null;

    const items = [];
    for (let i = 0; i < allMedia.length; i++) {
      if (i % 3 === 0 && i + 1 < allMedia.length) {
        // Two side-by-side
        items.push(
          <div key={`pair-${i}`} className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            {renderMediaItem(allMedia[i])}
            {renderMediaItem(allMedia[i + 1])}
          </div>
        );
        i++; // skip next because we used it
      } else {
        // Full width
        items.push(
          <div key={`full-${i}`} className="mt-4">
            {renderMediaItem(allMedia[i])}
          </div>
        );
      }
    }
    return items;
  };

  const renderMediaItem = (media) => {
    if (media.type === "image") {
      return (
        <img
          src={media.src}
          alt={`gallery-${media.id}`}
          className="w-full h-[350px] sm:h-[600px] lg:h-[850px] object-cover"
        />
      );
    } else {
      return (
        <video
          src={media.src}
          controls
          controlsList="nodownload"
          className="w-full h-[350px] sm:h-[600px] lg:h-[850px] object-cover bg-black"
        />
      );
    }
  };

  return (
    <div className="bg-[#f5f1eb] min-h-screen">
      {/* TOP SECTION */}
      <div className="px-4 sm:px-8 lg:px-20 py-12">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-[4px] text-[#6d645b] uppercase">
            {title}
          </h1>
          <p className="mt-4 text-[#8c8177] text-lg sm:text-xl">{couple}</p>
          <p className="mt-2 text-[#a09589] text-base sm:text-lg">
            {formatDate(date)} | {storyLocation}
          </p>
        </div>

        {/* MAIN IMAGE */}
        <div className="max-w-7xl mx-auto mt-14">
          <img
            src={
              coverImage ||
              "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600"
            }
            alt={title}
            className="w-full h-[260px] sm:h-[450px] md:h-[650px] object-cover"
          />
        </div>

        {/* DESCRIPTION */}
        <div className="max-w-4xl mx-auto mt-16 text-center">
          <p className="text-[#7d7369] leading-[40px] text-base sm:text-lg md:text-xl font-light">
            {description}
          </p>
        </div>

        {/* AUDIO PLAYER (if audio exists) */}
        {audio && (
          <div className="max-w-2xl mx-auto mt-12">
            <div className="bg-white shadow-md rounded-full px-4 py-4">
              <audio controls className="w-full">
                <source src={audio} type="audio/mpeg" />
              </audio>
            </div>
          </div>
        )}
      </div>

      {/* DYNAMIC GALLERY */}
      {allMedia.length > 0 && <div className="mt-20 px-4 sm:px-8 lg:px-20 pb-16">{renderGallery()}</div>}
    </div>
  );
};

export default StoryDetails;