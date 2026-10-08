import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getWorkHistoryLogs } from "../../config/api";
import { FaHistory, FaCalendarCheck, FaSpinner } from "react-icons/fa";

const UserTimeline = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await getWorkHistoryLogs();
        if (response.data.success) {
          setLogs(response.data.logs);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load timeline logs.");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <FaSpinner className="text-[#5A7863] animate-spin text-3xl" />
        <p className="text-sm text-[#3B4953]/60">Generating timeline feed...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-[#DDE7D8] pb-5">
        <h2 className="text-2xl font-extrabold text-[#3B4953] tracking-tight">
          Project Timeline
        </h2>
        <p className="text-sm text-[#3B4953]/60 mt-1">
          Historical log of all workflow actions, deliveries, and communications.
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#DDE7D8] p-16 text-center max-w-lg mx-auto">
          <FaHistory className="text-5xl text-[#D5E0D0] mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#3B4953]">Empty timeline</h3>
          <p className="text-sm text-[#3B4953]/60 mt-1">
            There are no logs in your project timeline yet.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 border-l-2 border-[#DDE7D8] space-y-8 ml-2">
          {logs.map((log) => (
            <div key={log._id} className="relative">
              {/* Point dot indicator */}
              <div className="absolute -left-[31px] top-1 w-4.5 h-4.5 rounded-full bg-white border-4 border-[#5A7863] shadow-sm flex items-center justify-center" />

              <div className="bg-white border border-[#DDE7D8] rounded-3xl p-4.5 shadow-sm hover:shadow-md transition">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-1 sm:items-center">
                  <span className="font-extrabold text-[#3B4953] text-sm sm:text-base">
                    {log.action}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {new Date(log.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-1">{log.remarks}</p>

                <div className="mt-3.5 flex items-center gap-2 pt-2.5 border-t border-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    By: {log.performedBy?.name || "System"}
                  </span>
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    Role: {log.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserTimeline;
