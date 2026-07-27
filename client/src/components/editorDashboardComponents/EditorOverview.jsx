// EditorOverview.jsx - Premium SaaS-Grade Editor Analytics Panel
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getDashboardAnalytics } from "../../config/api";
import {
  Folder,
  Clock,
  RefreshCw,
  CheckCircle,
  Wrench,
  CloudUpload,
  Loader2,
} from "lucide-react";

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

  useEffect(() => {
    fetchStats();
  }, []);

  const cards = [
    { label: "Assigned Projects", val: stats.assignedProjects, icon: <Folder size={16} className="text-indigo-500" />, bg: "from-zinc-50 to-white dark:from-[#18181B] dark:to-[#121214]" },
    { label: "Pending Duration", val: stats.pendingDuration, icon: <Clock size={16} className="text-amber-500" />, bg: "from-zinc-50 to-white dark:from-[#18181B] dark:to-[#121214]" },
    { label: "Projects In Progress", val: stats.inProgress, icon: <Loader2 size={16} className="text-blue-500 animate-spin" />, bg: "from-zinc-50 to-white dark:from-[#18181B] dark:to-[#121214]" },
    { label: "Completed Projects", val: stats.completed, icon: <CheckCircle size={16} className="text-emerald-500" />, bg: "from-zinc-50 to-white dark:from-[#18181B] dark:to-[#121214]" },
    { label: "Active Corrections", val: stats.corrections, icon: <Wrench size={16} className="text-rose-500" />, bg: "from-zinc-50 to-white dark:from-[#18181B] dark:to-[#121214]" },
    { label: "Today's Uploads", val: stats.todaysUploads, icon: <CloudUpload size={16} className="text-sky-500" />, bg: "from-zinc-50 to-white dark:from-[#18181B] dark:to-[#121214]" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="w-8 h-8 text-[#5A7863] dark:text-[#A7D18C] animate-spin" />
        <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Fetching editor dashboard metrics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDE7D8] dark:border-[#1E1E22] pb-6">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
            Editor Workstation
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 font-medium">
            Track active video/photo assignments, estimate delivery timelines, and process client revisions.
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchStats();
          }}
          className="self-start sm:self-auto px-4 py-2.5 bg-white dark:bg-[#18181B]/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800/80 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 transition flex items-center gap-2 shadow-sm"
        >
          <RefreshCw size={12} /> Sync overview
        </button>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className={`
              rounded-2xl border border-zinc-200/80 dark:border-zinc-800/60 p-5 bg-gradient-to-br ${card.bg}
              shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between
            `}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-extrabold">{card.label}</span>
              <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#1C1C1F] border border-zinc-100 dark:border-zinc-800/50 shadow-sm flex items-center justify-center">
                {card.icon}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-extrabold text-zinc-800 dark:text-zinc-100 tracking-tight">{card.val}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditorOverview;