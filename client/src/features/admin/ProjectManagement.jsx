import React, { useState, useEffect, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaFolder,
  FaPlus,
  FaCheck,
  FaTimes,
  FaEdit,
  FaClock,
  FaSpinner,
  FaGoogleDrive,
  FaHistory,
  FaDownload,
  FaSearch,
  FaFilter,
  FaTrash,
  FaFolderOpen,
  FaCalendarAlt,
  FaTasks,
  FaUserCheck,
} from "react-icons/fa";
import CommonModal from "../../components/feedback/CommonModelComponents";
import {
  getAllDirectoryUsers,
  getWorkAssignments,
  createWorkAssignment,
  approveWorkDuration,
  getCorrectionsList,
  downloadGalleryFile,
} from "../../config/api";

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
      <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
        <FaSpinner className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (!src) {
    return (
      <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center border border-slate-205 text-[9px] font-semibold text-center p-1.5">
        No preview
      </div>
    );
  }

  return (
    <img
      src={src}
      alt="Preview"
      className="w-16 h-16 object-cover rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity"
      onClick={() => window.open(src, "_blank")}
    />
  );
};

const SUBFOLDER_OPTIONS = [
  "Wedding",
  "Pre Wedding",
  "Haldi",
  "Mehendi",
  "Reception",
  "RAW Photos",
  "Edited Photos",
  "Videos",
  "Albums",
  "Final Delivery",
];

