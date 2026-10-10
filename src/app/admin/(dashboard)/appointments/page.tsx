"use client";

import { useEffect, useState, useMemo } from "react";
import { Icon } from "@/components/icons";

interface Appointment {
  id: string;
  name: string;
  email: string;
  phone: string;
  appointment_date: string;
  appointment_time: string;
  service_id: string;
  service_name: string;
  reason: string;
  status: string;
  created_at: string;
  updated_at: string;
  is_read: boolean;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  
  // Selected appointment for details modal
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchAppointments = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/appointments");
      if (!res.ok) throw new Error("Failed to load appointments");
      const data = await res.json();
      setAppointments(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update status");
      }
      
      const result = await res.json();
      
      setAppointments((prev) => 
        prev.map((a) => (a.id === id ? { ...a, status: result.data.status } : a))
      );
      
      if (selectedAppointment && selectedAppointment.id === id) {
        setSelectedAppointment({ ...selectedAppointment, status: result.data.status });
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this appointment? This action cannot be undone.")) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete appointment");
      
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      setSelectedAppointment(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const matchesSearch = 
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.phone.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || a.status.toLowerCase() === statusFilter.toLowerCase();
      
      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: appointments.length,
      pending: appointments.filter((a) => a.status === "pending" || a.status === "booked").length,
      confirmed: appointments.filter((a) => a.status === "confirmed").length,
      completed: appointments.filter((a) => a.status === "completed").length,
      cancelled: appointments.filter((a) => a.status === "cancelled" || a.status === "not_booked").length,
    };
  }, [appointments]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#09295a]">Appointments</h1>
          <p className="text-sm text-[#62728a] mt-1">
            Manage and track appointment requests received from the website.
          </p>
        </div>
        <button
          onClick={fetchAppointments}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-[#09295a] hover:bg-gray-50 shadow-sm transition-colors disabled:opacity-50"
        >
          <Icon name={isLoading ? "spinner" : "refresh-cw"} className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-[#09295a]" },
          { label: "Pending", value: stats.pending, color: "text-blue-600" },
          { label: "Confirmed", value: stats.confirmed, color: "text-indigo-600" },
          { label: "Completed", value: stats.completed, color: "text-green-600" },
          { label: "Cancelled", value: stats.cancelled, color: "text-red-600" },
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
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#126ce5] focus:border-transparent cursor-pointer min-w-[140px]"><option value="newest">Newest First</option><option value="oldest">Oldest First</option><option value="date">Appointment Date</option><option value="status">Status</option></select><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#126ce5] focus:border-transparent cursor-pointer min-w-[140px]"><option value="all">All Statuses</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select>
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
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Date & Time</th>
                <th className="px-6 py-4 font-semibold">Service</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Submitted On</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-400">
                    <Icon name="spinner" className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading appointments...
                  </td>
                </tr>
              ) : filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                        <Icon name="calendar" className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="font-medium text-gray-900">No appointments found</p>
                      <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-[#f4f8fd]/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#09295a]">{appointment.name}</div>
                      <div className="text-xs text-[#62728a] mt-0.5">{appointment.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[#09295a] font-medium">
                        {new Date(appointment.appointment_date).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </div>
                      <div className="text-xs text-[#62728a] mt-0.5">{appointment.appointment_time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                        {appointment.service_name || "General Consultation"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={appointment.status} />
                    </td>
                    <td className="px-6 py-4 text-[#62728a] whitespace-nowrap">
                      {new Date(appointment.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short"
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
    setSelectedAppointment(appointment);
    // Mark as read
    if (!(appointment as any).is_read) {
      fetch("/api/admin/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "appointment", id: appointment.id }),
      }).then(() => {
        window.dispatchEvent(new Event("refreshAdminCounts"));
        setAppointments(prev => prev.map(a => a.id === appointment.id ? { ...a, is_read: true } as any : a));
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
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09295a]/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-bold text-[#09295a]">Appointment Details</h3>
              <button 
                onClick={() => setSelectedAppointment(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                <div>
                  <h4 className="text-2xl font-bold text-[#09295a]">{selectedAppointment.name}</h4>
                  <p className="text-sm text-[#62728a] mt-1">ID: <span className="font-mono text-xs">{selectedAppointment.id}</span></p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500">Status:</span>
                  <select disabled={isUpdatingStatus} value={selectedAppointment.status} onChange={(e) => handleStatusChange(selectedAppointment.id, e.target.value)} className="py-1.5 px-3 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#126ce5] cursor-pointer">{selectedAppointment.status === "booked" && <option value="booked">Booked (New)</option>}<option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>{selectedAppointment.status === "not_booked" && <option value="not_booked">Not Booked (Conflict)</option>}</select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</span>
                  <a href={`mailto:${selectedAppointment.email}`} className="text-[#126ce5] hover:underline break-all">
                    {selectedAppointment.email}
                  </a>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Phone</span>
                  <a href={`tel:${selectedAppointment.phone}`} className="text-[#09295a] font-medium hover:underline">
                    {selectedAppointment.phone}
                  </a>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date & Time</span>
                  <span className="text-[#09295a] font-medium block">
                    {new Date(selectedAppointment.appointment_date).toLocaleDateString("en-IN", {
                      weekday: "short", day: "numeric", month: "short", year: "numeric"
                    })}
                  </span>
                  <span className="text-sm text-[#126ce5] font-semibold mt-1 block">
                    {selectedAppointment.appointment_time}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Service</span>
                  <span className="text-[#09295a] font-medium">{selectedAppointment.service_name || "General Consultation"}</span>
                </div>
              </div>

              {selectedAppointment.reason && (
                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Notes / Reason</span>
                  <div className="bg-white border border-gray-200 p-5 rounded-2xl text-[#09295a] text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedAppointment.reason}
                  </div>
                </div>
              )}
              
              <div className="mt-4 text-xs text-gray-400">
                Created on: {new Date(selectedAppointment.created_at).toLocaleString()}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <button
                onClick={() => handleDelete(selectedAppointment.id)}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
              >
                <Icon name="trash" className="w-4 h-4" />
                {isDeleting ? "Deleting..." : "Delete Appointment"}
              </button>
              <button
                onClick={() => setSelectedAppointment(null)}
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
  switch (status.toLowerCase()) {
    case "booked":
    case "pending":
      return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">{status}</span>;
    case "confirmed":
      return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">Confirmed</span>;
    case "completed":
      return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">Completed</span>;
    case "not_booked":
    case "cancelled":
      return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">{status}</span>;
    default:
      return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">{status}</span>;
  }
}


