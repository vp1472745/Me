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
        { label: "Total Users", val: stats.users, icon: <Users size={13} className="text-blue-600 dark:text-blue-400" />, trend: "+12%", trendUp: true },
        { label: "Approved Clients", val: stats.approvedUsers, icon: <UserCheck size={13} className="text-blue-600 dark:text-blue-400" />, trend: "+8%", trendUp: true },
        { label: "Pending Approvals", val: stats.pendingUsers, icon: <Clock size={13} className="text-amber-500" />, trend: "-3%", trendUp: false },
        { label: "Studio Editors", val: stats.editors, icon: <Shield size={13} className="text-blue-500" />, trend: "0%", trendUp: null },
        { label: "Total Assignments", val: stats.projects, icon: <Folder size={13} className="text-indigo-500" />, trend: "+5%", trendUp: true },
        { label: "Completed Projects", val: stats.completedProjects, icon: <CheckCircle size={13} className="text-emerald-500" />, trend: "+18%", trendUp: true },
        { label: "Pending Projects", val: stats.pendingProjects, icon: <Clock size={13} className="text-violet-500" />, trend: "-2%", trendUp: false },
        { label: "Drive Connected", val: stats.googleDriveConnectedUsers, icon: <FaGoogleDrive size={12} className="text-emerald-500" />, trend: "+4%", trendUp: true },
        { label: "Correction Requests", val: stats.corrections, icon: <Wrench size={13} className="text-rose-500" />, trend: "+6%", trendUp: false },
        { label: "Uploaded Assets", val: stats.uploads, icon: <CloudUpload size={13} className="text-sky-500" />, trend: "+22%", trendUp: true },
        { label: "Sync Storage Size", val: formatStorage(stats.storage), icon: <HardDrive size={13} className="text-slate-500" />, trend: "+9%", trendUp: true },
    ];

    // ── Main render ──
    return (
        <div className="animate-fade-in text-xs sm:text-sm space-y-4">
            {/* ─── COMPACT STATS GRID ─── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {cards.map((card, idx) => {
                    const isPending = card.label === "Pending Approvals" || card.label === "Pending Projects";
                    const isCorrections = card.label === "Correction Requests";
                    const isDrive = card.label === "Drive Connected";

                    let borderAccent = "border-slate-200/80 dark:border-slate-800";
                    if (isPending) borderAccent = "border-l-2 border-l-amber-400 border-slate-200/80 dark:border-slate-800";
                    else if (isCorrections) borderAccent = "border-l-2 border-l-rose-400 border-slate-200/80 dark:border-slate-800";
                    else if (isDrive) borderAccent = "border-l-2 border-l-blue-500 border-slate-200/80 dark:border-slate-800";

                    return (
                        <div
                            key={idx}
                            className={`
                                rounded-lg border p-2 sm:p-2.5
                                bg-white dark:bg-[#111827]
                                shadow-2xs hover:shadow-xs 
                                transition-all duration-150 flex flex-col justify-between
                                ${borderAccent}
                            `}
                        >
                            <div className="flex items-center justify-between gap-1.5">
                                <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold truncate">
                                    {card.label}
                                </span>
                                <div className="w-5 h-5 rounded bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center shrink-0">
                                    {card.icon}
                                </div>
                            </div>

                            <div className="mt-1.5 flex items-baseline justify-between gap-1">
                                <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight truncate">
                                    {card.val}
                                </p>
                                {card.trend && (
                                    <span
                                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                                            card.trendUp === null
                                                ? "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                                : card.trendUp
                                                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                                                    : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                                        }`}
                                    >
                                        {card.trend}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ─── COMPACT GOOGLE DRIVE CONNECTION ─── */}
            <div className="bg-white dark:bg-[#111827] rounded-lg border border-slate-200/80 dark:border-slate-800 p-2.5 sm:p-3 shadow-2xs transition-colors duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    {/* Left: Icon + Text */}
                    <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                        <div
                            className={`
                                w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-2xs border shrink-0
                                ${
                                    driveConnected
                                        ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/40"
                                        : "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/40"
                                }
                            `}
                        >
                            <FaGoogleDrive />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                                    Google Drive Cloud Sync
                                </h3>
                                <span
                                    className={`
                                        text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-full border shrink-0
                                        ${
                                            driveConnected
                                                ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                                                : "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900/50"
                                        }
                                    `}
                                >
                                    {driveConnected ? "Connected" : "Disconnected"}
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-normal max-w-xl truncate mt-0.5">
                                {driveConnected
                                    ? "Active synchronization configured for deliverables, films, and assets."
                                    : "Connect Google Drive to deliver files directly to client folders."}
                            </p>
                            {driveConnected && driveEmail && (
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate mt-0.5">
                                    <Database size={10} className="text-blue-600 shrink-0" />
                                    <span className="truncate">{driveEmail}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                        <button
                            onClick={driveConnected ? handleDisconnectDrive : handleConnectDrive}
                            className={`
                                w-full sm:w-auto px-3 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider 
                                transition-all duration-150 shadow-2xs flex items-center justify-center gap-1.5 border
                                ${
                                    driveConnected
                                        ? "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/40 hover:bg-rose-100"
                                        : "bg-blue-600 text-white border-transparent hover:bg-blue-700 active:scale-[0.99]"
                                }
                            `}
                        >
                            {driveConnected ? (
                                <>
                                    Disconnect Drive <ExternalLink size={10} />
                                </>
                            ) : (
                                <>
                                    Connect Drive <ChevronRight size={11} />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Additional status bar */}
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 dark:text-slate-500">
                    <div className="flex items-center gap-1.5">
                        <div
                            className={`w-1.5 h-1.5 rounded-full ${driveConnected ? "bg-blue-500" : "bg-rose-400"}`}
                        />
                        <span className="font-medium">
                            {driveConnected ? "Drive is live and syncing" : "Drive is not connected"}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <HardDrive size={11} className="text-blue-500" />
                        <span className="font-medium">
                            Storage used: <span className="text-slate-700 dark:text-slate-300 font-semibold">{formatStorage(stats.storage)}</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <CloudUpload size={11} className="text-blue-500" />
                        <span className="font-medium">
                            Assets: <span className="text-slate-700 dark:text-slate-300 font-semibold">{stats.uploads}</span>
                        </span>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default AdminOverview;