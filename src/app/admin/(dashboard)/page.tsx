import Link from "next/link";
import { getPool } from "@/lib/db";
import { Icon } from "@/components/icons";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const pool = getPool();
  try {
    const [enqCountRes, newEnqCountRes, apptCountRes, srvCountRes, recentEnqRes, recentApptRes] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM enquiries"),
      pool.query("SELECT COUNT(*) FROM enquiries WHERE LOWER(status) = 'new' OR status IS NULL"),
      pool.query("SELECT COUNT(*) FROM appointments"),
      pool.query("SELECT COUNT(*) FROM services"),
      pool.query(`
        SELECT e.id, e.name, e.email, e.status, e.created_at, s.title as service_name 
        FROM enquiries e 
        LEFT JOIN services s ON e.service_id = s.id 
        ORDER BY e.created_at DESC LIMIT 5
      `),
      pool.query(`
        SELECT id, name, appointment_date, appointment_time, service_name, status 
        FROM appointments 
        ORDER BY created_at DESC LIMIT 5
      `)
    ]);

    return {
      stats: {
        totalEnquiries: parseInt(enqCountRes.rows[0].count, 10),
        newEnquiries: parseInt(newEnqCountRes.rows[0].count, 10),
        totalAppointments: parseInt(apptCountRes.rows[0].count, 10),
        totalServices: parseInt(srvCountRes.rows[0].count, 10),
      },
      recentEnquiries: recentEnqRes.rows,
      recentAppointments: recentApptRes.rows,
      error: null
    };
  } catch (err: any) {
    console.error("Dashboard DB Error:", err);
    return {
      stats: { totalEnquiries: 0, newEnquiries: 0, totalAppointments: 0, totalServices: 0 },
      recentEnquiries: [],
      recentAppointments: [],
      error: "Failed to load dashboard data. Please try again later."
    };
  }
}

function StatusBadge({ status }: { status: string | null }) {
  const s = (status || "New").toLowerCase();
  if (s === "new") {
    return <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">New</span>;
  }
  if (s === "contacted" || s === "booked") {
    return <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 capitalize">{status}</span>;
  }
  if (s === "closed" || s === "not_booked") {
    return <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 capitalize">{status?.replace("_", " ")}</span>;
  }
  return <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 capitalize">{status}</span>;
}

