"use client";

import { useEffect, useState, useMemo } from "react";
import { Icon } from "@/components/icons";

interface Review {
  id: string;
  client_name: string;
  client_role: string | null;
  review_text: string;
  rating: number;
  image_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  status: string;
  created_at: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    client_name: "",
    client_role: "",
    review_text: "",
    rating: 5,
    image_url: "",
    is_featured: false,
    is_active: true,
    status: "approved",
  });

  const fetchReviews = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/reviews");
      if (!res.ok) throw new Error("Failed to load reviews");
      const data = await res.json();
      setReviews(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      client_name: "",
      client_role: "",
      review_text: "",
      rating: 5,
      image_url: "",
      is_featured: false,
      is_active: true,
      status: "approved",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (review: Review) => {
    setEditingId(review.id);
    setFormData({
      client_name: review.client_name,
      client_role: review.client_role || "",
      review_text: review.review_text,
      rating: review.rating,
      image_url: review.image_url || "",
      is_featured: review.is_featured,
      is_active: review.is_active,
      status: review.status || (review.is_active ? 'approved' : 'rejected'),
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const method = editingId ? "PATCH" : "POST";
      const url = editingId ? `/api/reviews/${editingId}` : "/api/reviews";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to save review");

      await fetchReviews();
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };


  const handleToggleFeatured = async (review: Review) => {
    try {
      const res = await fetch(`/api/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_featured: !review.is_featured }),
      });
      if (!res.ok) throw new Error("Failed to update featured status");
      
      setReviews((prev) => 
        prev.map((r) => (r.id === review.id ? { ...r, is_featured: !review.is_featured } : r))
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review? This action cannot be undone.")) return;
    
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || "Failed to delete review");
      }
      
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      // Text search
      const matchesSearch = 
        r.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.review_text.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      let matchesStatus = true;
      if (statusFilter !== "all" && statusFilter !== "featured") {
        matchesStatus = r.status === statusFilter;
      }
      if (statusFilter === "featured") matchesStatus = r.is_featured;

      // Rating filter
      let matchesRating = true;
      if (ratingFilter !== "all") matchesRating = r.rating.toString() === ratingFilter;

      return matchesSearch && matchesStatus && matchesRating;
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); // Sort newest first in UI
  }, [reviews, searchQuery, statusFilter, ratingFilter]);

  // Helper to render stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5 text-yellow-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg key={star} className={`w-4 h-4 ${star <= rating ? "fill-current" : "text-gray-200 fill-current"}`} viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const handleUpdateStatus = async (review: Review, newStatus: string) => {
    try {
      const res = await fetch(`/api/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      setReviews((prev) => 
        prev.map((r) => (r.id === review.id ? { ...r, status: newStatus, is_active: newStatus === 'approved' } : r))
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#09295a]">Reviews</h1>
          <p className="text-sm text-[#62728a] mt-1">
            Manage client reviews and testimonials displayed by S.P. Consultant.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchReviews}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-[#09295a] hover:bg-gray-50 shadow-sm transition-colors disabled:opacity-50"
          >
            <Icon name={isLoading ? "spinner" : "refresh-cw"} className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#126ce5] text-white rounded-xl text-sm font-bold hover:bg-[#0e5bc0] shadow-sm transition-colors"
          >
            <Icon name="message-square" className="w-4 h-4" />
            Add Review
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by client name or review content..."
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
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
          <option value="featured">Featured Only</option>
        </select>
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#126ce5]"
        >
          <option value="all">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
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
                <th className="px-6 py-4 font-semibold w-16">Date</th>
                <th className="px-6 py-4 font-semibold">Client</th>
                <th className="px-6 py-4 font-semibold hidden md:table-cell">Review</th>
                <th className="px-6 py-4 font-semibold">Rating</th>
                <th className="px-6 py-4 font-semibold text-center">Featured</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-gray-400">
                    <Icon name="spinner" className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading reviews...
                  </td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                        <Icon name="message-square" className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="font-medium text-gray-900">No reviews found</p>
                      <button onClick={handleOpenAdd} className="mt-2 text-sm text-[#126ce5] hover:underline">Add your first review</button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReviews.map((review) => (
                  <tr key={review.id} className={`hover:bg-[#f4f8fd]/50 transition-colors group ${!review.is_active ? 'opacity-70' : ''}`}>
                    <td className="px-6 py-4 text-xs font-mono text-gray-400 whitespace-nowrap">
                      {new Date(review.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#09295a]">{review.client_name}</div>
                      {review.client_role && (
                        <div className="text-xs text-gray-500 mt-0.5">{review.client_role}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-gray-600 max-w-sm">
                      <div className="line-clamp-2 italic">"{review.review_text}"</div>
                    </td>
                    <td className="px-6 py-4">
                      {renderStars(review.rating)}
                    </td>
                    <td className="px-6 py-4 text-center">
                       <button onClick={() => handleToggleFeatured(review)} className="focus:outline-none">
                         <Icon name="star" className={`w-5 h-5 mx-auto ${review.is_featured ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                       </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <select
                        value={review.status || (review.is_active ? 'approved' : 'rejected')}
                        onChange={(e) => handleUpdateStatus(review, e.target.value)}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold border transition-colors focus:outline-none cursor-pointer ${
                          review.status === 'approved' || (review.status == null && review.is_active)
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                            : review.status === 'pending'
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
                            : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                        }`}
                      >
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(review)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Review"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Review"
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
              <h3 className="text-lg font-bold text-[#09295a]">{editingId ? "Edit Review" : "Add New Review"}</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-5">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#09295a] mb-1">Client Name *</label>
                    <input
                      required
                      type="text"
                      value={formData.client_name}
                      onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#126ce5] focus:outline-none"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#09295a] mb-1">Client Role/Company</label>
                    <input
                      type="text"
                      value={formData.client_role}
                      onChange={(e) => setFormData({ ...formData, client_role: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#126ce5] focus:outline-none"
                      placeholder="e.g. CEO, TechCorp"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#09295a] mb-1">Review Content *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.review_text}
                    onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#126ce5] focus:outline-none resize-none"
                    placeholder="Write the review here..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#09295a] mb-1">Rating</label>
                    <div className="flex gap-1 items-center h-[38px]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData({ ...formData, rating: star })}
                          className="focus:outline-none"
                        >
                          <svg className={`w-8 h-8 transition-colors ${star <= formData.rating ? 'text-yellow-400 fill-current' : 'text-gray-200 fill-current hover:text-yellow-200'}`} viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#09295a] mb-1">Client Avatar Image URL</label>
                    <input
                      type="text"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#126ce5] focus:outline-none"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 border-t border-gray-100 pt-5">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-[#09295a] mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value, is_active: e.target.value === 'approved' })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#126ce5] focus:outline-none"
                    >
                      <option value="approved">Approved (Visible)</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected (Hidden)</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer mt-6">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                      />
                      <span className="text-sm font-semibold text-[#09295a]">Featured Review</span>
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
                  {isSaving ? "Saving..." : "Save Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
