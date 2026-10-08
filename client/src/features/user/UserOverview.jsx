// UserOverview.jsx - Premium SaaS-Grade Client Overview Portal
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getDashboardAnalytics } from "../../config/api";
import {
  FolderOpen,
  Download,
  Image,
  AlertTriangle,
  Loader2,
  ChevronRight,
  Sparkles,
} from "lucide-react";

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

  const cards = [
    { label: "My Projects", val: stats.projects, icon: <FolderOpen size={16} className="text-emerald-600 dark:text-emerald-400" />, bg: "from-[#F0FDF4] to-[#DCFCE7]/20 dark:from-[#06200E] dark:to-[#09090B]" },
    { label: "Total Downloads", val: stats.downloads, icon: <Download size={16} className="text-amber-600 dark:text-amber-400" />, bg: "from-[#FFFBEB] to-[#FEF3C7]/20 dark:from-[#231A03] dark:to-[#09090B]" },
    { label: "Photo Albums", val: stats.albums, icon: <Image size={16} className="text-blue-600 dark:text-blue-400" />, bg: "from-[#EFF6FF] to-[#DBEAFE]/20 dark:from-[#0A172F] dark:to-[#09090B]" },
    { label: "Pending Corrections", val: stats.pendingCorrections, icon: <AlertTriangle size={16} className="text-rose-600 dark:text-rose-400" />, bg: "from-[#FFF5F5] to-[#FFE3E3]/20 dark:from-[#2F0F13] dark:to-[#09090B]" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="w-8 h-8 text-[#5A7863] dark:text-[#A7D18C] animate-spin" />
        <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Loading client dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {/* Header Panel */}
      <div className="border-b border-[#DDE7D8] dark:border-[#1E1E22] pb-6">
        <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
          Client Portal
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 font-medium">
          Welcome back to Shutter Studio. Track your photography deliveries, preview folders, and request corrections.
        </p>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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

      {/* Main Welcome/Information Banner */}
      <div className="relative rounded-2xl border border-[#DDE7D8] dark:border-[#1E1E22] bg-white dark:bg-[#121214] p-6 md:p-8 shadow-sm overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors duration-200">
        
        {/* Subtle decorative glow element inside background */}
        <div className="absolute -right-16 -top-16 w-32 h-32 bg-[#5A7863]/10 dark:bg-[#A7D18C]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-3 relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-[#5A7863] dark:text-[#A7D18C] uppercase tracking-widest">
            <Sparkles size={14} /> Premium Media Delivery
          </div>
          <h3 className="text-lg font-extrabold text-zinc-800 dark:text-zinc-100">All your media. Secured and synced.</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed font-medium">
            Your deliverables are synced securely through cloud systems. Preview, download, and request direct revisions / photo-retouches on items inside your dynamic grid gallery.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 relative z-10 w-full md:w-auto">
          <a
            href="/dashboard/gallery"
            className="flex-1 sm:flex-initial px-5 py-3 bg-[#5A7863] dark:bg-[#20271E] hover:bg-[#4A6853] dark:hover:bg-[#2C3729] text-white dark:text-[#A7D18C] rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 text-center shadow-sm flex items-center justify-center gap-1.5"
          >
            Open Gallery <ChevronRight size={14} />
          </a>
          <a
            href="/dashboard/my-projects"
            className="flex-1 sm:flex-initial px-5 py-3 bg-white dark:bg-[#18181B]/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800/80 text-zinc-600 dark:text-zinc-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 text-center shadow-sm"
          >
            View Projects
          </a>
        </div>
      </div>
    </div>
  );
};

export default UserOverview;
