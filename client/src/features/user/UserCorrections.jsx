import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getCorrectionsList } from "../../config/api";
import { FaWrench, FaClock, FaCheckCircle, FaSpinner } from "react-icons/fa";

const UserCorrections = () => {
  const [corrections, setCorrections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCorrections = async () => {
      try {
        const response = await getCorrectionsList();
        if (response.data.success) {
          setCorrections(response.data.corrections);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load corrections list.");
      } finally {
        setLoading(false);
      }
    };
    fetchCorrections();
  }, []);

  const getStatusBadge = (status) => {
    const badges = {
      Pending: "bg-amber-50 text-amber-700 border border-amber-200",
      "In Progress": "bg-indigo-50 text-indigo-700 border border-indigo-200",
      Completed: "bg-green-50 text-green-700 border border-green-200",
      Rejected: "bg-rose-50 text-rose-700 border border-rose-200",
    };
    return badges[status] || "bg-gray-50 text-gray-700 border border-gray-200";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <FaSpinner className="text-[#5A7863] animate-spin text-3xl" />
        <p className="text-sm text-[#3B4953]/60">Fetching correction status...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-[#DDE7D8] pb-5">
        <h2 className="text-2xl font-extrabold text-[#3B4953] tracking-tight">
          Correction Requests
        </h2>
        <p className="text-sm text-[#3B4953]/60 mt-1">
          Monitor current edit updates, editor feedback notes, and completion statuses.
        </p>
      </div>

      {corrections.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#DDE7D8] p-16 text-center max-w-lg mx-auto">
          <FaWrench className="text-5xl text-[#D5E0D0] mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#3B4953]">No correction requests</h3>
          <p className="text-sm text-[#3B4953]/60 mt-1">
            You haven't requested any photo revisions yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {corrections.map((item) => (
            <div key={item._id} className="bg-white border border-[#DDE7D8] rounded-3xl p-5 hover:shadow-sm transition">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="font-extrabold text-[#3B4953] text-base">{item.fileName}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Revision version: V{item.version}</p>
                </div>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${getStatusBadge(item.status)}`}>
                  {item.status}
                </span>
              </div>

              <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">My Instruction:</span>
                  <p className="text-sm text-slate-700 font-medium mt-1">"{item.userComment}"</p>
                </div>
                {item.editorNotes && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Editor Notes:</span>
                    <p className="text-xs text-slate-500 font-medium italic mt-1">{item.editorNotes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserCorrections;
