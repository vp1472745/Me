// FamilyAccess.jsx
import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { createFamilyRequest, getMyFamilyRequests } from "../../config/api";
import { FaPlus, FaEye, FaClock, FaCheck, FaTimes, FaUserPlus } from 'react-icons/fa';

const FamilyAccess = () => {
  const [form, setForm] = useState({ memberName: '', relation: '', reason: '' });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    try {
      const res = await getMyFamilyRequests();
      setRequests(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load requests');
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.memberName || !form.relation) {
      toast.error('Name and relation are required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await createFamilyRequest(form);
      toast.success('Request sent!');
      setForm({ memberName: '', relation: '', reason: '' });
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${styles[status] || 'bg-slate-100 text-slate-700'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="animate-fade-in text-xs sm:text-sm space-y-4">
      <ToastContainer />
      <div className="border-b border-slate-200/80 dark:border-slate-800 pb-2.5">
        <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <FaUserPlus className="text-blue-600 dark:text-blue-400" /> Family Access
        </h1>
      </div>

      {/* Request Form */}
      <div className="bg-white dark:bg-[#111827] rounded-xl shadow-2xs border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">Request Access for Family Member</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Member Name</label>
              <input
                type="text"
                name="memberName"
                value={form.memberName}
                onChange={handleChange}
                placeholder="e.g. Vineet's Brother"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Relation</label>
              <input
                type="text"
                name="relation"
                value={form.relation}
                onChange={handleChange}
                placeholder="e.g. Brother"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Reason (Optional)</label>
              <textarea
                name="reason"
                value={form.reason}
                onChange={handleChange}
                placeholder="Why do they need access?"
                rows="2"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-blue-700 transition disabled:opacity-50"
            >
              {submitting ? 'Sending...' : 'Send Request'}
            </button>
          </form>
        </div>

        {/* My Requests */}
        <div className="bg-white dark:bg-[#111827] rounded-xl shadow-2xs border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">My Requests</h2>
          {requests.length === 0 ? (
            <p className="text-slate-400 text-center py-4 text-xs">No requests yet.</p>
          ) : (
            <div className="space-y-2">
              {requests.map((req, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{req.memberName}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{req.relation} {req.reason && `• ${req.reason}`}</p>
                    <p className="text-[10px] text-slate-400">{new Date(req.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>{getStatusBadge(req.status)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  );
};

export default FamilyAccess;