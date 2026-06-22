// StoriesList.jsx
import React, { useState } from "react";
import { Calendar, MapPin, Trash2, Eye, Image as ImageIcon, Music, Video } from "lucide-react";
import DeleteConfirmationModal from "../../commonComponents/DeleteConfirmationModal";

const StoriesList = ({ stories, onStoryClick, onDeleteStory }) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  };

  const handleDeleteClick = (e, storyId, storyTitle) => {
    e.stopPropagation(); // Prevents launching the view details modal on card click
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

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {stories.map((story) => (
          <div
            key={story._id}
            onClick={() => onStoryClick(story)}
            className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 border border-[#DDE7D8]"
          >
            {/* Image Cover Display */}
            <div className="relative h-56 bg-[#F7F9F4] overflow-hidden">
              <img
                src={story.coverImage || "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop"}
                alt={story.title}
                className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                onError={(e) => { e.target.src = "https://via.placeholder.com/600x400?text=No+Image"; }}
              />
              
              {/* Media Badges Overlay */}
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

              {/* Delete Action Action Overlay */}
              <button
                type="button"
                onClick={(e) => handleDeleteClick(e, story._id, story.title)}
                className="absolute top-3 right-3 p-2 bg-white/90 text-red-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-50 shadow-sm z-10"
              >
                <Trash2 size={16} />
              </button>

              {/* View Overlay on Hover */}
              <div className="absolute inset-0 bg-[#5A7863]/10 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                <span className="bg-white/95 text-[#3B4953] font-semibold text-xs px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition transform translate-y-2 group-hover:translate-y-0">
                  <Eye size={14} /> View Details
                </span>
              </div>
            </div>

            {/* Content Specifications Section */}
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

      {/* Confirmation Safeguard Modal integration */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Story"
        message={`Are you sure you want to delete "${storyToDelete?.title || "this story"}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </>
  );
};

export default StoriesList;