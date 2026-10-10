"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { Icon } from "@/components/icons";
import { LogoutButton } from "./logout-button";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: "landmark" as const },
  { name: "Enquiries", href: "/admin/enquiries", icon: "chat" as const },
  { name: "Appointments", href: "/admin/appointments", icon: "calendar" as const },
  { name: "Services", href: "/admin/services", icon: "folder" as const },
  { name: "Expertise", href: "/admin/expertise", icon: "building" as const },
  { name: "Reviews", href: "/admin/reviews", icon: "sparkle" as const },
  { name: "Gallery", href: "/admin/gallery", icon: "community" as const },
  { name: "Careers", href: "/admin/careers", icon: "handover" as const },
  { name: "Site Settings", href: "/admin/settings", icon: "document" as const },
];

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [counts, setCounts] = useState({ newAppointments: 0, newEnquiries: 0 });

  // Close sidebar on route change on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Fetch counts periodically and listen to global updates
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch("/api/admin/counts");
        if (res.ok) {
          const data = await res.json();
          if (data.success) setCounts(data.data);
        }
      } catch (e) {
        // silently fail
      }
    };

    fetchCounts();
    const intervalId = setInterval(fetchCounts, 15000); // refresh every 15 seconds

    // Allow other components to trigger a refresh
    const handleRefresh = () => fetchCounts();
    window.addEventListener("refreshAdminCounts", handleRefresh);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("refreshAdminCounts", handleRefresh);
    };
  }, []);

  return (
    <>
      {/* Mobile Header Toggle */}
      <div className="lg:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 py-4 fixed top-0 w-full z-40">
        <BrandMark />
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 -mr-2 text-gray-600 hover:bg-gray-50 rounded-lg"
        >
          <Icon name={isOpen ? "close" : "menu"} className="h-6 w-6" />
        </button>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#061d43]/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-72 bg-white border-r border-[#0d3369]/10 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 hidden lg:block">
          <BrandMark />
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1 mt-16 lg:mt-0">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            
            let badgeCount = 0;
            if (item.name === "Appointments") badgeCount = counts.newAppointments;
            if (item.name === "Enquiries") badgeCount = counts.newEnquiries;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#f4f8fd] text-[#126ce5]"
                    : "text-[#62728a] hover:bg-gray-50 hover:text-[#09295a]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    name={item.icon}
                    className={`h-5 w-5 ${isActive ? "text-[#126ce5]" : "text-gray-400"}`}
                  />
                  {item.name}
                </div>
                {badgeCount > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-sm">
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#0d3369]/10">
          <div className="px-4 py-3 mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Admin Account</p>
            <p className="text-sm font-medium text-[#09295a] truncate mt-1">{email}</p>
          </div>
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
