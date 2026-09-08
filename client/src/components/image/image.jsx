// =====================================
// GallerySection.jsx
// =====================================

import React, {
  useEffect,
  useState,
} from "react";

import {
  getAllGalleries,
} from "../../config/api";
import Navbar from "../homeComponents/navbarHomeComponents";
import ImageHeroSection from "../image/ImageHeroSection"

import {
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

const GallerySection = () => {

  // =====================================
  // STATES
  // =====================================

  const [galleries, setGalleries] =
    useState([]);

  const [selectedImages, setSelectedImages] =
    useState([]);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [openModal, setOpenModal] =
    useState(false);

  const [loading, setLoading] = useState(true);

  // =====================================
  // FETCH GALLERY
  // =====================================

  const fetchGalleries = async () => {
    try {
      setLoading(true);
      const res = await getAllGalleries();
      setGalleries(res?.data?.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleries();
  }, []);

  // =====================================
  // OPEN SLIDER
  // =====================================

  const handleOpenSlider = (images, index) => {
    setSelectedImages(images || []);
    setCurrentIndex(index);
    setOpenModal(true);
  };

  // =====================================
  // NEXT IMAGE
  // =====================================

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev === selectedImages.length - 1 ? 0 : prev + 1
    );
  };

  // =====================================
  // PREVIOUS IMAGE
  // =====================================

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? selectedImages.length - 1 : prev - 1
    );
  };

  return (
    <>
      <Navbar textColor="text-black/50" />
      <ImageHeroSection />

      {/* =====================================
          GALLERY SECTION
      ===================================== */}
      <section className="px-4 md:px-10 py-10">
        <div className="max-w-7xl mx-auto">
          {/* TITLE */}
          <div className="text-center mb-12">
            <div className="w-full h-[1px] mb-8 bg-[#cfc6bb] max-w-4xl mx-auto"></div>
            <h1 className="text-[#8d8479] text-2xl md:text-3xl tracking-[12px] uppercase font-light">
              Images
            </h1>
            <div className="w-full h-[1px] mt-8 bg-[#cfc6bb] max-w-4xl mx-auto"></div>
          </div>

          {/* SKELETON LOADERS */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-28">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div
                  key={n}
                  className="w-full h-[220px] md:h-[350px] rounded-2xl bg-gray-200/70 animate-pulse"
                />
              ))}
            </div>
          ) : galleries.length === 0 ? (
            <div className="text-center py-16 bg-white/30 rounded-2xl backdrop-blur-sm max-w-2xl mx-auto">
              <p className="text-[#8d8479] text-lg font-light">No image galleries found.</p>
            </div>
          ) : (
            /* GALLERY LOOP */
            galleries.map((gallery) => (
              <div key={gallery._id} className="mb-28">
                {/* IMAGE GRID */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {(gallery.images || []).map((image, index) => (
                    <div
                      key={index}
                      className="overflow-hidden cursor-pointer group rounded-2xl bg-gray-100"
                      onClick={() =>
                        handleOpenSlider(gallery.images || [], index)
                      }
                    >
                      <img
                        src={image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="w-full h-[220px] md:h-[350px] object-cover rounded-2xl transition-transform duration-700 ease-in-out group-hover:scale-110"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* =====================================
          IMAGE SLIDER MODAL
      ===================================== */}

      {openModal && (

        <div
          className="
            fixed
            inset-0
            z-[999]
            bg-black/95
            flex
            items-center
            justify-center
            px-4
          "
        >

          {/* CLOSE BUTTON */}

          <button
            onClick={() =>
              setOpenModal(false)
            }
            className="
              absolute
              top-6
              right-6
              text-white
              z-50
            "
          >
            <X size={40} />
          </button>

          {/* LEFT BUTTON */}

          <button
            onClick={prevSlide}
            className="
              absolute
              left-4
              md:left-10
              text-white
              z-50
            "
          >
            <ChevronLeft size={60} />
          </button>

          {/* IMAGE */}

          <img
            src={
              selectedImages?.[currentIndex] || ""
            }
            alt=""
            className="
              max-h-[90vh]
              max-w-[95vw]
              object-contain
              shadow-2xl
            "
          />

          {/* RIGHT BUTTON */}

          <button
            onClick={nextSlide}
            className="
              absolute
              right-4
              md:right-10
              text-white
              z-50
            "
          >
            <ChevronRight size={60} />
          </button>

        </div>
      )}

    </>
  );
};

export default GallerySection;