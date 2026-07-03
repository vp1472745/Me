// components/DeliverableUpload.jsx
import React, { useState } from "react";
import { FaUpload, FaTimes, FaSpinner, FaImage, FaVideo } from "react-icons/fa";
import CommonModal from "../../../commonComponents/CommonModelComponents";

const DeliverableUpload = ({
  isOpen,
  onClose,
  categoryId,
  subCategory,
  onUpload,
}) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(
      selected.map((f) => ({
        id: Date.now() + Math.random().toString(36),
        name: f.name,
        size: f.size,
        type: f.type,
        file: f,
      }))
    );
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Select files to upload");
      return;
    }
    setUploading(true);
    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 1000));
    onUpload(files);
    setFiles([]);
    setUploading(false);
    onClose();
  };

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <CommonModal isOpen={isOpen} onClose={onClose} title={`Upload to ${subCategory}`} size="md">
      <div className="space-y-4">
        <div
          className="border-2 border-dashed border-[#E5ECE1] rounded-2xl p-8 text-center hover:border-[#5A7863] transition cursor-pointer"
          onClick={() => document.getElementById("uploadFileInput").click()}
        >
          <FaUpload className="text-3xl text-[#8A9A8F] mx-auto mb-2" />
          <p className="text-[#2D3A45] font-medium">Click or drag files here</p>
          <p className="text-xs text-[#8A9A8F] mt-1">Upload images or videos</p>
          <input
            id="uploadFileInput"
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {files.length > 0 && (
          <div className="max-h-48 overflow-y-auto space-y-2">
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-[#F8FAF7] rounded-xl">
                <div className="flex items-center gap-3">
                  {file.type.startsWith("image") ? (
                    <FaImage className="text-emerald-500" />
                  ) : (
                    <FaVideo className="text-blue-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-[#2D3A45]">{file.name}</p>
                    <p className="text-xs text-[#8A9A8F]">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                </div>
                <button onClick={() => removeFile(file.id)} className="text-red-400 hover:text-red-600">
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 h-11 rounded-2xl border border-[#E5ECE1] text-[#2D3A45] hover:bg-[#F8FAF7] transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="px-6 h-11 rounded-2xl bg-[#5A7863] text-white font-semibold hover:bg-[#4A6853] transition disabled:opacity-50 flex items-center gap-2"
          >
            {uploading ? (
              <>
                <FaSpinner className="animate-spin" /> Uploading...
              </>
            ) : (
              <>
                <FaUpload /> Upload
              </>
            )}
          </button>
        </div>
      </div>
    </CommonModal>
  );
};

export default DeliverableUpload;