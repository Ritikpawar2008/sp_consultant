"use client";

import { useEffect, useState, useMemo } from "react";
import { Icon } from "@/components/icons";

interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  service_id: string;
  service_name: string;
  message: string;
  status: "new" | "contacted" | "closed";
  created_at: string;
  updated_at: string;
  is_read: boolean;
}

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "contacted" | "closed">("all");
  const [sortOrder, setSortOrder] = useState("newest");
  
  // Selected enquiry for details modal
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchEnquiries = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/enquiries");
      if (!res.ok) throw new Error("Failed to load enquiries");
      const data = await res.json();
      setEnquiries(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const result = await res.json();
      
      setEnquiries((prev) => 
        prev.map((e) => (e.id === id ? { ...e, status: result.data.status } : e))
      );
      
      if (selectedEnquiry && selectedEnquiry.id === id) {
        setSelectedEnquiry({ ...selectedEnquiry, status: result.data.status });
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this enquiry? This action cannot be undone.")) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/enquiries/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete enquiry");
      
      setEnquiries((prev) => prev.filter((e) => e.id !== id));
      setSelectedEnquiry(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((e) => {
      const matchesSearch = 
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.phone.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || e.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [enquiries, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: enquiries.length,
      new: enquiries.filter((e) => e.status === "new").length,
      contacted: enquiries.filter((e) => e.status === "contacted").length,
      closed: enquiries.filter((e) => e.status === "closed").length,
    };
  }, [enquiries]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#09295a]">Enquiries</h1>
          <p className="text-sm text-[#62728a] mt-1">
            Manage and respond to enquiries received from the website.
          </p>
        </div>
        <button
          onClick={fetchEnquiries}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-[#09295a] hover:bg-gray-50 shadow-sm transition-colors disabled:opacity-50"
        >
          <Icon name={isLoading ? "spinner" : "refresh-cw"} className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Enquiries", value: stats.total, color: "text-[#09295a]" },
          { label: "New", value: stats.new, color: "text-blue-600" },
          { label: "Contacted", value: stats.contacted, color: "text-amber-600" },
          { label: "Closed", value: stats.closed, color: "text-green-600" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <span className="text-sm font-medium text-[#62728a]">{stat.label}</span>
            <span className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#126ce5] focus:border-transparent transition-shadow"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#126ce5] focus:border-transparent cursor-pointer min-w-[140px]"
        >
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="closed">Closed</option>
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
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold">Service</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-400">
                    <Icon name="spinner" className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading enquiries...
                  </td>
                </tr>
              ) : filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                        <Icon name="inbox" className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="font-medium text-gray-900">No enquiries found</p>
                      <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((enquiry) => (
                  <tr key={enquiry.id} className="hover:bg-[#f4f8fd]/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-[#09295a]">
                      {enquiry.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[#09295a]">{enquiry.email}</div>
                      <div className="text-xs text-[#62728a] mt-0.5">{enquiry.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                        {enquiry.service_name || "General Enquiry"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={enquiry.status} />
                    </td>
                    <td className="px-6 py-4 text-[#62728a] whitespace-nowrap">
                      {new Date(enquiry.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
    setSelectedEnquiry(enquiry);
    // Mark as read
    if (!(enquiry as any).is_read) {
      fetch("/api/admin/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "enquiry", id: enquiry.id }),
      }).then(() => {
        window.dispatchEvent(new Event("refreshAdminCounts"));
        setEnquiries(prev => prev.map(e => e.id === enquiry.id ? { ...e, is_read: true } as any : e));
      }).catch(console.error);
    }
  }}
                        className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-[#126ce5] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09295a]/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-bold text-[#09295a]">Enquiry Details</h3>
              <button 
                onClick={() => setSelectedEnquiry(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                <div>
                  <h4 className="text-2xl font-bold text-[#09295a]">{selectedEnquiry.name}</h4>
                  <p className="text-sm text-[#62728a] mt-1">ID: <span className="font-mono text-xs">{selectedEnquiry.id}</span></p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500">Status:</span>
                  <select
                    disabled={isUpdatingStatus}
                    value={selectedEnquiry.status}
                    onChange={(e) => handleStatusChange(selectedEnquiry.id, e.target.value)}
                    className="py-1.5 px-3 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#126ce5] cursor-pointer"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</span>
                  <a href={`mailto:${selectedEnquiry.email}`} className="text-[#126ce5] hover:underline break-all">
                    {selectedEnquiry.email}
                  </a>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Phone</span>
                  <a href={`tel:${selectedEnquiry.phone}`} className="text-[#09295a] font-medium hover:underline">
                    {selectedEnquiry.phone}
                  </a>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Service Requested</span>
                  <span className="text-[#09295a] font-medium">{selectedEnquiry.service_name || "General Enquiry"}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Submitted On</span>
                  <span className="text-[#09295a] font-medium">
                    {new Date(selectedEnquiry.created_at).toLocaleString("en-IN", {
                      dateStyle: "medium", timeStyle: "short"
                    })}
                  </span>
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Message</span>
                <div className="bg-white border border-gray-200 p-5 rounded-2xl text-[#09295a] text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedEnquiry.message}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <button
                onClick={() => handleDelete(selectedEnquiry.id)}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
              >
                <Icon name="trash" className="w-4 h-4" />
                {isDeleting ? "Deleting..." : "Delete Enquiry"}
              </button>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="px-6 py-2 bg-[#09295a] text-white text-sm font-bold rounded-xl hover:bg-[#0d3369] transition-colors"
              >
                Done
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "new":
      return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">New</span>;
    case "contacted":
      return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">Contacted</span>;
    case "closed":
      return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">Closed</span>;
    default:
      return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">{status}</span>;
  }
}
