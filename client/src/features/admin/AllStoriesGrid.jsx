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
import DeleteConfirmationModal from "../../components/feedback/DeleteConfirmationModal";
import EditStoryModal from "./EditStoriesModal";
import CommonModal from "../../components/feedback/CommonModelComponents";

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {stories.map((story) => (
          <div
            key={story._id}
            onClick={() => handleCardClick(story)}
            className="group relative bg-white dark:bg-slate-800/90 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer hover:-translate-y-0.5 border border-slate-200 dark:border-slate-700/80"
          >
            {/* Cover Image */}
            <div className="relative h-44 sm:h-48 bg-slate-100 dark:bg-slate-900 overflow-hidden">
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
              <div className="absolute top-2.5 left-2.5 flex gap-1 z-10">
                {story.galleryImages?.length > 0 && (
                  <span className="flex items-center gap-1 bg-slate-900/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs border border-white/10">
                    <ImageIcon size={11} /> {story.galleryImages.length}
                  </span>
                )}
                {story.galleryVideos?.length > 0 && (
                  <span className="flex items-center gap-1 bg-slate-900/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs border border-white/10">
                    <Video size={11} /> {story.galleryVideos.length}
                  </span>
                )}
                {story.audio && (
                  <span className="flex items-center bg-slate-900/80 text-white p-1 rounded backdrop-blur-xs border border-white/10">
                    <Music size={11} />
                  </span>
                )}
              </div>

              {/* ===== ACTION BUTTONS – ALWAYS VISIBLE ===== */}
              <div className="absolute top-2.5 right-2.5 flex gap-1.5 z-10 opacity-100 pointer-events-auto">
                {/* View Button */}
                <button
                  type="button"
                  onClick={(e) => handleViewClick(e, story)}
                  className="p-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs text-blue-600 dark:text-blue-400 rounded-lg shadow-xs hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
                  aria-label="View story"
                >
                  <Eye size={14} />
                </button>

                {/* Edit Button */}
                <button
                  type="button"
                  onClick={(e) => handleEditClick(e, story)}
                  className="p-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs text-blue-600 dark:text-blue-400 rounded-lg shadow-xs hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Edit story"
                >
                  <Pencil size={14} />
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={(e) => handleDeleteClick(e, story._id, story.title)}
                  className="p-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs text-red-600 dark:text-red-400 rounded-lg shadow-xs hover:bg-red-50 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Delete story"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Subtle dark overlay on hover for depth */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
            </div>

            {/* Story Info */}
            <div className="p-3.5 space-y-2 bg-white dark:bg-slate-800/90">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-snug truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {story.title}
                </h4>
                <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mt-0.5 truncate">
                  {story.couple}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80 flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-blue-500" />
                  <span>{formatDate(story.date)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-blue-500" />
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
          <div className="space-y-4 text-slate-800 dark:text-slate-100">
            {/* Cover Image */}
            {selectedStoryForView.coverImage && (
              <div className="w-full h-52 sm:h-60 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <img
                  src={selectedStoryForView.coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Couple & Date / Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                  Couple
                </label>
                <p className="text-slate-800 dark:text-slate-100 font-semibold text-sm">{selectedStoryForView.couple}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                  Date
                </label>
                <p className="text-slate-700 dark:text-slate-300 text-sm">{formatDate(selectedStoryForView.date)}</p>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                  Location
                </label>
                <p className="text-slate-700 dark:text-slate-300 text-sm">{selectedStoryForView.location}</p>
              </div>
            </div>

            {/* Description */}
            {selectedStoryForView.description && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                  Description
                </label>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap text-xs sm:text-sm">{selectedStoryForView.description}</p>
              </div>
            )}

            {/* Audio */}
            {selectedStoryForView.audio && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
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
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Gallery Images ({selectedStoryForView.galleryImages.length})
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {selectedStoryForView.galleryImages.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                      <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery Videos */}
            {selectedStoryForView.galleryVideos?.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Gallery Videos ({selectedStoryForView.galleryVideos.length})
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedStoryForView.galleryVideos.map((url, idx) => (
                    <video
                      key={idx}
                      controls
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      <source src={url} type="video/mp4" />
                      Your browser does not support the video element.
                    </video>
                  ))}
                </div>
              </div>
            )}

            {/* Close button */}
            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-700/80">
              <button
                type="button"
                onClick={handleViewClose}
                className="px-5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition"
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