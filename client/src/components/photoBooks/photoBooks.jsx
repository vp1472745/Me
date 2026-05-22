// WeddingGallery.jsx
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
    <Navbar />
      {/* GALLERY GRID */}
      <section className="bg-linear-to-br from-[#fdf8f0] to-[#f4ede3] min-h-screen px-4 sm:px-8 lg:px-20 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="border-t border-[#cfc6bb] w-24 mx-auto"></div>
            <h1 className="text-4xl md:text-5xl font-light tracking-[8px] text-[#6f655d] mt-6">
              WEDDING STORIES
            </h1>
            <p className="text-[#b1a79d] italic mt-3 text-lg">
              Explore our cinematic love tales
            </p>
            <div className="border-b border-[#cfc6bb] w-24 mx-auto mt-6"></div>
          </div>

            {loading && (
              <div className="text-center text-[#8a7f74] py-16">
                Loading wedding stories...
              </div>
            )}

            {!loading && error && (
              <div className="text-center text-red-600 py-16">
                {error}
              </div>
            )}

          {/* Grid: 1 col on mobile, 2 on tablet, 3 on desktop */}
            {!loading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
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
                    className="w-full h-112.5 sm:h-125 object-cover transition duration-700 group-hover:scale-105"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                    <span className="text-white text-sm uppercase tracking-wider border border-white px-4 py-2 rounded-full">
                      View Gallery
                    </span>
                  </div>
                </div>
                <h2 className="mt-6 text-center text-[#6f665c] text-2xl uppercase tracking-[2px] font-light">
                  {story.title}
                </h2>
              </div>
            ))}
            </div>
          )}
        </div>
      </section>

      {/* FULLSCREEN SLIDER MODAL */}
      {selectedStory && (
        <div className="fixed inset-0 z-999 bg-black/95 backdrop-blur-md overflow-hidden">
          {/* Close button */}
          <button
            onClick={closeSlider}
            className="absolute top-6 right-6 z-50 text-white/80 hover:text-white text-3xl transition"
            aria-label="Close"
          >
            <FaTimes />
          </button>

          {/* Title */}
          <h1 className="absolute top-6 left-1/2 -translate-x-1/2 z-40 text-white text-2xl md:text-3xl uppercase tracking-[4px] font-light text-center whitespace-nowrap">
            {selectedStory.title}
          </h1>

          {/* Slider container */}
          <div className="h-screen flex items-center justify-center relative">
            {/* Previous button */}
            <button
              onClick={prevSlide}
              className="absolute left-4 md:left-8 z-40 w-10 h-10 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl md:text-2xl hover:bg-white/40 transition"
              aria-label="Previous"
            >
              <FaChevronLeft />
            </button>

            {/* Current image */}
            <img
              src={selectedStory.images[currentIndex]}
              alt={`${selectedStory.title} - ${currentIndex + 1}`}
              className="w-full h-screen object-contain md:object-cover"
            />

            {/* Next button */}
            <button
              onClick={nextSlide}
              className="absolute right-4 md:right-8 z-40 w-10 h-10 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl md:text-2xl hover:bg-white/40 transition"
              aria-label="Next"
            >
              <FaChevronRight />
            </button>
          </div>

          {/* Image counter */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/80 text-sm md:text-base tracking-wide z-40">
            {currentIndex + 1} / {selectedStory.images.length}
          </div>
        </div>
      )}
    </>
  );
};

export default WeddingGallery;