import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getWorkAssignments } from "../../config/api";
import { FaFolder, FaRegCalendarAlt, FaUserEdit, FaSpinner, FaClock } from "react-icons/fa";

const MyProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getWorkAssignments();
        if (response.data.success) {
          setProjects(response.data.projects);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load projects list.");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const getStatusBadge = (status) => {
    const badges = {
      WAITING_FOR_EDITOR: "bg-amber-50 text-amber-700 border border-amber-200",
      WAITING_FOR_ADMIN_APPROVAL: "bg-blue-50 text-blue-700 border border-blue-200",
      IN_PROGRESS: "bg-indigo-50 text-indigo-700 border border-indigo-200",
      NEEDS_CORRECTION: "bg-rose-50 text-rose-700 border border-rose-200",
      COMPLETED: "bg-green-50 text-green-700 border border-green-200",
    };
    return badges[status] || "bg-gray-50 text-gray-700 border border-gray-200";
  };

  const formatStatusText = (status) => {
    return status.replace(/_/g, " ");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <FaSpinner className="text-[#5A7863] animate-spin text-3xl" />
        <p className="text-sm text-[#3B4953]/60">Fetching project listings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-[#DDE7D8] pb-5">
        <h2 className="text-2xl font-extrabold text-[#3B4953] tracking-tight">
          My Active Projects
        </h2>
        <p className="text-sm text-[#3B4953]/60 mt-1">
          Review progress schedules, assign editors, expected delivery timelines, and statuses.
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#DDE7D8] p-16 text-center max-w-lg mx-auto">
          <FaFolder className="text-5xl text-[#D5E0D0] mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#3B4953]">No active projects</h3>
          <p className="text-sm text-[#3B4953]/60 mt-1">
            You don't have any studio editing projects assigned to your account yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {projects.map((proj) => (
            <div key={proj._id} className="bg-white border border-[#DDE7D8] rounded-3xl p-5 hover:shadow-md transition duration-350">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#EBF4DD] text-[#5A7863] flex items-center justify-center">
                    <FaFolder />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-lg">{proj.category}</h3>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider mt-1.5 inline-block ${getStatusBadge(proj.status)}`}>
                      {formatStatusText(proj.status)}
                    </span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 text-[10px] font-bold tracking-wider rounded-md uppercase ${
                  proj.priority === "HIGH" ? "bg-red-50 text-red-600" : proj.priority === "MEDIUM" ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"
                }`}>
                  {proj.priority} PRIORITY
                </span>
              </div>

              <div className="mt-6 space-y-3.5 border-t border-slate-100 pt-4">
                <div className="flex items-center text-sm text-slate-600 justify-between">
                  <span className="flex items-center gap-1.5 font-medium"><FaUserEdit className="text-slate-400" /> Editor:</span>
                  <span className="font-semibold text-slate-700">{proj.editor?.name || "Unassigned"}</span>
                </div>
                <div className="flex items-center text-sm text-slate-600 justify-between">
                  <span className="flex items-center gap-1.5 font-medium"><FaRegCalendarAlt className="text-slate-400" /> Target Delivery:</span>
                  <span className="font-semibold text-slate-700">
                    {proj.deliveryDate ? new Date(proj.deliveryDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                  </span>
                </div>
                {proj.duration?.estimated && (
                  <div className="flex items-center text-sm text-slate-600 justify-between">
                    <span className="flex items-center gap-1.5 font-medium"><FaClock className="text-slate-400" /> Estimated Duration:</span>
                    <span className="font-semibold text-slate-700">{proj.duration.estimated}</span>
                  </div>
                )}
                {proj.duration?.expectedCompletionDate && (
                  <div className="flex items-center text-sm text-slate-600 justify-between">
                    <span className="flex items-center gap-1.5 font-medium"><FaRegCalendarAlt className="text-slate-400" /> Expected Completion:</span>
                    <span className="font-semibold text-slate-700">
                      {new Date(proj.duration.expectedCompletionDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProjects;
