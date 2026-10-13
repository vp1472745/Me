// EditStoryModal.jsx - Wedding Theme (Fully Integrated)
import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { X, Upload, Music, Video, Plus, Trash2 } from "lucide-react";
import CommonModal from "../../components/feedback/CommonModelComponents";
import { updateStory } from "../../config/api";
import { uploadToDrive } from "../../services/driveUpload";

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
        const result = await uploadToDrive(newCoverFile);
        coverUrl = result.secure_url;
      }

      // Upload new audio if provided
      if (newAudioFile) {
        const result = await uploadToDrive(newAudioFile);
        audioUrl = result.secure_url;
      }

      // Upload new gallery images
      for (const file of newImages) {
        const result = await uploadToDrive(file);
        imageUrls.push(result.secure_url);
      }

      // Upload new gallery videos
      for (const file of newVideos) {
        const result = await uploadToDrive(file);
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
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />
        </div>

        {/* Couple */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Couple
          </label>
          <input
            type="text"
            name="couple"
            value={formData.couple}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />
        </div>

        {/* Location & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition resize-y"
          />
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Cover Image
          </label>
          <div className="flex items-center gap-3">
            {formData.coverImage && !newCoverFile && (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
              </div>
            )}
            {newCoverFile && (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                <img
                  src={URL.createObjectURL(newCoverFile)}
                  alt="New cover"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setNewCoverFile(null)}
                  className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X size={12} />
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
              className="px-3.5 py-1.5 border border-dashed border-blue-300 dark:border-blue-800 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition flex items-center gap-1.5 text-xs font-semibold"
            >
              <Upload size={14} /> {newCoverFile ? "Change" : "Upload"}
            </button>
          </div>
        </div>

        {/* Audio */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Audio
          </label>
          <div className="flex items-center gap-3">
            {formData.audio && !newAudioFile && (
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-xs">
                <Music size={14} className="text-blue-600 dark:text-blue-400" />
                <span className="truncate max-w-[150px]">
                  {formData.audio.split("/").pop()}
                </span>
              </div>
            )}
            {newAudioFile && (
              <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900 text-xs">
                <Music size={14} className="text-blue-600 dark:text-blue-400" />
                <span className="truncate max-w-[150px]">
                  {newAudioFile.name}
                </span>
                <button
                  type="button"
                  onClick={() => setNewAudioFile(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={12} />
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
              className="px-3.5 py-1.5 border border-dashed border-blue-300 dark:border-blue-800 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition flex items-center gap-1.5 text-xs font-semibold"
            >
              <Upload size={14} /> {newAudioFile ? "Change" : "Upload"}
            </button>
          </div>
        </div>

        {/* Gallery Images */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Gallery Images
          </label>
          <div className="flex flex-wrap gap-2.5 mb-2">
            {formData.galleryImages.map((url, idx) => (
              <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-0.5 right-0.5 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
            {newImages.map((file, idx) => (
              <div key={`new-${idx}`} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                <img src={URL.createObjectURL(file)} alt={`New ${idx}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setNewImages((prev) => prev.filter((_, i) => i !== idx))}
                  className="absolute top-0.5 right-0.5 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X size={11} />
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
            className="px-3.5 py-1.5 border border-dashed border-blue-300 dark:border-blue-800 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition flex items-center gap-1.5 text-xs font-semibold"
          >
            <Plus size={14} /> Add Images
          </button>
        </div>

        {/* Gallery Videos */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Gallery Videos
          </label>
          <div className="flex flex-wrap gap-2.5 mb-2">
            {formData.galleryVideos.map((url, idx) => (
              <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-black flex items-center justify-center">
                <Video size={20} className="text-white" />
                <button
                  type="button"
                  onClick={() => removeVideo(idx)}
                  className="absolute top-0.5 right-0.5 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
            {newVideos.map((file, idx) => (
              <div key={`new-video-${idx}`} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-black flex items-center justify-center">
                <Video size={20} className="text-white" />
                <button
                  type="button"
                  onClick={() => setNewVideos((prev) => prev.filter((_, i) => i !== idx))}
                  className="absolute top-0.5 right-0.5 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X size={11} />
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
            className="px-3.5 py-1.5 border border-dashed border-blue-300 dark:border-blue-800 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition flex items-center gap-1.5 text-xs font-semibold"
          >
            <Plus size={14} /> Add Videos
          </button>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-700/80">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-bold uppercase tracking-wider"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
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