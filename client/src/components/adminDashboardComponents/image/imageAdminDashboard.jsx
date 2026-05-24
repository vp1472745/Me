// ==============================
// GalleryUpload.jsx - Dark theme + Responsive + View modal
// ==============================

import React, { useEffect, useState } from "react";
import { createGallery, getAllGalleries, deleteGallery } from "../../../config/api";
import { FaEye, FaTrash, FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const GalleryUpload = () => {
  // ==============================
  // STATES
  // ==============================
  const [activeTab, setActiveTab] = useState("create");

  const [images, setImages] = useState([]);
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal / slider states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // ==============================
  // CREATE GALLERY
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();

      for (let i = 0; i < images.length; i++) {
        formData.append("images", images[i]);
      }
      await createGallery(formData);
      alert("Gallery Uploaded Successfully");

      setImages([]);
      fetchGalleries();
      setActiveTab("all");
    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // GET ALL GALLERIES
  // ==============================
  const fetchGalleries = async () => {
    try {
      const res = await getAllGalleries();
      setGalleries(res?.data?.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  // ==============================
  // DELETE GALLERY
  // ==============================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this gallery?");
    if (!confirmDelete) return;
    try {
      await deleteGallery(id);
      alert("Gallery Deleted");
      fetchGalleries();
    } catch (error) {
      console.log(error);
      alert("Delete failed");
    }
  };

  // ==============================
  // VIEW GALLERY MODAL FUNCTIONS
  // ==============================
  const openViewModal = (gallery) => {
    setSelectedGallery(gallery);
    setCurrentImageIndex(0);
    setViewModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setSelectedGallery(null);
    document.body.style.overflow = "auto";
  };

  const nextImage = () => {
    if (selectedGallery && selectedGallery.images?.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === selectedGallery.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedGallery && selectedGallery.images?.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedGallery.images.length - 1 : prev - 1
      );
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!viewModalOpen) return;
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "Escape") closeViewModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewModalOpen, selectedGallery]);

  useEffect(() => {
    fetchGalleries();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 md:px-10 py-8 md:py-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="border-b border-gray-800 pb-6 mb-8 text-center">
          <h1 className="text-3xl md:text-5xl tracking-[10px] uppercase text-white font-light">
            Gallery Dashboard
          </h1>
        </div>

        {/* Tabs - responsive */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <button
            onClick={() => setActiveTab("create")}
            className={`px-6 sm:px-8 py-2.5 uppercase tracking-[3px] text-sm transition-all duration-300 rounded-lg ${
              activeTab === "create"
                ? "bg-gray-800 text-white shadow-md"
                : "border border-gray-700 text-gray-400 hover:bg-gray-800/50 hover:text-white"
            }`}
          >
            Create Gallery
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-6 sm:px-8 py-2.5 uppercase tracking-[3px] text-sm transition-all duration-300 rounded-lg ${
              activeTab === "all"
                ? "bg-gray-800 text-white shadow-md"
                : "border border-gray-700 text-gray-400 hover:bg-gray-800/50 hover:text-white"
            }`}
          >
            All Galleries
          </button>
        </div>

        {/* CREATE TAB */}
        {activeTab === "create" && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 sm:p-10 md:p-14 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Images */}
              <div>
                <label className="block mb-3 uppercase tracking-[3px] text-gray-300 text-sm">
                  Upload Images
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setImages(e.target.files)}
                  className="w-full border-2 border-dashed border-gray-700 rounded-xl p-6 bg-gray-800 text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-gray-700 file:text-white hover:file:bg-gray-600"
                  required
                />
                {images.length > 0 && (
                  <p className="text-sm text-gray-400 mt-2">{images.length} file(s) selected</p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-xl uppercase tracking-[4px] text-sm font-medium transition-all disabled:opacity-50"
              >
                {loading ? "Uploading..." : "Upload Gallery"}
              </button>
            </form>
          </div>
        )}

        {/* ALL GALLERIES TAB */}
        {activeTab === "all" && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 sm:p-10">
            {galleries.length === 0 ? (
              <div className="text-center text-gray-400 text-xl py-20">No Galleries Found</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {galleries.map((gallery) => (
                  <div
                    key={gallery._id}
                    className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-lg transition-transform hover:-translate-y-1"
                  >
                    {/* Cover image (first image) */}
                    <img
                      src={gallery?.images?.[0]}
                      alt={gallery.title || "Gallery"}
                      className="w-full h-64 object-cover"
                    />
                    <div className="p-5">
                   
                      <p className="text-gray-400 text-sm mb-4">
                        {gallery.images?.length || 0} images
                      </p>
                      <div className="flex gap-3">
                        {/* View Button */}
                        <button
                          onClick={() => openViewModal(gallery)}
                          className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-2.5 rounded-lg uppercase tracking-[1px] text-sm transition"
                        >
                          <FaEye size={14} /> View
                        </button>
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(gallery._id)}
                          className="flex-1 inline-flex items-center justify-center gap-2 bg-red-900/40 hover:bg-red-800/60 text-red-300 border border-red-800 py-2.5 rounded-lg uppercase tracking-[1px] text-sm transition"
                        >
                          <FaTrash size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ==============================
          FULLSCREEN VIEW MODAL (Lightbox)
      ============================== */}
      {viewModalOpen && selectedGallery && (
        <div className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-md overflow-hidden">
          {/* Close button */}
          <button
            onClick={closeViewModal}
            className="absolute top-5 right-5 z-50 text-gray-300 hover:text-white text-3xl transition"
            aria-label="Close"
          >
            <FaTimes />
          </button>



          {/* Main slider area */}
          <div className="h-screen flex items-center justify-center relative">
            {/* Prev button */}
            <button
              onClick={prevImage}
              className="absolute left-3 sm:left-6 md:left-10 z-40 w-10 h-10 md:w-14 md:h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl md:text-2xl hover:bg-white/30 transition"
            >
              <FaChevronLeft />
            </button>

            {/* Current image */}
            {selectedGallery.images?.length > 0 ? (
              <img
                src={selectedGallery.images[currentImageIndex]}
                alt={`${selectedGallery.title} - ${currentImageIndex + 1}`}
                className="max-h-full max-w-full object-contain p-4"
              />
            ) : (
              <div className="text-white text-center px-4">
                <p>No images in this gallery</p>
              </div>
            )}

            {/* Next button */}
            <button
              onClick={nextImage}
              className="absolute right-3 sm:right-6 md:right-10 z-40 w-10 h-10 md:w-14 md:h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl md:text-2xl hover:bg-white/30 transition"
            >
              <FaChevronRight />
            </button>
          </div>

          {/* Image counter */}
          {selectedGallery.images?.length > 0 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-gray-300 text-sm md:text-base bg-black/60 px-4 py-1.5 rounded-full">
              {currentImageIndex + 1} / {selectedGallery.images.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GalleryUpload;