import React, { useState, useEffect, useMemo } from "react";
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
  FaSearch,
  FaCloud,
  FaUnlink,
  FaPaperPlane,
} from "react-icons/fa";

function AdminUsers() {
  const [activeTab, setActiveTab] = useState("users"); // 'users', 'editors', 'pending'
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // stores userId being approved/rejected
  const [searchQuery, setSearchQuery] = useState("");

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
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    fetchData();
    setSearchQuery(""); // Reset search on tab change
  }, [activeTab]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      (item) =>
        item.name?.toLowerCase().includes(query) ||
        item.email?.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const handleApprove = async (userId) => {
    setActionLoading(userId);
    try {
      const response = await approveUserRequest(userId);
      toast.success(response.data.message || "User approved successfully");
      fetchData();
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
      fetchData();
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
    <div className="animate-fade-in text-xs sm:text-sm space-y-4">
      {/* Control Bar: Tabs & Advanced Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-2.5">
        {/* Modern Tabs */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 relative ${
              activeTab === "pending"
                ? "bg-blue-600 text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <FaClock size={13} />
            Pending
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2.5">
            <FaSpinner className="text-blue-600 animate-spin text-2xl" />
            <p className="text-xs font-medium text-slate-500">Loading directory records...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-11 h-11 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl flex items-center justify-center mb-2 shadow-inner">
              <FaUser size={18} />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No records found</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-0.5">
              {searchQuery ? "No users match your search filter." : "There are no accounts currently in this view."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  <th className="px-4 py-2.5">User Details</th>
                  <th className="px-4 py-2.5">Role</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Drive Integration</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    {/* User Info */}
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          {item.name?.charAt(0).toUpperCase()}
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

                    {/* Role Badge */}
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                        item.role === "ADMIN"
                          ? "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/40"
                          : item.role === "EDITOR"
                          ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700"
                      }`}>
                        {item.role}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                        item.status === "APPROVED"
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40"
                          : item.status === "PENDING"
                          ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40"
                          : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.status === "APPROVED" ? "bg-emerald-500" : item.status === "PENDING" ? "bg-amber-500" : "bg-rose-500"
                        }`} />
                        {item.status}
                      </span>
                    </td>

                    {/* Drive Status */}
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md ${
                        item.googleDrive?.connected
                          ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200/60 dark:border-slate-700"
                      }`}>
                        <FaCloud size={10} />
                        {item.googleDrive?.connected ? "Connected" : "Disconnected"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {activeTab === "pending" ? (
                          <>
                            <button
                              onClick={() => handleApprove(item._id)}
                              disabled={actionLoading !== null}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-2xs transition disabled:opacity-50"
                              title="Approve Account"
                            >
                              {actionLoading === item._id ? <FaSpinner className="animate-spin text-xs" /> : <FaCheck size={10} />}
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(item._id)}
                              disabled={actionLoading !== null}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-rose-50 hover:text-rose-700 rounded-md text-xs font-semibold transition disabled:opacity-50"
                              title="Reject Account"
                            >
                              {actionLoading === item._id ? <FaSpinner className="animate-spin text-xs" /> : <FaTimes size={10} />}
                              Reject
                            </button>
                          </>
                        ) : (
                          <>
                            {item.googleDrive?.connected ? (
                              <button
                                onClick={() => handleDisconnectDrive(item._id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-200/60 hover:bg-rose-100 rounded-md text-xs font-semibold transition"
                              >
                                <FaUnlink size={10} /> Disconnect
                              </button>
                            ) : (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleConnectDrive(item._id)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-2xs transition"
                                >
                                  <FaCloud size={10} /> Connect
                                </button>
                                {item.role === "USER" && (
                                  <button
                                    onClick={() => handleSendEmail(item._id)}
                                    disabled={actionLoading === item._id}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-md text-xs font-medium transition disabled:opacity-50"
                                    title="Send Connection Link via Email"
                                  >
                                    <FaPaperPlane size={9} />
                                    {actionLoading === item._id ? "Sending..." : "Email Link"}
                                  </button>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </td>
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