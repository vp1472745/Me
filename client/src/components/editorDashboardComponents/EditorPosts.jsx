import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaFolder,
  FaClock,
  FaUpload,
  FaCheckCircle,
  FaSpinner,
  FaRegCheckCircle,
  FaFolderOpen,
  FaExclamationTriangle,
  FaDownload,
  FaCheck,
  FaHistory,
  FaWrench,
} from "react-icons/fa";
import {
  getWorkAssignments,
  submitWorkDuration,
  completeWorkAssignment,
  uploadMultipleFilesToDrive,
  getCorrectionsList,
  updateCorrectionRequest,
  downloadGalleryFile,
} from "../../config/api";
import CommonModal from "../commonComponents/CommonModelComponents";

const CorrectionImagePreview = ({ fileId, workId }) => {
  const [src, setSrc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadPreview = async () => {
      try {
        const res = await downloadGalleryFile(fileId, workId);
        if (active) {
          const url = URL.createObjectURL(new Blob([res.data]));
          setSrc(url);
        }
      } catch (err) {
        console.error("Failed to load image preview:", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadPreview();
    return () => {
      active = false;
      if (src) URL.revokeObjectURL(src);
    };
  }, [fileId, workId]);

  if (loading) {
    return (
      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-105 rounded-2xl flex items-center justify-center border border-slate-200">
        <FaSpinner className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (!src) {
    return (
      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center border border-rose-100 text-xs font-semibold text-center p-2">
        Preview unavailable
      </div>
    );
  }

  return (
    <img
      src={src}
      alt="Preview"
      className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity"
      onClick={() => window.open(src, "_blank")}
    />
  );
};

const EditorPosts = () => {
  const [activeTab, setActiveTab] = useState("assignments"); // 'assignments' | 'corrections'
  const [projects, setProjects] = useState([]);
  const [corrections, setCorrections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Duration Submission Form
  const [durationForm, setDurationForm] = useState({
    workId: "",
    estimatedDuration: "",
    expectedCompletionDate: "",
    notes: "",
  });
  const [durationModalOpen, setDurationModalOpen] = useState(false);

  // File Upload Form (for assignments)
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    categoryFolder: "RAW Photos",
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // Correction Upload Form
  const [corrUploadModalOpen, setCorrUploadModalOpen] = useState(false);
  const [selectedCorrection, setSelectedCorrection] = useState(null);
  const [corrUploadNotes, setCorrUploadNotes] = useState("");
  const [corrFiles, setCorrFiles] = useState([]);
  const [uploadingCorr, setUploadingCorr] = useState(false);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      // 1. Fetch Assignments
      const res = await getWorkAssignments();
      setProjects(res.data.projects || []);

      // 2. Fetch Corrections
      const corrRes = await getCorrectionsList();
      setCorrections(corrRes.data.corrections || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load assigned projects or correction requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // Duration handlers
  const openDurationModal = (project) => {
    setDurationForm({
      workId: project._id,
      estimatedDuration: project.duration?.estimated || "",
      expectedCompletionDate: project.duration?.expectedCompletionDate
        ? new Date(project.duration.expectedCompletionDate).toISOString().substring(0, 10)
        : "",
      notes: project.duration?.notes || "",
    });
    setDurationModalOpen(true);
  };

  const handleDurationSubmit = async (e) => {
    e.preventDefault();
    if (!durationForm.estimatedDuration || !durationForm.expectedCompletionDate) {
      toast.error("Please fill in estimated duration and target completion date.");
      return;
    }

    setActionLoading(durationForm.workId);
    try {
      const res = await submitWorkDuration(durationForm);
      if (res.data.success) {
        toast.success("Estimated duration submitted for approval!");
        setDurationModalOpen(false);
        fetchAssignments();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to submit duration details.");
    } finally {
      setActionLoading(null);
    }
  };

  // Upload handlers (Assignments)
  const openUploadModal = (project) => {
    setSelectedProject(project);
    setUploadForm({ categoryFolder: project.category || "RAW Photos" });
    setSelectedFiles([]);
    setUploadModalOpen(true);
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      toast.error("Please select files to upload.");
      return;
    }

    setUploadingFiles(true);
    try {
      const formData = new FormData();
      formData.append("workId", selectedProject._id);
      formData.append("subFolder", selectedProject.category);
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const res = await uploadMultipleFilesToDrive(formData);
      if (res.data.success) {
        toast.success(`Successfully uploaded ${selectedFiles.length} file(s) to user Google Drive.`);
        setUploadModalOpen(false);
        fetchAssignments();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to upload files to Google Drive.");
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleMarkComplete = async (workId) => {
    if (!window.confirm("Mark this project assignment as fully completed?")) return;
    setActionLoading(workId);
    try {
      const res = await completeWorkAssignment({ workId });
      if (res.data.success) {
        toast.success("Project marked as completed successfully!");
        fetchAssignments();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to complete work.");
    } finally {
      setActionLoading(null);
    }
  };

  // Correction handlers
  const handleDownloadFile = async (fileId, workId, name) => {
    try {
      const response = await downloadGalleryFile(fileId, workId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
      toast.error("Failed to download original file.");
    }
  };

  const handleAcceptCorrection = async (correctionId) => {
    setActionLoading(correctionId);
    try {
      const formData = new FormData();
      formData.append("correctionId", correctionId);
      formData.append("status", "In Progress");
      formData.append("editorNotes", "Started working on the requested correction.");

      const res = await updateCorrectionRequest(formData);
      if (res.data.success) {
        toast.success("Correction request accepted.");
        fetchAssignments();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to accept correction request.");
    } finally {
      setActionLoading(null);
    }
  };

  const openCorrUploadModal = (correction) => {
    setSelectedCorrection(correction);
    setCorrUploadNotes("");
    setCorrFiles([]);
    setCorrUploadModalOpen(true);
  };

  const handleCorrFileChange = (e) => {
    setCorrFiles(Array.from(e.target.files));
  };

  const handleCorrUploadSubmit = async (e) => {
    e.preventDefault();
    if (corrFiles.length === 0) {
      toast.error("Please select a corrected file to upload.");
      return;
    }

    setUploadingCorr(true);
    try {
      const formData = new FormData();
      formData.append("correctionId", selectedCorrection._id);
      formData.append("status", "Completed");
      formData.append("editorNotes", corrUploadNotes || "Uploaded corrected revision.");
      formData.append("file", corrFiles[0]);

      const res = await updateCorrectionRequest(formData);
      if (res.data.success) {
        toast.success("Corrected version uploaded successfully!");
        setCorrUploadModalOpen(false);
        fetchAssignments();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to upload corrected file.");
    } finally {
      setUploadingCorr(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      WAITING_FOR_EDITOR: "bg-amber-100 text-amber-800 border border-amber-200",
      WAITING_FOR_ADMIN_APPROVAL: "bg-blue-100 text-blue-800 border border-blue-200",
      IN_PROGRESS: "bg-indigo-100 text-indigo-800 border border-indigo-200",
      COMPLETED: "bg-green-100 text-green-800 border border-green-200",
      DELIVERED: "bg-teal-100 text-teal-800 border border-teal-200",
    };
    const displayStatus = (status || "").replace(/_/g, " ");
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${styles[status] || "bg-gray-100 text-gray-850"}`}>
        {displayStatus}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-[#3B4953]">
      <ToastContainer />

      {/* Header */}
      <div className="border-b border-[#DDE7D8] pb-5">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FaFolderOpen className="text-[#5A7863]" /> Editor Production Dashboard
        </h1>
        <p className="text-sm text-[#3B4953]/60 mt-1">
          Review assignments workload, timeline estimates, and solve client file correction requests.
        </p>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-[#DDE7D8] gap-4 mb-6">
        <button
          onClick={() => setActiveTab("assignments")}
          className={`pb-2.5 text-sm font-bold border-b-2 transition-all ${activeTab === "assignments"
              ? "border-[#5A7863] text-[#5A7863]"
              : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
        >
          My Assignments ({projects.length})
        </button>
        <button
          onClick={() => setActiveTab("corrections")}
          className={`pb-2.5 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${activeTab === "corrections"
              ? "border-rose-500 text-rose-600"
              : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
        >
          Correction Requests ({corrections.filter((c) => c.status !== "Completed").length} Active)
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <FaSpinner className="animate-spin text-[#5A7863] text-3xl" />
          <p className="text-sm text-[#3B4953]/60">Loading data...</p>
        </div>
      ) : activeTab === "assignments" ? (
        /* ==================== ASSIGNMENTS TAB ==================== */
        projects.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#DDE7D8] rounded-3xl p-12">
            <p className="text-[#3B4953]/60 font-semibold">No assignments currently listed.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {projects.map((project) => (
              <div key={project._id} className="bg-white border border-[#DDE7D8] rounded-3xl p-6 shadow-sm hover:shadow-md transition space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base">{project.category} Assignment</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Priority: <b className="text-slate-600">{project.priority}</b></p>
                  </div>
                  <div>{getStatusBadge(project.status)}</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-[#3B4953]/80">
                  <div>
                    <span className="font-semibold text-slate-500 block text-xs uppercase tracking-wide">Client Details</span>
                    <span className="font-bold text-slate-800">{project.client?.name}</span>
                    <span className="block text-xs text-slate-400">{project.client?.email}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block text-xs uppercase tracking-wide">Target Deadline</span>
                    <span className="font-bold text-slate-800">
                      {project.deliveryDate ? new Date(project.deliveryDate).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block text-xs uppercase tracking-wide">Drive Connection Status</span>
                    {project.client?.googleDrive?.connected ? (
                      <span className="inline-block text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold mt-1">Connected</span>
                    ) : (
                      <span className="inline-block text-xs bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-bold mt-1">Disconnected</span>
                    )}
                  </div>
                </div>

                {project.deliverables && project.deliverables.length > 0 && (
                  <div className="bg-[#F7F9F4] border border-[#DDE7D8] rounded-2xl p-4">
                    <span className="font-semibold text-slate-500 block text-[10px] uppercase tracking-wide mb-2">Assigned Deliverables Checklist</span>
                    <div className="flex flex-wrap gap-2">
                      {project.deliverables.map((item, idx) => (
                        <span key={idx} className="bg-white border border-[#DDE7D8] text-slate-600 text-xs px-3 py-1 rounded-full font-semibold">
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Estimated duration details if submitted */}
                {project.duration && (
                  <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-4 space-y-2">
                    <h4 className="font-bold text-indigo-900 text-xs flex items-center gap-1.5 uppercase tracking-wide">
                      <FaClock /> Submitted Duration Estimate
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-indigo-950">
                      <div>
                        <span className="font-semibold text-indigo-800/80 block">Duration Estimate</span>
                        <span className="font-bold">{project.duration.estimated}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-indigo-800/80 block">Expected Completion Date</span>
                        <span className="font-bold">
                          {project.duration?.expectedCompletionDate ? new Date(project.duration.expectedCompletionDate).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                    </div>
                    {project.duration.notes && (
                      <div className="pt-2 border-t border-indigo-100 text-xs text-indigo-950">
                        <span className="font-semibold text-indigo-800/80 block">My Remarks</span>
                        <p className="italic">"{project.duration.notes}"</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions based on Status */}
                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
                  {project.status === "WAITING_FOR_EDITOR" && (
                    <button
                      onClick={() => openDurationModal(project)}
                      className="px-5 py-2.5 bg-[#5A7863] text-white hover:bg-[#4B6654] text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
                    >
                      <FaClock /> Submit Timeline Details
                    </button>
                  )}

                  {project.status === "WAITING_FOR_ADMIN_APPROVAL" && (
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs text-slate-400 font-semibold italic flex items-center gap-1">
                        <FaSpinner className="animate-spin text-indigo-500" /> Awaiting Admin Approval to start uploading...
                      </span>
                      <button
                        onClick={() => openDurationModal(project)}
                        className="px-4 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 text-xs font-bold rounded-xl transition flex items-center gap-1"
                      >
                        Change Timeline Details
                      </button>
                    </div>
                  )}

                  {project.status === "IN_PROGRESS" && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => openUploadModal(project)}
                        className="px-5 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
                      >
                        <FaUpload /> Upload Files to Google Drive
                      </button>
                      <button
                        onClick={() => handleMarkComplete(project._id)}
                        disabled={actionLoading === project._id}
                        className="px-5 py-2.5 bg-green-600 text-white hover:bg-green-700 text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
                      >
                        {actionLoading === project._id ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaCheckCircle />
                        )}
                        Mark as Completed
                      </button>
                    </div>
                  )}

                  {project.status === "COMPLETED" && (
                    <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                      <FaRegCheckCircle /> Project Work Completed & Awaiting Admin Delivery dispatch.
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* ==================== CORRECTIONS TAB ==================== */
        corrections.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#DDE7D8] rounded-3xl p-12">
            <p className="text-[#3B4953]/60 font-semibold">No correction requests found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {corrections.map((corr) => (
              <div key={corr._id} className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                      <FaExclamationTriangle className="text-rose-500" /> Correction Needed
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Project: <b>{corr.workId?.category}</b></p>
                  </div>
                  <div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${corr.status === "Pending"
                        ? "bg-rose-50 text-rose-700 border-rose-100"
                        : corr.status === "In Progress"
                          ? "bg-amber-50 text-amber-700 border-amber-100"
                          : "bg-green-50 text-green-700 border-green-100"
                      }`}>
                      {corr.status}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-5">
                  {/* Left Column: Image Preview */}
                  <div className="flex-shrink-0">
                    <CorrectionImagePreview fileId={corr.fileId} workId={corr.workId?._id} />
                  </div>

                  {/* Right Column: Details & Comments */}
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#3B4953]/80">
                      <div>
                        <span className="font-semibold text-slate-500 block text-xs uppercase tracking-wide">File Name</span>
                        <span className="font-bold text-slate-800 break-all">{corr.fileName}</span>
                        <span className="block text-xs text-slate-400">Current Version: {corr.version}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-500 block text-xs uppercase tracking-wide">Actions</span>
                        <button
                          onClick={() => handleDownloadFile(corr.fileId, corr.workId?._id, corr.fileName)}
                          className="mt-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <FaDownload /> Download Original
                        </button>
                      </div>
                    </div>

                    {/* Comment Box */}
                    <div className="bg-rose-50/50 border border-rose-100/50 rounded-2xl p-4">
                      <span className="font-bold text-rose-800 text-[10px] uppercase tracking-wide mb-1.5 block">Client Correction Request Remarks:</span>
                      <p className="italic text-slate-700 text-sm">"{corr.userComment}"</p>
                    </div>

                    {/* Editor Notes if any */}
                    {corr.editorNotes && (
                      <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 text-xs text-slate-600">
                        <span className="font-bold text-slate-500 block uppercase tracking-wide mb-1">My Response Notes:</span>
                        <p className="italic">"{corr.editorNotes}"</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Correction Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
                  {corr.status === "Pending" && (
                    <button
                      onClick={() => handleAcceptCorrection(corr._id)}
                      disabled={actionLoading === corr._id}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                    >
                      {actionLoading === corr._id ? <FaSpinner className="animate-spin" /> : <FaWrench />}
                      Accept & Start Edit
                    </button>
                  )}

                  {corr.status !== "Completed" && (
                    <button
                      onClick={() => openCorrUploadModal(corr)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                    >
                      <FaUpload /> Upload Corrected Version
                    </button>
                  )}

                  {corr.status === "Completed" && (
                    <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                      <FaCheck /> Corrected version uploaded. Awaiting Client review.
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Submit Duration Details Modal */}
      <CommonModal
        isOpen={durationModalOpen}
        onClose={() => setDurationModalOpen(false)}
        title="Submit Delivery Estimate & Timeline"
        size="md"
      >
        <form onSubmit={handleDurationSubmit} className="space-y-4 text-slate-800">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Estimated Duration (e.g. 7 Days)</label>
            <input
              type="text"
              value={durationForm.estimatedDuration}
              onChange={(e) => setDurationForm({ ...durationForm, estimatedDuration: e.target.value })}
              placeholder="e.g. 7 Days"
              className="w-full h-11 px-4 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-[#5A7863]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Expected Completion Date</label>
            <input
              type="date"
              value={durationForm.expectedCompletionDate}
              onChange={(e) => setDurationForm({ ...durationForm, expectedCompletionDate: e.target.value })}
              className="w-full h-11 px-4 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-[#5A7863]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Remarks / Requests (optional)</label>
            <textarea
              value={durationForm.notes}
              onChange={(e) => setDurationForm({ ...durationForm, notes: e.target.value })}
              placeholder="e.g. Need Client RAW photos link to proceed edit."
              className="w-full p-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-[#5A7863] h-24 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setDurationModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading !== null}
              className="px-5 py-2 bg-[#5A7863] text-white rounded-xl hover:bg-[#4B6654] transition text-xs font-bold"
            >
              Submit For Approval
            </button>
          </div>
        </form>
      </CommonModal>

      {/* Upload Files Modal (Assignments) */}
      <CommonModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Deliverables Directly to Client Google Drive"
        size="md"
      >
        {selectedProject && (
          <form onSubmit={handleUploadSubmit} className="space-y-4 text-slate-800">
            <div>
              <p className="text-sm text-slate-500 mb-2">
                Uploading to Client: <b>{selectedProject.client?.name}</b>
              </p>
            </div>
            <div className="bg-[#F7F9F4] border border-[#DDE7D8] rounded-xl p-3.5">
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Target Subfolder (Assigned by Admin)</span>
              <span className="block text-base font-bold text-[#3B4953] mt-1">{selectedProject.category}</span>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Files</label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#EBF4DD] file:text-[#5A7863] hover:file:bg-[#EEF6EC] text-xs"
                required
              />
              <span className="block text-xs text-slate-400 mt-1">{selectedFiles.length} file(s) selected</span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploadingFiles}
                className="px-5 py-2 bg-[#5A7863] text-white rounded-xl hover:bg-[#4B6654] transition text-xs font-bold flex items-center gap-2"
              >
                {uploadingFiles ? <FaSpinner className="animate-spin" /> : <FaUpload />} Upload Files
              </button>
            </div>
          </form>
        )}
      </CommonModal>

      {/* Upload Correction Modal */}
      <CommonModal
        isOpen={corrUploadModalOpen}
        onClose={() => setCorrUploadModalOpen(false)}
        title="Upload Corrected Version of File"
        size="md"
      >
        {selectedCorrection && (
          <form onSubmit={handleCorrUploadSubmit} className="space-y-4 text-slate-800">
            <div>
              <p className="text-sm text-slate-500 mb-2">
                File to correct: <b>{selectedCorrection.fileName}</b>
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Corrected File</label>
              <input
                type="file"
                onChange={handleCorrFileChange}
                className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 text-xs"
                required
              />
              <span className="block text-xs text-slate-400 mt-1">{corrFiles.length} file selected</span>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Editor Remarks (optional)</label>
              <textarea
                value={corrUploadNotes}
                onChange={(e) => setCorrUploadNotes(e.target.value)}
                placeholder="e.g. Corrected brightness levels and removed shadow."
                className="w-full p-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-rose-500 h-24 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCorrUploadModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploadingCorr}
                className="px-5 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition text-xs font-bold flex items-center gap-2"
              >
                {uploadingCorr ? <FaSpinner className="animate-spin" /> : <FaUpload />} Upload Correction
              </button>
            </div>
          </form>
        )}
      </CommonModal>
    </div>
  );
};

export default EditorPosts;