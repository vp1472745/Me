// ======================================================
// FILE: HeroManagement.jsx - Professional Earthy Dashboard System
// ======================================================
import React, { useEffect, useState } from "react";
import {
  createHeroSection,
  getAllHeroSections,
  deleteHeroSection,
} from "../../../config/api";
import {
  FaTrash,
  FaImage,
  FaVideo,
  FaPlus,
  FaCloudUploadAlt,
} from "react-icons/fa";
import LoadingModal from "../../../components/commonComponents/LoadingModal";
import uploadToCloudinary from "../../../services/cloudinaryUpload";

const HeroManagement = () => {
  // ==========================
  // VIEW, UPLOAD & ASSET STATES
  // ==========================
  const [activeTab, setActiveTab] = useState("create");
  const [mediaType, setMediaType] = useState("image");
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState("");
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Processing...");

  // ==========================
  // GET ALL ASSETS
  // ==========================
  const fetchHeroSections = async () => {
    try {
      const res = await getAllHeroSections();
      setHeroes(res?.data?.data || []);
    } catch (error) {
      console.error("Error reading entry portal canvas feeds:", error);
    }
  };

  useEffect(() => {
    fetchHeroSections();
  }, []);

  // ==========================
  // FILE SELECTION HANDLE
  // ==========================
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMedia(file);
    setPreview(URL.createObjectURL(file));
  };

  // Helper handling type toggle sanitization
  const handleTypeChange = (type) => {
    setMediaType(type);
    setMedia(null);
    setPreview("");
  };

  // ==========================
  // COMMIT / CREATE (Upload Handling)
  // ==========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!media) {
      alert("Please select media asset first.");
      return;
    }

    try {
      setLoadingMessage(
        mediaType === "video" 
          ? "Streaming heavy video payload to Cloudinary. Please wait..." 
          : "Deploying high-definition still frame scale..."
      );
      setLoading(true);

      // 1. Direct Cloudinary Client-Side Upload Sequence
      const uploadResult = await uploadToCloudinary(media, (percent) => {
        setLoadingMessage(`Uploading to Cloud Provider: ${percent}%`);
      });

      if (!uploadResult?.secure_url) {
        throw new Error("Cloudinary delivery missing valid storage target URL reference.");
      }

      // 2. Transmit Secured Delivery Blueprint metadata down to App Server Backend
const payload = {
  mediaUrl: uploadResult.secure_url,
  mediaType,
  public_id: uploadResult.public_id,
};

await createHeroSection(payload);

      setMedia(null);
      setPreview("");
      await fetchHeroSections();
      setActiveTab("all");
    } catch (error) {
      console.error("Asset deployment block fault context:", error);
      alert(error?.response?.data?.message || error?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // DELETION AGENT (Cloud Purging)
  // ==========================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to completely delete this entry hero asset?");
    if (!confirmDelete) return;

    try {
      setLoadingMessage("Purging cloud storage mirrors and record entries...");
      setLoading(true);
      
      await deleteHeroSection(id);
      await fetchHeroSections();
    } catch (error) {
      console.error("Error running drop tracking execution block:", error);
      alert("Delete transaction dropped by server safety rules.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#F7F9F4] text-[#3B4953]">
      
      {/* Structural Navigation Tabs Module */}
      <div className="flex-shrink-0 mt-4">
        <div className="max-w-7xl mx-auto border-b border-[#DDE7D8] bg-white rounded-t-xl overflow-hidden shadow-sm">
          <div className="flex">
            <button
              onClick={() => setActiveTab("create")}
              className={`px-8 py-4 text-xs font-semibold uppercase tracking-[3px] transition-all duration-200 border-r border-[#DDE7D8] flex items-center gap-2 ${
                activeTab === "create"
                  ? "bg-[#EBF4DD] text-[#5A7863] border-b-2 border-b-[#5A7863]"
                  : "text-[#3B4953]/70 hover:bg-[#F7F9F4] hover:text-[#3B4953]"
              }`}
            >
              <FaPlus size={10} />
              Deploy Media
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`px-8 py-4 text-xs font-semibold uppercase tracking-[3px] transition-all duration-200 flex items-center gap-2 ${
                activeTab === "all"
                  ? "bg-[#EBF4DD] text-[#5A7863] border-b-2 border-b-[#5A7863]"
                  : "text-[#3B4953]/70 hover:bg-[#F7F9F4] hover:text-[#3B4953]"
              }`}
            >
              <FaImage size={11} />
              Active Canvas ({heroes.length})
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Content Stream Area */}
      <div className="flex-1 overflow-y-auto sm:px-6 pb-6">
        <div className="max-w-7xl mx-auto mt-6">

          {/* CREATE / UPLOAD ASSET FORM */}
          {activeTab === "create" && (
            <div className="bg-white rounded-2xl border border-[#DDE7D8] p-5 sm:p-6 md:p-8 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Media Select Strategy Switcher */}
                <div>
                  <label className="block mb-2 uppercase tracking-[2px] text-[11px] font-bold text-[#3B4953]/80">
                    Target Media Pipeline
                  </label>
                  <select
                    value={mediaType}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="w-full bg-[#F7F9F4] border border-[#DDE7D8] text-[#3B4953] rounded-xl p-4 focus:outline-none focus:border-[#5A7863] transition text-sm font-medium"
                  >
                    <option value="image">Still Frame Matrix (Image)</option>
                    <option value="video">Kinetic Motion Stream (Video)</option>
                  </select>
                </div>

                {/* File Drop Drag Area Zone Frame */}
                <div>
                  <label className="block mb-2 uppercase tracking-[2px] text-[11px] font-bold text-[#3B4953]/80">
                    Upload Resource Asset
                  </label>
                  <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-[#90AB8B]/40 hover:border-[#5A7863] bg-[#F7F9F4] rounded-xl p-8 text-center transition min-h-[160px]">
                    <input
                      type="file"
                      accept={mediaType === "image" ? "image/*" : "video/*"}
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center pointer-events-none space-y-2 text-[#3B4953]/70">
                      <div className="w-12 h-12 rounded-full bg-white border border-[#DDE7D8] flex items-center justify-center text-[#5A7863] shadow-xs">
                        <FaCloudUploadAlt size={20} />
                      </div>
                      <p className="text-xs font-bold text-[#3B4953]">
                        {media ? "Substitute Selected Object" : "Select or Drop Media Asset"}
                      </p>
                      <p className="text-[10px] text-[#3B4953]/50">
                        {mediaType === "image" ? "Supports JPG, PNG, WEBP background scales" : "Supports high-bitrate streaming MP4 channels"}
                      </p>
                    </div>
                  </div>
                  {media && (
                    <p className="text-[11px] font-bold text-[#5A7863] bg-[#EBF4DD] px-3 py-1 rounded-md mt-2 inline-block max-w-full truncate shadow-xs">
                      ✓ Staged Target: {media.name}
                    </p>
                  )}
                </div>

                {/* Local Sandbox Rendering Mirror Box */}
                {preview && (
                  <div className="p-4 bg-[#F7F9F4] border border-[#DDE7D8] rounded-xl">
                    <p className="text-[10px] font-bold uppercase tracking-[1px] text-[#3B4953]/60 mb-2.5">Local Display Mirror Preview</p>
                    <div className="max-w-xl mx-auto rounded-xl overflow-hidden border border-[#DDE7D8] bg-black shadow-inner">
                      {mediaType === "image" ? (
                        <img
                          src={preview}
                          alt="Local mirror view staging"
                          className="w-full h-auto max-h-[340px] object-contain mx-auto"
                        />
                      ) : (
                        <video
                          key={preview}
                          controls
                          muted
                          playsInline
                          className="w-full max-h-[340px] object-contain mx-auto"
                        >
                          <source src={preview} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>
                  </div>
                )}

                {/* Commit Action Panel Pipeline Trigger */}
                <div className="pt-4 border-t border-[#DDE7D8]">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 bg-[#5A7863] hover:bg-[#4a6352] text-white px-8 py-3.5 rounded-xl uppercase tracking-[2px] text-xs font-semibold transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    <FaCloudUploadAlt size={12} />
                    {loading ? "Deploying Core Assets..." : "Publish Hero Asset"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ACTIVE LIVE HERO CANVASES */}
          {activeTab === "all" && (
            <>
              {heroes.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-[#DDE7D8] px-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F7F9F4] rounded-full mb-4 border border-[#DDE7D8]">
                    <FaVideo size={20} className="text-[#90AB8B]" />
                  </div>
                  <p className="text-[#3B4953] text-lg font-semibold mb-1">Hero asset matrix empty</p>
                  <p className="text-[#3B4953]/60 text-sm">Deploy high-definition streams to feed the entry portal canvas.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {heroes.map((item) => (
                    <div
                      key={item._id}
                      className="group bg-white rounded-xl overflow-hidden border border-[#DDE7D8] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
                    >
                      {/* Media Display Window Segment Frame */}
                      <div className="relative h-56 bg-black overflow-hidden flex items-center justify-center">
                        {item.mediaType === "image" ? (
                          <img
                            src={item.mediaUrl}
                            alt="Portal canvas target background scale track"
                            className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <video
                            key={item.mediaUrl}
                            muted
                            loop
                            autoPlay
                            playsInline
                            controls
                            className="w-full h-full object-cover"
                          >
                            <source src={item.mediaUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        )}
                        
                        {/* Status Label Floating Meta Pill */}
                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md border border-[#DDE7D8] flex items-center gap-1.5 text-[10px] font-bold uppercase text-[#3B4953] z-20">
                          {item.mediaType === "image" ? <FaImage className="text-[#5A7863]" /> : <FaVideo className="text-[#5A7863]" />}
                          <span>{item.mediaType} asset</span>
                        </div>
                      </div>

                      {/* Control Panel Interaction Block Frame Footer */}
                      <div className="p-4 bg-white border-t border-[#DDE7D8] flex items-center justify-between mt-auto">
                        <span className="text-[10px] font-bold text-[#3B4953]/50 uppercase tracking-[1px] truncate max-w-[70%]">
                          ID: {item._id}
                        </span>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="inline-flex items-center justify-center bg-red-50 hover:bg-red-100/80 text-red-600 border border-red-200/60 p-2.5 rounded-lg transition-all duration-200"
                          title="Purge Stream Canvas Asset"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Dynamic Structural Overlay Loader Context */}
      <LoadingModal
        isLoading={loading}
        message={loadingMessage}
        showProgress={false}
        variant="dots"
      />
    </div>
  );
};

export default HeroManagement;