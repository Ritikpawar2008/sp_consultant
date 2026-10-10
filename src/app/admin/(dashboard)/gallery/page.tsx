"use client";

import { useEffect, useState, useMemo } from "react";
import { Icon } from "@/components/icons";
import { UploadModal } from "./UploadModal";

interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  category: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    category: "",
    display_order: 0,
    is_active: true,
  });

  const fetchGallery = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/gallery");
      if (!res.ok) throw new Error("Failed to load gallery items");
      const data = await res.json();
      setItems(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleOpenAdd = () => {
    setIsUploadOpen(true);
  };

  const handleOpenEdit = (item: GalleryItem) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      description: item.description || "",
      image_url: item.image_url,
      category: item.category || "",
      display_order: item.display_order,
      is_active: item.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const method = editingId ? "PATCH" : "POST";
      const url = editingId ? `/api/gallery/${editingId}` : "/api/gallery";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to save gallery item");

      await fetchGallery();
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (item: GalleryItem) => {
    try {
      const res = await fetch(`/api/gallery/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !item.is_active }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      setItems((prev) => 
        prev.map((i) => (i.id === item.id ? { ...i, is_active: !item.is_active } : i))
      );
    } catch (err: any) {
      alert(err.message);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this gallery item? This action cannot be undone.")) return;
    
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || "Failed to delete item");
      }
      
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((i) => {
      // Text search
      const matchesSearch = 
        i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (i.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (i.category || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      let matchesStatus = true;
      if (statusFilter === "published") matchesStatus = i.is_active;
      if (statusFilter === "unpublished") matchesStatus = !i.is_active;

      // Category filter
      let matchesCategory = true;
      if (categoryFilter === "unassigned") matchesCategory = !i.category;
      else if (categoryFilter !== "all") matchesCategory = i.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    }).sort((a, b) => a.display_order - b.display_order);
  }, [items, searchQuery, statusFilter, categoryFilter]);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#09295a]">Gallery</h1>
          <p className="text-sm text-[#62728a] mt-1">
            Manage images and visual content displayed in the S.P. Consultant gallery.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchGallery}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-[#09295a] hover:bg-gray-50 shadow-sm transition-colors disabled:opacity-50"
          >
            <Icon name={isLoading ? "spinner" : "refresh-cw"} className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#126ce5] text-white rounded-xl text-sm font-bold hover:bg-[#0e5bc0] shadow-sm transition-colors"
          >
            <Icon name="community" className="w-4 h-4" />
            Add Gallery Images
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "all", label: "All Images" },
          { id: "Office & consultations", label: "Office & Consultations" },
          { id: "Society & site visits", label: "Society & Site Visits" },
          { id: "Milestones", label: "Milestones" },
          { id: "unassigned", label: "Unassigned" },
        ].map(cat => {
          const count = items.filter(i => cat.id === "all" ? true : cat.id === "unassigned" ? !i.category : i.category === cat.id).length;
          if (cat.id === "unassigned" && count === 0) return null; // hide unassigned if empty
          return (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm ${
                categoryFilter === cat.id
                  ? "bg-[#126ce5] text-white border border-[#126ce5]"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {cat.label} 
              <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${categoryFilter === cat.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, description or category..."
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

      {/* Gallery Grid Area */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-400 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Icon name="spinner" className="w-6 h-6 animate-spin mb-2" />
          Loading gallery items...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
            <Icon name="community" className="w-6 h-6 text-gray-400" />
          </div>
          <p className="font-medium text-gray-900">No gallery items found</p>
          <button onClick={handleOpenAdd} className="mt-2 text-sm text-[#126ce5] hover:underline">Add your first image</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className={`group bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md ${!item.is_active ? 'opacity-70 grayscale-[20%]' : ''}`}>
              <div className="relative aspect-video bg-gray-100 w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={item.image_url} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://placehold.co/600x400/f3f4f6/9ca3af?text=Image+Not+Found";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute top-2 right-2 flex gap-1">
                  <button 
                    onClick={() => handleToggleActive(item)}
                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md shadow-sm backdrop-blur-md ${
                      item.is_active 
                        ? 'bg-green-500/90 text-white' 
                        : 'bg-gray-500/90 text-white'
                    }`}
                  >
                    {item.is_active ? "Published" : "Hidden"}
                  </button>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-[#09295a] text-sm line-clamp-1" title={item.title}>{item.title}</h3>
                  <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">#{item.display_order}</span>
                </div>
                {item.category ? (
                  <span className="inline-block text-[10px] font-semibold text-[#126ce5] uppercase tracking-wider mb-2">{item.category}</span>
                ) : (
                  <span className="inline-block text-[10px] font-semibold text-red-500 bg-red-50 px-1.5 py-0.5 rounded uppercase tracking-wider mb-2 border border-red-200">Missing Section</span>
                )}
                {item.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1 mb-4 flex-1">
                    {item.description}
                  </p>
                )}
                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-[10px] text-gray-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Edit Item"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete Item"
                    >
                      <Icon name="trash" className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isUploadOpen && (
        <UploadModal 
          onClose={() => setIsUploadOpen(false)} 
          onSuccess={() => { 
            setIsUploadOpen(false); 
            fetchGallery(); 
          }} 
        />
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09295a]/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-bold text-[#09295a]">{editingId ? "Edit Gallery Item" : "Add Gallery Item"}</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-5">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#09295a] mb-1">Image URL *</label>
                      <input
                        required
                        type="url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#126ce5] focus:outline-none"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-[#09295a] mb-1">Title *</label>
                      <input
                        required
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#126ce5] focus:outline-none"
                        placeholder="e.g. Office Building"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#09295a] mb-1">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#126ce5] focus:outline-none"
                      >
                        <option value="" disabled>Select a section (Required)</option>
                        <option value="Office & consultations">Office & consultations</option>
                        <option value="Society & site visits">Society & site visits</option>
                        <option value="Milestones">Milestones</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#09295a] mb-1">Image Preview</label>
                    <div className="w-full aspect-video bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden relative">
                      {formData.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={formData.image_url} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://placehold.co/600x400/f3f4f6/9ca3af?text=Broken+Image+Link";
                          }}
                        />
                      ) : (
                        <div className="text-gray-400 flex flex-col items-center">
                          <Icon name="community" className="w-8 h-8 mb-2 opacity-50" />
                          <span className="text-xs font-medium">No image URL provided</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#09295a] mb-1">Description / Caption</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#126ce5] focus:outline-none resize-none"
                    placeholder="Describe this gallery item..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-6 border-t border-gray-100 pt-5 items-center justify-between">
                  <div className="w-32">
                    <label className="block text-sm font-semibold text-[#09295a] mb-1">Display Order</label>
                    <input
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#126ce5] focus:outline-none"
                    />
                  </div>
                  
                  <label className="flex items-center gap-2 cursor-pointer mt-4 sm:mt-0">
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
                  {isSaving ? "Saving..." : "Save Image"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
