// AdminFamilyRequests.jsx
import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { getAllFamilyRequests, approveFamilyRequest, rejectFamilyRequest } from '../../../config/api';
import CreateUserModal from '../../../components/commonComponents/CommonModelComponents';
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
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-4 md:p-6 bg-[#F7F9F4] min-h-screen">
      <ToastContainer />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-[#3B4953] flex items-center gap-2 mb-6">
          <FaUserPlus className="text-[#5A7863]" /> Family Access Requests
        </h1>

        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-[#DDE7D8] p-8 text-center">
            <p className="text-[#90AB8B]">No requests yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-[#DDE7D8] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F7F9F4] border-b border-[#DDE7D8]">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-[#3B4953]">User</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#3B4953]">Member</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#3B4953]">Relation</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#3B4953]">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#3B4953]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.requestId} className="border-b border-[#DDE7D8] hover:bg-[#F7F9F4]">
                      <td className="px-4 py-3 text-[#3B4953]">{req.userName}</td>
                      <td className="px-4 py-3 text-[#3B4953]">{req.memberName}</td>
                      <td className="px-4 py-3 text-[#3B4953]">{req.relation}</td>
                      <td className="px-4 py-3">{getStatusBadge(req.status)}</td>
                      <td className="px-4 py-3">
                        {req.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(req.userId, req.requestId)}
                              className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                              title="Approve & Create User"
                            >
                              <FaCheck />
                            </button>
                            <button
                              onClick={() => handleReject(req.userId, req.requestId)}
                              className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                              title="Reject"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        )}
                        {req.status === 'APPROVED' && (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <FaCheck className="text-green-500" /> Approved
                          </span>
                        )}
                        {req.status === 'REJECTED' && (
                          <span className="text-xs text-red-600 flex items-center gap-1">
                            <FaTimes className="text-red-500" /> Rejected
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
      </div>

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