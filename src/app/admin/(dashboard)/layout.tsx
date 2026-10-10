import { getSession } from "@/lib/auth";
import { AdminSidebar } from "../components/admin-sidebar";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.email) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#f4f8fd]">
      <AdminSidebar email={session.email} />
      <main className="lg:pl-72 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6 sm:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
