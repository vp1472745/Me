// WeddingGallery.jsx - Responsive (colors & UI unchanged)
import { useState, useEffect, useCallback } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
} from "react-icons/fa";
import Navbar from "../homeComponents/navbarHomeComponents";
import { getAllWeddingStories } from "../../config/api";

const WeddingGallery = () => {
  const [selectedStory, setSelectedStory] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [weddingStories, setWeddingStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWeddingStories = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getAllWeddingStories();
        const stories = response?.data?.data || [];
        console.log("Wedding Stories:", stories);
        setWeddingStories(
          stories.map((story, index) => ({
            id: story._id || index,
            title: story.title,
            cover: story.coverImage,
            images: [story.coverImage, ...(story.galleryImages || [])],
          }))
        );
      } catch (err) {
        console.error(err);
        setError("Could not load wedding stories.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeddingStories();
  }, []);

  // Open slider with the clicked story
  const openSlider = (story) => {
    setSelectedStory(story);
    setCurrentIndex(0);
  };

  // Close slider
  const closeSlider = () => {
    setSelectedStory(null);
  };

  // Next slide
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === selectedStory.images.length - 1 ? 0 : prev + 1
    );
  }, [selectedStory]);

  // Previous slide
  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === 0 ? selectedStory.images.length - 1 : prev - 1
    );
  }, [selectedStory]);

  useEffect(() => {
    document.body.style.overflow = selectedStory ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedStory]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedStory) return;
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "Escape") closeSlider();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedStory, nextSlide, prevSlide]);

  return (
    <>
    <Navbar textColor="text-black/50" />
      {/* GALLERY GRID */}
      <section className="min-h-screen px-4 sm:px-6 md:px-10 lg:px-20 py-30 md:py-50">
        <div className="max-w-7xl mx-auto">
          {loading && (
            <div className="text-center text-[#8a7f74] py-16">
              Loading wedding stories...
            </div>
          )}

          {!loading && error && (
            <div className="text-center text-red-600 py-16">{error}</div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
              {weddingStories.map((story) => (
                <div
                  key={story.id}
                  onClick={() => openSlider(story)}
                  className="group cursor-pointer transform transition duration-500 hover:-translate-y-2"
                >
                  <div className="relative overflow-hidden rounded-2xl shadow-xl">
                    <img
                      src={story.cover}
                      alt={story.title}
                      className="w-full h-64 sm:h-80 md:h-96 object-cover transition duration-700 group-hover:scale-105"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                      <span className="text-white text-xs sm:text-sm uppercase tracking-wider border border-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full">
                        View Gallery
                      </span>
                    </div>
                  </div>
                  <h2 className="mt-4 sm:mt-6 text-center text-[#6f665c] text-xl sm:text-2xl uppercase tracking-[2px] font-light">
                    {story.title}
                  </h2>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FULLSCREEN SLIDER MODAL (already responsive) */}
      {selectedStory && (
        <div className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-md overflow-hidden">
          {/* Close button */}
          <button
            onClick={closeSlider}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 text-white/80 hover:text-white text-2xl sm:text-3xl transition"
            aria-label="Close"
          >
            <FaTimes />
          </button>

          {/* Title */}
          <h1 className="absolute top-4 left-4 right-4 sm:top-6 sm:left-1/2 sm:-translate-x-1/2 z-40 text-white text-base sm:text-2xl md:text-3xl uppercase tracking-[2px] sm:tracking-[4px] font-light text-center truncate px-2">
            {selectedStory.title}
          </h1>

          {/* Slider container */}
          <div className="h-screen flex items-center justify-center relative">
            {/* Previous button */}
            <button
              onClick={prevSlide}
              className="absolute left-2 sm:left-4 md:left-8 z-40 w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-base sm:text-xl md:text-2xl hover:bg-white/40 transition"
              aria-label="Previous"
            >
              <FaChevronLeft />
            </button>

            {/* Current image */}
            <img
              src={selectedStory.images[currentIndex]}
              alt={`${selectedStory.title} - ${currentIndex + 1}`}
              className="w-full h-full object-contain p-2 sm:p-0"
            />

            {/* Next button */}
            <button
              onClick={nextSlide}
              className="absolute right-2 sm:right-4 md:right-8 z-40 w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-base sm:text-xl md:text-2xl hover:bg-white/40 transition"
              aria-label="Next"
            >
              <FaChevronRight />
            </button>
          </div>

          {/* Image counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-xs sm:text-sm md:text-base tracking-wide z-40 bg-black/50 px-2 py-1 rounded-full">
            {currentIndex + 1} / {selectedStory.images.length}
          </div>
        </div>
      )}
    </>
  );
};

export default WeddingGallery;