import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getDashboardAnalytics } from "../../config/api";
import {
  FaFolderOpen,
  FaDownload,
  FaImages,
  FaExclamationTriangle,
  FaBell,
  FaSpinner,
} from "react-icons/fa";

const UserOverview = () => {
  const [stats, setStats] = useState({
    projects: 0,
    downloads: 0,
    albums: 0,
    pendingCorrections: 0,
    unreadNotifications: 0,
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
        toast.error("Failed to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cardTones = [
    { label: "My Projects", val: stats.projects, icon: <FaFolderOpen />, bg: "bg-emerald-50 border-emerald-100 text-emerald-700" },
    { label: "Total Downloads", val: stats.downloads, icon: <FaDownload />, bg: "bg-amber-50 border-amber-100 text-amber-700" },
    { label: "Photo Albums", val: stats.albums, icon: <FaImages />, bg: "bg-blue-50 border-blue-100 text-blue-700" },
    { label: "Pending Corrections", val: stats.pendingCorrections, icon: <FaExclamationTriangle />, bg: "bg-rose-50 border-rose-100 text-rose-700" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <FaSpinner className="text-[#5A7863] animate-spin text-3xl" />
        <p className="text-sm text-[#3B4953]/60">Loading client dashboard statistics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-[#DDE7D8] pb-5">
        <h2 className="text-2xl font-extrabold text-[#3B4953] tracking-tight">
          Client Portal Home
        </h2>
        <p className="text-sm text-[#3B4953]/60 mt-1">
          Welcome to your Shutter Studio dashboard. Track deliverables, request corrections, and view your galleries.
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cardTones.map((card, idx) => (
          <div key={idx} className={`rounded-2xl border p-5 bg-gradient-to-br from-white to-slate-50/20 shadow-sm ${card.bg}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">{card.label}</p>
                <p className="text-3xl font-extrabold text-slate-800 mt-1">{card.val}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-lg border border-slate-100">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Welcome Banner */}
      <div className="rounded-3xl border border-[#DDE7D8] bg-white p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <div className="flex-1 space-y-3 text-center md:text-left">
          <h3 className="text-xl font-bold text-[#3B4953]">All-In-One Media Delivery</h3>
          <p className="text-sm text-[#3B4953]/70 max-w-2xl leading-relaxed">
            Your photos and videos are stored securely in your personal Google Drive, synchronized directly with our studios. You can view, download, mark favorites, and request specific corrections at any time!
          </p>
          <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-3">
            <a
              href="/dashboard/gallery"
              className="px-5 py-2.5 bg-[#5A7863] text-white rounded-xl text-xs font-semibold uppercase tracking-wider shadow-sm hover:bg-[#4A6853] transition"
            >
              Browse Gallery
            </a>
            <a
              href="/dashboard/my-projects"
              className="px-5 py-2.5 bg-white border border-[#DDE7D8] text-[#5A7863] rounded-xl text-xs font-semibold uppercase tracking-wider shadow-sm hover:bg-[#EEF6EC]/30 transition"
            >
              View My Projects
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserOverview;
