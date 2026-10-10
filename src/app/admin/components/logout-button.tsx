"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors rounded-xl w-full text-left"
    >
      <Icon name="log-out" className="h-5 w-5" />
      Sign out
    </button>
  );
}
