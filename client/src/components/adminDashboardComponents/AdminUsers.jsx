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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DDE7D8] pb-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#3B4953]">
            User Directory & Access Control
          </h2>
          <p className="text-sm text-[#3B4953]/60 mt-1">
            Manage application user accounts, configure editor roles, and approve pending signup requests.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="self-start md:self-auto px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#5A7863] bg-white border border-[#DDE7D8] rounded-xl hover:bg-[#EEF6EC]/30 transition disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <FaSpinner className="animate-spin" /> : "Refresh Directory"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#DDE7D8] pb-px">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2.5 px-5 py-3 text-sm font-semibold border-b-2 transition-all duration-200 ${
            activeTab === "users"
              ? "border-[#5A7863] text-[#5A7863]"
              : "border-transparent text-[#3B4953]/60 hover:text-[#5A7863]"
          }`}
        >
          <FaUsers size={16} />
          Users
        </button>
        <button
          onClick={() => setActiveTab("editors")}
          className={`flex items-center gap-2.5 px-5 py-3 text-sm font-semibold border-b-2 transition-all duration-200 ${
            activeTab === "editors"
              ? "border-[#5A7863] text-[#5A7863]"
              : "border-transparent text-[#3B4953]/60 hover:text-[#5A7863]"
          }`}
        >
          <FaUserShield size={16} />
          Editors
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex items-center gap-2.5 px-5 py-3 text-sm font-semibold border-b-2 transition-all duration-200 relative ${
            activeTab === "pending"
              ? "border-[#5A7863] text-[#5A7863]"
              : "border-transparent text-[#3B4953]/60 hover:text-[#5A7863]"
          }`}
        >
          <FaClock size={16} />
          Pending Approvals
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-3xl border border-[#DDE7D8] shadow-sm overflow-hidden min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <FaSpinner className="text-[#5A7863] animate-spin text-3xl" />
            <p className="text-sm text-[#3B4953]/60">Fetching directory listing...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-4">
            <div className="w-16 h-16 bg-[#F7F9F4] text-[#5A7863]/60 rounded-full flex items-center justify-center mb-4">
              <FaUser size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#3B4953]">No users found</h3>
            <p className="text-sm text-[#3B4953]/60 max-w-sm mt-1">
              There are no accounts in this list. Any newly registered users requiring approval will show up here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F7F9F4] border-b border-[#DDE7D8]">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#3B4953]/60">User Details</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#3B4953]/60">Role</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#3B4953]/60">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#3B4953]/60">Drive Connection</th>
                  {(activeTab === "pending" || activeTab === "users") && (
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#3B4953]/60 text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE7D8]">
                {users.map((item) => (
                  <tr key={item._id} className="hover:bg-[#F7F9F4]/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#EBF4DD] text-[#5A7863] flex items-center justify-center font-bold text-sm">
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-[#3B4953]">{item.name}</div>
                          <div className="text-xs text-[#3B4953]/60 flex items-center gap-1 mt-0.5">
                            <FaEnvelope size={10} />
                            {item.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold tracking-wider rounded-full uppercase ${
                        item.role === "ADMIN"
                          ? "bg-purple-50 text-purple-700 border border-purple-100"
                          : item.role === "EDITOR"
                          ? "bg-blue-50 text-blue-700 border border-blue-100"
                          : "bg-slate-50 text-slate-700 border border-slate-100"
                      }`}>
                        {item.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold tracking-wider rounded-full uppercase ${
                        item.status === "APPROVED"
                          ? "bg-green-50 text-green-700 border border-green-100"
                          : item.status === "PENDING"
                          ? "bg-amber-50 text-amber-700 border border-amber-100"
                          : "bg-rose-50 text-rose-700 border border-rose-100"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold tracking-wider rounded-full ${
                        item.googleDrive?.connected
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-gray-50 text-gray-500 border border-gray-100"
                      }`}>
                        {item.googleDrive?.connected ? "Connected" : "Disconnected"}
                      </span>
                    </td>
                    {activeTab === "pending" && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleApprove(item._id)}
                            disabled={actionLoading !== null}
                            className="p-2 bg-green-50 text-green-700 border border-green-100 hover:bg-green-100 rounded-lg transition disabled:opacity-50"
                            title="Approve Account"
                          >
                            {actionLoading === item._id ? (
                              <FaSpinner className="animate-spin text-sm" />
                            ) : (
                              <FaCheck size={14} />
                            )}
                          </button>
                          <button
                            onClick={() => handleReject(item._id)}
                            disabled={actionLoading !== null}
                            className="p-2 bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100 rounded-lg transition disabled:opacity-50"
                            title="Reject Account"
                          >
                            {actionLoading === item._id ? (
                              <FaSpinner className="animate-spin text-sm" />
                            ) : (
                              <FaTimes size={14} />
                            )}
                          </button>
                        </div>
                      </td>
                    )}
                    {activeTab === "users" && (
                      <td className="px-6 py-4 text-right">
                        {item.role === "USER" && (
                          item.googleDrive?.connected ? (
                            <button
                              onClick={() => handleDisconnectDrive(item._id)}
                              className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100 rounded-xl text-xs font-semibold transition"
                            >
                              Disconnect Drive
                            </button>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleConnectDrive(item._id)}
                                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 rounded-xl text-xs font-semibold transition"
                              >
                                Connect Drive
                              </button>
                              <button
                                onClick={() => handleSendEmail(item._id)}
                                disabled={actionLoading === item._id}
                                className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 rounded-xl text-xs font-semibold transition disabled:opacity-50"
                              >
                                {actionLoading === item._id ? "Sending..." : "Send Link"}
                              </button>
                            </div>
                          )
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