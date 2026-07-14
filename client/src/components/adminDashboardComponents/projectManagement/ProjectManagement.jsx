import React, { useState, useEffect } from "react";
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
import CommonModal from "../../commonComponents/CommonModelComponents";
import {
  getAllDirectoryUsers,
  getWorkAssignments,
  createWorkAssignment,
  approveWorkDuration,
  getCorrectionsList,
  downloadGalleryFile,
} from "../../../config/api";

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
    category: "Wedding",
    deliveryDate: "",
  });

  const [editForm, setEditForm] = useState({
    estimatedDuration: "",
    expectedCompletionDate: "",
    notes: "",
  });

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

  const handleAssignWork = async (e) => {
    e.preventDefault();
    if (!form.client || !form.editor || !form.deliveryDate) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        client: form.client,
        editor: form.editor,
        category: form.category,
        priority: "MEDIUM",
        deliveryDate: form.deliveryDate,
      };

      const res = await createWorkAssignment(payload);
      if (res.data.success) {
        toast.success("Project assigned successfully.");
        setForm({
          client: "",
          editor: "",
          category: "Wedding",
          deliveryDate: "",
        });
        setAssignModalOpen(false);
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
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-[#F7F9F4] min-h-screen text-[#3B4953]">
      <ToastContainer />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#DDE7D8] pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[#3B4953] flex items-center gap-2">
            <FaFolder className="text-[#5A7863]" /> Project Assignments & Timelines
          </h1>
          <p className="text-sm text-[#3B4953]/60 mt-1">
            Assign client subfolders to editors, review timeline durations, and manage production workflow.
          </p>
        </div>
        {activeTab === "assignments" && (
          <button
            onClick={() => setAssignModalOpen(true)}
            className="self-start sm:self-center px-5 py-2.5 bg-[#5A7863] text-white hover:bg-[#4B6654] text-sm font-bold rounded-2xl transition flex items-center gap-2 shadow-sm"
          >
            <FaPlus /> Assign Work
          </button>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-[#DDE7D8] gap-6">
        <button
          onClick={() => setActiveTab("assignments")}
          className={`pb-3 text-sm font-extrabold border-b-2 transition-all ${
            activeTab === "assignments"
              ? "border-[#5A7863] text-[#5A7863]"
              : "border-transparent text-slate-400 hover:text-slate-650"
          }`}
        >
          Assignments Overview ({projects.length})
        </button>
        <button
          onClick={() => setActiveTab("corrections")}
          className={`pb-3 text-sm font-extrabold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "corrections"
              ? "border-rose-500 text-rose-600"
              : "border-transparent text-slate-400 hover:text-slate-650"
          }`}
        >
          Correction Feedback logs ({corrections.length})
        </button>
      </div>

      {/* Dynamic Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <FaSpinner className="animate-spin text-[#5A7863] text-3xl" />
          <p className="text-sm text-[#3B4953]/60">Loading production database...</p>
        </div>
      ) : activeTab === "assignments" ? (
        /* ==================== ASSIGNMENTS TAB ==================== */
        <div className="space-y-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#DDE7D8] rounded-2xl p-4 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center flex-shrink-0">
                <FaTasks />
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">Total Assigned</span>
                <span className="text-xl font-black text-slate-800">{totalAssigned}</span>
              </div>
            </div>
            <div className="bg-white border border-[#DDE7D8] rounded-2xl p-4 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                <FaClock />
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">Wait Estimate</span>
                <span className="text-xl font-black text-slate-850">{awaitingEstimates}</span>
              </div>
            </div>
            <div className="bg-white border border-[#DDE7D8] rounded-2xl p-4 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <FaHistory />
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">Wait Approval</span>
                <span className="text-xl font-black text-slate-850">{pendingApprovals}</span>
              </div>
            </div>
            <div className="bg-white border border-[#DDE7D8] rounded-2xl p-4 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <FaFolderOpen />
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">In Progress</span>
                <span className="text-xl font-black text-slate-850">{inProgress}</span>
              </div>
            </div>
          </div>

          {/* Search and Filters Action Panel */}
          <div className="bg-white border border-[#DDE7D8] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <FaSearch className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search Client or Editor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#5A7863] text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-[#F7F9F4] px-3.5 py-1.5 rounded-xl border border-slate-200 w-full sm:w-auto">
                <FaFilter className="text-slate-400 text-xs" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent outline-none text-xs font-bold text-slate-700 w-full"
                >
                  <option value="All">All Statuses</option>
                  <option value="WAITING_FOR_EDITOR">Awaiting Estimate</option>
                  <option value="WAITING_FOR_ADMIN_APPROVAL">Pending Approval</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="DELIVERED">Delivered</option>
                </select>
              </div>

              <div className="flex items-center gap-2 bg-[#F7F9F4] px-3.5 py-1.5 rounded-xl border border-slate-200 w-full sm:w-auto">
                <FaFolder className="text-slate-400 text-xs" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-transparent outline-none text-xs font-bold text-slate-700 w-full"
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
          <div className="bg-white border border-[#DDE7D8] rounded-2xl shadow-sm overflow-x-auto">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-slate-400 font-semibold">No assigned works match the filters.</p>
              </div>
            ) : (
              <table className="w-full border-collapse text-left text-sm text-slate-700">
                <thead>
                  <tr className="border-b border-[#DDE7D8] bg-[#F7F9F4]">
                    <th className="px-6 py-4 font-extrabold text-xs uppercase tracking-wider text-slate-500">Client Details</th>
                    <th className="px-6 py-4 font-extrabold text-xs uppercase tracking-wider text-slate-500">Assigned Editor</th>
                    <th className="px-6 py-4 font-extrabold text-xs uppercase tracking-wider text-slate-500">Target Folder</th>
                    <th className="px-6 py-4 font-extrabold text-xs uppercase tracking-wider text-slate-500">Target Date</th>
                    <th className="px-6 py-4 font-extrabold text-xs uppercase tracking-wider text-slate-500">Duration Estimate</th>
                    <th className="px-6 py-4 font-extrabold text-xs uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-6 py-4 font-extrabold text-xs uppercase tracking-wider text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProjects.map((proj) => (
                    <tr key={proj._id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{proj.client?.name || "Deleted User"}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{proj.client?.email}</div>
                        {proj.client?.googleDrive?.connected ? (
                          <span className="inline-flex items-center gap-1 text-[9px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded mt-1 font-semibold">
                            <FaGoogleDrive /> Linked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded mt-1 font-semibold">
                            <FaGoogleDrive /> Unlinked
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{proj.editor?.name || "Deleted Editor"}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{proj.editor?.email}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-[#5A7863]">
                        <span className="bg-[#EBF4DD] px-2.5 py-1 rounded-lg text-xs">
                          {proj.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-600">
                        {proj.deliveryDate ? new Date(proj.deliveryDate).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        {proj.duration?.estimated ? (
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-800">{proj.duration.estimated}</div>
                            <div className="text-[10px] text-slate-400">
                              Exp: {proj.duration.expectedCompletionDate ? new Date(proj.duration.expectedCompletionDate).toLocaleDateString() : "N/A"}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs italic text-slate-400">Awaiting...</span>
                        )}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(proj.status)}</td>
                      <td className="px-6 py-4 text-right">
                        {proj.status === "WAITING_FOR_ADMIN_APPROVAL" ? (
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleApprove(proj._id)}
                              title="Approve Estimate"
                              className="w-8 h-8 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 flex items-center justify-center transition"
                            >
                              <FaCheck size={12} />
                            </button>
                            <button
                              onClick={() => openEditModal(proj)}
                              title="Modify & Approve"
                              className="w-8 h-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 flex items-center justify-center transition"
                            >
                              <FaEdit size={12} />
                            </button>
                            <button
                              onClick={() => handleReject(proj._id)}
                              title="Reject Estimate"
                              className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center justify-center transition"
                            >
                              <FaTimes size={12} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No pending action</span>
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
          <div className="text-center py-20 bg-white border border-[#DDE7D8] rounded-3xl p-12">
            <p className="text-[#3B4953]/60 font-semibold">No file correction requests found in history.</p>
          </div>
        ) : (
          <div className="space-y-6 max-w-5xl mx-auto">
            {corrections.map((corr) => (
              <div key={corr._id} className="bg-white border border-[#DDE7D8] rounded-3xl p-6 shadow-sm hover:shadow-md transition space-y-4 text-slate-800">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base">File: {corr.fileName}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Project Category Folder: <b>{corr.workId?.category}</b></p>
                  </div>
                  <div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      corr.status === "Pending"
                        ? "bg-rose-50 text-rose-700 border-rose-100"
                        : corr.status === "In Progress"
                        ? "bg-amber-50 text-amber-700 border-amber-100"
                        : "bg-green-50 text-green-700 border-green-100"
                    }`}>
                      {corr.status}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Left Column: Image Preview */}
                  <div className="flex-shrink-0">
                    <CorrectionImagePreview fileId={corr.fileId} workId={corr.workId?._id} />
                  </div>

                  {/* Right Column: User-Editor Notes */}
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-500">
                      <div>
                        <span className="font-semibold text-slate-400 block uppercase">Client Details</span>
                        <span className="font-bold text-slate-800">{corr.workId?.client?.name || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400 block uppercase">Editor Assigned</span>
                        <span className="font-bold text-slate-800">{corr.workId?.editor?.name || "N/A"}</span>
                      </div>
                    </div>

                    <div className="bg-rose-50/50 border border-rose-100/50 rounded-2xl p-4 text-sm">
                      <span className="font-bold text-rose-800 text-[10px] uppercase tracking-wide block mb-1">Latest Client Request Comment:</span>
                      <p className="italic text-slate-700 text-sm">"{corr.userComment}"</p>
                    </div>

                    {corr.editorNotes && (
                      <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 text-xs text-slate-600">
                        <span className="font-bold text-slate-500 block uppercase tracking-wide mb-1">Latest Editor Response Note:</span>
                        <p className="italic">"{corr.editorNotes}"</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadFile(corr.fileId, corr.workId?._id, corr.fileName)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <FaDownload /> Download Original
                      </button>
                    </div>
                  </div>
                </div>

                {/* View History Button */}
                {corr.history && corr.history.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => {
                        setSelectedCorrection(corr);
                        setHistoryModalOpen(true);
                      }}
                      className="px-4 py-2 bg-[#5A7863] hover:bg-[#4B6654] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                    >
                      <FaHistory /> View Version & Message History ({corr.history.length})
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
        <form onSubmit={handleAssignWork} className="space-y-4 text-slate-850">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Client <span className="text-rose-500">*</span></label>
            <select
              name="client"
              value={form.client}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-350 outline-none focus:ring-2 focus:ring-[#5A7863] text-sm"
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
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Editor <span className="text-rose-500">*</span></label>
            <select
              name="editor"
              value={form.editor}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-350 outline-none focus:ring-2 focus:ring-[#5A7863] text-sm"
            >
              <option value="">-- Choose Editor --</option>
              {editors.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Target Subfolder</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-350 outline-none focus:ring-2 focus:ring-[#5A7863] text-sm"
            >
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

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Target Completion Date <span className="text-rose-500">*</span></label>
            <input
              type="date"
              name="deliveryDate"
              value={form.deliveryDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-350 outline-none focus:ring-2 focus:ring-[#5A7863] text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAssignModalOpen(false)}
              className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-[#5A7863] text-white rounded-xl font-bold hover:bg-[#4B6654] transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm text-xs"
            >
              {submitting ? <FaSpinner className="animate-spin" /> : <FaUserCheck />} Confirm Assignment
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
          <form onSubmit={handleEditConfirm} className="space-y-4 text-slate-800">
            <div>
              <p className="text-sm text-slate-500 mb-2">
                Project Category: <b>{selectedProject.category}</b> for Client <b>{selectedProject.client?.name}</b>
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Estimated Duration (e.g. 10 Days)
              </label>
              <input
                type="text"
                value={editForm.estimatedDuration}
                onChange={(e) => setEditForm({ ...editForm, estimatedDuration: e.target.value })}
                placeholder="e.g. 10 Days"
                className="w-full h-11 px-4 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-[#5A7863]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Expected Completion Date
              </label>
              <input
                type="date"
                value={editForm.expectedCompletionDate}
                onChange={(e) => setEditForm({ ...editForm, expectedCompletionDate: e.target.value })}
                className="w-full h-11 px-4 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-[#5A7863]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Notes / Remarks (optional)
              </label>
              <textarea
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="e.g. Adjusted timeline due to editor workload"
                className="w-full p-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-[#5A7863] h-24 resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-xs font-bold"
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
          <div className="space-y-6 text-slate-800">
            <div>
              <h3 className="font-extrabold text-base">File: {selectedCorrection.fileName}</h3>
              <p className="text-xs text-slate-500 mt-1">
                Project Category Folder: <b>{selectedCorrection.workId?.category}</b> | Client: <b>{selectedCorrection.workId?.client?.name}</b> | Editor: <b>{selectedCorrection.workId?.editor?.name}</b>
              </p>
            </div>

            <div className="border-t border-slate-200 pt-4 space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {/* Loop over history array */}
              {selectedCorrection.history.map((hist, idx) => (
                <div key={idx} className="border-b border-slate-100 pb-5 last:border-b-0 space-y-3">
                  <div className="flex justify-between items-center bg-slate-50 px-4 py-2 rounded-xl">
                    <span className="text-xs font-bold text-[#5A7863]">VERSION {hist.version}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      hist.status === "Pending" ? "bg-rose-50 text-rose-700" : "bg-green-50 text-green-700"
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