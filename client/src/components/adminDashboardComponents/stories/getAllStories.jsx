// StoriesList.jsx - Light theme with Delete Confirmation Modal
import React, { useState } from "react";
import { Calendar, MapPin, Users, Music, Video, Image as ImageIcon, Trash2, Eye, ChevronRight } from "lucide-react";
import DeleteConfirmationModal from "../../commonComponents/DeleteConfirmationModal";

const StoriesList = ({ stories, onStoryClick, onDeleteStory }) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDeleteClick = (storyId, storyTitle) => {
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
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseModal = () => {
    setDeleteModalOpen(false);
    setStoryToDelete(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {stories.map((story) => (
          <div
            key={story._id}
            onClick={() => onStoryClick(story)}
            className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 border border-gray-100"
          >
            {/* Image Container */}
            <div className="relative h-56 bg-gray-200 overflow-hidden">
              <img
                src={story.coverImage || "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop"}
                alt={story.title}
                className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                onError={(e) => { e.target.src = "https://via.placeholder.com/600x400?text=No+Image"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                <Eye size={16} className="text-gray-700" />
              </div>

              {/* Delete button – now opens modal */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(story._id, story.title);
                }}
                className="absolute top-3 left-3 bg-red-500/80 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors shadow-md z-10"
                title="Delete Story"
              >
                <Trash2 size={14} />
              </button>

              {/* Media Badge */}
              {(story.audio || (story.galleryVideos?.length > 0)) && (
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 shadow-md">
                  {story.audio && <Music size={12} className="text-white" />}
                  {story.galleryVideos?.length > 0 && <Video size={12} className="text-white" />}
                  <span className="text-white text-[10px] font-medium uppercase tracking-wider">Media</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 line-clamp-1 tracking-tight">
                {story.title || "Untitled"}
              </h3>
              <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                <Users size={14} className="text-blue-500 flex-shrink-0" />
                <span className="truncate">{story.couple || "Couple"}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-sm mt-0.5">
                <MapPin size={14} className="text-blue-400 flex-shrink-0" />
                <span className="truncate">{story.location || "Location"}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-sm mt-0.5">
                <Calendar size={14} className="text-blue-400 flex-shrink-0" />
                <span>{formatDate(story.date)}</span>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div className="flex gap-1.5">
                  {story.galleryImages?.length > 0 && (
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                      <ImageIcon size={12} /> {story.galleryImages.length}
                    </span>
                  )}
                  {story.galleryVideos?.length > 0 && (
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                      <Video size={12} /> {story.galleryVideos.length}
                    </span>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStoryClick(story);
                  }}
                  className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Read Story
                  <ChevronRight size={16} className="text-blue-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title="Delete Story"
        message={`Are you sure you want to delete "${storyToDelete?.title || 'this story'}"?`}
        itemName={storyToDelete?.title}
        isLoading={isDeleting}
      />
    </>
  );
};

export default StoriesList;