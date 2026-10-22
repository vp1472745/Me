import React, { useEffect, useState, useRef } from "react";
import { uploadToDrive } from "../../services/driveUpload";
import { createGallery, getAllGalleries, deleteGallery } from "../../config/api";
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
import LoadingModal from "../../components/feedback/CommonLoadingModal";
import DeleteConfirmationModal from "../../components/feedback/DeleteConfirmationModal";

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
            fetchGalleries(true);
            setActiveTab("all");
        } catch (error) {
            console.error("Upload error:", error);
            toast.error(error?.response?.data?.message || "Upload failed.");
        } finally {
            setLoading(false);
            setModalMessage("Uploading...");
        }
    };

    const fetchGalleries = async (forceFresh = false) => {
        try {
            const res = await getAllGalleries(forceFresh);
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
        const targetId = galleryToDelete._id;
        setIsDeleting(true);
        try {
            await deleteGallery(targetId);
            toast.success("Gallery deleted successfully");
        } catch (error) {
            if (error?.response?.status === 404) {
                toast.success("Gallery was already removed from database");
            } else {
                toast.error(error?.response?.data?.message || "Delete failed");
            }
        } finally {
            setGalleries((prev) => prev.filter((g) => g._id !== targetId));
            setIsDeleting(false);
            setDeleteModalOpen(false);
            setGalleryToDelete(null);
            fetchGalleries(true);
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
        fetchGalleries(true);
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
        <div className="animate-fade-in text-xs sm:text-sm space-y-4">
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    className: "custom-toast",
                    style: {
                        background: "#1e293b",
                        color: "#fff",
                        borderRadius: "10px",
                        padding: "12px",
                        fontSize: "13px",
                    },
                    success: {
                        style: {
                            background: "#059669",
                        },
                    },
                    error: {
                        style: {
                            background: "#dc2626",
                        },
                    },
                }}
            />

            {/* Tabs */}
            <div className="flex items-center gap-1.5 border-b border-slate-200/80 dark:border-slate-800 pb-2.5">
                <button
                    onClick={() => setActiveTab("create")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${activeTab === "create"
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                >
                    <FaUpload size={12} />
                    Upload Images
                </button>
                <button
                    onClick={() => setActiveTab("all")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${activeTab === "all"
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                >
                    <FaTh size={12} />
                    All Galleries ({galleries.length})
                </button>
            </div>

            <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-4 sm:p-5">
                        {activeTab === "create" ? (
                            <div>
                                <form onSubmit={handleSubmit}>
                                    {/* Drop Zone */}
                                    <div
                                        className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 transition-all duration-200 ${isDragging
                                            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 scale-[1.005]"
                                            : "border-slate-300 dark:border-slate-700 hover:border-blue-400"
                                            } ${files.length > 0 ? "bg-slate-50/50 dark:bg-slate-900/40" : "bg-white dark:bg-slate-800"}`}
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
                                            <div className="text-center py-6">
                                                <div className="w-14 h-14 mx-auto bg-blue-50 dark:bg-blue-950/50 rounded-xl flex items-center justify-center mb-3 border border-blue-200 dark:border-blue-900">
                                                    <FaImages className="text-2xl text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                                                    Drop your images here
                                                </h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                    or click to browse files
                                                </p>
                                                <p className="text-[11px] text-slate-400 mt-2 font-medium">
                                                    Supports JPG, PNG, WEBP & more • Single files up to {MAX_IMAGE_SIZE_LABEL}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                                        {files.length} file{files.length > 1 ? "s" : ""} selected
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={clearAllFiles}
                                                        className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-semibold transition-colors"
                                                    >
                                                        <FaTrash size={10} />
                                                        Clear All
                                                    </button>
                                                </div>

                                                {Object.values(uploadProgress).length > 0 && (
                                                    <div className="mb-3">
                                                        <div className="flex justify-between text-xs mb-1">
                                                            <span className="text-slate-500">Overall Progress</span>
                                                            <span className="font-bold text-blue-600 dark:text-blue-400">
                                                                {Math.round(totalProgress)}%
                                                            </span>
                                                        </div>
                                                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full transition-all duration-300 rounded-full ${isAllUploaded ? "bg-emerald-500" : "bg-blue-600"
                                                                    }`}
                                                                style={{ width: `${totalProgress}%` }}
                                                            />
                                                        </div>
                                                        {isAllUploaded && (
                                                            <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-semibold">
                                                                <FaCheckCircle /> All files uploaded!
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                                                    {files.map((file, index) => {
                                                        const progress = uploadProgress[index] || 0;
                                                        const isDone = progress === 100;
                                                        const isUploading = loading && progress > 0 && progress < 100;
                                                        return (
                                                            <div
                                                                key={index}
                                                                className="relative group flex items-center gap-2.5 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs hover:shadow-xs transition"
                                                            >
                                                                {!loading && progress === 0 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeFile(index)}
                                                                        className="absolute top-1.5 right-1.5 z-10 w-4.5 h-4.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center transition shadow-2xs"
                                                                        title="Remove file"
                                                                    >
                                                                        <FaTimes size={8} />
                                                                    </button>
                                                                )}
                                                                {isUploading && (
                                                                    <div className="absolute top-1.5 right-1.5 z-10">
                                                                        <FaSpinner className="text-blue-600 animate-spin text-xs" />
                                                                    </div>
                                                                )}
                                                                {isDone && (
                                                                    <div className="absolute top-1.5 right-1.5 z-10">
                                                                        <FaCheckCircle className="text-emerald-500 text-xs" />
                                                                    </div>
                                                                )}
                                                                <div className="w-10 h-10 rounded-md bg-slate-100 dark:bg-slate-900 flex-shrink-0 overflow-hidden">
                                                                    {previews[index] ? (
                                                                        <img
                                                                            src={previews[index]}
                                                                            alt="preview"
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                                            <FaFileImage />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0 pr-5">
                                                                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                                                                        {file.name}
                                                                    </p>
                                                                    <p className="text-[10px] text-slate-400">
                                                                        {getFileSize(file.size)}
                                                                    </p>
                                                                    {progress > 0 && (
                                                                        <div className="mt-0.5 flex items-center gap-1.5">
                                                                            <div className="flex-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                                                <div
                                                                                    className={`h-full transition-all duration-300 rounded-full ${getProgressColor(progress)}`}
                                                                                    style={{ width: `${progress}%` }}
                                                                                />
                                                                            </div>
                                                                            <span className="text-[9px] font-bold text-slate-500 min-w-[28px] text-right">
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

                                    <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
                                        <button
                                            type="submit"
                                            disabled={loading || files.length === 0}
                                            className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider text-white transition-all duration-200 flex items-center justify-center gap-2 ${loading || files.length === 0
                                                ? "bg-slate-300 dark:bg-slate-700 cursor-not-allowed"
                                                : "bg-blue-600 hover:bg-blue-700 shadow-xs hover:shadow"
                                                }`}
                                        >
                                            {loading ? (
                                                <>
                                                    <FaSpinner className="animate-spin text-xs" />
                                                    Uploading... {Math.round(totalProgress)}%
                                                </>
                                            ) : (
                                                <>
                                                    <FaUpload className="text-xs" />
                                                    Upload {files.length} File{files.length > 1 ? "s" : ""}
                                                </>
                                            )}
                                        </button>
                                        {loading && (
                                            <span className="text-xs text-slate-500">
                                                Please wait, this may take a moment...
                                            </span>
                                        )}
                                        {files.length > 0 && !loading && (
                                            <span className="text-xs text-slate-400 font-medium">
                                                {getFileSize(files.reduce((acc, f) => acc + f.size, 0))} total
                                            </span>
                                        )}
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div>
                                {galleries.length === 0 ? (
                                    <div className="text-center py-14">
                                        <div className="w-16 h-16 mx-auto bg-blue-50 dark:bg-blue-950/50 rounded-2xl flex items-center justify-center mb-3 border border-blue-200 dark:border-blue-900">
                                            <FaImages className="text-2xl text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                            No galleries yet
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Upload your first media collection to get started
                                        </p>
                                        <button
                                            onClick={() => setActiveTab("create")}
                                            className="mt-3 px-4 py-1.5 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-blue-700 transition"
                                        >
                                            Upload now
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {galleries.map((g) => (
                                            <div
                                                key={g._id}
                                                className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                                            >
                                                <div className="relative h-44 sm:h-48 bg-slate-100 dark:bg-slate-900 overflow-hidden">
                                                    {g.images && g.images.length > 0 ? (
                                                        <img
                                                            src={g.images[0]}
                                                            alt="Gallery cover"
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                            <FaImages size={32} />
                                                        </div>
                                                    )}
                                                    <div className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-white/10">
                                                        <FaImages size={9} />
                                                        {g.images?.length || 0}
                                                    </div>
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300" />
                                                </div>
                                                <div className="p-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                                                                {g.title || "Media Collection"}
                                                            </p>
                                                            <p className="text-[10px] text-slate-400 mt-0.5">
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
                                                                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 transition"
                                                                title="View gallery"
                                                            >
                                                                <FaEye size={13} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteClick(g)}
                                                                className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 transition"
                                                                title="Delete gallery"
                                                            >
                                                                <FaTrash size={12} />
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