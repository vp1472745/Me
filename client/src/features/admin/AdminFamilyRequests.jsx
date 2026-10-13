// AdminFamilyRequests.jsx
import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { getAllFamilyRequests, approveFamilyRequest, rejectFamilyRequest } from '../../config/api';
import CreateUserModal from '../../components/feedback/CommonModelComponents';
import { FaCheck, FaTimes, FaUserPlus, FaClock } from 'react-icons/fa';

const AdminFamilyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await getAllFamilyRequests();
      setRequests(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (userId, requestId) => {
    try {
      await approveFamilyRequest(userId, requestId);
      toast.success('Request approved!');
      // Find the request to pass to modal
      const req = requests.find(r => r.userId === userId && r.requestId === requestId);
      if (req) {
        setSelectedRequest(req);
        setModalOpen(true); // Open create user modal
      }
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error');
    }
  };

  const handleReject = async (userId, requestId) => {
    if (!window.confirm('Reject this request?')) return;
    try {
      await rejectFamilyRequest(userId, requestId);
      toast.info('Request rejected');
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error');
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedRequest(null);
    fetchRequests(); // refresh list
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
          <FaUserPlus className="text-blue-600 dark:text-blue-400" /> Family Access Requests
        </h1>
      </div>

        {loading ? (
          <div className="text-center py-10 text-xs text-slate-500">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="bg-white dark:bg-slate-800/90 rounded-xl shadow-xs border border-slate-200 dark:border-slate-700 p-8 text-center">
            <p className="text-slate-400 text-xs">No family requests found.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800/90 rounded-xl shadow-xs border border-slate-200 dark:border-slate-700/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-3.5 py-2.5 text-left font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">User</th>
                    <th className="px-3.5 py-2.5 text-left font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Member</th>
                    <th className="px-3.5 py-2.5 text-left font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Relation</th>
                    <th className="px-3.5 py-2.5 text-left font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Status</th>
                    <th className="px-3.5 py-2.5 text-left font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {requests.map((req) => (
                    <tr key={req.requestId} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
                      <td className="px-3.5 py-2 text-slate-800 dark:text-slate-200 font-medium">{req.userName}</td>
                      <td className="px-3.5 py-2 text-slate-800 dark:text-slate-200">{req.memberName}</td>
                      <td className="px-3.5 py-2 text-slate-600 dark:text-slate-400">{req.relation}</td>
                      <td className="px-3.5 py-2">{getStatusBadge(req.status)}</td>
                      <td className="px-3.5 py-2">
                        {req.status === 'PENDING' && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleApprove(req.userId, req.requestId)}
                              className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 dark:text-blue-400 rounded-md transition"
                              title="Approve & Create User"
                            >
                              <FaCheck size={11} />
                            </button>
                            <button
                              onClick={() => handleReject(req.userId, req.requestId)}
                              className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 dark:text-red-400 rounded-md transition"
                              title="Reject"
                            >
                              <FaTimes size={11} />
                            </button>
                          </div>
                        )}
                        {req.status === 'APPROVED' && (
                          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                            <FaCheck className="text-emerald-500" size={10} /> Approved
                          </span>
                        )}
                        {req.status === 'REJECTED' && (
                          <span className="text-[11px] text-red-600 font-semibold flex items-center gap-1">
                            <FaTimes className="text-red-500" size={10} /> Rejected
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* Create User Modal */}
      {selectedRequest && (
        <CreateUserModal
          isOpen={modalOpen}
          onClose={handleModalClose}
          defaultName={selectedRequest.memberName}
          defaultRole="USER" // or can auto-select based on permissions
          defaultPermissions={['view_dashboard']} // only 1 tab, but admin can add more
        />
      )}
    </div>
  );
};

export default AdminFamilyRequests;