const ProjectManagement = () => {
  const [activeTab, setActiveTab] = useState("assignments"); // 'assignments' | 'corrections'
  const [projects, setProjects] = useState([]);
  const [corrections, setCorrections] = useState([]);
  const [clients, setClients] = useState([]);
  const [editors, setEditors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Modals state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  // Selected item states
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedCorrection, setSelectedCorrection] = useState(null);

  // Form states
  const [form, setForm] = useState({
    client: "",
    editor: "",
    categories: ["Wedding"],
    deliveryDate: "",
  });

  const [subfolderDropdownOpen, setSubfolderDropdownOpen] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const subfolderDropdownRef = useRef(null);

  const [editForm, setEditForm] = useState({
    estimatedDuration: "",
    expectedCompletionDate: "",
    notes: "",
  });

  // Close subfolder dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        subfolderDropdownRef.current &&
        !subfolderDropdownRef.current.contains(event.target)
      ) {
        setSubfolderDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const clientsRes = await getAllDirectoryUsers({ role: "USER" });
      setClients(clientsRes.data.users || []);

      const editorsRes = await getAllDirectoryUsers({ role: "EDITOR" });
      setEditors(editorsRes.data.users || []);

      const projectsRes = await getWorkAssignments();
      setProjects(projectsRes.data.projects || []);

      const correctionsRes = await getCorrectionsList();
      setCorrections(correctionsRes.data.corrections || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load project details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleToggleCategory = (cat) => {
    setForm((prev) => {
      const exists = prev.categories.includes(cat);
      const updated = exists
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat];
      return { ...prev, categories: updated };
    });
  };

  const handleRemoveCategory = (cat, e) => {
    if (e) e.stopPropagation();
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== cat),
    }));
  };

  const handleSelectAllCategories = () => {
    setForm((prev) => ({
      ...prev,
      categories: [...SUBFOLDER_OPTIONS],
    }));
  };

  const handleClearCategories = () => {
    setForm((prev) => ({
      ...prev,
      categories: [],
    }));
  };

  const handleAddCustomCategory = (e) => {
    if (e) e.preventDefault();
    const trimmed = customCategory.trim();
    if (!trimmed) return;
    if (!form.categories.includes(trimmed)) {
      setForm((prev) => ({
        ...prev,
        categories: [...prev.categories, trimmed],
      }));
    }
    setCustomCategory("");
  };

  const handleAssignWork = async (e) => {
    e.preventDefault();
    if (!form.client || !form.editor || !form.deliveryDate) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!form.categories || form.categories.length === 0) {
      toast.error("Please select at least one target subfolder / category.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        client: form.client,
        editor: form.editor,
        category: form.categories[0], // for single legacy support
        categories: form.categories,
        priority: "MEDIUM",
        deliveryDate: form.deliveryDate,
      };

      const res = await createWorkAssignment(payload);
      if (res.data.success) {
        toast.success(res.data.message || "Project assigned successfully.");
        setForm({
          client: "",
          editor: "",
          categories: ["Wedding"],
          deliveryDate: "",
        });
        setAssignModalOpen(false);
        setSubfolderDropdownOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to assign work.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (workId) => {
    try {
      const res = await approveWorkDuration({ workId, action: "APPROVE" });
      if (res.data.success) {
        toast.success("Estimated timeline approved successfully!");
        fetchData();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to approve duration.");
    }
  };

  const handleReject = async (workId) => {
    if (!window.confirm("Are you sure you want to reject this duration estimate?")) return;
    try {
      const res = await approveWorkDuration({ workId, action: "REJECT" });
      if (res.data.success) {
        toast.info("Estimated timeline rejected. Editor notified.");
        fetchData();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to reject duration.");
    }
  };

  const openEditModal = (project) => {
    setSelectedProject(project);
    setEditForm({
      estimatedDuration: project.duration?.estimated || "",
      expectedCompletionDate: project.duration?.expectedCompletionDate
        ? new Date(project.duration.expectedCompletionDate).toISOString().substring(0, 10)
        : "",
      notes: project.duration?.notes || "",
    });
    setEditModalOpen(true);
  };

  const handleEditConfirm = async (e) => {
    e.preventDefault();
    if (!editForm.estimatedDuration || !editForm.expectedCompletionDate) {
      toast.error("Please fill in estimated duration and expected completion date.");
      return;
    }

    try {
      const res = await approveWorkDuration({
        workId: selectedProject._id,
        action: "MODIFY",
        estimatedDuration: editForm.estimatedDuration,
        expectedCompletionDate: editForm.expectedCompletionDate,
        notes: editForm.notes,
      });

      if (res.data.success) {
        toast.success("Estimated duration modified and approved.");
        setEditModalOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to modify duration.");
    }
  };

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
      toast.error("Failed to download file.");
    }
  };

  // Stats calculation
  const totalAssigned = projects.length;
  const awaitingEstimates = projects.filter((p) => p.status === "WAITING_FOR_EDITOR").length;
  const pendingApprovals = projects.filter((p) => p.status === "WAITING_FOR_ADMIN_APPROVAL").length;
  const inProgress = projects.filter((p) => p.status === "IN_PROGRESS").length;

  // Filter projects list
  const filteredProjects = projects.filter((proj) => {
    const clientName = proj.client?.name || "";
    const clientEmail = proj.client?.email || "";
    const editorName = proj.editor?.name || "";

    const matchesSearch =
      clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      editorName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "All" || proj.status === statusFilter;
    const matchesCategory = categoryFilter === "All" || proj.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status) => {
    const styles = {
      WAITING_FOR_EDITOR: "bg-amber-50 text-amber-700 border border-amber-200",
      WAITING_FOR_ADMIN_APPROVAL: "bg-blue-50 text-blue-700 border border-blue-200",
      IN_PROGRESS: "bg-indigo-50 text-indigo-700 border border-indigo-200",
      COMPLETED: "bg-green-50 text-green-700 border border-green-200",
      DELIVERED: "bg-teal-50 text-teal-700 border border-teal-200",
    };
    const displayStatus = (status || "").replace(/_/g, " ");
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || "bg-gray-50 text-gray-700"}`}>
        {displayStatus}
      </span>
    );
  };

  return (
    <div className="animate-fade-in text-xs sm:text-sm space-y-4">
      <ToastContainer />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-3">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FaFolder className="text-blue-600 dark:text-blue-400" /> Project Assignments & Timelines
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Assign client subfolders to editors, review timeline durations, and manage production workflow.
          </p>
        </div>
        {activeTab === "assignments" && (
          <button
            onClick={() => setAssignModalOpen(true)}
            className="self-start sm:self-center px-3.5 py-1.5 bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow-2xs"
          >
            <FaPlus /> Assign Work
          </button>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1.5 border-b border-slate-200/80 dark:border-slate-800 pb-2.5">
        <button
          onClick={() => setActiveTab("assignments")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
            activeTab === "assignments"
              ? "bg-blue-600 text-white shadow-2xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Assignments Overview ({projects.length})
        </button>
        <button
          onClick={() => setActiveTab("corrections")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
            activeTab === "corrections"
              ? "bg-blue-600 text-white shadow-2xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Correction Feedback logs ({corrections.length})
        </button>
      </div>

      {/* Dynamic Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <FaSpinner className="animate-spin text-blue-600 text-2xl" />
          <p className="text-xs text-slate-500">Loading production database...</p>
        </div>
      ) : activeTab === "assignments" ? (
        /* ==================== ASSIGNMENTS TAB ==================== */
        <div className="space-y-4">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 shadow-2xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                <FaTasks size={13} />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Total Assigned</span>
                <span className="text-lg font-black text-slate-800 dark:text-slate-100">{totalAssigned}</span>
              </div>
            </div>
            <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 shadow-2xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                <FaClock size={13} />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Wait Estimate</span>
                <span className="text-lg font-black text-slate-800 dark:text-slate-100">{awaitingEstimates}</span>
              </div>
            </div>
            <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 shadow-2xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                <FaHistory size={13} />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Wait Approval</span>
                <span className="text-lg font-black text-slate-800 dark:text-slate-100">{pendingApprovals}</span>
              </div>
            </div>
            <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 shadow-2xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
                <FaFolderOpen size={13} />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">In Progress</span>
                <span className="text-lg font-black text-slate-800 dark:text-slate-100">{inProgress}</span>
              </div>
            </div>
          </div>

          {/* Search and Filters Action Panel */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-72">
              <FaSearch className="absolute left-3 top-2.5 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Search Client or Editor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-slate-800 dark:text-slate-100"
              />
            </div>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-700 w-full sm:w-auto">
                <FaFilter className="text-slate-400 text-[10px]" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent outline-none text-xs font-semibold text-slate-700 dark:text-slate-200 w-full"
                >
                  <option value="All">All Statuses</option>
                  <option value="WAITING_FOR_EDITOR">Awaiting Estimate</option>
                  <option value="WAITING_FOR_ADMIN_APPROVAL">Pending Approval</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="DELIVERED">Delivered</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-700 w-full sm:w-auto">
                <FaFolder className="text-slate-400 text-[10px]" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-transparent outline-none text-xs font-semibold text-slate-700 dark:text-slate-200 w-full"
                >
                  <option value="All">All Folders</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Pre Wedding">Pre Wedding</option>
                  <option value="Haldi">Haldi</option>
                  <option value="Mehendi">Mehendi</option>
                  <option value="Reception">Reception</option>
                  <option value="RAW Photos">RAW Photos</option>
                  <option value="Edited Photos">Edited Photos</option>
                  <option value="Videos">Videos</option>
                  <option value="Albums">Albums</option>
                  <option value="Final Delivery">Final Delivery</option>
                </select>
              </div>
            </div>
          </div>

          {/* Compact SaaS datatable */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-2xs overflow-x-auto">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 font-medium text-xs">No assigned works match the filters.</p>
              </div>
            ) : (
              <table className="w-full border-collapse text-left text-xs text-slate-700 dark:text-slate-200">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
                    <th className="px-3.5 py-2.5 font-bold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Client Details</th>
                    <th className="px-3.5 py-2.5 font-bold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Assigned Editor</th>
                    <th className="px-3.5 py-2.5 font-bold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Target Folder</th>
                    <th className="px-3.5 py-2.5 font-bold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Target Date</th>
                    <th className="px-3.5 py-2.5 font-bold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Duration Estimate</th>
                    <th className="px-3.5 py-2.5 font-bold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                    <th className="px-3.5 py-2.5 font-bold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredProjects.map((proj) => (
                    <tr key={proj._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="px-3.5 py-2.5">
                        <div className="font-bold text-slate-800 dark:text-slate-100 text-xs">{proj.client?.name || "Deleted User"}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{proj.client?.email}</div>
                        {proj.client?.googleDrive?.connected ? (
                          <span className="inline-flex items-center gap-1 text-[9px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded mt-0.5 font-semibold">
                            <FaGoogleDrive /> Linked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded mt-0.5 font-semibold">
                            <FaGoogleDrive /> Unlinked
                          </span>
                        )}
                      </td>
                      <td className="px-3.5 py-2.5">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{proj.editor?.name || "Deleted Editor"}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{proj.editor?.email}</div>
                      </td>
                      <td className="px-3.5 py-2.5 font-bold text-blue-600 dark:text-blue-400">
                        <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                          {proj.category}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 font-semibold text-slate-600 dark:text-slate-300">
                        {proj.deliveryDate ? new Date(proj.deliveryDate).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-3.5 py-2.5">
                        {proj.duration?.estimated ? (
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-800 dark:text-slate-200">{proj.duration.estimated}</div>
                            <div className="text-[10px] text-slate-400">
                              Exp: {proj.duration.expectedCompletionDate ? new Date(proj.duration.expectedCompletionDate).toLocaleDateString() : "N/A"}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] italic text-slate-400">Awaiting...</span>
                        )}
                      </td>
                      <td className="px-3.5 py-2.5">{getStatusBadge(proj.status)}</td>
                      <td className="px-3.5 py-2.5 text-right">
                        {proj.status === "WAITING_FOR_ADMIN_APPROVAL" ? (
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleApprove(proj._id)}
                              title="Approve Estimate"
                              className="w-7 h-7 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 flex items-center justify-center transition"
                            >
                              <FaCheck size={11} />
                            </button>
                            <button
                              onClick={() => openEditModal(proj)}
                              title="Modify & Approve"
                              className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 flex items-center justify-center transition"
                            >
                              <FaEdit size={11} />
                            </button>
                            <button
                              onClick={() => handleReject(proj._id)}
                              title="Reject Estimate"
                              className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center justify-center transition"
                            >
                              <FaTimes size={11} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No pending action</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        /* ==================== CORRECTIONS TAB ==================== */
        corrections.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-xl p-6">
            <p className="text-slate-400 font-medium text-xs">No file correction requests found in history.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {corrections.map((corr) => (
              <div key={corr._id} className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-3 text-slate-800 dark:text-slate-200">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">File: {corr.fileName}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Project Category Folder: <b>{corr.workId?.category}</b></p>
                  </div>
                  <div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      corr.status === "Pending"
                        ? "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/40 dark:text-rose-400"
                        : corr.status === "In Progress"
                        ? "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-400"
                        : "bg-green-50 text-green-700 border-green-100 dark:bg-green-950/40 dark:text-green-400"
                    }`}>
                      {corr.status}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Left Column: Image Preview */}
                  <div className="flex-shrink-0">
                    <CorrectionImagePreview fileId={corr.fileId} workId={corr.workId?._id} />
                  </div>

                  {/* Right Column: User-Editor Notes */}
                  <div className="flex-1 space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-500">
                      <div>
                        <span className="font-semibold text-slate-400 block uppercase text-[10px]">Client Details</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{corr.workId?.client?.name || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400 block uppercase text-[10px]">Editor Assigned</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{corr.workId?.editor?.name || "N/A"}</span>
                      </div>
                    </div>

                    <div className="bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100/50 dark:border-rose-900/40 rounded-xl p-3 text-xs">
                      <span className="font-bold text-rose-800 dark:text-rose-400 text-[10px] uppercase tracking-wide block mb-1">Latest Client Request Comment:</span>
                      <p className="italic text-slate-700 dark:text-slate-300">"{corr.userComment}"</p>
                    </div>

                    {corr.editorNotes && (
                      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-600 dark:text-slate-300">
                        <span className="font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wide mb-1 text-[10px]">Latest Editor Response Note:</span>
                        <p className="italic">"{corr.editorNotes}"</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadFile(corr.fileId, corr.workId?._id, corr.fileName)}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <FaDownload size={11} /> Download Original
                      </button>
                    </div>
                  </div>
                </div>

                {/* View History Button */}
                {corr.history && corr.history.length > 0 && (
                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                      onClick={() => {
                        setSelectedCorrection(corr);
                        setHistoryModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow-2xs"
                    >
                      <FaHistory size={11} /> View Version & Message History ({corr.history.length})
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* Assign Work Modal Form */}
      <CommonModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign New Project to Editor"
        size="md"
      >
        <form onSubmit={handleAssignWork} className="space-y-3.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Client <span className="text-rose-500">*</span></label>
            <select
              name="client"
              value={form.client}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-slate-800 dark:text-slate-100"
            >
              <option value="">-- Choose Client --</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.email}) {c.googleDrive?.connected ? "🟢 Drive" : "🔴 No Drive"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Editor <span className="text-rose-500">*</span></label>
            <select
              name="editor"
              value={form.editor}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-slate-800 dark:text-slate-100"
            >
              <option value="">-- Choose Editor --</option>
              {editors.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          {/* Multi-Select Target Subfolders */}
          <div className="relative" ref={subfolderDropdownRef}>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Target Subfolders <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={handleSelectAllCategories}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold hover:underline"
                >
                  Select All
                </button>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <button
                  type="button"
                  onClick={handleClearCategories}
                  className="text-rose-500 hover:text-rose-600 font-semibold hover:underline"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Selected Pills Display & Dropdown Trigger */}
            <div
              onClick={() => setSubfolderDropdownOpen((prev) => !prev)}
              className={`w-full min-h-[38px] p-1.5 rounded-lg border transition-all cursor-pointer flex flex-wrap items-center gap-1.5 bg-white dark:bg-slate-800 ${
                subfolderDropdownOpen
                  ? "border-blue-500 ring-2 ring-blue-500/20"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
              }`}
            >
              {form.categories && form.categories.length > 0 ? (
                form.categories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-md text-[11px] font-semibold transition-all hover:bg-blue-100"
                  >
                    <span>{cat}</span>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveCategory(cat, e)}
                      className="hover:text-rose-600 focus:outline-none rounded-full p-0.5 hover:bg-rose-50 transition-colors"
                      title={`Remove ${cat}`}
                    >
                      <FaTimes className="text-[9px]" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 px-2">
                  -- Select one or more subfolders --
                </span>
              )}
              <div className="ml-auto pr-1 text-slate-400 flex items-center gap-1">
                {form.categories && form.categories.length > 0 && (
                  <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
                    {form.categories.length}
                  </span>
                )}
                <span className="text-[9px] text-slate-500">▼</span>
              </div>
            </div>

            {/* Dropdown Menu */}
            {subfolderDropdownOpen && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-2.5 space-y-2 max-h-60 overflow-y-auto">
                {/* Custom Subfolder Adder */}
                <div className="flex gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomCategory(e);
                      }
                    }}
                    placeholder="Add custom subfolder (e.g. Sangeet)..."
                    className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomCategory}
                    className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition"
                  >
                    + Add
                  </button>
                </div>

                {/* Subfolders Grid / List */}
                <div className="grid grid-cols-2 gap-1 pt-1">
                  {Array.from(new Set([...SUBFOLDER_OPTIONS, ...form.categories])).map((cat) => {
                    const isSelected = form.categories.includes(cat);
                    return (
                      <div
                        key={cat}
                        onClick={() => handleToggleCategory(cat)}
                        className={`flex items-center justify-between p-1.5 rounded-lg text-xs font-medium cursor-pointer transition select-none ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-semibold"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 pointer-events-none accent-blue-600"
                          />
                          <span className="truncate text-xs">{cat}</span>
                        </div>
                        {isSelected && (
                          <button
                            type="button"
                            onClick={(e) => handleRemoveCategory(cat, e)}
                            className="text-slate-400 hover:text-rose-600 ml-1 p-0.5 rounded transition"
                            title="Remove"
                          >
                            <FaTimes className="text-[9px]" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Completion Date <span className="text-rose-500">*</span></label>
            <input
              type="date"
              name="deliveryDate"
              value={form.deliveryDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setAssignModalOpen(false)}
              className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-2xs text-xs"
            >
              {submitting ? <FaSpinner className="animate-spin text-xs" /> : <FaUserCheck size={12} />} Confirm Assignment
            </button>
          </div>
        </form>
      </CommonModal>

      {/* Edit & Approve Modal */}
      <CommonModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit & Approve Delivery Estimate"
        size="md"
      >
        {selectedProject && (
          <form onSubmit={handleEditConfirm} className="space-y-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                Project Category: <b>{selectedProject.category}</b> for Client <b>{selectedProject.client?.name}</b>
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Estimated Duration (e.g. 10 Days)
              </label>
              <input
                type="text"
                value={editForm.estimatedDuration}
                onChange={(e) => setEditForm({ ...editForm, estimatedDuration: e.target.value })}
                placeholder="e.g. 10 Days"
                className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-slate-800 dark:text-slate-100"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Expected Completion Date
              </label>
              <input
                type="date"
                value={editForm.expectedCompletionDate}
                onChange={(e) => setEditForm({ ...editForm, expectedCompletionDate: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-slate-800 dark:text-slate-100"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Notes / Remarks (optional)
              </label>
              <textarea
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="e.g. Adjusted timeline due to editor workload"
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-20 resize-none text-xs text-slate-800 dark:text-slate-100"
              />
            </div>
            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs font-semibold shadow-2xs"
              >
                Confirm Modify & Approve
              </button>
            </div>
          </form>
        )}
      </CommonModal>

      {/* Version History Modal */}
      <CommonModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title="Correction Version & Message History"
        size="lg"
      >
        {selectedCorrection && (
          <div className="space-y-4 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
            <div>
              <h3 className="font-bold text-sm">File: {selectedCorrection.fileName}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Project Category Folder: <b>{selectedCorrection.workId?.category}</b> | Client: <b>{selectedCorrection.workId?.client?.name}</b> | Editor: <b>{selectedCorrection.workId?.editor?.name}</b>
              </p>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* Loop over history array */}
              {selectedCorrection.history.map((hist, idx) => (
                <div key={idx} className="border-b border-slate-100 dark:border-slate-800 pb-3 last:border-b-0 space-y-2">
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">VERSION {hist.version}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      hist.status === "Pending" ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400" : "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                    }`}>
                      {hist.status}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <CorrectionImagePreview fileId={hist.fileId} workId={selectedCorrection.workId?._id} />
                    <div className="flex-1 space-y-2.5">
                      <div className="bg-rose-50/40 p-3 rounded-xl text-xs">
                        <span className="font-bold text-rose-800 block text-[10px] uppercase">Client Request Comment:</span>
                        <p className="italic text-slate-700">"{hist.userComment || "No comment"}"</p>
                      </div>
                      {hist.editorNotes && (
                        <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-600">
                          <span className="font-bold text-slate-500 block text-[10px] uppercase">Editor Response Note:</span>
                          <p className="italic text-slate-700">"{hist.editorNotes}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Display current active version */}
              <div className="bg-slate-100/50 p-4 rounded-2xl border border-slate-200/50 space-y-3">
                <div className="flex justify-between items-center bg-slate-100 px-4 py-2 rounded-xl">
                  <span className="text-xs font-bold text-slate-800">LATEST VERSION (V{selectedCorrection.version})</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700`}>
                    {selectedCorrection.status}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <CorrectionImagePreview fileId={selectedCorrection.fileId} workId={selectedCorrection.workId?._id} />
                  <div className="flex-1 space-y-2.5">
                    <div className="bg-rose-50/40 p-3 rounded-xl text-xs">
                      <span className="font-bold text-rose-800 block text-[10px] uppercase">Client Request Comment:</span>
                      <p className="italic text-slate-700">"{selectedCorrection.userComment}"</p>
                    </div>
                    {selectedCorrection.editorNotes && (
                      <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-600">
                        <span className="font-bold text-slate-500 block text-[10px] uppercase">Editor Response Note:</span>
                        <p className="italic text-slate-700">"{selectedCorrection.editorNotes}"</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setHistoryModalOpen(false)}
                className="px-5 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition text-xs font-bold"
              >
                Close History Logs
              </button>
            </div>
          </div>
        )}
      </CommonModal>
    </div>
  );
};

export default ProjectManagement;