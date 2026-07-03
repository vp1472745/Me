// components/FolderList.jsx
import React from "react";
import { FaFolder, FaFolderOpen, FaSearch, FaFilter } from "react-icons/fa";

const FolderList = ({ folders, selectedFolder, onSelectFolder, searchTerm, onSearchChange, viewMode, onViewModeChange }) => {
  return (
    <div className="bg-white rounded-2xl border border-[#E5ECE1] shadow-sm overflow-hidden">
      <div className="p-4 border-b border-[#E5ECE1]">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A9A8F]" />
          <input
            type="text"
            placeholder="Search folders..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#E5ECE1] bg-[#F8FAF7] focus:border-[#5A7863] focus:ring-4 focus:ring-[#5A7863]/10 outline-none transition"
          />
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-[#8A9A8F]">{folders.length} folders</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewModeChange("list")}
              className={`p-2 rounded-xl transition ${
                viewMode === "list" ? "bg-[#5A7863] text-white" : "bg-[#F8FAF7] text-[#8A9A8F] hover:bg-[#E5ECE1]"
              }`}
              title="List view"
            >
              <FaFolder size={14} />
            </button>
            <button
              onClick={() => onViewModeChange("grid")}
              className={`p-2 rounded-xl transition ${
                viewMode === "grid" ? "bg-[#5A7863] text-white" : "bg-[#F8FAF7] text-[#8A9A8F] hover:bg-[#E5ECE1]"
              }`}
              title="Grid view"
            >
              <FaFolderOpen size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-h-[600px] overflow-y-auto p-3 space-y-3 custom-scroll">
        {folders.map((folder) => (
          <div
            key={folder.id}
            onClick={() => onSelectFolder(folder)}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
              selectedFolder?.id === folder.id
                ? "border-[#5A7863] bg-[#F0F7ED] shadow-md"
                : "border-[#E5ECE1] hover:border-[#B8CDAE] hover:bg-[#F8FAF7]"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    selectedFolder?.id === folder.id ? "bg-[#5A7863] text-white" : "bg-[#E5ECE1] text-[#5A7863]"
                  }`}
                >
                  {selectedFolder?.id === folder.id ? <FaFolderOpen size={22} /> : <FaFolder size={22} />}
                </div>
                <div>
                  <h4 className="font-semibold text-[#2D3A45]">{folder.name}</h4>
                  <p className="text-sm text-[#8A9A8F]">{folder.clientName}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs bg-[#F0F7ED] text-[#5A7863] px-2.5 py-1 rounded-full font-medium">
                  {Object.values(folder.deliverables).reduce(
                    (acc, cat) => acc + Object.values(cat).reduce((s, items) => s + items.length, 0),
                    0
                  )} files
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-[#8A9A8F]">
              <span>📅 {folder.weddingDate}</span>
              <span className="flex items-center gap-1">
                <FaFilter size={12} />
                {folder.assignedEditors.length} editors
              </span>
            </div>
          </div>
        ))}
        {folders.length === 0 && (
          <div className="text-center py-10">
            <FaFolder className="text-4xl text-[#D5E0D0] mx-auto mb-2" />
            <p className="text-[#8A9A8F]">No folders found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FolderList;