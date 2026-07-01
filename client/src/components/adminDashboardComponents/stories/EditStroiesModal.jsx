// EditStoryModal.jsx - Wedding Theme (Fully Integrated)
import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { X, Upload, Music, Video, Plus, Trash2 } from "lucide-react";
import CommonModal from "../../commonComponents/CommonModelComponents";
import { updateStory } from "../../../config/api";
import { uploadToCloudinary } from "../../../services/cloudinaryUpload";

/**
 * EditStoryModal - Edit an existing story
 *
 * @param {boolean} isOpen - Modal visibility
 * @param {function} onClose - Close callback
 * @param {object} story - Story to edit (null when closed)
 * @param {function} onStoryUpdated - Callback after successful update
 */
const EditStoryModal = ({ isOpen, onClose, story, onStoryUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    couple: "",
    location: "",
    date: "",
    description: "",
    coverImage: "",
    audio: "",
    galleryImages: [],
    galleryVideos: [],
  });

  // New file states
  const [newCoverFile, setNewCoverFile] = useState(null);
  const [newAudioFile, setNewAudioFile] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [newVideos, setNewVideos] = useState([]);

  // Refs for hidden file inputs
  const coverInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const imagesInputRef = useRef(null);
  const videosInputRef = useRef(null);

  // Populate form when story changes
  useEffect(() => {
    if (story) {
      setFormData({
        title: story.title || "",
        couple: story.couple || "",
        location: story.location || "",
        date: story.date ? story.date.split("T")[0] : "",
        description: story.description || "",
        coverImage: story.coverImage || "",
        audio: story.audio || "",
        galleryImages: story.galleryImages || [],
        galleryVideos: story.galleryVideos || [],
      });
      // Reset file states
      setNewCoverFile(null);
      setNewAudioFile(null);
      setNewImages([]);
      setNewVideos([]);
    }
  }, [story]);

  // Text input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // File input handlers
  const handleCoverFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setNewCoverFile(file);
  };

  const handleAudioFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setNewAudioFile(file);
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length) setNewImages(files);
  };

  const handleVideosChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length) setNewVideos(files);
  };

  // Remove gallery items
  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index),
    }));
  };

  const removeVideo = (index) => {
    setFormData((prev) => ({
      ...prev,
      galleryVideos: prev.galleryVideos.filter((_, i) => i !== index),
    }));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!story?._id) {
      toast.error("No story selected");
      return;
    }

    setLoading(true);
    setUploading(true);

    try {
      let coverUrl = formData.coverImage;
      let audioUrl = formData.audio;
      let imageUrls = [...formData.galleryImages];
      let videoUrls = [...formData.galleryVideos];

      // Upload new cover if provided
      if (newCoverFile) {
        const result = await uploadToCloudinary(newCoverFile);
        coverUrl = result.secure_url;
      }

      // Upload new audio if provided (handled as 'video' by Cloudinary)
      if (newAudioFile) {
        const result = await uploadToCloudinary(newAudioFile);
        audioUrl = result.secure_url;
      }

      // Upload new gallery images
      for (const file of newImages) {
        const result = await uploadToCloudinary(file);
        imageUrls.push(result.secure_url);
      }

      // Upload new gallery videos
      for (const file of newVideos) {
        const result = await uploadToCloudinary(file);
        videoUrls.push(result.secure_url);
      }

      // Build update payload
      const updateData = {
        title: formData.title,
        couple: formData.couple,
        location: formData.location,
        date: formData.date,
        description: formData.description,
        coverImage: coverUrl,
        audio: audioUrl,
        galleryImages: imageUrls,
        galleryVideos: videoUrls,
      };

      // Call API (axios instance)
      const response = await updateStory(story._id, updateData);

      // Assuming response.data contains { success: boolean, story: updatedStory }
      if (response.data?.success) {
        toast.success("Story updated successfully!");
        onStoryUpdated(response.data.story);
        onClose();
      } else {
        toast.error(response.data?.message || "Update failed");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || error.message || "Something went wrong");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  // Reset and close
  const handleClose = () => {
    setNewCoverFile(null);
    setNewAudioFile(null);
    setNewImages([]);
    setNewVideos([]);
    onClose();
  };

  const isSubmitting = loading || uploading;

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Story"
      size="lg"
      showCloseButton
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-[#3B4953] mb-1">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-xl border border-[#DDE7D8] bg-white focus:outline-none focus:ring-2 focus:ring-[#5A7863] transition"
            required
          />
        </div>

        {/* Couple */}
        <div>
          <label className="block text-sm font-medium text-[#3B4953] mb-1">
            Couple
          </label>
          <input
            type="text"
            name="couple"
            value={formData.couple}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-xl border border-[#DDE7D8] bg-white focus:outline-none focus:ring-2 focus:ring-[#5A7863] transition"
            required
          />
        </div>

        {/* Location & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#3B4953] mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-[#DDE7D8] bg-white focus:outline-none focus:ring-2 focus:ring-[#5A7863] transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#3B4953] mb-1">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-[#DDE7D8] bg-white focus:outline-none focus:ring-2 focus:ring-[#5A7863] transition"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[#3B4953] mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 rounded-xl border border-[#DDE7D8] bg-white focus:outline-none focus:ring-2 focus:ring-[#5A7863] transition resize-y"
          />
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-[#3B4953] mb-1">
            Cover Image
          </label>
          <div className="flex items-center gap-4">
            {formData.coverImage && !newCoverFile && (
              <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-[#DDE7D8]">
                <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
              </div>
            )}
            {newCoverFile && (
              <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-[#DDE7D8]">
                <img
                  src={URL.createObjectURL(newCoverFile)}
                  alt="New cover"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setNewCoverFile(null)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              ref={coverInputRef}
              onChange={handleCoverFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => coverInputRef.current.click()}
              className="px-4 py-2 border-2 border-dashed border-[#DDE7D8] rounded-xl text-[#5A7863] hover:bg-[#EBF4DD] transition flex items-center gap-2"
            >
              <Upload size={16} /> {newCoverFile ? "Change" : "Upload"}
            </button>
          </div>
        </div>

        {/* Audio */}
        <div>
          <label className="block text-sm font-medium text-[#3B4953] mb-1">
            Audio
          </label>
          <div className="flex items-center gap-4">
            {formData.audio && !newAudioFile && (
              <div className="flex items-center gap-2 text-[#3B4953] bg-[#F7F9F4] px-3 py-1 rounded-full border border-[#DDE7D8]">
                <Music size={16} className="text-[#5A7863]" />
                <span className="text-sm truncate max-w-[150px]">
                  {formData.audio.split("/").pop()}
                </span>
              </div>
            )}
            {newAudioFile && (
              <div className="flex items-center gap-2 text-[#3B4953] bg-[#EBF4DD] px-3 py-1 rounded-full border border-[#DDE7D8]">
                <Music size={16} className="text-[#5A7863]" />
                <span className="text-sm truncate max-w-[150px]">
                  {newAudioFile.name}
                </span>
                <button
                  type="button"
                  onClick={() => setNewAudioFile(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            <input
              type="file"
              accept="audio/*"
              ref={audioInputRef}
              onChange={handleAudioFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => audioInputRef.current.click()}
              className="px-4 py-2 border-2 border-dashed border-[#DDE7D8] rounded-xl text-[#5A7863] hover:bg-[#EBF4DD] transition flex items-center gap-2"
            >
              <Upload size={16} /> {newAudioFile ? "Change" : "Upload"}
            </button>
          </div>
        </div>

        {/* Gallery Images */}
        <div>
          <label className="block text-sm font-medium text-[#3B4953] mb-1">
            Gallery Images
          </label>
          <div className="flex flex-wrap gap-3 mb-2">
            {formData.galleryImages.map((url, idx) => (
              <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#DDE7D8]">
                <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            {newImages.map((file, idx) => (
              <div key={`new-${idx}`} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#DDE7D8]">
                <img src={URL.createObjectURL(file)} alt={`New ${idx}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setNewImages((prev) => prev.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            ref={imagesInputRef}
            onChange={handleImagesChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => imagesInputRef.current.click()}
            className="px-4 py-2 border-2 border-dashed border-[#DDE7D8] rounded-xl text-[#5A7863] hover:bg-[#EBF4DD] transition flex items-center gap-2"
          >
            <Plus size={16} /> Add Images
          </button>
        </div>

        {/* Gallery Videos */}
        <div>
          <label className="block text-sm font-medium text-[#3B4953] mb-1">
            Gallery Videos
          </label>
          <div className="flex flex-wrap gap-3 mb-2">
            {formData.galleryVideos.map((url, idx) => (
              <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#DDE7D8] bg-black flex items-center justify-center">
                <Video size={24} className="text-white" />
                <button
                  type="button"
                  onClick={() => removeVideo(idx)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            {newVideos.map((file, idx) => (
              <div key={`new-video-${idx}`} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#DDE7D8] bg-black flex items-center justify-center">
                <Video size={24} className="text-white" />
                <button
                  type="button"
                  onClick={() => setNewVideos((prev) => prev.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          <input
            type="file"
            accept="video/*"
            multiple
            ref={videosInputRef}
            onChange={handleVideosChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => videosInputRef.current.click()}
            className="px-4 py-2 border-2 border-dashed border-[#DDE7D8] rounded-xl text-[#5A7863] hover:bg-[#EBF4DD] transition flex items-center gap-2"
          >
            <Plus size={16} /> Add Videos
          </button>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[#DDE7D8]">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2 rounded-xl border border-[#DDE7D8] text-[#3B4953] hover:bg-[#F7F9F4] transition"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-xl bg-[#5A7863] text-white font-semibold hover:bg-[#4A6853] transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Update Story"}
          </button>
        </div>
      </form>
    </CommonModal>
  );
};

export default EditStoryModal;