import React from "react";
import { FaUserCircle, FaEnvelope, FaShieldAlt, FaGoogleDrive } from "react-icons/fa";

const UserProfile = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-[#DDE7D8] pb-5">
        <h2 className="text-2xl font-extrabold text-[#3B4953] tracking-tight">
          My Profile
        </h2>
        <p className="text-sm text-[#3B4953]/60 mt-1">
          Review your account settings, permissions, and cloud storage status.
        </p>
      </div>

      {/* Account Info */}
      <div className="bg-white border border-[#DDE7D8] rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-slate-100">
          <div className="w-20 h-20 rounded-2xl bg-[#EBF4DD] text-[#5A7863] flex items-center justify-center text-4xl shadow-inner font-extrabold">
            {user.name?.charAt(0).toUpperCase() || "C"}
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-bold text-[#3B4953]">{user.name}</h3>
            <p className="text-sm text-[#3B4953]/60 mt-0.5">{user.email}</p>
            <span className="mt-2.5 inline-block text-[10px] bg-[#EBF4DD] text-[#5A7863] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {user.role} Account
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Details list */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Account Details</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-slate-600 text-sm">
                <FaEnvelope className="text-slate-400" />
                <span className="font-medium">Email:</span>
                <span className="font-semibold text-slate-800">{user.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600 text-sm">
                <FaShieldAlt className="text-slate-400" />
                <span className="font-medium">Account Access:</span>
                <span className="font-semibold text-slate-800 capitalize">Approved Client</span>
              </div>
            </div>
          </div>

          {/* Drive info */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Cloud Synchronization</h4>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-blue-500 text-lg">
                <FaGoogleDrive />
              </div>
              <div>
                <h5 className="font-bold text-slate-800 text-sm">Google Drive Status</h5>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {user.googleDrive?.connected
                    ? `Synchronized with ${user.googleDrive.googleEmail}`
                    : "No Google Drive folder connected yet. Please wait for an Admin to establish the connection."}
                </p>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase mt-2.5 ${
                  user.googleDrive?.connected ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                }`}>
                  {user.googleDrive?.connected ? "Connected" : "Disconnected"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
