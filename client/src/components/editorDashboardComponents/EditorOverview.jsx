import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getDashboardAnalytics } from "../../config/api";
import {
  FaFolder,
  FaClock,
  FaSpinner,
  FaCheckCircle,
  FaWrench,
  FaCloudUploadAlt,
} from "react-icons/fa";

const EditorOverview = () => {
  const [stats, setStats] = useState({
    assignedProjects: 0,
    pendingDuration: 0,
    inProgress: 0,
    completed: 0,
    corrections: 0,
    todaysUploads: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getDashboardAnalytics();
        if (response.data.success) {
          setStats(response.data.stats);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load editor statistics.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Assigned Projects", val: stats.assignedProjects, icon: <FaFolder className="text-indigo-600" />, bg: "bg-indigo-50 border-indigo-100" },
    { label: "Pending Duration", val: stats.pendingDuration, icon: <FaClock className="text-amber-600" />, bg: "bg-amber-50 border-amber-100" },
    { label: "Projects In Progress", val: stats.inProgress, icon: <FaSpinner className="text-blue-600 animate-spin" />, bg: "bg-blue-50 border-blue-100" },
    { label: "Completed Projects", val: stats.completed, icon: <FaCheckCircle className="text-green-600" />, bg: "bg-green-50 border-green-100" },
    { label: "Active Corrections", val: stats.corrections, icon: <FaWrench className="text-rose-600" />, bg: "bg-rose-50 border-rose-100" },
    { label: "Today's Uploads", val: stats.todaysUploads, icon: <FaCloudUploadAlt className="text-sky-600" />, bg: "bg-sky-50 border-sky-100" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <FaSpinner className="text-[#5A7863] animate-spin text-3xl" />
        <p className="text-sm text-[#3B4953]/60">Fetching editor dashboard metrics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-[#DDE7D8] pb-5">
        <h2 className="text-2xl font-extrabold text-[#3B4953] tracking-tight">
          Editor Overview
        </h2>
        <p className="text-sm text-[#3B4953]/60 mt-1">
          Review assignments workload, timeline estimates, progress delivery, and edit revision request logs.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card, idx) => (
          <div key={idx} className={`rounded-3xl border p-5 bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition ${card.bg}`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">{card.label}</span>
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-md">
                {card.icon}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-extrabold text-slate-800">{card.val}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditorOverview;