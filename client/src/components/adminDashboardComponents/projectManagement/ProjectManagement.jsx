// ProjectManagement.jsx
import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaFolder,
  FaPlus,
  FaUserPlus,
  FaSpinner,
} from "react-icons/fa";
import CommonModal from "../../../components/commonComponents/CommonModelComponents";
import {
  DELIVERABLE_CATEGORIES,
  DUMMY_FOLDERS,
  DUMMY_EDITORS,
} from "./components/dummyData";
import FolderList from "./components/FolderList";
import FolderDetails from "./components/FolderDetails";
import DeliverableUpload from "./components/DeliverableUpload";
import EditorAssignment from "./components/EditorAssignment";

const ProjectManagement = ({ userRole = "ADMIN" }) => {
  // State
  const [folders, setFolders] = useState(DUMMY_FOLDERS);
  const [editors] = useState(DUMMY_EDITORS);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list");

  // Modal states
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [newFolder, setNewFolder] = useState({
    name: "",
    clientName: "",
    weddingDate: "",
    assignedEditors: [],
  });
  const [assignEditorOpen, setAssignEditorOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    folderId: "",
    categoryId: "",
    subCategory: "",
  });
  const [creating, setCreating] = useState(false);

  // Filtered folders
  const filteredFolders = folders.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ---- Folder CRUD ----
  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolder.name || !newFolder.clientName) {
      toast.error("Name and client name are required");
      return;
    }

    setCreating(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const folder = {
      id: Date.now().toString(),
      ...newFolder,
      deliverables: Object.fromEntries(
        Object.values(DELIVERABLE_CATEGORIES).map((cat) => [
          cat.id,
          Object.fromEntries(cat.subCategories.map((s) => [s, []])),
        ])
      ),
    };

    setFolders([...folders, folder]);
    toast.success("Folder created!");
    setCreateFolderOpen(false);
    setNewFolder({ name: "", clientName: "", weddingDate: "", assignedEditors: [] });
    setCreating(false);
  };

  const handleDeleteFolder = (folderId) => {
    if (!window.confirm("Delete this folder and all data?")) return;
    setFolders(folders.filter((f) => f.id !== folderId));
    if (selectedFolder?.id === folderId) setSelectedFolder(null);
    toast.success("Folder deleted");
  };

  // ---- Editor Assignment ----
  const handleAssignEditor = (folder) => {
    setSelectedFolder(folder);
    setAssignEditorOpen(true);
  };

  const handleAssignEditorConfirm = (editorId) => {
    const updated = folders.map((f) =>
      f.id === selectedFolder.id
        ? {
            ...f,
            assignedEditors: f.assignedEditors.includes(editorId)
              ? f.assignedEditors
              : [...f.assignedEditors, editorId],
          }
        : f
    );
    setFolders(updated);
    const updatedFolder = updated.find((f) => f.id === selectedFolder.id);
    setSelectedFolder(updatedFolder);
    toast.success("Editor assigned!");
  };

  const handleRemoveEditor = (folderId, editorId) => {
    const updated = folders.map((f) =>
      f.id === folderId
        ? { ...f, assignedEditors: f.assignedEditors.filter((e) => e !== editorId) }
        : f
    );
    setFolders(updated);
    const updatedFolder = updated.find((f) => f.id === folderId);
    setSelectedFolder(updatedFolder);
    toast.info("Editor removed");
  };

  // ---- File Upload ----
  const handleUploadFile = (folderId, categoryId, subCategory) => {
    // Check if user has access (for editor role)
    if (userRole === "EDITOR") {
      const folder = folders.find((f) => f.id === folderId);
      if (!folder.assignedEditors.includes(userRole)) {
        toast.error("You are not assigned to this folder");
        return;
      }
    }
    setUploadData({ folderId, categoryId, subCategory });
    setUploadModalOpen(true);
  };

  const handleFileUploadSubmit = (files) => {
    const updated = folders.map((f) => {
      if (f.id === uploadData.folderId) {
        const newDeliverables = { ...f.deliverables };
        const category = newDeliverables[uploadData.categoryId];
        if (category) {
          category[uploadData.subCategory] = [
            ...(category[uploadData.subCategory] || []),
            ...files.map((file) => ({
              id: file.id,
              name: file.name,
              size: file.size,
              type: file.type,
              uploadedBy: userRole === "ADMIN" ? "Admin" : "Editor",
              uploadedAt: new Date().toISOString(),
            })),
          ];
        }
        return { ...f, deliverables: newDeliverables };
      }
      return f;
    });
    setFolders(updated);
    const updatedFolder = updated.find((f) => f.id === uploadData.folderId);
    setSelectedFolder(updatedFolder);
    toast.success("Files uploaded!");
    setUploadModalOpen(false);
  };

  const handleDeleteFile = (fileId, folderId, categoryId, subCategory) => {
    const updated = folders.map((f) => {
      if (f.id === folderId) {
        const newDeliverables = { ...f.deliverables };
        newDeliverables[categoryId][subCategory] = newDeliverables[categoryId][
          subCategory
        ].filter((file) => file.id !== fileId);
        return { ...f, deliverables: newDeliverables };
      }
      return f;
    });
    setFolders(updated);
    const updatedFolder = updated.find((f) => f.id === folderId);
    setSelectedFolder(updatedFolder);
    toast.success("File deleted");
  };

  return (
    <>
      <ToastContainer position="top-right" />
      <div className="min-h-screen bg-[#F6F9F5] p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#2D3A45] flex items-center gap-2">
                <FaFolder className="text-[#5A7863]" /> Project Management
              </h1>
              <p className="text-sm text-[#8A9A8F]">
                Manage client folders, assign editors, and track deliverables
              </p>
            </div>
            {userRole === "ADMIN" && (
              <button
                onClick={() => setCreateFolderOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#5A7863] text-white rounded-2xl font-medium hover:bg-[#4A6853] transition shadow-sm"
              >
                <FaPlus /> New Folder
              </button>
            )}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4">
              <FolderList
                folders={filteredFolders}
                selectedFolder={selectedFolder}
                onSelectFolder={setSelectedFolder}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>
            <div className="lg:col-span-8">
              {selectedFolder ? (
                <FolderDetails
                  folder={selectedFolder}
                  editors={editors}
                  userRole={userRole}
                  onAssignEditor={handleAssignEditor}
                  onRemoveEditor={handleRemoveEditor}
                  onUploadFile={handleUploadFile}
                  onDeleteFile={(fileId, categoryId, subCategory) =>
                    handleDeleteFile(fileId, selectedFolder.id, categoryId, subCategory)
                  }
                  onDeleteFolder={handleDeleteFolder}
                />
              ) : (
                <div className="bg-white rounded-2xl border border-[#E5ECE1] shadow-sm p-12 text-center">
                  <FaFolder className="text-6xl text-[#D5E0D0] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-[#2D3A45]">Select a folder</h3>
                  <p className="text-sm text-[#8A9A8F] mt-2">
                    Choose a folder from the left panel to view and manage deliverables
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== CREATE FOLDER MODAL ===== */}
      <CommonModal
        isOpen={createFolderOpen}
        onClose={() => setCreateFolderOpen(false)}
        title="Create New Folder"
        size="md"
      >
        <form onSubmit={handleCreateFolder} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#2D3A45] mb-1.5">
              Folder Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={newFolder.name}
              onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
              placeholder="e.g. Sharma Wedding"
              className="w-full h-12 px-4 rounded-2xl border border-[#E5ECE1] bg-[#F8FAF7] outline-none focus:bg-white focus:border-[#5A7863] focus:ring-4 focus:ring-[#5A7863]/10 transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#2D3A45] mb-1.5">
              Client Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={newFolder.clientName}
              onChange={(e) => setNewFolder({ ...newFolder, clientName: e.target.value })}
              placeholder="e.g. Vineet & Priya Sharma"
              className="w-full h-12 px-4 rounded-2xl border border-[#E5ECE1] bg-[#F8FAF7] outline-none focus:bg-white focus:border-[#5A7863] focus:ring-4 focus:ring-[#5A7863]/10 transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#2D3A45] mb-1.5">
              Wedding Date
            </label>
            <input
              type="date"
              value={newFolder.weddingDate}
              onChange={(e) => setNewFolder({ ...newFolder, weddingDate: e.target.value })}
              className="w-full h-12 px-4 rounded-2xl border border-[#E5ECE1] bg-[#F8FAF7] outline-none focus:bg-white focus:border-[#5A7863] focus:ring-4 focus:ring-[#5A7863]/10 transition"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCreateFolderOpen(false)}
              className="px-5 h-11 rounded-2xl border border-[#E5ECE1] text-[#2D3A45] hover:bg-[#F8FAF7] transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-6 h-11 rounded-2xl bg-[#5A7863] text-white font-semibold hover:bg-[#4A6853] transition disabled:opacity-50 flex items-center gap-2"
            >
              {creating ? <FaSpinner className="animate-spin" /> : <FaPlus />}
              Create
            </button>
          </div>
        </form>
      </CommonModal>

      {/* ===== ASSIGN EDITOR MODAL ===== */}
      <EditorAssignment
        isOpen={assignEditorOpen}
        onClose={() => setAssignEditorOpen(false)}
        editors={editors}
        onAssign={handleAssignEditorConfirm}
      />

      {/* ===== UPLOAD MODAL ===== */}
      <DeliverableUpload
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        categoryId={uploadData.categoryId}
        subCategory={uploadData.subCategory}
        onUpload={handleFileUploadSubmit}
      />
    </>
  );
};

export default ProjectManagement;