import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getAdminUsers,
  getAdminEditors,
  getAdminPendingUsers,
  approveUserRequest,
  rejectUserRequest,
  connectGoogleDrive,
  disconnectGoogleDrive,
  sendGoogleDriveLinkEmail,
} from "../../config/api";
import {
  FaUser,
  FaEnvelope,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaUsers,
  FaUserShield,
  FaClock,
} from "react-icons/fa";

function AdminUsers() {
  const [activeTab, setActiveTab] = useState("users"); // 'users', 'editors', 'pending'
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // stores userId being approved/rejected

  const fetchData = async () => {
    setLoading(true);
    try {
      let response;
      if (activeTab === "users") {
        response = await getAdminUsers();
        setUsers(response.data.users || []);
      } else if (activeTab === "editors") {
        response = await getAdminEditors();
        setUsers(response.data.editors || []);
      } else if (activeTab === "pending") {
        response = await getAdminPendingUsers();
        setUsers(response.data.pendingUsers || []);
      }
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setTimeout(() => {
          window.location.replace("/adminlogin");
        }, 1500);
      } else {
        toast.error(error.response?.data?.message || "Failed to fetch user data");
      }
    } finally {
      setLoading(false);
    }
  };

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
  }, []);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleApprove = async (userId) => {
    setActionLoading(userId);
    try {
      const response = await approveUserRequest(userId);
      toast.success(response.data.message || "User approved successfully");
      fetchData(); // reload
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to approve user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId) => {
    setActionLoading(userId);
    try {
      const response = await rejectUserRequest(userId);
      toast.success(response.data.message || "User rejected successfully");
      fetchData(); // reload
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to reject user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleConnectDrive = async (userId) => {
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

  const handleDisconnectDrive = async (userId) => {
    if (!window.confirm("Are you sure you want to disconnect this user's Google Drive?")) return;
    try {
      const response = await disconnectGoogleDrive(userId);
      if (response.data.success) {
        toast.success("Google Drive disconnected successfully");
        fetchData();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to disconnect Google Drive.");
    }
  };

  const handleSendEmail = async (userId) => {
    setActionLoading(userId);
    try {
      const response = await sendGoogleDriveLinkEmail(userId);
      toast.success(response.data.message || "Connection email sent successfully.");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to send email.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">


      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#DDE7D8] pb-px">
  return (
    <div className="max-w-6xl mx-auto space-y-4 pb-8 text-xs sm:text-sm">
      {/* Structural Navigation Tabs Module */}
      <div className="flex border-b border-slate-200/80 dark:border-slate-800 gap-2 pb-2">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
            activeTab === "users"
              ? "bg-blue-600 text-white shadow-2xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <FaUsers size={13} />
          Users
        </button>
        <button
          onClick={() => setActiveTab("editors")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
            activeTab === "editors"
              ? "bg-blue-600 text-white shadow-2xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <FaUserShield size={13} />
          Editors
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 relative ${
            activeTab === "pending"
              ? "bg-blue-600 text-white shadow-2xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <FaClock size={13} />
          Pending Approvals
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <FaSpinner className="text-blue-600 animate-spin text-2xl" />
            <p className="text-xs text-slate-500">Fetching directory listing...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-full flex items-center justify-center mb-3">
              <FaUser size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No users found</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-0.5">
              There are no accounts in this list. Any newly registered users requiring approval will show up here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800">
                  <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">User Details</th>
                  <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Role</th>
                  <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                  <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Drive Connection</th>
                  {(activeTab === "pending" || activeTab === "users" || activeTab === "editors") && (
                    <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{item.name}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <FaEnvelope size={9} />
                            {item.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-md uppercase ${
                        item.role === "ADMIN"
                          ? "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60"
                          : item.role === "EDITOR"
                          ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60"
                      }`}>
                        {item.role}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-md uppercase ${
                        item.status === "APPROVED"
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60"
                          : item.status === "PENDING"
                          ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60"
                          : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md ${
                        item.googleDrive?.connected
                          ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200/60"
                      }`}>
                        {item.googleDrive?.connected ? "Connected" : "Disconnected"}
                      </span>
                    </td>
                    {activeTab === "pending" && (
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleApprove(item._id)}
                            disabled={actionLoading !== null}
                            className="p-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-md transition disabled:opacity-50"
                            title="Approve Account"
                          >
                            {actionLoading === item._id ? (
                              <FaSpinner className="animate-spin text-xs" />
                            ) : (
                              <FaCheck size={11} />
                            )}
                          </button>
                          <button
                            onClick={() => handleReject(item._id)}
                            disabled={actionLoading !== null}
                            className="p-1.5 bg-white dark:bg-slate-800 text-rose-600 border border-rose-200 hover:bg-rose-50 rounded-md transition disabled:opacity-50"
                            title="Reject Account"
                          >
                            {actionLoading === item._id ? (
                              <FaSpinner className="animate-spin text-xs" />
                            ) : (
                              <FaTimes size={11} />
                            )}
                          </button>
                        </div>
                      </td>
                    )}
                    {(activeTab === "users" || activeTab === "editors") && (
                      <td className="px-4 py-2.5 text-right">
                        {item.googleDrive?.connected ? (
                          <button
                            onClick={() => handleDisconnectDrive(item._id)}
                            className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-200/60 hover:bg-rose-100 rounded-md text-xs font-semibold transition"
                          >
                            Disconnect Drive
                          </button>
                        ) : (
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleConnectDrive(item._id)}
                              className="px-2.5 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-xs font-semibold transition shadow-2xs"
                            >
                              Connect Drive
                            </button>
                            {item.role === "USER" && (
                              <button
                                onClick={() => handleSendEmail(item._id)}
                                disabled={actionLoading === item._id}
                                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-md text-xs font-medium transition disabled:opacity-50"
                              >
                                {actionLoading === item._id ? "Sending..." : "Send Link"}
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUsers;