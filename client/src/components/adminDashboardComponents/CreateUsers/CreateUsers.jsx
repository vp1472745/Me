// src/components/adminDashboardComponents/CreateUsers/CreateUsers.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaUser,
  FaUserTag,
  FaCheck,
  FaPlus,
  FaSearch,
  FaSpinner,
  FaSave,
  FaTimes,
  FaUserCircle,
  FaShieldAlt,
  FaImage,
  FaVideo,
  FaMusic,
  FaFileAlt,
  FaUsersCog,
  FaRegEdit,
  FaRegTrashAlt,
  FaUserPlus,
  FaFilter,
  FaEnvelope,
  FaPhone,
  FaKey,
  FaCheckCircle,
  FaArrowLeft,
  FaRedo,
} from "react-icons/fa";
import CommonModal from "../../../components/commonComponents/CommonModelComponents";
import {
  getAllDirectoryUsers,
  createAdminUser,
  createEditorUser,
  createClientUser,
  updateEditorPermissions,
  sendOTP,
} from "../../../config/api";

// ============================================================
// PERMISSIONS CONFIG
// ============================================================
const PERMISSIONS = {
  ADMIN: [
    "view_dashboard",
    "manage_users",
    "manage_roles",
    "manage_stories",
    "manage_hero",
    "manage_gallery",
    "manage_films",
    "manage_prewedding",
    "view_analytics",
    "delete_content",
  ],
  EDITOR: [
    "view_dashboard",
    "manage_stories",
    "manage_gallery",
    "manage_films",
    "manage_prewedding",
    "view_analytics",
  ],
  USER: ["view_dashboard"],
};

const ROLE_CONFIG = {
  ADMIN: {
    label: "Administrator",
    color: "bg-violet-100 text-violet-700 ring-violet-200",
    border: "border-violet-200",
    chip: "bg-violet-50 text-violet-700",
  },
  EDITOR: {
    label: "Editor",
    color: "bg-sky-100 text-sky-700 ring-sky-200",
    border: "border-sky-200",
    chip: "bg-sky-50 text-sky-700",
  },
  USER: {
    label: "User",
    color: "bg-slate-100 text-slate-700 ring-slate-200",
    border: "border-slate-200",
    chip: "bg-slate-50 text-slate-700",
  },
};

const PERMISSION_LABELS = {
  view_dashboard: "Dashboard",
  manage_users: "Manage Users",
  manage_roles: "Manage Roles",
  manage_stories: "Stories",
  manage_hero: "Hero Content",
  manage_gallery: "Gallery",
  manage_films: "Films",
  manage_prewedding: "Pre-Wedding",
  view_analytics: "Analytics",
  delete_content: "Delete Content",
};

const PERMISSION_ICONS = {
  view_dashboard: <FaShieldAlt size={14} />,
  manage_users: <FaUsersCog size={14} />,
  manage_roles: <FaUserTag size={14} />,
  manage_stories: <FaFileAlt size={14} />,
  manage_hero: <FaImage size={14} />,
  manage_gallery: <FaImage size={14} />,
  manage_films: <FaVideo size={14} />,
  manage_prewedding: <FaMusic size={14} />,
  view_analytics: <FaShieldAlt size={14} />,
  delete_content: <FaRegTrashAlt size={14} />,
};

// ============================================================
// SMALL UI HELPERS
// ============================================================
const SectionTitle = ({ title, subtitle, right }) => (
  <div className="flex items-start justify-between gap-3 mb-4">
    <div>
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
    {right}
  </div>
);

