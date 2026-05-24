// ======================================================
// FILE: PreWeddingGallery.jsx (Responsive, colors unchanged)
// ======================================================

import React, { useEffect, useState, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { getAllPreWeddingStories } from "../../config/api";
import CoverVideo from "../../assets/preWedding/preWeddingCoverVideos.mp4";
import Navbar from "../homeComponents/navbarHomeComponents";

const PreWeddingGallery = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const imageRefs = useRef([]);

  // Fetch stories
  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await getAllPreWeddingStories();
      setStories(response?.data?.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  // Open modal
  const openStory = (story) => {
    setSelectedStory(story);
    setCurrentIndex(0);
    document.body.style.overflow = "hidden";
  };

  // Close modal
  const closeStory = () => {
    setSelectedStory(null);
    document.body.style.overflow = "auto";
  };

  // Next image – with smooth scroll to the new image
  const nextImage = useCallback(() => {
    if (selectedStory?.galleryImages?.length) {
      const newIndex = (currentIndex + 1) % selectedStory.galleryImages.length;
      setCurrentIndex(newIndex);
      setTimeout(() => {
        imageRefs.current[newIndex]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  }, [selectedStory, currentIndex]);

  // Previous image
  const prevImage = useCallback(() => {
    if (selectedStory?.galleryImages?.length) {
      const newIndex =
        currentIndex === 0
          ? selectedStory.galleryImages.length - 1
          : currentIndex - 1;
      setCurrentIndex(newIndex);
      setTimeout(() => {
        imageRefs.current[newIndex]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  }, [selectedStory, currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedStory) return;
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "Escape") closeStory();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedStory, prevImage, nextImage]);

  // Cleanup scroll when modal closes
  useEffect(() => {
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <>
      <Navbar />

      {/* Header - responsive text size */}
      <div className="text-center mb-1 py-2 px-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-light tracking-[4px] sm:tracking-[8px] text-[#4d4037] uppercase">
          Pre Wedding Stories
        </h1>
      </div>

      {/* Cover video - responsive height */}
      <div className="w-full sm:w-[90%] md:w-[80%] mx-auto rounded-2xl mb-5 overflow-hidden shadow-xl px-4 sm:px-0">
        <video
          src={CoverVideo}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-auto max-h-[250px] sm:max-h-[350px] md:max-h-[500px] object-cover"
        />
      </div>

      <div className="min-h-screen px-4 sm:px-6 md:px-10 py-8 md:py-10">
        {/* Loading state - unchanged */}
        {loading && (
          <div className="flex justify-center items-center h-[300px]">
            <div className="w-14 h-14 border-4 border-[#8d7f74] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Story grid - responsive columns */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
            {stories.map((story) => (
              <div
                key={story._id}
                className="group cursor-pointer transition-transform duration-300 hover:-translate-y-2"
                onClick={() => openStory(story)}
              >
                <div className="overflow-hidden bg-white rounded-lg shadow-md">
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    className="w-full h-64 sm:h-80 lg:h-96 object-cover transition-all duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="text-center mt-4 sm:mt-5">
                  <h2 className="text-xl sm:text-2xl uppercase tracking-wide text-[#4d4037] font-light">
                    {story.title}
                  </h2>
                  <button className="mt-3 sm:mt-5 uppercase tracking-[3px] sm:tracking-[4px] text-xs sm:text-sm text-[#5e5148] font-semibold hover:tracking-[5px] sm:hover:tracking-[6px] transition-all">
                    Read More →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Fullscreen story modal - responsive layout */}
        {selectedStory && (
          <div className="fixed inset-0 z-50 bg-[#f3eee6] overflow-y-auto">
            {/* Close button - fixed, responsive size */}
            <button
              onClick={closeStory}
              className="fixed top-4 right-4 sm:top-5 sm:right-5 z-50 bg-black/80 text-white p-2 sm:p-3 rounded-full hover:scale-110 transition-all duration-300 backdrop-blur-sm"
              aria-label="Close"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>

            {/* Navigation buttons - only if multiple images, adjust position */}
            {selectedStory?.galleryImages?.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="fixed left-3 sm:left-5 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 sm:p-4 rounded-full z-50 hover:bg-black/80 transition-all backdrop-blur-sm"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} className="sm:w-7 sm:h-7" />
                </button>
                <button
                  onClick={nextImage}
                  className="fixed right-3 sm:right-5 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 sm:p-4 rounded-full z-50 hover:bg-black/80 transition-all backdrop-blur-sm"
                  aria-label="Next image"
                >
                  <ChevronRight size={20} className="sm:w-7 sm:h-7" />
                </button>
                {/* Image counter - responsive */}
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium backdrop-blur-sm z-50">
                  {currentIndex + 1} / {selectedStory.galleryImages.length}
                </div>
              </>
            )}

            {/* Content - responsive padding and text sizes */}
            <div className="max-w-[1400px] mx-auto py-12 sm:py-20 px-4 md:px-10">
              {/* Title & description */}
              <div className="text-center mb-10 sm:mb-16">
                <h2 className="text-2xl sm:text-4xl md:text-6xl uppercase tracking-[4px] sm:tracking-[8px] text-[#4d4037] font-light px-2">
                  {selectedStory.title}
                </h2>
                {selectedStory.description && (
                  <p className="mt-3 sm:mt-5 text-[#7d7066] max-w-3xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed px-4">
                    {selectedStory.description}
                  </p>
                )}
              </div>

              {/* Gallery images - full width on mobile, better spacing */}
              <div className="space-y-6 sm:space-y-8 md:space-y-12">
                {selectedStory.galleryImages?.map((img, idx) => (
                  <div
                    key={idx}
                    ref={(el) => (imageRefs.current[idx] = el)}
                    className={`bg-white p-3 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-sm transition-all duration-300 ${
                      idx === currentIndex ? "ring-2 ring-[#4d4037]/20" : ""
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${selectedStory.title} - ${idx + 1}`}
                      className="w-full h-auto object-contain mx-auto"
                      loading="lazy"
                    />
                    <p className="text-center text-xs sm:text-sm text-[#7d7066] mt-2 sm:mt-4">
                      {idx + 1} / {selectedStory.galleryImages.length}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PreWeddingGallery;