export default async function AdminDashboard() {
  const { stats, recentEnquiries, recentAppointments, error } = await getDashboardData();

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-[#09295a]">Dashboard</h1>
        <p className="mt-2 text-sm text-[#62728a]">
          Overview of your enquiries, appointments, and services.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 border border-red-100">
          <div className="flex">
            <Icon name="x" className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { name: "Total Enquiries", value: stats.totalEnquiries, icon: "chat", href: "/admin/enquiries" },
          { name: "New Enquiries", value: stats.newEnquiries, icon: "sparkle", href: "/admin/enquiries?status=new" },
          { name: "Appointments", value: stats.totalAppointments, icon: "calendar", href: "/admin/appointments" },
          { name: "Active Services", value: stats.totalServices, icon: "folder", href: "/admin/services" },
        ].map((item) => (
          <div key={item.name} className="relative overflow-hidden rounded-2xl bg-white px-5 py-6 shadow-sm border border-[#0d3369]/10">
            <dt>
              <div className="absolute rounded-xl bg-[#f4f8fd] p-3">
                <Icon name={item.icon as any} className="h-5 w-5 text-[#126ce5]" />
              </div>
              <p className="ml-14 truncate text-sm font-medium text-[#62728a]">{item.name}</p>
            </dt>
            <dd className="ml-14 flex items-baseline pb-1 sm:pb-2">
              <p className="text-2xl font-bold text-[#09295a]">{item.value}</p>
            </dd>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-[#09295a] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/services" className="flex items-center justify-center gap-2 rounded-xl bg-[#061d43] px-4 py-3 text-sm font-bold text-white hover:bg-[#09295a] transition-colors shadow-sm">
            <Icon name="folder" className="h-4 w-4" />
            New Service
          </Link>
          <Link href="/admin/reviews" className="flex items-center justify-center gap-2 rounded-xl bg-white border border-[#0d3369]/10 px-4 py-3 text-sm font-bold text-[#09295a] hover:bg-gray-50 transition-colors shadow-sm">
            <Icon name="sparkle" className="h-4 w-4 text-[#126ce5]" />
            Add Review
          </Link>
          <Link href="/admin/gallery" className="flex items-center justify-center gap-2 rounded-xl bg-white border border-[#0d3369]/10 px-4 py-3 text-sm font-bold text-[#09295a] hover:bg-gray-50 transition-colors shadow-sm">
            <Icon name="community" className="h-4 w-4 text-[#126ce5]" />
            Add Gallery Item
          </Link>
          <Link href="/admin/enquiries" className="flex items-center justify-center gap-2 rounded-xl bg-[#f4f8fd] border border-[#126ce5]/20 px-4 py-3 text-sm font-bold text-[#126ce5] hover:bg-[#e6f1ff] transition-colors shadow-sm">
            View Enquiries
            <Icon name="arrow" className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Enquiries */}
        <div className="rounded-[2rem] bg-white shadow-xl shadow-blue-950/5 border border-[#0d3369]/10 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-[#0d3369]/10 flex items-center justify-between bg-white">
            <h3 className="text-base font-bold text-[#09295a]">Recent Enquiries</h3>
            <Link href="/admin/enquiries" className="text-sm font-bold text-[#126ce5] hover:underline">
              View all
            </Link>
          </div>
          <div className="flex-1 overflow-x-auto">
            {recentEnquiries.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#f8fbff]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-[#09295a] uppercase tracking-wider">Name / Email</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-[#09295a] uppercase tracking-wider">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-[#09295a] uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {recentEnquiries.map((enq) => (
                    <tr key={enq.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-[#09295a]">{enq.name}</div>
                        <div className="text-sm text-[#62728a]">{enq.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[#09295a]">{enq.service_name || "General Enquiry"}</div>
                        <div className="text-xs text-[#62728a]">
                          {new Date(enq.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={enq.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto w-12 h-12 bg-[#f4f8fd] rounded-full flex items-center justify-center mb-3">
                  <Icon name="chat" className="h-6 w-6 text-[#126ce5]" />
                </div>
                <h3 className="text-sm font-bold text-[#09295a]">No enquiries yet</h3>
                <p className="mt-1 text-sm text-[#62728a]">When visitors contact you, they will appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="rounded-[2rem] bg-white shadow-xl shadow-blue-950/5 border border-[#0d3369]/10 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-[#0d3369]/10 flex items-center justify-between bg-white">
            <h3 className="text-base font-bold text-[#09295a]">Recent Appointments</h3>
            <Link href="/admin/appointments" className="text-sm font-bold text-[#126ce5] hover:underline">
              View all
            </Link>
          </div>
          <div className="flex-1 overflow-x-auto">
            {recentAppointments.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#f8fbff]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-[#09295a] uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-[#09295a] uppercase tracking-wider">Schedule</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-[#09295a] uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {recentAppointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-[#09295a]">{appt.name}</div>
                        <div className="text-xs text-[#62728a] truncate max-w-[120px]" title={appt.service_name || "General Session"}>
                          {appt.service_name || "General Session"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[#09295a]">
                          {new Date(appt.appointment_date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-[#62728a]">{appt.appointment_time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={appt.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto w-12 h-12 bg-[#f4f8fd] rounded-full flex items-center justify-center mb-3">
                  <Icon name="calendar" className="h-6 w-6 text-[#126ce5]" />
                </div>
                <h3 className="text-sm font-bold text-[#09295a]">No appointments yet</h3>
                <p className="mt-1 text-sm text-[#62728a]">Bookings will show up here once scheduled.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