const StatCard = ({ label, value, icon, tone = "emerald" }) => {
  const tones = {
    emerald: "from-emerald-50 to-white border-emerald-100 text-emerald-700",
    sky: "from-sky-50 to-white border-sky-100 text-sky-700",
    violet: "from-violet-50 to-white border-violet-100 text-violet-700",
  };

  return (
    <div className={`rounded-2xl border bg-gradient-to-br ${tones[tone]} p-4 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-700 border border-slate-100">
          {icon}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const CreateUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editRole, setEditRole] = useState("");
  const [editPermissions, setEditPermissions] = useState([]);

  // Modal & OTP State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState("form"); // "form" | "otp"
  const [sendingOtp, setSendingOtp] = useState(false);
  const [creating, setCreating] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);

  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    role: "USER",
    permissions: ["view_dashboard"],
  });

  const searchInputRef = useRef(null);

  // Fetch all live directory users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await getAllDirectoryUsers();
      if (response.data.success) {
        const fetchedUsers = response.data.users || [];
        setUsers(fetchedUsers);
        setFilteredUsers(fetchedUsers);
        if (!selectedUser && fetchedUsers.length > 0) {
          handleSelectUser(fetchedUsers[0]);
        }
      }
    } catch (error) {
      console.error("Fetch Users Error:", error);
      toast.error(error.response?.data?.message || "Failed to load directory users");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users by search term
  useEffect(() => {
    const lower = searchTerm.trim().toLowerCase();
    if (!lower) {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(
        users.filter((u) => {
          const name = u.name?.toLowerCase() || "";
          const role = u.role?.toLowerCase() || "";
          const email = u.email?.toLowerCase() || "";
          return name.includes(lower) || role.includes(lower) || email.includes(lower);
        })
      );
    }
  }, [searchTerm, users]);

  // Countdown timer for resending OTP
  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCountdown]);

  const stats = useMemo(() => {
    const admins = users.filter((u) => u.role === "ADMIN").length;
    const editors = users.filter((u) => u.role === "EDITOR").length;
    const clients = users.filter((u) => u.role === "USER").length;
    return { admins, editors, clients, total: users.length };
  }, [users]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setEditRole(user.role || "USER");
    setEditPermissions(user.permissions || PERMISSIONS[user.role || "USER"] || []);
  };

  const togglePermission = (perm) => {
    setEditPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }

    setSaving(true);
    try {
      const response = await updateEditorPermissions({
        userId: selectedUser._id,
        role: editRole,
        permissions: editPermissions,
      });

      if (response.data.success) {
        toast.success(response.data.message || "User role & permissions updated successfully!");
        await fetchUsers();
        setSelectedUser((prev) => ({
          ...prev,
          role: editRole,
          permissions: editPermissions,
        }));
      }
    } catch (error) {
      console.error("Save Permissions Error:", error);
      toast.error(error.response?.data?.message || "Failed to update permissions");
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // STEP 1: SEND OTP FOR USER CREATION
  // ============================================================
  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!newUser.username || !newUser.username.trim()) {
      toast.error("Full Name / Username is required");
      return;
    }
    if (!newUser.email || !newUser.email.trim()) {
      toast.error("Email is required");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSendingOtp(true);
    try {
      const emailLower = newUser.email.trim().toLowerCase();
      await sendOTP(emailLower);
      toast.success(`Verification OTP sent to ${emailLower} from The Wedding Sedding!`);
      setModalStep("otp");
      setOtpCountdown(30);
    } catch (error) {
      console.error("Send OTP Error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to send verification OTP. Please try again."
      );
    } finally {
      setSendingOtp(false);
    }
  };

  // ============================================================
  // STEP 2: VERIFY OTP & CREATE USER
  // ============================================================
  const handleVerifyAndCreateUser = async (e) => {
    e.preventDefault();

    const cleanOtp = enteredOtp.trim();
    if (cleanOtp.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }

    setCreating(true);
    try {
      let response;
      const payload = {
        name: newUser.username.trim(),
        email: newUser.email.trim().toLowerCase(),
        otp: cleanOtp,
        role: newUser.role,
        permissions: newUser.permissions || PERMISSIONS[newUser.role] || [],
      };

      if (newUser.role === "ADMIN") {
        response = await createAdminUser(payload);
      } else if (newUser.role === "EDITOR") {
        response = await createEditorUser(payload);
      } else {
        response = await createClientUser(payload);
      }

      if (response.data.success) {
        toast.success(
          response.data.message ||
            `${newUser.role} user created successfully! Credentials emailed with The Wedding Sedding branding.`
        );
        handleModalClose();
        await fetchUsers();
      }
    } catch (error) {
      console.error("Create User Error:", error);
      toast.error(
        error.response?.data?.message || "User creation failed. Please check the OTP and try again."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpCountdown > 0) return;
    setSendingOtp(true);
    try {
      const emailLower = newUser.email.trim().toLowerCase();
      await sendOTP(emailLower);
      toast.success(`New OTP sent to ${emailLower}`);
      setOtpCountdown(30);
      setEnteredOtp("");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to resend OTP"
      );
    } finally {
      setSendingOtp(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    searchInputRef.current?.focus();
  };

  const getRoleBadgeClass = (role) => {
    return ROLE_CONFIG[role]?.chip || ROLE_CONFIG.USER.chip;
  };

  const getRoleRingClass = (role) => {
    return ROLE_CONFIG[role]?.color || ROLE_CONFIG.USER.color;
  };

  const handleModalClose = () => {
    setCreateModalOpen(false);
    setModalStep("form");
    setEnteredOtp("");
    setOtpCountdown(0);
    setNewUser({
      username: "",
      email: "",
      role: "USER",
      permissions: ["view_dashboard"],
    });
  };

  return (
    <>
      <ToastContainer position="top-right" />
      <div className="min-h-screen bg-gradient-to-b from-[#F6F8F5] to-[#EEF3EC] p-4 md:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="rounded-3xl border border-white/70 bg-white/80 backdrop-blur-sm shadow-sm p-5 md:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#5A7863] text-white flex items-center justify-center shadow-md">
                    <FaUser />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                      User Management
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                      Manage photo studio roles, permissions, and create verified accounts with Email OTP.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setModalStep("form");
                  setCreateModalOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#5A7863] text-white font-medium shadow-md hover:bg-[#4A6853] transition"
              >
                <FaUserPlus />
                Create New User
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <StatCard
                label="Total Studio Users"
                value={users.length}
                icon={<FaUsersCog />}
                tone="emerald"
              />
              <StatCard
                label="Studio Editors"
                value={stats.editors}
                icon={<FaRegEdit />}
                tone="sky"
              />
              <StatCard
                label="Administrators"
                value={stats.admins}
                icon={<FaShieldAlt />}
                tone="violet"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Panel */}
            <div className="lg:col-span-4">
              <div className="rounded-3xl border border-white/70 bg-white shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                  <SectionTitle
                    title="Studio Users"
                    subtitle="Search directory by name, role, or email"
                    right={
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                        {filteredUsers.length} found
                      </span>
                    }
                  />

                  <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search by name, email, or role..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full h-12 pl-11 pr-12 rounded-2xl border border-slate-200 bg-slate-50/80 text-slate-700 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#5A7863] focus:ring-4 focus:ring-[#5A7863]/10 transition text-sm"
                    />
                    {searchTerm && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition flex items-center justify-center"
                      >
                        <FaTimes size={13} />
                      </button>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <FaFilter />
                    Filter active: live database synchronized
                  </div>
                </div>

                <div className="max-h-[560px] overflow-y-auto p-3 custom-scroll">
                  {loadingUsers ? (
                    <div className="space-y-3 p-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="animate-pulse flex items-center gap-3 p-3 rounded-2xl bg-slate-50"
                        >
                          <div className="w-11 h-11 rounded-full bg-slate-200" />
                          <div className="flex-1">
                            <div className="h-4 bg-slate-200 rounded w-3/5" />
                            <div className="h-3 bg-slate-200 rounded w-2/5 mt-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="py-14 text-center">
                      <FaUserCircle className="text-6xl text-slate-200 mx-auto mb-3" />
                      <p className="text-slate-600 font-medium">No users found</p>
                      <p className="text-sm text-slate-400 mt-1">
                        Try searching a different name or role
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredUsers.map((user) => {
                        const active = selectedUser?._id === user._id;
                        return (
                          <button
                            key={user._id}
                            onClick={() => handleSelectUser(user)}
                            className={`w-full text-left p-3 rounded-2xl border transition-all duration-200 flex items-center gap-3 ${
                              active
                                ? "bg-[#F4F8F1] border-[#BFD0B7] shadow-sm"
                                : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            <div
                              className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white font-semibold shadow-sm ${
                                active ? "bg-[#5A7863]" : "bg-slate-700"
                              }`}
                            >
                              {user.name?.charAt(0).toUpperCase() || "U"}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-3">
                                <p className="font-semibold text-slate-800 truncate">
                                  {user.name}
                                </p>
                                {active && (
                                  <FaCheck className="text-[#5A7863] shrink-0 text-sm" />
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span
                                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wide ${getRoleBadgeClass(
                                    user.role
                                  )}`}
                                >
                                  {user.role}
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  {user.permissions?.length || 0} permissions
                                </span>
                                {user.email && (
                                  <span className="text-[11px] text-slate-400 truncate max-w-[120px]">
                                    {user.email}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel */}
            <div className="lg:col-span-8">
              {selectedUser ? (
                <div className="rounded-3xl border border-white/70 bg-white shadow-sm p-5 md:p-6 animate-fadeIn">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-5 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-[#5A7863] text-white flex items-center justify-center text-2xl font-bold shadow-md">
                        {selectedUser.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                          {selectedUser.name}
                        </h2>
                        {selectedUser.email && (
                          <p className="text-sm text-slate-600 flex items-center gap-1.5 mt-0.5">
                            <FaEnvelope size={12} className="text-[#5A7863]" /> {selectedUser.email}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 mt-1">
                          Account ID: <span className="font-mono">{selectedUser._id}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getRoleRingClass(
                          selectedUser.role
                        )}`}
                      >
                        {selectedUser.role}
                      </span>
                      {selectedUser.status && (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase ${
                          selectedUser.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}>
                          {selectedUser.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Role Selector */}
                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Assigned Role
                    </label>
                    <select
                      value={editRole}
                      onChange={(e) => {
                        const role = e.target.value;
                        setEditRole(role);
                        setEditPermissions(PERMISSIONS[role] || []);
                      }}
                      className="w-full h-12 px-4 rounded-2xl border border-slate-200 bg-slate-50/80 text-slate-700 font-medium outline-none focus:bg-white focus:border-[#5A7863] focus:ring-4 focus:ring-[#5A7863]/10 transition"
                    >
                      <option value="ADMIN">Administrator (Full System Access)</option>
                      <option value="EDITOR">Editor (Photography & Story Management)</option>
                      <option value="USER">Client User (Gallery & Deliverables)</option>
                    </select>
                  </div>

                  {/* Permissions Selection */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-700">
                          Role Permissions
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Toggle module permissions granted to this user
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setEditPermissions(PERMISSIONS[editRole] || [])
                          }
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditPermissions([])}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 text-xs font-semibold hover:bg-rose-100 transition"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-3xl bg-slate-50 border border-slate-200 max-h-72 overflow-y-auto custom-scroll">
                      {(PERMISSIONS[editRole] || []).map((perm) => {
                        const checked = editPermissions.includes(perm);
                        return (
                          <label
                            key={perm}
                            className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition ${
                              checked
                                ? "bg-white border-[#BFD0B7] shadow-sm"
                                : "bg-white/60 border-transparent hover:border-slate-200 hover:bg-white"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePermission(perm)}
                              className="w-4 h-4 accent-[#5A7863] cursor-pointer"
                            />
                            <span className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                              <span className="text-[#5A7863]">
                                {PERMISSION_ICONS[perm]}
                              </span>
                              {PERMISSION_LABELS[perm] || perm}
                            </span>
                          </label>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                      <span>{editPermissions.length} permissions configured</span>
                      <span className="font-semibold text-[#5A7863]">
                        {PERMISSIONS[editRole]?.length
                          ? `${Math.round(
                              (editPermissions.length /
                                PERMISSIONS[editRole].length) *
                                100
                            )}% enabled`
                          : "0%"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleSavePermissions}
                    disabled={saving}
                    className="mt-6 w-full h-12 rounded-2xl bg-[#5A7863] text-white font-semibold shadow-md hover:bg-[#4A6853] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Saving Permissions...
                      </>
                    ) : (
                      <>
                        <FaSave />
                        Save Permissions & Role
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="rounded-3xl border border-white/70 bg-white shadow-sm p-12 text-center">
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-50 flex items-center justify-center mb-4">
                    <FaUserCircle className="text-5xl text-slate-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800">
                    No User Selected
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                    Select a user from the left directory to view details, assign roles, and configure studio permissions.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================== */}
      {/* 2-STEP CREATE USER MODAL WITH EMAIL OTP VERIFICATION   */}
      {/* ====================================================== */}
      <CommonModal
        isOpen={createModalOpen}
        onClose={handleModalClose}
        title={
          modalStep === "form"
            ? "Create New Studio User (Email OTP Verification)"
            : "Verify OTP & Provision Account"
        }
        size="md"
      >
        {modalStep === "form" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                  placeholder="e.g. John Doe"
                  className="w-full h-12 pl-11 pr-4 rounded-2xl border border-slate-200 bg-slate-50/80 text-slate-700 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#5A7863] focus:ring-4 focus:ring-[#5A7863]/10 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  placeholder="e.g. john@example.com"
                  className="w-full h-12 pl-11 pr-4 rounded-2xl border border-slate-200 bg-slate-50/80 text-slate-700 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#5A7863] focus:ring-4 focus:ring-[#5A7863]/10 transition"
                  required
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                A 6-digit verification code will be dispatched to this email from <strong>The Wedding Sedding</strong>.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Account Role <span className="text-rose-500">*</span>
              </label>
              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    role: e.target.value,
                    permissions: PERMISSIONS[e.target.value] || [],
                  })
                }
                className="w-full h-12 px-4 rounded-2xl border border-slate-200 bg-slate-50/80 text-slate-700 font-medium outline-none focus:bg-white focus:border-[#5A7863] focus:ring-4 focus:ring-[#5A7863]/10 transition"
              >
                <option value="ADMIN">Administrator (Full Dashboard Access)</option>
                <option value="EDITOR">Editor (Studio Content & Assignments)</option>
                <option value="USER">User (Client Gallery & Deliverables)</option>
              </select>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-800 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <span>📸</span> The Wedding Sedding Account Provisioning:
              </p>
              <p className="text-emerald-700">
                After verifying OTP, the account will be created and an official email containing their <strong>User ID</strong> and <strong>temporary password</strong> will be automatically sent.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleModalClose}
                className="px-5 h-11 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition font-medium text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sendingOtp}
                className="px-6 h-11 rounded-2xl bg-[#5A7863] text-white font-semibold hover:bg-[#4A6853] transition disabled:opacity-50 flex items-center gap-2 text-sm shadow-sm"
              >
                {sendingOtp ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <FaEnvelope />
                    Send Verification OTP
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* STEP 2: OTP ENTRY */
          <form onSubmit={handleVerifyAndCreateUser} className="space-y-4">
            <div className="text-center py-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-[#5A7863] flex items-center justify-center text-2xl mb-3 shadow-inner">
                <FaKey />
              </div>
              <h4 className="text-base font-bold text-slate-800">
                Enter Verification OTP
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                We sent a 6-digit code to <strong className="text-slate-700">{newUser.email}</strong> from <strong>The Wedding Sedding</strong>.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 text-center">
                6-Digit OTP Code
              </label>
              <input
                type="text"
                maxLength="6"
                value={enteredOtp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setEnteredOtp(val);
                }}
                placeholder="• • • • • •"
                className="w-full h-14 px-4 rounded-2xl border border-slate-300 bg-slate-50 text-slate-800 text-center text-2xl tracking-[12px] font-mono outline-none focus:bg-white focus:border-[#5A7863] focus:ring-4 focus:ring-[#5A7863]/15 transition font-bold"
                autoFocus
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>OTP valid for 5 minutes</span>
              {otpCountdown > 0 ? (
                <span className="text-slate-400">Resend in {otpCountdown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={sendingOtp}
                  className="text-[#5A7863] font-semibold hover:underline flex items-center gap-1"
                >
                  <FaRedo size={10} /> Resend OTP
                </button>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-3">
              <button
                type="button"
                onClick={() => setModalStep("form")}
                className="px-4 h-11 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition font-medium text-sm flex items-center gap-2"
              >
                <FaArrowLeft size={12} />
                Edit Details
              </button>
              <button
                type="submit"
                disabled={creating || enteredOtp.length !== 6}
                className="px-6 h-11 rounded-2xl bg-[#5A7863] text-white font-semibold hover:bg-[#4A6853] transition disabled:opacity-50 flex items-center gap-2 text-sm shadow-md"
              >
                {creating ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Verifying & Creating...
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    Verify & Create {newUser.role}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </CommonModal>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #c7d2c0;
          border-radius: 999px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: #9eac95;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default CreateUsers;