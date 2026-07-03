// components/FolderDetails.jsx
import React, { useState } from "react";
import {
  FaFolderOpen,
  FaUser,
  FaTimes,
  FaTrash,
  FaUserPlus,
  FaChevronRight,
  FaChevronDown,
  FaUpload,
  FaImage,
  FaVideo,
  FaFileAlt,
} from "react-icons/fa";
import { DELIVERABLE_CATEGORIES } from "./dummyData";

const CategoryItem = ({ category, deliverables, onUpload }) => {
  const [expanded, setExpanded] = useState(false);
  const totalFiles = Object.values(deliverables).reduce((acc, items) => acc + items.length, 0);

  return (
    <div className="border border-[#E5ECE1] rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 bg-[#F8FAF7] hover:bg-[#F0F7ED] transition"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{category.label.split(" ")[0]}</span>
          <span className="font-medium text-[#2D3A45]">{category.label}</span>
          <span className="text-xs text-[#8A9A8F] bg-white px-2 py-0.5 rounded-full">{totalFiles} files</span>
        </div>
        {expanded ? <FaChevronDown size={14} /> : <FaChevronRight size={14} />}
      </button>

      {expanded && (
        <div className="p-4 bg-white space-y-3">
          {category.subCategories.map((sub) => {
            const files = deliverables[sub] || [];
            return (
              <div key={sub} className="flex items-center justify-between p-3 bg-[#F8FAF7] rounded-xl">
                <span className="text-sm text-[#2D3A45]">{sub}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#8A9A8F]">{files.length} files</span>
                  <button
                    onClick={() => onUpload(category.id, sub)}
                    className="px-3 py-1.5 bg-[#5A7863] text-white text-xs rounded-lg hover:bg-[#4A6853] transition flex items-center gap-1.5"
                  >
                    <FaUpload size={10} /> Upload
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const FileItem = ({ file, onDelete }) => {
  const getFileIcon = (type) => {
    if (type?.startsWith("image")) return <FaImage className="text-emerald-500" />;
    if (type?.startsWith("video")) return <FaVideo className="text-blue-500" />;
    return <FaFileAlt className="text-slate-500" />;
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#E5ECE1] hover:shadow-sm transition">
      <div className="flex items-center gap-3">
        {getFileIcon(file.type)}
        <div>
          <p className="text-sm font-medium text-[#2D3A45]">{file.name}</p>
          <p className="text-xs text-[#8A9A8F]">
            {(file.size / 1024 / 1024).toFixed(1)} MB • {file.uploadedBy}
          </p>
        </div>
      </div>
      <button
        onClick={() => onDelete(file.id)}
        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
      >
        <FaTrash size={14} />
      </button>
    </div>
  );
};

const FolderDetails = ({
  folder,
  editors,
  userRole,
  onAssignEditor,
  onRemoveEditor,
  onUploadFile,
  onDeleteFile,
  onDeleteFolder,
}) => {
  const getEditorName = (id) => {
    const editor = editors.find((e) => e.id === id);
    return editor ? editor.name : id;
  };

  const categories = Object.values(DELIVERABLE_CATEGORIES);

  return (
    <div className="bg-white rounded-2xl border border-[#E5ECE1] shadow-sm p-5 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-[#E5ECE1]">
        <div>
          <h2 className="text-xl font-bold text-[#2D3A45] flex items-center gap-2">
            <FaFolderOpen className="text-[#5A7863]" /> {folder.name}
          </h2>
          <p className="text-sm text-[#8A9A8F]">{folder.clientName}</p>
          <p className="text-xs text-[#8A9A8F] mt-1">📅 {folder.weddingDate}</p>
        </div>
        {userRole === "ADMIN" && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onAssignEditor(folder)}
              className="px-4 py-2 bg-[#F0F7ED] text-[#5A7863] rounded-xl text-sm font-medium hover:bg-[#E5ECE1] transition flex items-center gap-2"
            >
              <FaUserPlus /> Assign Editor
            </button>
            <button
              onClick={() => onDeleteFolder(folder.id)}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
            >
              <FaTrash />
            </button>
          </div>
        )}
      </div>

      {/* Assigned Editors */}
      <div className="py-3 border-b border-[#E5ECE1]">
        <p className="text-xs font-semibold text-[#8A9A8F] uppercase tracking-wider mb-2">Assigned Editors</p>
        <div className="flex flex-wrap gap-2">
          {folder.assignedEditors.length === 0 ? (
            <span className="text-sm text-[#8A9A8F]">No editors assigned</span>
          ) : (
            folder.assignedEditors.map((editorId) => (
              <span
                key={editorId}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#F0F7ED] text-[#5A7863] rounded-full text-sm"
              >
                <FaUser size={12} />
                {getEditorName(editorId)}
                {userRole === "ADMIN" && (
                  <button
                    onClick={() => onRemoveEditor(folder.id, editorId)}
                    className="text-red-400 hover:text-red-600 ml-1"
                  >
                    <FaTimes size={12} />
                  </button>
                )}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Deliverables */}
      <div className="pt-4">
        <h3 className="font-semibold text-[#2D3A45] mb-3">Deliverables</h3>
        <div className="space-y-3">
          {categories.map((category) => {
            const deliverables = folder.deliverables[category.id] || {};
            return (
              <CategoryItem
                key={category.id}
                category={category}
                deliverables={deliverables}
                onUpload={(catId, sub) => onUploadFile(folder.id, catId, sub)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FolderDetails;