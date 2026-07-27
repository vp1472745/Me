import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { 
  getDashboardAnalytics,
  getGoogleDriveStatus,
  connectGoogleDrive,
  disconnectGoogleDrive 
} from "../../config/api";
import {
  FaUsers,
  FaUserClock,
  FaUserShield,
  FaFolder,
  FaCheckCircle,
  FaClock,
  FaGoogleDrive,
  FaWrench,
  FaCloudUploadAlt,
  FaHdd,
  FaSpinner,
} from "react-icons/fa";

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

  useEffect(() => {
    // Parse Google Drive OAuth callback results from URL query parameters
    const queryParams = new URLSearchParams(window.location.search);
    const googleStatus = queryParams.get("google");
    if (googleStatus) {
      if (googleStatus === "success") {
        toast.success("Google Drive connected successfully!");
      } else if (googleStatus === "failed") {
        toast.error("Google Drive connection was cancelled.");
      } else if (googleStatus === "error") {
        toast.error(
          "Failed to connect Google Drive. If you saw the 'Google hasn't verified this app' warning screen, you must click 'Advanced' -> 'Go to (unsafe)', and make sure you check/tick the Google Drive permission box to allow access.",
          { autoClose: 10000 }
        );
      }
      // Clean query parameters from URL without reloading page
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const fetchStats = async () => {
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
      }
    };

    const fetchDriveStatus = async () => {
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
    };

    fetchStats();
    fetchDriveStatus();
  }, []);

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

  const formatStorage = (bytes) => {
    if (!bytes) return "0.00 MB";
    const mb = bytes / (1024 * 1024);
    if (mb > 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(2)} MB`;
  };

  const cards = [
    { label: "Total Users", val: stats.users, icon: <FaUsers className="text-emerald-600" />, bg: "bg-emerald-50 border-emerald-100" },
    { label: "Approved Clients", val: stats.approvedUsers, icon: <FaCheckCircle className="text-emerald-600" />, bg: "bg-emerald-50/50 border-emerald-100/50" },
    { label: "Pending Approvals", val: stats.pendingUsers, icon: <FaUserClock className="text-amber-600" />, bg: "bg-amber-50 border-amber-100" },
    { label: "Studio Editors", val: stats.editors, icon: <FaUserShield className="text-blue-600" />, bg: "bg-blue-50 border-blue-100" },
    { label: "Total Assignments", val: stats.projects, icon: <FaFolder className="text-indigo-600" />, bg: "bg-indigo-50 border-indigo-100" },
    { label: "Completed Projects", val: stats.completedProjects, icon: <FaCheckCircle className="text-green-600" />, bg: "bg-green-50 border-green-100" },
    { label: "Pending Projects", val: stats.pendingProjects, icon: <FaClock className="text-purple-600" />, bg: "bg-purple-50 border-purple-100" },
    { label: "Drive Connected", val: stats.googleDriveConnectedUsers, icon: <FaGoogleDrive className="text-emerald-700" />, bg: "bg-teal-50 border-teal-100" },
    { label: "Correction Requests", val: stats.corrections, icon: <FaWrench className="text-rose-600" />, bg: "bg-rose-50 border-rose-100" },
    { label: "Uploaded Assets", val: stats.uploads, icon: <FaCloudUploadAlt className="text-sky-600" />, bg: "bg-sky-50 border-sky-100" },
    { label: "Sync Storage Size", val: formatStorage(stats.storage), icon: <FaHdd className="text-slate-600" />, bg: "bg-slate-50 border-slate-200" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <FaSpinner className="text-[#5A7863] animate-spin text-3xl" />
        <p className="text-sm text-[#3B4953]/60">Compiling studio statistics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-[#DDE7D8] pb-5">
        <h2 className="text-2xl font-extrabold text-[#3B4953] tracking-tight">
          Admin Overview Dashboard
        </h2>
        <p className="text-sm text-[#3B4953]/60 mt-1">
          Real-time metrics, assignments progress, user registration approvals, and cloud drive sync metrics.
        </p>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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

      {/* Google Drive Connection Section */}
      <div className="bg-white rounded-3xl border border-[#DDE7D8] p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
            driveConnected ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          }`}>
            <FaGoogleDrive />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Admin Google Drive Sync</h3>
            <p className="text-xs text-slate-400">
              {driveConnected 
                ? `Syncing Hero Content, Stories, Photo Books, Gallery, Films, and Pre-Wedding to Google Drive.`
                : `Uploads are currently saving to local server storage because Google Drive is not connected.`}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
          <div className="text-sm font-semibold text-slate-700">
            Status: {" "}
            <span className={driveConnected ? "text-emerald-600" : "text-rose-600"}>
              {driveConnected ? `Connected (${driveEmail})` : "Not Connected"}
            </span>
          </div>

          <button
            onClick={driveConnected ? handleDisconnectDrive : handleConnectDrive}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
              driveConnected 
                ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
            }`}
          >
            {driveConnected ? "Disconnect Account" : "Connect Google Drive"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
