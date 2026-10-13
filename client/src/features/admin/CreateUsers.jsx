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
import CommonModal from "../../components/feedback/CommonModelComponents";
import {
  getAllDirectoryUsers,
  createAdminUser,
  createEditorUser,
  createClientUser,
  updateEditorPermissions,
  sendOTP,
} from "../../config/api";

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
      <div className="animate-fade-in text-xs sm:text-sm space-y-4">
        {/* Header */}
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-2xs p-3.5 sm:p-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-2xs shrink-0">
                    <FaUser size={14} />
                  </div>
                  <div>
                    <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                      User Management & Roles
                    </h1>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
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
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold shadow-2xs hover:bg-blue-700 transition"
              >
                <FaUserPlus size={13} />
                Create New User
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mt-3.5">
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Panel */}
            <div className="lg:col-span-4">
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-2xs overflow-hidden">
                <div className="p-3.5 border-b border-slate-100 dark:border-slate-800">
                  <SectionTitle
                    title="Studio Users"
                    subtitle="Search directory by name, role, or email"
                    right={
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {filteredUsers.length} found
                      </span>
                    }
                  />

                  <div className="relative mt-2">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search name, email, role..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full h-8 pl-8 pr-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition text-xs"
                    />
                    {searchTerm && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full text-slate-400 hover:text-slate-700 transition flex items-center justify-center"
                      >
                        <FaTimes size={10} />
                      </button>
                    )}
                  </div>

                  <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                    <FaFilter size={9} />
                    Live directory synchronized
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
                    <div className="space-y-1.5">
                      {filteredUsers.map((user) => {
                        const active = selectedUser?._id === user._id;
                        return (
                          <button
                            key={user._id}
                            onClick={() => handleSelectUser(user)}
                            className={`w-full text-left p-2.5 rounded-xl border transition-all duration-200 flex items-center gap-2.5 ${
                              active
                                ? "bg-blue-50/70 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 shadow-2xs"
                                : "bg-white dark:bg-[#111827] border-slate-100 dark:border-slate-800 hover:border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            }`}
                          >
                            <div
                              className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-semibold shadow-2xs ${
                                active ? "bg-blue-600" : "bg-slate-700"
                              }`}
                            >
                              {user.name?.charAt(0).toUpperCase() || "U"}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-semibold text-slate-800 dark:text-slate-100 truncate text-xs">
                                  {user.name}
                                </p>
                                {active && (
                                  <FaCheck className="text-blue-600 dark:text-blue-400 shrink-0 text-xs" />
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span
                                  className={`text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide ${getRoleBadgeClass(
                                    user.role
                                  )}`}
                                >
                                  {user.role}
                                </span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                  {user.permissions?.length || 0} perms
                                </span>
                                {user.email && (
                                  <span className="text-[10px] text-slate-400 truncate max-w-[110px]">
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
                <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-2xs p-4 sm:p-5 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-2xs">
                        {selectedUser.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                          {selectedUser.name}
                        </h2>
                        {selectedUser.email && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <FaEnvelope size={11} className="text-blue-600 dark:text-blue-400" /> {selectedUser.email}
                          </p>
                        )}
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Account ID: <span className="font-mono">{selectedUser._id}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${getRoleRingClass(
                          selectedUser.role
                        )}`}
                      >
                        {selectedUser.role}
                      </span>
                      {selectedUser.status && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          selectedUser.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                        }`}>
                          {selectedUser.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Role Selector */}
                  <div className="mt-4">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                      Assigned Role
                    </label>
                    <select
                      value={editRole}
                      onChange={(e) => {
                        const role = e.target.value;
                        setEditRole(role);
                        setEditPermissions(PERMISSIONS[role] || []);
                      }}
                      className="w-full h-9.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    >
                      <option value="ADMIN">Administrator (Full System Access)</option>
                      <option value="EDITOR">Editor (Photography & Story Management)</option>
                      <option value="USER">Client User (Gallery & Deliverables)</option>
                    </select>
                  </div>

                  {/* Permissions Selection */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between gap-3 mb-2.5">
                      <div>
                        <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                          Role Permissions
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Toggle module permissions granted to this user
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setEditPermissions(PERMISSIONS[editRole] || [])
                          }
                          className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold hover:bg-emerald-100 transition"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditPermissions([])}
                          className="px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 text-[11px] font-semibold hover:bg-rose-100 transition"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 max-h-64 overflow-y-auto custom-scroll">
                      {(PERMISSIONS[editRole] || []).map((perm) => {
                        const checked = editPermissions.includes(perm);
                        return (
                          <label
                            key={perm}
                            className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition ${
                              checked
                                ? "bg-white dark:bg-slate-800 border-blue-300 dark:border-blue-700 shadow-2xs"
                                : "bg-white/60 dark:bg-slate-800/40 border-transparent hover:border-slate-200 hover:bg-white"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePermission(perm)}
                              className="w-3.5 h-3.5 accent-blue-600 cursor-pointer"
                            />
                            <span className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200 font-medium">
                              <span className="text-blue-600 dark:text-blue-400 text-xs">
                                {PERMISSION_ICONS[perm]}
                              </span>
                              {PERMISSION_LABELS[perm] || perm}
                            </span>
                          </label>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between mt-2.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{editPermissions.length} permissions configured</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
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
                    className="mt-5 w-full h-10 rounded-xl bg-blue-600 text-white font-semibold shadow-2xs hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm"
                  >
                    {saving ? (
                      <>
                        <FaSpinner className="animate-spin text-xs" />
                        Saving Permissions...
                      </>
                    ) : (
                      <>
                        <FaSave size={13} />
                        Save Permissions & Role
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-2xs p-8 text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3">
                    <FaUserCircle className="text-4xl text-slate-300 dark:text-slate-600" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                    No User Selected
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm mx-auto">
                    Select a user from the left directory to view details, assign roles, and configure studio permissions.
                  </p>
                </div>
              )}
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
          <form onSubmit={handleSendOtp} className="space-y-3.5 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                  placeholder="e.g. John Doe"
                  className="w-full h-9.5 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs sm:text-sm transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  placeholder="e.g. john@example.com"
                  className="w-full h-9.5 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs sm:text-sm transition"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                A 6-digit verification code will be dispatched to this email from <strong>The Wedding Sedding</strong>.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
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
                className="w-full h-9.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
              >
                <option value="ADMIN">Administrator (Full Dashboard Access)</option>
                <option value="EDITOR">Editor (Studio Content & Assignments)</option>
                <option value="USER">User (Client Gallery & Deliverables)</option>
              </select>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-300 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <span>📸</span> The Wedding Sedding Account Provisioning:
              </p>
              <p className="text-blue-800 dark:text-blue-200 text-[11px]">
                After verifying OTP, the account will be created and an official email containing their <strong>User ID</strong> and <strong>temporary password</strong> will be automatically sent.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1.5">
              <button
                type="button"
                onClick={handleModalClose}
                className="px-4 h-9 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition font-medium text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sendingOtp}
                className="px-4.5 h-9 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-1.5 text-xs shadow-2xs"
              >
                {sendingOtp ? (
                  <>
                    <FaSpinner className="animate-spin text-xs" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <FaEnvelope size={12} />
                    Send Verification OTP
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* STEP 2: OTP ENTRY */
          <form onSubmit={handleVerifyAndCreateUser} className="space-y-3.5 text-xs sm:text-sm">
            <div className="text-center py-1">
              <div className="w-12 h-12 mx-auto rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl mb-2.5 shadow-2xs">
                <FaKey />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Enter Verification OTP
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                We sent a 6-digit code to <strong className="text-slate-700 dark:text-slate-200">{newUser.email}</strong> from <strong>The Wedding Sedding</strong>.
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1 text-center">
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
                className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-center text-xl tracking-[10px] font-mono outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition font-bold"
                autoFocus
                required
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
              <span>OTP valid for 5 minutes</span>
              {otpCountdown > 0 ? (
                <span className="text-slate-400">Resend in {otpCountdown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={sendingOtp}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                >
                  <FaRedo size={9} /> Resend OTP
                </button>
              )}
            </div>

            <div className="flex items-center justify-between gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setModalStep("form")}
                className="px-3.5 h-9 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition font-medium text-xs flex items-center gap-1.5"
              >
                <FaArrowLeft size={11} />
                Edit Details
              </button>
              <button
                type="submit"
                disabled={creating || enteredOtp.length !== 6}
                className="px-4.5 h-9 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-1.5 text-xs shadow-2xs"
              >
                {creating ? (
                  <>
                    <FaSpinner className="animate-spin text-xs" />
                    Verifying & Creating...
                  </>
                ) : (
                  <>
                    <FaCheckCircle size={12} />
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