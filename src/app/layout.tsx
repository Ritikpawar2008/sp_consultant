import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { getSiteConfig } from "@/lib/site-server";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: { default: `${config.name} | Society Conveyance & Documentation`, template: `%s | ${config.name}` },
    description: config.tagline,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const config = await getSiteConfig();
  return <html lang="en"><body><AppShell config={config}>{children}</AppShell></body></html>;
}
