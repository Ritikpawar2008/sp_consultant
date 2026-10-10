"use client";

import { useState, useRef } from "react";
import { Icon } from "@/components/icons";

interface UploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface SelectedFile {
  id: string;
  file: File;
  previewUrl: string;
  category: string;
  status: "pending" | "uploading" | "success" | "error";
  errorMessage?: string;
}

const CATEGORIES = [
  "Office & consultations",
  "Society & site visits",
  "Milestones",
];

const VALID_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export function UploadModal({ onClose, onSuccess }: UploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | File[]) => {
    const newFiles: SelectedFile[] = [];

    Array.from(files).forEach((file) => {
      if (!VALID_TYPES.includes(file.type)) {
        alert(`${file.name} is not a supported format. Please use JPG, PNG, or WebP.`);
        return;
      }
      if (file.size > MAX_SIZE) {
        alert(`${file.name} exceeds the 5MB limit.`);
        return;
      }

      newFiles.push({
        id: Math.random().toString(36).substring(7),
        file,
        previewUrl: URL.createObjectURL(file),
        category: "", // No default section
        status: "pending",
      });
    });

    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (id: string) => {
    setSelectedFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) URL.revokeObjectURL(file.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  };

  const updateCategory = (id: string, category: string) => {
    setSelectedFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, category } : f))
    );
  };

  const uploadAll = async () => {
    const filesToUpload = selectedFiles.filter((f) => f.status === "pending" || f.status === "error");
    if (filesToUpload.length === 0) return;

    for (const f of filesToUpload) {
      // mark uploading
      setSelectedFiles((prev) => prev.map((item) => item.id === f.id ? { ...item, status: "uploading" } : item));

      try {
        // 1. Upload file to storage
        const formData = new FormData();
        formData.append("file", f.file);

        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");

        // 2. Save gallery item to db
        const galleryRes = await fetch("/api/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: f.file.name,
            image_url: uploadData.url,
            category: f.category,
            is_active: true,
          }),
        });
        const galleryData = await galleryRes.json();
        if (!galleryRes.ok) throw new Error(galleryData.error || "Failed to save item");

        // mark success
        setSelectedFiles((prev) => prev.map((item) => item.id === f.id ? { ...item, status: "success" } : item));
      } catch (err: any) {
        // mark error
        setSelectedFiles((prev) => prev.map((item) => item.id === f.id ? { ...item, status: "error", errorMessage: err.message } : item));
      }
    }

    // if all success, close? wait, user might want to see results.
    // If we trigger onSuccess, parent will refresh.
    onSuccess();
  };

  const pendingCount = selectedFiles.filter(f => f.status === "pending" || f.status === "error").length;
  const isUploading = selectedFiles.some(f => f.status === "uploading");
  const hasMissingCategory = selectedFiles.some(f => (f.status === "pending" || f.status === "error") && !f.category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09295a]/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-lg font-bold text-[#09295a]">Add Gallery Images</h3>
          <button 
            onClick={onClose}
            disabled={isUploading}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Drag & Drop Area */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`w-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center py-12 px-6 transition-colors ${
              isDragging ? "border-[#126ce5] bg-[#126ce5]/5" : "border-gray-300 bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <Icon name="upload" className="w-10 h-10 text-[#126ce5] mb-4 opacity-80" />
            <h4 className="text-base font-bold text-[#09295a] mb-2">Drag and drop images here</h4>
            <p className="text-sm text-gray-500 mb-6 text-center max-w-md">
              Support for JPG, JPEG, PNG, and WebP up to 5MB per file.
              <br/>For production, ensure a remote storage solution (like Vercel Blob or AWS S3) is configured. Currently saving locally.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2.5 bg-[#126ce5] text-white rounded-xl text-sm font-bold shadow-sm hover:bg-[#0e5bc0] transition-colors"
            >
              Select Images
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg, image/png, image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[#09295a]">Selected Images ({selectedFiles.length})</h4>
              <div className="grid gap-4 md:grid-cols-2">
                {selectedFiles.map((f) => (
                  <div key={f.id} className="flex gap-4 items-start p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                    {/* Preview */}
                    <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      <img src={f.previewUrl} alt={f.file.name} className="w-full h-full object-cover" />
                    </div>
                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-semibold text-[#09295a] truncate" title={f.file.name}>
                          {f.file.name}
                        </p>
                        {f.status === "pending" || f.status === "error" ? (
                          <button onClick={() => removeFile(f.id)} className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors shrink-0">
                            <Icon name="trash" className="w-4 h-4" />
                          </button>
                        ) : null}
                      </div>
                      
                      {/* Section Dropdown */}
                      <select
                        value={f.category}
                        onChange={(e) => updateCategory(f.id, e.target.value)}
                        disabled={f.status === "uploading" || f.status === "success"}
                        className={`w-full text-xs font-medium px-2 py-1.5 bg-gray-50 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#126ce5] disabled:opacity-70 ${
                          !f.category ? 'border-red-400' : 'border-gray-200'
                        }`}
                      >
                        <option value="" disabled>Select a section (Required)</option>
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>

                      {/* Status */}
                      {f.status === "uploading" && (
                        <p className="text-xs text-[#126ce5] font-medium mt-2 flex items-center gap-1">
                          <Icon name="spinner" className="w-3 h-3 animate-spin" /> Uploading...
                        </p>
                      )}
                      {f.status === "success" && (
                        <p className="text-xs text-green-600 font-medium mt-2 flex items-center gap-1">
                          <Icon name="check-circle" className="w-3 h-3" /> Uploaded successfully
                        </p>
                      )}
                      {f.status === "error" && (
                        <p className="text-xs text-red-600 font-medium mt-2 line-clamp-1" title={f.errorMessage}>
                          Error: {f.errorMessage}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
          >
            {pendingCount === 0 && selectedFiles.length > 0 ? "Close" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={uploadAll}
            disabled={isUploading || pendingCount === 0 || hasMissingCategory}
            className="flex items-center gap-2 px-6 py-2 bg-[#126ce5] text-white text-sm font-bold rounded-xl hover:bg-[#0e5bc0] transition-colors disabled:opacity-50"
          >
            {isUploading && <Icon name="spinner" className="w-4 h-4 animate-spin" />}
            {isUploading ? "Uploading..." : `Upload ${pendingCount} Image${pendingCount !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
