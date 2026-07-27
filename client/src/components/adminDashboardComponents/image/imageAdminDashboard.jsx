import React, { useEffect, useState, useRef } from "react";
import { uploadToDrive } from "../../../services/driveUpload";
import { createGallery, getAllGalleries, deleteGallery } from "../../../config/api";
import {
    FaEye,
    FaTrash,
    FaTimes,
    FaChevronLeft,
    FaChevronRight,
    FaImages,
    FaPlus,
    FaUpload,
    FaCheckCircle,
    FaSpinner,
    FaFileImage,
    FaTh,
} from "react-icons/fa";
import { toast, Toaster } from "react-hot-toast";
import LoadingModal from "../../commonComponents/CommonLoadingModal";
import DeleteConfirmationModal from "../../commonComponents/DeleteConfirmationModal";

const MAX_IMAGE_SIZE = 500 * 1024 * 1024;
const MAX_IMAGE_SIZE_LABEL = "500 MB";

const filterOversizedFiles = (selectedFiles) => {
    const validFiles = selectedFiles.filter((file) => file.size <= MAX_IMAGE_SIZE);
    const oversizedFiles = selectedFiles.filter((file) => file.size > MAX_IMAGE_SIZE);

    if (oversizedFiles.length > 0) {
        toast.error(`Each image must be ${MAX_IMAGE_SIZE_LABEL} or smaller.`);
    }

    return validFiles;
};

