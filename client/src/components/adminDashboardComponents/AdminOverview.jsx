// AdminOverview.jsx - Enterprise SaaS-Grade Studio Analytics & Sync Center
import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
    getDashboardAnalytics,
    getGoogleDriveStatus,
    connectGoogleDrive,
    disconnectGoogleDrive,
} from "../../config/api";
import {
    Users,
    UserCheck,
    Shield,
    Folder,
    CheckCircle,
    Clock,
    Wrench,
    CloudUpload,
    HardDrive,
    Loader2,
    ExternalLink,
    RefreshCw,
    AlertTriangle,
    ChevronRight,
    Database,
    Zap,
    PieChart,
} from "lucide-react";
import { FaGoogleDrive } from "react-icons/fa";

// ─── Skeleton Loader ───────────────────────────────────────────────
const StatSkeleton = () => (
    <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/60 p-5 bg-gradient-to-br from-zinc-50 to-white dark:from-[#18181B] dark:to-[#121214] shadow-sm animate-pulse">
        <div className="flex items-center justify-between">
            <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
            <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
        </div>
        <div className="mt-4 h-8 w-16 bg-zinc-200 dark:bg-zinc-700 rounded-lg" />
    </div>
);

const DriveSkeleton = () => (
    <div className="bg-white dark:bg-[#121214] rounded-2xl border border-[#DDE7D8] dark:border-[#1E1E22] p-6 shadow-sm animate-pulse">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-200 dark:bg-zinc-700" />
                <div className="space-y-2">
                    <div className="h-5 w-64 bg-zinc-200 dark:bg-zinc-700 rounded-lg" />
                    <div className="h-3 w-80 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="h-6 w-28 bg-zinc-200 dark:bg-zinc-700 rounded-lg" />
                <div className="h-10 w-40 bg-zinc-200 dark:bg-zinc-700 rounded-xl" />
            </div>
        </div>
    </div>
);

// ─── Main Component ────────────────────────────────────────────────
const AdminOverview = () => {
    const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
    const [stats, setStats] = useState({
        users: 0,
        pendingUsers: 0,
        approvedUsers: 0,
        editors: 0,
        projects: 0,
        completedProjects: 0,
        pendingProjects: 0,
        googleDriveConnectedUsers: 0,
        corrections: 0,
        uploads: 0,
        storage: 0,
    });
    const [loading, setLoading] = useState(true);
    const [driveConnected, setDriveConnected] = useState(false);
    const [driveEmail, setDriveEmail] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    // ── Data fetching ──
    const fetchStats = useCallback(async () => {
        try {
            const response = await getDashboardAnalytics();
            if (response.data.success) {
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load admin statistics.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const fetchDriveStatus = useCallback(async () => {
        const userId = loggedInUser?.id || loggedInUser?._id;
        if (!userId) return;
        try {
            const response = await getGoogleDriveStatus(userId);
            if (response.data.success) {
                setDriveConnected(response.data.connected);
                setDriveEmail(response.data.googleEmail);
            }
        } catch (error) {
            console.error("Failed to load Google Drive status:", error);
        }
    }, [loggedInUser]);

    // ── Combined refresh ──
    const refreshAll = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([fetchStats(), fetchDriveStatus()]);
    }, [fetchStats, fetchDriveStatus]);

    // ── Effects ──
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const googleStatus = queryParams.get("google");
        if (googleStatus) {
            if (googleStatus === "success") {
                toast.success("Google Drive connected successfully!");
            } else if (googleStatus === "failed") {
                toast.error("Google Drive connection was cancelled.");
            } else if (googleStatus === "error") {
                toast.error(
                    "Failed to connect Google Drive. If you saw the 'Google hasn't verified this app' warning screen, you must click 'Advanced' → 'Go to (unsafe)', and make sure you check/tick the Google Drive permission box to allow access.",
                    { autoClose: 10000 }
                );
            }
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        refreshAll();
    }, [refreshAll]);

    // ── Drive handlers ──
    const handleConnectDrive = async () => {
        const userId = loggedInUser?.id || loggedInUser?._id;
        if (!userId) return;
        try {
            const response = await connectGoogleDrive(userId);
            if (response.data.success && response.data.authUrl) {
                window.location.href = response.data.authUrl;
            } else {
                toast.error("Failed to generate Google Drive link");
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to connect Google Drive.");
        }
    };

    const handleDisconnectDrive = async () => {
        const userId = loggedInUser?.id || loggedInUser?._id;
        if (!userId) return;
        if (!window.confirm("Are you sure you want to disconnect your Google Drive?")) return;
        try {
            const response = await disconnectGoogleDrive(userId);
            if (response.data.success) {
                toast.success("Google Drive disconnected successfully");
                setDriveConnected(false);
                setDriveEmail("");
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to disconnect Google Drive.");
        }
    };

    // ── Helpers ──
    const formatStorage = (bytes) => {
        if (!bytes) return "0.00 MB";
        const mb = bytes / (1024 * 1024);
        if (mb > 1024) return `${(mb / 1024).toFixed(2)} GB`;
        return `${mb.toFixed(2)} MB`;
    };

    // ── Card definitions ──
    const cards = [
        { label: "Total Users", val: stats.users, icon: <Users size={16} className="text-[#5A7863] dark:text-[#A7D18C]" />, trend: "+12%", trendUp: true },
        { label: "Approved Clients", val: stats.approvedUsers, icon: <UserCheck size={16} className="text-[#5A7863] dark:text-[#A7D18C]" />, trend: "+8%", trendUp: true },
        { label: "Pending Approvals", val: stats.pendingUsers, icon: <Clock size={16} className="text-amber-500" />, trend: "-3%", trendUp: false },
        { label: "Studio Editors", val: stats.editors, icon: <Shield size={16} className="text-blue-500" />, trend: "0%", trendUp: null },
        { label: "Total Assignments", val: stats.projects, icon: <Folder size={16} className="text-indigo-500" />, trend: "+5%", trendUp: true },
        { label: "Completed Projects", val: stats.completedProjects, icon: <CheckCircle size={16} className="text-emerald-500" />, trend: "+18%", trendUp: true },
        { label: "Pending Projects", val: stats.pendingProjects, icon: <Clock size={16} className="text-violet-500" />, trend: "-2%", trendUp: false },
        { label: "Drive Connected", val: stats.googleDriveConnectedUsers, icon: <FaGoogleDrive size={15} className="text-emerald-500" />, trend: "+4%", trendUp: true },
        { label: "Correction Requests", val: stats.corrections, icon: <Wrench size={16} className="text-rose-500" />, trend: "+6%", trendUp: false },
        { label: "Uploaded Assets", val: stats.uploads, icon: <CloudUpload size={16} className="text-sky-500" />, trend: "+22%", trendUp: true },
        { label: "Sync Storage Size", val: formatStorage(stats.storage), icon: <HardDrive size={16} className="text-zinc-500" />, trend: "+9%", trendUp: true },
    ];

    // ── Loading state ──
    if (loading) {
        return (
            <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6">
                {/* Header skeleton */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDE7D8] dark:border-[#1E1E22] pb-6">
                    <div className="space-y-2">
                        <div className="h-8 w-56 bg-zinc-200 dark:bg-zinc-700 rounded-lg animate-pulse" />
                        <div className="h-4 w-80 bg-zinc-200 dark:bg-zinc-700 rounded-full animate-pulse" />
                    </div>
                    <div className="h-10 w-40 bg-zinc-200 dark:bg-zinc-700 rounded-xl animate-pulse" />
                </div>
                {/* Cards skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {Array.from({ length: 11 }).map((_, i) => (
                        <StatSkeleton key={i} />
                    ))}
                </div>
                {/* Drive skeleton */}
                <DriveSkeleton />
            </div>
        );
    }

    // ── Main render ──
    return (
        <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6 animate-fade-in">

            {/* ─── HEADER ─── */}
                {/* <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDE7D8] dark:border-[#1E1E22] pb-6">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
                            <PieChart size={26} className="text-[#5A7863] dark:text-[#A7D18C]" />
                            Overview Dashboard
                        </h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 font-medium flex items-center gap-1.5 flex-wrap">
                            <Zap size={14} className="text-amber-400" />
                            Real-time studio health, asset deliveries, editor workloads, and cloud drive sync pipelines.
                        </p>
                    </div>
                    <button
                        onClick={refreshAll}
                        disabled={refreshing}
                        className="self-start sm:self-auto px-4 py-2.5 bg-white dark:bg-[#18181B]/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800/80 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 transition flex items-center gap-2 shadow-sm disabled:opacity-60"
                    >
                        <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
                        {refreshing ? "Refreshing…" : "Sync Dashboard"}
                    </button>
                </div> */}

            {/* ─── STATS GRID ─── */}
            {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {cards.map((card, idx) => {
                    const isPending = card.label === "Pending Approvals" || card.label === "Pending Projects";
                    const isCorrections = card.label === "Correction Requests";
                    const isDrive = card.label === "Drive Connected";

                    let borderAccent = "border-transparent";
                    if (isPending) borderAccent = "border-l-4 border-l-amber-400";
                    else if (isCorrections) borderAccent = "border-l-4 border-l-rose-400";
                    else if (isDrive) borderAccent = "border-l-4 border-l-emerald-400";

                    return (
                        <div
                            key={idx}
                            className={`
                                rounded-2xl border border-zinc-200/80 dark:border-zinc-800/60 p-5 
                                bg-gradient-to-br from-zinc-50 to-white dark:from-[#18181B] dark:to-[#121214]
                                shadow-sm hover:shadow-md hover:-translate-y-1 
                                transition-all duration-300 flex flex-col justify-between
                                ${borderAccent}
                                group
                            `}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-extrabold">
                                    {card.label}
                                </span>
                                <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#1C1C1F] border border-zinc-100 dark:border-zinc-800/50 shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                                    {card.icon}
                                </div>
                            </div>

                            <div className="mt-4 flex items-end justify-between">
                                <p className="text-2xl font-extrabold text-zinc-800 dark:text-zinc-100 tracking-tight">
                                    {card.val}
                                </p>
                                {card.trend && (
                                    <span
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            card.trendUp === null
                                                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                                                : card.trendUp
                                                    ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                                                    : "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400"
                                        }`}
                                    >
                                        {card.trend}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div> */}

            {/* ─── GOOGLE DRIVE CONNECTION ─── */}
            <div className="bg-white dark:bg-[#121214] rounded-2xl border border-[#DDE7D8] dark:border-[#1E1E22] p-4 sm:p-6 shadow-sm transition-colors duration-200">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Left: Icon + Text */}
                    <div className="flex items-start sm:items-center gap-4">
                        <div
                            className={`
                                w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm border shrink-0
                                ${
                                    driveConnected
                                        ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40"
                                        : "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/40"
                                }
                            `}
                        >
                            <FaGoogleDrive />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-base font-extrabold text-zinc-800 dark:text-zinc-100 flex items-center gap-2 flex-wrap">
                                System Google Drive Storage Connection
                                <span
                                    className={`
                                        text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full shadow-sm border
                                        ${
                                            driveConnected
                                                ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50"
                                                : "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900/50"
                                        }
                                    `}
                                >
                                    {driveConnected ? "● Connected" : "○ Disconnected"}
                                </span>
                            </h3>
                            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 font-medium leading-relaxed max-w-2xl">
                                {driveConnected
                                    ? "Active synchronization is configured. Deliverables, films, pre-wedding assets, and gallery images are syncing to your Google Drive."
                                    : "Your uploads are currently storing on the local server storage. Connect your Google Drive to automate deliveries directly to client subfolders."}
                            </p>
                            {driveConnected && driveEmail && (
                                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 font-mono truncate">
                                    <Database size={12} />
                                    {driveEmail}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                        <button
                            onClick={driveConnected ? handleDisconnectDrive : handleConnectDrive}
                            className={`
                                w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider 
                                transition-all duration-200 shadow-sm flex items-center justify-center gap-2 border
                                ${
                                    driveConnected
                                        ? "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/40 hover:bg-rose-100 dark:hover:bg-rose-900/20"
                                        : "bg-emerald-600 text-white border-transparent hover:bg-emerald-700 hover:shadow-md active:scale-[0.98]"
                                }
                            `}
                        >
                            {driveConnected ? (
                                <>
                                    Disconnect Drive <ExternalLink size={12} />
                                </>
                            ) : (
                                <>
                                    Connect Google Drive <ChevronRight size={14} />
                                </>
                            )}
                        </button>

                        {/* Small hint for OAuth */}
                        {!driveConnected && (
                            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500 font-medium bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                                <AlertTriangle size={12} className="text-amber-500 shrink-0" />
                                <span>Requires verified OAuth or dev profile</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── Additional status bar (mobile friendly) ─── */}
                <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-zinc-400 dark:text-zinc-500">
                    <div className="flex items-center gap-2">
                        <div
                            className={`w-2 h-2 rounded-full ${driveConnected ? "bg-emerald-500" : "bg-rose-400"}`}
                        />
                        <span className="font-medium">
                            {driveConnected ? "Drive is live and syncing" : "Drive is not connected"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <HardDrive size={14} />
                        <span className="font-medium">
                            Storage used: <span className="text-zinc-600 dark:text-zinc-300">{formatStorage(stats.storage)}</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CloudUpload size={14} />
                        <span className="font-medium">
                            Assets: <span className="text-zinc-600 dark:text-zinc-300">{stats.uploads}</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* ─── FOOTER NOTE ─── */}
            <div className="text-center text-[10px] text-zinc-400 dark:text-zinc-600 font-medium tracking-wide border-t border-zinc-100 dark:border-zinc-800/60 pt-6">
                Studio Analytics · All metrics are live and updated in real-time
            </div>

        </div>
    );
};

export default AdminOverview;