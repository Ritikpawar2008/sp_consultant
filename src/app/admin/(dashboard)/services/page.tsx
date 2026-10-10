"use client";

import { useEffect, useState, useMemo } from "react";
import { Icon } from "@/components/icons";

interface Service {
  id: string;
  title: string;
  slug: string;
  icon: string | null;
  short_description: string | null;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    icon: "",
    short_description: "",
    description: "",
    display_order: 0,
    is_active: true,
  });

  const fetchServices = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/services");
      if (!res.ok) throw new Error("Failed to load services");
      const data = await res.json();
      setServices(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      title: "",
      slug: "",
      icon: "",
      short_description: "",
      description: "",
      display_order: services.length * 10,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service: Service) => {
    setEditingId(service.id);
    setFormData({
      title: service.title,
      slug: service.slug,
      icon: service.icon || "",
      short_description: service.short_description || "",
      description: service.description || "",
      display_order: service.display_order,
      is_active: service.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const method = editingId ? "PATCH" : "POST";
      const url = editingId ? `/api/services/${editingId}` : "/api/services";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to save service");

      await fetchServices();
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !service.is_active }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      setServices((prev) => 
        prev.map((s) => (s.id === service.id ? { ...s, is_active: !service.is_active } : s))
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service? This action cannot be undone.")) return;
    
    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || "Failed to delete service");
      }
      
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredServices = useMemo(() => {
    return services.filter((s) => 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.short_description || "").toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => a.display_order - b.display_order);
  }, [services, searchQuery]);

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    if (!editingId) {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setFormData(prev => ({ ...prev, title, slug }));
    } else {
      setFormData(prev => ({ ...prev, title }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#09295a]">Services</h1>
          <p className="text-sm text-[#62728a] mt-1">
            Manage the services offered by S.P. Consultant.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchServices}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-[#09295a] hover:bg-gray-50 shadow-sm transition-colors disabled:opacity-50"
          >
            <Icon name={isLoading ? "spinner" : "refresh-cw"} className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#126ce5] text-white rounded-xl text-sm font-bold hover:bg-[#0e5bc0] shadow-sm transition-colors"
          >
            <Icon name="sparkle" className="w-4 h-4" />
            Add Service
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#126ce5] focus:border-transparent transition-shadow"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-center gap-2">
          <Icon name="alert-circle" className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Main Table Area */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col relative">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[#62728a] text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold w-12 text-center">Order</th>
                <th className="px-6 py-4 font-semibold">Service</th>
                <th className="px-6 py-4 font-semibold hidden md:table-cell">Description</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-400">
                    <Icon name="spinner" className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading services...
                  </td>
                </tr>
              ) : filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                        <Icon name="sparkle" className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="font-medium text-gray-900">No services found</p>
                      <button onClick={handleOpenAdd} className="mt-2 text-sm text-[#126ce5] hover:underline">Create your first service</button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredServices.map((service) => (
                  <tr key={service.id} className={`hover:bg-[#f4f8fd]/50 transition-colors group ${!service.is_active ? 'opacity-70' : ''}`}>
                    <td className="px-6 py-4 text-center font-mono text-gray-400">
                      {service.display_order}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#09295a]">{service.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5 font-mono">/{service.slug}</div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-gray-600 max-w-xs truncate">
                      {service.short_description || <span className="text-gray-300 italic">No description</span>}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggleActive(service)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                          service.is_active 
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                            : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {service.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(service)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Service"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Service"
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
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-bold text-[#09295a]">{editingId ? "Edit Service" : "Add New Service"}</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#09295a] mb-1">Service Title *</label>
                    <input
                      required
                      type="text"
                      value={formData.title}
                      onChange={handleTitleChange}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#126ce5] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#09295a] mb-1">URL Slug *</label>
                    <input
                      required
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#126ce5] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#09295a] mb-1">Short Description</label>
                  <textarea
                    rows={2}
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#126ce5] focus:outline-none resize-none"
                    placeholder="A brief summary for cards and lists..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#09295a] mb-1">Full Description</label>
                  <textarea
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#126ce5] focus:outline-none resize-none"
                    placeholder="Detailed description of the service..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 pt-4 mt-2">
                  <div>
                    <label className="block text-sm font-semibold text-[#09295a] mb-1">Display Order</label>
                    <input
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#126ce5] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#09295a] mb-1">Icon Identifier</label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#126ce5] focus:outline-none"
                      placeholder="e.g. building"
                    />
                  </div>
                  <div className="flex items-center mt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-4 h-4 text-[#126ce5] border-gray-300 rounded focus:ring-[#126ce5]"
                      />
                      <span className="text-sm font-semibold text-[#09295a]">Active / Published</span>
                    </label>
                  </div>
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
                  {isSaving ? "Saving..." : "Save Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
