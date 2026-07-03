// components/EditorAssignment.jsx
import React, { useState } from "react";
import { FaUserPlus, FaSpinner } from "react-icons/fa";
import CommonModal from "../../../commonComponents/CommonModelComponents";

const EditorAssignment = ({ isOpen, onClose, editors, onAssign }) => {
  const [selectedEditor, setSelectedEditor] = useState("");
  const [assigning, setAssigning] = useState(false);

  const handleAssign = async () => {
    if (!selectedEditor) {
      toast.error("Select an editor");
      return;
    }
    setAssigning(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    onAssign(selectedEditor);
    setAssigning(false);
    setSelectedEditor("");
    onClose();
  };

  return (
    <CommonModal isOpen={isOpen} onClose={onClose} title="Assign Editor to Folder" size="sm">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-[#2D3A45] mb-1.5">Select Editor</label>
          <select
            value={selectedEditor}
            onChange={(e) => setSelectedEditor(e.target.value)}
            className="w-full h-12 px-4 rounded-2xl border border-[#E5ECE1] bg-[#F8FAF7] outline-none focus:bg-white focus:border-[#5A7863] focus:ring-4 focus:ring-[#5A7863]/10 transition"
          >
            <option value="">Choose an editor...</option>
            {editors.map((editor) => (
              <option key={editor.id} value={editor.id}>
                {editor.name} ({editor.email})
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 h-11 rounded-2xl border border-[#E5ECE1] text-[#2D3A45] hover:bg-[#F8FAF7] transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={assigning || !selectedEditor}
            className="px-6 h-11 rounded-2xl bg-[#5A7863] text-white font-semibold hover:bg-[#4A6853] transition disabled:opacity-50 flex items-center gap-2"
          >
            {assigning ? <FaSpinner className="animate-spin" /> : <FaUserPlus />}
            {assigning ? "Assigning..." : "Assign"}
          </button>
        </div>
      </div>
    </CommonModal>
  );
};

export default EditorAssignment;