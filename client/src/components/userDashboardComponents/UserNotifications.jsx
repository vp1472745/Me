import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "../../config/api";
import { FaBell, FaCheck, FaCheckDouble, FaSpinner } from "react-icons/fa";

const UserNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();
      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const response = await markNotificationRead(id);
      if (response.data.success) {
        setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
        toast.success("Notification marked as read");
      }
    } catch (error) {
      toast.error("Error marking notification as read");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await markAllNotificationsRead();
      if (response.data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        toast.success("All notifications marked as read");
      }
    } catch (error) {
      toast.error("Error marking all read");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <FaSpinner className="text-[#5A7863] animate-spin text-3xl" />
        <p className="text-sm text-[#3B4953]/60">Fetching notifications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDE7D8] pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-[#3B4953] tracking-tight">
            Notifications
          </h2>
          <p className="text-sm text-[#3B4953]/60 mt-1">
            Stay updated with real-time studio activities and delivery milestones.
          </p>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#EBF4DD] text-[#5A7863] rounded-xl text-xs font-bold hover:bg-[#EBF4DD]/80 transition"
          >
            <FaCheckDouble /> Mark All Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#DDE7D8] p-16 text-center max-w-lg mx-auto">
          <FaBell className="text-5xl text-[#D5E0D0] mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#3B4953]">All caught up</h3>
          <p className="text-sm text-[#3B4953]/60 mt-1">
            You don't have any notifications or announcements yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <div
              key={item._id}
              className={`border rounded-3xl p-4.5 transition flex justify-between items-center gap-4 ${
                item.isRead
                  ? "bg-white/80 border-slate-100 text-[#3B4953]/80"
                  : "bg-white border-[#EBF4DD] shadow-sm font-semibold text-[#3B4953] ring-2 ring-[#EBF4DD]/20"
              }`}
            >
              <div className="flex-1">
                <p className="text-sm">{item.message}</p>
                <span className="text-[10px] text-slate-400 font-medium block mt-1">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>
              {!item.isRead && (
                <button
                  onClick={() => handleMarkAsRead(item._id)}
                  className="w-8 h-8 rounded-xl bg-[#EBF4DD]/60 hover:bg-[#EBF4DD] text-[#5A7863] flex items-center justify-center transition border border-[#90AB8B]/20"
                  title="Mark Read"
                >
                  <FaCheck size={11} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserNotifications;
