"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { Icon } from "@/components/icons";

const navItems = [
  ["Home", "/"],
  ["About us", "/about"],
  ["Services", "/services"],
  ["Expertise", "/expertise"],
  ["Careers", "/careers"],
  ["Gallery", "/gallery"],
  ["Reviews", "/reviews"],
];

export function SiteHeader({ isHome = false }: { isHome?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-[#061d43]/75 backdrop-blur-xl text-white transition-colors duration-300">
      <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <BrandMark inverted={true} />
        <nav className="hidden items-center gap-6 xl:flex" aria-label="Main navigation">
          {navItems.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className={`nav-link text-sm font-semibold transition-colors ${
                pathname === href
                  ? "nav-link-active text-[#71b8ff]"
                  : "text-[#c2d7f0] hover:text-white"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 sm:flex">
          <Link
            href="/contact"
            className="interactive-button rounded-full bg-[#1474ed] px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(20,116,237,.3)] transition hover:-translate-y-0.5 hover:bg-[#2e8dff] hover:shadow-[0_12px_26px_rgba(20,116,237,.4)]"
          >
            Start an enquiry
          </Link>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 text-white/90 hover:bg-white/10 xl:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <Icon name={open ? "close" : "menu"} className="h-6 w-6" />
        </button>
      </div>
      {open && (
        <div className="border-t border-white/10 bg-[#061d43]/95 backdrop-blur-2xl px-5 py-4 xl:hidden">
          <nav className="mx-auto grid max-w-7xl gap-1" aria-label="Mobile navigation">
            {navItems.map(([label, href]) => (
              <Link
                onClick={() => setOpen(false)}
                key={href}
                href={href}
                className={`rounded-lg px-3 py-3 text-sm font-semibold transition-colors ${
                  pathname === href ? "bg-white/10 text-[#71b8ff]" : "text-[#c2d7f0] hover:bg-white/5 hover:text-white"
                }`}
              >
                {label}
              </Link>
            ))}
            <Link
              onClick={() => setOpen(false)}
              href="/contact"
              className="mt-2 rounded-lg bg-[#1474ed] px-3 py-3 text-center text-sm font-bold text-white shadow-lg"
            >
              Start an enquiry
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
