// FamilyAccess.jsx
import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { createFamilyRequest, getMyFamilyRequests } from '../../../config/api';
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
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-4 md:p-6 bg-[#F7F9F4] min-h-screen">
      <ToastContainer />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-[#3B4953] flex items-center gap-2 mb-6">
          <FaUserPlus className="text-[#5A7863]" /> Family Access
        </h1>

        {/* Request Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#DDE7D8] p-6 mb-8">
          <h2 className="text-lg font-semibold text-[#3B4953] mb-4">Request Access for Family Member</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#3B4953] mb-1">Member Name</label>
              <input
                type="text"
                name="memberName"
                value={form.memberName}
                onChange={handleChange}
                placeholder="e.g. Vineet's Brother"
                className="w-full px-4 py-2 rounded-xl border border-[#DDE7D8] focus:ring-2 focus:ring-[#5A7863] outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#3B4953] mb-1">Relation</label>
              <input
                type="text"
                name="relation"
                value={form.relation}
                onChange={handleChange}
                placeholder="e.g. Brother"
                className="w-full px-4 py-2 rounded-xl border border-[#DDE7D8] focus:ring-2 focus:ring-[#5A7863] outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#3B4953] mb-1">Reason (Optional)</label>
              <textarea
                name="reason"
                value={form.reason}
                onChange={handleChange}
                placeholder="Why do they need access?"
                rows="2"
                className="w-full px-4 py-2 rounded-xl border border-[#DDE7D8] focus:ring-2 focus:ring-[#5A7863] outline-none resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#5A7863] text-white rounded-xl font-semibold hover:bg-[#4A6853] transition disabled:opacity-50"
            >
              {submitting ? 'Sending...' : 'Send Request'}
            </button>
          </form>
        </div>

        {/* My Requests */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#DDE7D8] p-6">
          <h2 className="text-lg font-semibold text-[#3B4953] mb-4">My Requests</h2>
          {requests.length === 0 ? (
            <p className="text-[#90AB8B] text-center py-6">No requests yet.</p>
          ) : (
            <div className="space-y-3">
              {requests.map((req, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-[#F7F9F4] rounded-xl border border-[#DDE7D8]">
                  <div>
                    <p className="font-medium text-[#3B4953]">{req.memberName}</p>
                    <p className="text-sm text-[#90AB8B]">{req.relation} {req.reason && `• ${req.reason}`}</p>
                    <p className="text-xs text-[#90AB8B]">{new Date(req.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>{getStatusBadge(req.status)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FamilyAccess;