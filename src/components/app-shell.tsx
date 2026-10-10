"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { FloatingContact } from "@/components/floating-contact";

export function AppShell({ children, config }: { children: ReactNode, config?: any }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return <main>{children}</main>;
  const isHome = pathname === "/";
  return (
    <>
      <SiteHeader isHome={isHome} />
      <main className={isHome ? "" : "pt-[74px]"}>{children}</main>
      <SiteFooter config={config} />
      <FloatingContact />
    </>
  );
}
