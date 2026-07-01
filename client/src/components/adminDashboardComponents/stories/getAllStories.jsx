// StoriesList.jsx – Wedding Theme (Always-Visible Icons)
import React, { useState } from "react";
import {
  Calendar,
  MapPin,
  Trash2,
  Eye,
  Image as ImageIcon,
  Music,
  Video,
  Pencil,
} from "lucide-react";
import DeleteConfirmationModal from "../../commonComponents/DeleteConfirmationModal";
import EditStoryModal from "./EditStroiesModal";
import CommonModal from "../../commonComponents/CommonModelComponents";

/**
 * StoriesList – Displays story cards with cover image, media badges, and quick actions.
 *
 * @param {Array} stories - List of story objects
 * @param {Function} onDeleteStory - Async function to delete a story by ID
 * @param {Function} onStoryUpdated - Callback after a story is updated (receives updated story)
 */
const StoriesList = ({ stories, onDeleteStory, onStoryUpdated }) => {
  // Delete state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);

  // View modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedStoryForView, setSelectedStoryForView] = useState(null);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Delete handlers
  const handleDeleteClick = (e, storyId, storyTitle) => {
    e.stopPropagation();
    setStoryToDelete({ id: storyId, title: storyTitle });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!storyToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteStory(storyToDelete.id);
      setDeleteModalOpen(false);
      setStoryToDelete(null);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Edit handlers
  const handleCardClick = (story) => {
    setSelectedStory(story);
    setEditModalOpen(true);
  };

  const handleStoryUpdated = (updatedStory) => {
    if (onStoryUpdated) {
      onStoryUpdated(updatedStory);
    }
    setEditModalOpen(false);
    setSelectedStory(null);
  };

  const handleEditClose = () => {
    setEditModalOpen(false);
    setSelectedStory(null);
  };

  const handleEditClick = (e, story) => {
    e.stopPropagation();
    handleCardClick(story);
  };

  // View handlers
  const handleViewClick = (e, story) => {
    e.stopPropagation();
    setSelectedStoryForView(story);
    setViewModalOpen(true);
  };

  const handleViewClose = () => {
    setViewModalOpen(false);
    setSelectedStoryForView(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {stories.map((story) => (
          <div
            key={story._id}
            onClick={() => handleCardClick(story)}
            className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 border border-[#DDE7D8]"
          >
            {/* Cover Image */}
            <div className="relative h-56 bg-[#F7F9F4] overflow-hidden">
              <img
                src={
                  story.coverImage ||
                  "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop"
                }
                alt={story.title}
                className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/600x400?text=No+Image";
                }}
              />

              {/* Media Badges (always visible) */}
              <div className="absolute top-3 left-3 flex gap-1.5 z-10">
                {story.galleryImages?.length > 0 && (
                  <span className="flex items-center gap-1 bg-black/60 text-white text-[11px] px-2 py-1 rounded-md backdrop-blur-sm">
                    <ImageIcon size={12} /> {story.galleryImages.length}
                  </span>
                )}
                {story.galleryVideos?.length > 0 && (
                  <span className="flex items-center gap-1 bg-black/60 text-white text-[11px] px-2 py-1 rounded-md backdrop-blur-sm">
                    <Video size={12} /> {story.galleryVideos.length}
                  </span>
                )}
                {story.audio && (
                  <span className="flex items-center bg-black/60 text-white p-1 rounded-md backdrop-blur-sm">
                    <Music size={12} />
                  </span>
                )}
              </div>

              {/* ===== ACTION BUTTONS – ALWAYS VISIBLE ===== */}
              <div className="absolute top-3 right-3 flex gap-2 z-10 opacity-100 pointer-events-auto">
                {/* View Button */}
                <button
                  type="button"
                  onClick={(e) => handleViewClick(e, story)}
                  className="p-2 bg-white/80 backdrop-blur-sm text-[#5A7863] rounded-xl shadow-md hover:bg-white hover:text-[#3B4953] transition-colors"
                  aria-label="View story"
                >
                  <Eye size={16} />
                </button>

                {/* Edit Button */}
                <button
                  type="button"
                  onClick={(e) => handleEditClick(e, story)}
                  className="p-2 bg-white/80 backdrop-blur-sm text-[#5A7863] rounded-xl shadow-md hover:bg-white hover:text-[#3B4953] transition-colors"
                  aria-label="Edit story"
                >
                  <Pencil size={16} />
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={(e) => handleDeleteClick(e, story._id, story.title)}
                  className="p-2 bg-white/80 backdrop-blur-sm text-red-600 rounded-xl shadow-md hover:bg-white transition-colors"
                  aria-label="Delete story"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Subtle dark overlay on hover for depth */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300" />
            </div>

            {/* Story Info */}
            <div className="p-5 space-y-3">
              <div>
                <h4 className="font-bold text-[#3B4953] text-lg leading-snug truncate group-hover:text-[#5A7863] transition-colors">
                  {story.title}
                </h4>
                <p className="text-xs font-semibold text-[#5A7863] uppercase tracking-wider mt-0.5 truncate">
                  {story.couple}
                </p>
              </div>

              <div className="pt-2 border-t border-[#F0F4EC] flex flex-col gap-1.5 text-xs text-[#61717C]">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-[#90AB8B]" />
                  <span>{formatDate(story.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-[#90AB8B]" />
                  <span className="truncate">{story.location}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Story"
        message={`Are you sure you want to delete "${storyToDelete?.title || "this story"}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />

      {/* Edit Story Modal */}
      <EditStoryModal
        isOpen={editModalOpen}
        onClose={handleEditClose}
        story={selectedStory}
        onStoryUpdated={handleStoryUpdated}
      />

      {/* View Story Modal (Read-Only) */}
      <CommonModal
        isOpen={viewModalOpen}
        onClose={handleViewClose}
        title={selectedStoryForView?.title || "Story Details"}
        size="lg"
        showCloseButton
      >
        {selectedStoryForView && (
          <div className="space-y-6">
            {/* Cover Image */}
            {selectedStoryForView.coverImage && (
              <div className="w-full h-64 rounded-xl overflow-hidden border border-[#DDE7D8]">
                <img
                  src={selectedStoryForView.coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Couple & Date / Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#3B4953]/70 uppercase tracking-wider mb-1">
                  Couple
                </label>
                <p className="text-[#3B4953] font-medium">{selectedStoryForView.couple}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#3B4953]/70 uppercase tracking-wider mb-1">
                  Date
                </label>
                <p className="text-[#3B4953]">{formatDate(selectedStoryForView.date)}</p>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#3B4953]/70 uppercase tracking-wider mb-1">
                  Location
                </label>
                <p className="text-[#3B4953]">{selectedStoryForView.location}</p>
              </div>
            </div>

            {/* Description */}
            {selectedStoryForView.description && (
              <div>
                <label className="block text-xs font-medium text-[#3B4953]/70 uppercase tracking-wider mb-1">
                  Description
                </label>
                <p className="text-[#3B4953] whitespace-pre-wrap">{selectedStoryForView.description}</p>
              </div>
            )}

            {/* Audio */}
            {selectedStoryForView.audio && (
              <div>
                <label className="block text-xs font-medium text-[#3B4953]/70 uppercase tracking-wider mb-1">
                  Audio
                </label>
                <audio controls className="w-full rounded-lg">
                  <source src={selectedStoryForView.audio} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {/* Gallery Images */}
            {selectedStoryForView.galleryImages?.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-[#3B4953]/70 uppercase tracking-wider mb-2">
                  Gallery Images ({selectedStoryForView.galleryImages.length})
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {selectedStoryForView.galleryImages.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-[#DDE7D8]">
                      <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery Videos */}
            {selectedStoryForView.galleryVideos?.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-[#3B4953]/70 uppercase tracking-wider mb-2">
                  Gallery Videos ({selectedStoryForView.galleryVideos.length})
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedStoryForView.galleryVideos.map((url, idx) => (
                    <video
                      key={idx}
                      controls
                      className="w-full rounded-lg border border-[#DDE7D8]"
                    >
                      <source src={url} type="video/mp4" />
                      Your browser does not support the video element.
                    </video>
                  ))}
                </div>
              </div>
            )}

            {/* Close button */}
            <div className="flex justify-end pt-4 border-t border-[#DDE7D8]">
              <button
                type="button"
                onClick={handleViewClose}
                className="px-6 py-2 rounded-xl bg-[#5A7863] text-white font-semibold hover:bg-[#4A6853] transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </CommonModal>
    </>
  );
};

export default StoriesList;