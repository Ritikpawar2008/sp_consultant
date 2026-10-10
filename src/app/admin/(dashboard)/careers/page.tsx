"use client";

import { useEffect, useState, useMemo } from "react";
import { Icon } from "@/components/icons";

interface Career {
  id: string;
  job_title: string;
  department: string | null;
  location: string | null;
  employment_type: string | null;
  description: string | null;
  requirements: string | null;
  is_active: boolean;
  created_at: string;
}

export default function CareersPage() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    job_title: "",
    department: "",
    location: "",
    employment_type: "",
    description: "",
    requirements: "",
    is_active: true,
  });

  const fetchCareers = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/careers");
      if (!res.ok) throw new Error("Failed to load careers");
      const data = await res.json();
      setCareers(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCareers();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      job_title: "",
      department: "",
      location: "",
      employment_type: "",
      description: "",
      requirements: "",
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (career: Career) => {
    setEditingId(career.id);
    setFormData({
      job_title: career.job_title,
      department: career.department || "",
      location: career.location || "",
      employment_type: career.employment_type || "",
      description: career.description || "",
      requirements: career.requirements || "",
      is_active: career.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const method = editingId ? "PATCH" : "POST";
      const url = editingId ? `/api/careers/${editingId}` : "/api/careers";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to save career opening");

      await fetchCareers();
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (career: Career) => {
    try {
      const res = await fetch(`/api/careers/${career.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !career.is_active }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      setCareers((prev) => 
        prev.map((c) => (c.id === career.id ? { ...c, is_active: !career.is_active } : c))
      );
    } catch (err: any) {
      alert(err.message);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this career opening? This action cannot be undone.")) return;
    
    try {
      const res = await fetch(`/api/careers/${id}`, { method: "DELETE" });
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || "Failed to delete career opening");
      }
      
      setCareers((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredCareers = useMemo(() => {
    return careers.filter((c) => {
      // Text search
      const matchesSearch = 
        c.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.department || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.location || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      let matchesStatus = true;
      if (statusFilter === "published") matchesStatus = c.is_active;
      if (statusFilter === "unpublished") matchesStatus = !c.is_active;

      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [careers, searchQuery, statusFilter]);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#09295a]">Careers</h1>
          <p className="text-sm text-[#62728a] mt-1">
            Manage career opportunities displayed by S.P. Consultant.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchCareers}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-[#09295a] hover:bg-gray-50 shadow-sm transition-colors disabled:opacity-50"
          >
            <Icon name={isLoading ? "spinner" : "refresh-cw"} className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#126ce5] text-white rounded-xl text-sm font-bold hover:bg-[#0e5bc0] shadow-sm transition-colors"
          >
            <Icon name="folder" className="w-4 h-4" />
            Add Career
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by job title, department, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#126ce5] focus:border-transparent transition-shadow"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#126ce5]"
        >
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="unpublished">Unpublished</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-center gap-2">
          <Icon name="alert-circle" className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* List Area */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200 text-sm">
                <th className="px-6 py-4 font-semibold text-[#09295a]">Job Title</th>
                <th className="px-6 py-4 font-semibold text-[#09295a]">Details</th>
                <th className="px-6 py-4 font-semibold text-[#09295a]">Status</th>
                <th className="px-6 py-4 font-semibold text-[#09295a] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Icon name="spinner" className="w-6 h-6 animate-spin mb-2" />
                      Loading careers...
                    </div>
                  </td>
                </tr>
              ) : filteredCareers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                        <Icon name="document" className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="font-medium text-gray-900">No career openings found</p>
                      <button onClick={handleOpenAdd} className="mt-2 text-sm text-[#126ce5] hover:underline">Add a new career opening</button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCareers.map((career) => (
                  <tr key={career.id} className={`hover:bg-[#f4f8fd]/50 transition-colors group ${!career.is_active ? 'opacity-70' : ''}`}>
                    <td className="px-6 py-4 align-top">
                      <div className="font-bold text-[#09295a]">{career.job_title}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Posted {new Date(career.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex flex-col gap-1.5">
                        {career.department && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Icon name="folder" className="w-3.5 h-3.5 text-gray-400" />
                            {career.department}
                          </div>
                        )}
                        {career.location && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Icon name="location" className="w-3.5 h-3.5 text-gray-400" />
                            {career.location}
                          </div>
                        )}
                        {career.employment_type && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Icon name="calendar" className="w-3.5 h-3.5 text-gray-400" />
                            {career.employment_type}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <button
                        onClick={() => handleToggleActive(career)}
                        className={`px-2.5 py-1 text-xs font-bold uppercase rounded-md shadow-sm transition-colors ${
                          career.is_active 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {career.is_active ? "Published" : "Hidden"}
                      </button>
                    </td>
                    <td className="px-6 py-4 align-top text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(career)}
                          className="p-2 text-[#126ce5] hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Career"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button
                          onClick={() => handleDelete(career.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Career"
                        >
                          <Icon name="trash" className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09295a]/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-bold text-[#09295a]">{editingId ? "Edit Career Opening" : "Add Career Opening"}</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#09295a] mb-1">Job Title *</label>
                    <input
                      required
                      type="text"
                      value={formData.job_title}
                      onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#126ce5] focus:outline-none"
                      placeholder="e.g. Senior Consultant"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#09295a] mb-1">Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#126ce5] focus:outline-none"
                      placeholder="e.g. Consulting, IT, HR"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#09295a] mb-1">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#126ce5] focus:outline-none"
                      placeholder="e.g. Remote, New York, London"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#09295a] mb-1">Employment Type</label>
                    <input
                      type="text"
                      value={formData.employment_type}
                      onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#126ce5] focus:outline-none"
                      placeholder="e.g. Full-time, Part-time, Contract"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#09295a] mb-1">Job Description</label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#126ce5] focus:outline-none resize-y"
                    placeholder="Describe the role..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#09295a] mb-1">Requirements</label>
                  <textarea
                    rows={4}
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#126ce5] focus:outline-none resize-y"
                    placeholder="List the job requirements..."
                  />
                </div>

                <div className="flex items-center gap-2 border-t border-gray-100 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-[#126ce5] border-gray-300 rounded focus:ring-[#126ce5]"
                    />
                    <span className="text-sm font-semibold text-[#09295a]">Published (Visible on site)</span>
                  </label>
                </div>

              </div>

              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2 bg-[#126ce5] text-white text-sm font-bold rounded-xl hover:bg-[#0e5bc0] transition-colors disabled:opacity-50"
                >
                  {isSaving && <Icon name="spinner" className="w-4 h-4 animate-spin" />}
                  {isSaving ? "Saving..." : "Save Career"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