const GalleryUpload = () => {
    const [activeTab, setActiveTab] = useState("create");
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [galleries, setGalleries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [isDragging, setIsDragging] = useState(false);
    const [modalMessage, setModalMessage] = useState("Uploading...");

    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedGallery, setSelectedGallery] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [galleryToDelete, setGalleryToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fileInputRef = useRef(null);

    // --- Handlers ---
    const handleFileChange = (e) => {
        const selectedFiles = filterOversizedFiles(Array.from(e.target.files || []));
        if (selectedFiles.length === 0) return;
        setFiles(selectedFiles);
        setPreviews(selectedFiles.map((file) => URL.createObjectURL(file)));
        const initialProgress = {};
        selectedFiles.forEach((_, index) => { initialProgress[index] = 0; });
        setUploadProgress(initialProgress);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = filterOversizedFiles(Array.from(e.dataTransfer.files || []));
        if (droppedFiles.length === 0) return;
        setFiles(droppedFiles);
        setPreviews(droppedFiles.map((file) => URL.createObjectURL(file)));
        const initialProgress = {};
        droppedFiles.forEach((_, index) => { initialProgress[index] = 0; });
        setUploadProgress(initialProgress);
    };

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);

    const removeFile = (index) => {
        if (previews[index]) {
            URL.revokeObjectURL(previews[index]);
        }
        const newFiles = [...files];
        const newPreviews = [...previews];
        newFiles.splice(index, 1);
        newPreviews.splice(index, 1);
        setFiles(newFiles);
        setPreviews(newPreviews);
        const newProgress = { ...uploadProgress };
        delete newProgress[index];
        const reIndexed = {};
        Object.keys(newProgress).forEach((key, i) => {
            reIndexed[i] = newProgress[key];
        });
        setUploadProgress(reIndexed);
    };

    const clearAllFiles = () => {
        previews.forEach((url) => URL.revokeObjectURL(url));
        setFiles([]);
        setPreviews([]);
        setUploadProgress({});
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (files.length === 0) {
            toast.error("Please select files first");
            return;
        }
        setLoading(true);
        setModalMessage("Preparing upload...");
        const progressMap = {};
        try {
            const uploadedUrls = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                setModalMessage(`Uploading file ${i + 1} of ${files.length}...`);
                const result = await uploadToDrive(file, (percent) => {
                    progressMap[i] = percent;
                    setUploadProgress({ ...progressMap });
                    setModalMessage(
                        `Uploading file ${i + 1} of ${files.length}... ${percent}%`
                    );
                });

                uploadedUrls.push(result.secure_url);
                progressMap[i] = 100;
                setUploadProgress({ ...progressMap });
            }
            setModalMessage("Saving gallery to database...");
            await createGallery({ images: uploadedUrls });
            toast.success("Gallery uploaded successfully! 🎉");
            clearAllFiles();
            fetchGalleries();
            setActiveTab("all");
        } catch (error) {
            console.error("Upload error:", error);
            toast.error(error?.response?.data?.message || "Upload failed.");
        } finally {
            setLoading(false);
            setModalMessage("Uploading...");
        }
    };

    const fetchGalleries = async () => {
        try {
            const res = await getAllGalleries();
            setGalleries(res?.data?.data || []);
        } catch (error) {
            console.log(error);
            toast.error("Failed to load galleries");
        }
    };

    const handleDeleteClick = (gallery) => {
        setGalleryToDelete(gallery);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!galleryToDelete) return;
        setIsDeleting(true);
        try {
            await deleteGallery(galleryToDelete._id);
            toast.success("Gallery deleted successfully");
            fetchGalleries();
        } catch (error) {
            toast.error("Delete failed");
        } finally {
            setIsDeleting(false);
            setDeleteModalOpen(false);
            setGalleryToDelete(null);
        }
    };

    const handleCloseDeleteModal = () => {
        setDeleteModalOpen(false);
        setGalleryToDelete(null);
    };

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
        if (selectedGallery) {
            setCurrentImageIndex((prev) =>
                prev === selectedGallery.images.length - 1 ? 0 : prev + 1
            );
        }
    };

    const prevImage = () => {
        if (selectedGallery) {
            setCurrentImageIndex((prev) =>
                prev === 0 ? selectedGallery.images.length - 1 : prev - 1
            );
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (viewModalOpen) {
                if (e.key === "ArrowRight") nextImage();
                if (e.key === "ArrowLeft") prevImage();
                if (e.key === "Escape") closeViewModal();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [viewModalOpen, selectedGallery]);

    useEffect(() => {
        fetchGalleries();
    }, []);

    useEffect(() => {
        return () => {
            previews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, []);

    const getProgressColor = (progress) => {
        if (progress < 30) return "bg-red-500";
        if (progress < 70) return "bg-yellow-500";
        return "bg-green-500";
    };

    const getFileSize = (bytes) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
        if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + " MB";
        return (bytes / 1073741824).toFixed(2) + " GB";
    };

    const totalProgress = Object.values(uploadProgress).length > 0
        ? Object.values(uploadProgress).reduce((a, b) => a + b, 0) / Object.values(uploadProgress).length
        : 0;

    const isAllUploaded = Object.values(uploadProgress).length > 0 &&
        Object.values(uploadProgress).every((p) => p === 100);

    return (
        <div className="flex flex-col h-full w-full bg-gradient-to-br from-[#F7F9F4] via-[#f0f5eb] to-[#e8efe0] text-[#2d3748] font-sans overflow-hidden">
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    className: "custom-toast",
                    style: {
                        background: "#2d3748",
                        color: "#fff",
                        borderRadius: "12px",
                        padding: "16px",
                    },
                    success: {
                        style: {
                            background: "#1a7d4a",
                        },
                    },
                    error: {
                        style: {
                            background: "#b91c1c",
                        },
                    },
                }}
            />

            {/* ===== FIXED HEADER ===== */}
            <div className="sticky top-0 z-20 bg-gradient-to-br from-[#F7F9F4] via-[#f0f5eb] to-[#e8efe0] border-b border-[#DDE7D8]/50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">
                    {/* Title & New Upload Button */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#3B4953] to-[#5A7863] bg-clip-text text-transparent">
                                Media Gallery
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Upload, manage, and organize your media collections
                            </p>
                        </div>
                        <button
                            onClick={() => setActiveTab("create")}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md ${activeTab === "create"
                                    ? "bg-[#5A7863] text-white hover:bg-[#4a6a53]"
                                    : "bg-white text-[#3B4953] border border-gray-200 hover:border-[#5A7863]"
                                }`}
                        >
                            <FaPlus className="text-sm" />
                            New Upload
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 bg-white/70 backdrop-blur-sm p-1.5 rounded-2xl border border-white/50 shadow-sm w-full sm:w-auto">
                        <button
                            onClick={() => setActiveTab("create")}
                            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${activeTab === "create"
                                    ? "bg-[#5A7863] text-white shadow-md"
                                    : "text-[#3B4953] hover:bg-gray-100"
                                }`}
                        >
                            <FaUpload className="text-xs" />
                            Upload
                        </button>
                        <button
                            onClick={() => setActiveTab("all")}
                            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${activeTab === "all"
                                    ? "bg-[#5A7863] text-white shadow-md"
                                    : "text-[#3B4953] hover:bg-gray-100"
                                }`}
                        >
                            <FaTh className="text-xs" />
                            All Galleries
                            <span className="ml-1 px-2 py-0.5 text-xs bg-white/20 rounded-full">
                                {galleries.length}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ===== SCROLLABLE CONTENT ===== */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 shadow-xl shadow-black/5 p-6 sm:p-8 min-h-[500px]">
                        {activeTab === "create" ? (
                            <div>
                                <form onSubmit={handleSubmit}>
                                    {/* Drop Zone */}
                                    <div
                                        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 transition-all duration-300 ${isDragging
                                                ? "border-[#5A7863] bg-[#5A7863]/5 scale-[1.01]"
                                                : "border-gray-300 hover:border-[#5A7863]/50"
                                            } ${files.length > 0 ? "bg-gray-50/50" : "bg-white"}`}
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />

                                        {files.length === 0 ? (
                                            <div className="text-center py-8">
                                                <div className="w-20 h-20 mx-auto bg-[#5A7863]/10 rounded-2xl flex items-center justify-center mb-4">
                                                    <FaImages className="text-3xl text-[#5A7863]" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-[#3B4953]">
                                                    Drop your images here
                                                </h3>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    or click to browse files
                                                </p>
                                                <p className="text-xs text-gray-300 mt-3">
                                                    Supports JPG, PNG, WEBP & more
                                                </p>
                                                <p className="text-xs text-gray-400 mt-2">
                                                    ⚡ Large images will be automatically compressed
                                                </p>
                                                <p className="text-xs text-gray-500 mt-2">
                                                    Single files up to {MAX_IMAGE_SIZE_LABEL} are supported.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-[#3B4953]">
                                                        {files.length} file{files.length > 1 ? "s" : ""} selected
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={clearAllFiles}
                                                        className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
                                                    >
                                                        <FaTrash size={12} />
                                                        Clear All
                                                    </button>
                                                </div>

                                                {Object.values(uploadProgress).length > 0 && (
                                                    <div className="mb-4">
                                                        <div className="flex justify-between text-sm mb-1">
                                                            <span className="text-gray-600">Overall Progress</span>
                                                            <span className="font-semibold text-[#5A7863]">
                                                                {Math.round(totalProgress)}%
                                                            </span>
                                                        </div>
                                                        <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full transition-all duration-300 rounded-full ${isAllUploaded ? "bg-green-500" : "bg-[#5A7863]"
                                                                    }`}
                                                                style={{ width: `${totalProgress}%` }}
                                                            />
                                                        </div>
                                                        {isAllUploaded && (
                                                            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                                                <FaCheckCircle /> All files uploaded!
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                                                    {files.map((file, index) => {
                                                        const progress = uploadProgress[index] || 0;
                                                        const isDone = progress === 100;
                                                        const isUploading = loading && progress > 0 && progress < 100;
                                                        return (
                                                            <div
                                                                key={index}
                                                                className="relative group flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                                                            >
                                                                {!loading && progress === 0 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeFile(index)}
                                                                        className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center transition-colors shadow-sm"
                                                                        title="Remove file"
                                                                    >
                                                                        <FaTimes size={10} />
                                                                    </button>
                                                                )}
                                                                {isUploading && (
                                                                    <div className="absolute top-2 right-2 z-10">
                                                                        <FaSpinner className="text-[#5A7863] animate-spin text-sm" />
                                                                    </div>
                                                                )}
                                                                {isDone && (
                                                                    <div className="absolute top-2 right-2 z-10">
                                                                        <FaCheckCircle className="text-green-500 text-sm" />
                                                                    </div>
                                                                )}
                                                                <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                                                                    {previews[index] ? (
                                                                        <img
                                                                            src={previews[index]}
                                                                            alt="preview"
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                            <FaFileImage />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0 pr-6">
                                                                    <p className="text-xs font-medium text-gray-700 truncate">
                                                                        {file.name}
                                                                    </p>
                                                                    <p className="text-[10px] text-gray-400">
                                                                        {getFileSize(file.size)}
                                                                    </p>
                                                                    {progress > 0 && (
                                                                        <div className="mt-1 flex items-center gap-2">
                                                                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                                                <div
                                                                                    className={`h-full transition-all duration-300 rounded-full ${getProgressColor(progress)}`}
                                                                                    style={{ width: `${progress}%` }}
                                                                                />
                                                                            </div>
                                                                            <span className="text-[10px] font-medium text-gray-500 min-w-[32px] text-right">
                                                                                {Math.round(progress)}%
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
                                        <button
                                            type="submit"
                                            disabled={loading || files.length === 0}
                                            className={`w-full sm:w-auto px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-3 ${loading || files.length === 0
                                                    ? "bg-gray-300 cursor-not-allowed"
                                                    : "bg-[#5A7863] hover:bg-[#4a6a53] shadow-lg hover:shadow-xl"
                                                }`}
                                        >
                                            {loading ? (
                                                <>
                                                    <FaSpinner className="animate-spin" />
                                                    Uploading... {Math.round(totalProgress)}%
                                                </>
                                            ) : (
                                                <>
                                                    <FaUpload />
                                                    Upload {files.length} File{files.length > 1 ? "s" : ""}
                                                </>
                                            )}
                                        </button>
                                        {loading && (
                                            <span className="text-sm text-gray-500">
                                                Please wait, this may take a moment...
                                            </span>
                                        )}
                                        {files.length > 0 && !loading && (
                                            <span className="text-sm text-gray-400">
                                                {getFileSize(files.reduce((acc, f) => acc + f.size, 0))} total
                                            </span>
                                        )}
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div>
                                {galleries.length === 0 ? (
                                    <div className="text-center py-16">
                                        <div className="w-24 h-24 mx-auto bg-gray-100 rounded-3xl flex items-center justify-center mb-4">
                                            <FaImages className="text-4xl text-gray-300" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-[#3B4953]">
                                            No galleries yet
                                        </h3>
                                        <p className="text-sm text-gray-400 mt-1">
                                            Upload your first media collection to get started
                                        </p>
                                        <button
                                            onClick={() => setActiveTab("create")}
                                            className="mt-4 px-6 py-2 bg-[#5A7863] text-white rounded-xl hover:bg-[#4a6a53] transition-colors"
                                        >
                                            Upload now
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                        {galleries.map((g) => (
                                            <div
                                                key={g._id}
                                                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                            >
                                                <div className="relative h-52 bg-gray-100 overflow-hidden">
                                                    {g.images && g.images.length > 0 ? (
                                                        <img
                                                            src={g.images[0]}
                                                            alt="Gallery cover"
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <FaImages size={40} />
                                                        </div>
                                                    )}
                                                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5">
                                                        <FaImages size={10} />
                                                        {g.images?.length || 0}
                                                    </div>
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                                                </div>
                                                <div className="p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-medium text-[#3B4953] truncate">
                                                                {g.title || "Media Collection"}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                {g.createdAt
                                                                    ? new Date(g.createdAt).toLocaleDateString("en-US", {
                                                                        month: "short",
                                                                        day: "numeric",
                                                                        year: "numeric",
                                                                    })
                                                                    : "Recent"}
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-1 ml-2">
                                                            <button
                                                                onClick={() => openViewModal(g)}
                                                                className="p-2 rounded-lg text-gray-500 hover:text-[#5A7863] hover:bg-[#5A7863]/10 transition-all"
                                                                title="View gallery"
                                                            >
                                                                <FaEye size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteClick(g)}
                                                                className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all"
                                                                title="Delete gallery"
                                                            >
                                                                <FaTrash size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Lightbox */}
            {viewModalOpen && selectedGallery && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 animate-fadeIn"
                    onClick={closeViewModal}
                >
                    <div
                        className="relative max-w-6xl w-full h-full flex flex-col items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-4 right-4 z-10 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 rounded-full p-3 transition-all duration-200 backdrop-blur-sm"
                            onClick={closeViewModal}
                        >
                            <FaTimes size={22} />
                        </button>
                        <div className="absolute top-4 left-4 z-10 text-white/80 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                            {currentImageIndex + 1} / {selectedGallery.images.length}
                        </div>
                        <div className="relative w-full h-full flex items-center justify-center">
                            <img
                                src={selectedGallery.images[currentImageIndex]}
                                alt={`Gallery ${currentImageIndex + 1}`}
                                className="max-h-[85vh] max-w-[95vw] object-contain rounded-lg shadow-2xl"
                            />
                            {selectedGallery.images.length > 1 && (
                                <>
                                    <button
                                        className="absolute left-2 sm:left-6 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 rounded-full p-3 sm:p-4 transition-all duration-200 backdrop-blur-sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            prevImage();
                                        }}
                                    >
                                        <FaChevronLeft size={20} />
                                    </button>
                                    <button
                                        className="absolute right-2 sm:right-6 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 rounded-full p-3 sm:p-4 transition-all duration-200 backdrop-blur-sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            nextImage();
                                        }}
                                    >
                                        <FaChevronRight size={20} />
                                    </button>
                                </>
                            )}
                        </div>
                        {selectedGallery.images.length > 1 && (
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-4 py-2 bg-black/30 backdrop-blur-sm rounded-2xl">
                                {selectedGallery.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentImageIndex(idx);
                                        }}
                                        className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 ${idx === currentImageIndex
                                                ? "border-white scale-110 shadow-lg"
                                                : "border-white/30 hover:border-white/60"
                                            }`}
                                    >
                                        <img
                                            src={img}
                                            alt={`Thumb ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modals */}
            <LoadingModal
                isLoading={loading}
                message={modalMessage}
                variant="spinner"
                showProgress={false}
            />

            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                title="Delete Gallery"
                message={`Are you sure you want to delete "${galleryToDelete?.title || 'this gallery'}"? This action cannot be undone.`}
                isLoading={isDeleting}
            />

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.98); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
                ::-webkit-scrollbar { width: 4px; height: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #c4cdd5; border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: #a0abb8; }
            `}</style>
        </div>
    );
};

export default GalleryUpload;