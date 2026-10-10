import { ReactNode } from "react";
import { Icon } from "@/components/icons";

export function PageHero({ eyebrow, title, copy, compact = false, children }: { eyebrow: string; title: string; copy: string; compact?: boolean; children?: ReactNode }) {
  const paddingClass = compact
    ? "px-5 py-10 sm:px-8 sm:py-12"
    : "px-5 pb-16 pt-20 sm:px-8 sm:pb-20 sm:pt-24";

  return <section className={`relative isolate overflow-hidden bg-[#061d43] text-white ${paddingClass}`}><div className="absolute inset-0 -z-10 opacity-40 [background-image:linear-gradient(rgba(113,171,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(113,171,255,.08)_1px,transparent_1px)] [background-size:52px_52px]" /><div className="hero-glow-one absolute -right-24 -top-32 -z-10 h-80 w-80 rounded-full bg-[#1474ee]/30 blur-3xl" /><div className="hero-glow-two absolute bottom-0 left-[20%] -z-10 h-32 w-32 rounded-full bg-[#7bc3ff]/10 blur-2xl" /><div className="absolute right-16 top-10 -z-10 h-44 w-44 rounded-full border border-white/10" /><div className="relative mx-auto max-w-7xl"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#7fc0ff]"><span className="h-px w-7 bg-[#7fc0ff]" />{eyebrow}</p><h1 className="mt-5 max-w-3xl text-4xl font-black tracking-[-0.05em] sm:text-6xl">{title}</h1><p className="mt-6 max-w-2xl text-base leading-7 text-[#c2d4ee] sm:text-lg">{copy}</p>{children}</div><Icon name="sparkle" className="hero-glow-one absolute bottom-10 right-8 h-10 w-10 text-white/10" /></section>;
}
