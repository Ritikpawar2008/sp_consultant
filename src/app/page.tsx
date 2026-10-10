import Link from "next/link";
import { Icon } from "@/components/icons";
import { CinematicHero } from "@/components/cinematic-hero";
import { getPool } from "@/lib/db";
import { getSiteConfig } from "@/lib/site-server";

const steps = [
  ["01", "Understand your matter", "Start with a clear conversation about your society, property, documents, and current requirement."],
  ["02", "Prepare the right path", "Receive focused guidance on the documentation, process, and next steps that apply to your case."],
  ["03", "Move forward with clarity", "Get steady coordination and updates as formalities move toward completion."],
];

export const dynamic = "force-dynamic";

export default async function Home() {
  const siteConfig = await getSiteConfig();
  let servicesItems: any[] = [];
  try {
    const pool = getPool();
    const result = await pool.query(
      "SELECT * FROM services WHERE is_active = true ORDER BY display_order ASC LIMIT 8"
    );
    servicesItems = result.rows;
  } catch (error) {
    console.error("Error fetching services:", error);
  }

  return <>
    <CinematicHero config={siteConfig} />

    <section className="bg-[#f6f9fd] px-5 py-16 sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1474ed]">What we help with</p><h2 className="mt-4 text-3xl font-black tracking-[-0.045em] text-[#09295a] sm:text-5xl">Essential support for the work that matters.</h2><p className="mt-5 text-base leading-7 text-[#5d6d84]">From a single documentation question to coordinated support across a detailed process, explore the services built around housing societies and property matters.</p></div>
    
    {servicesItems.length > 0 ? (
      <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{servicesItems.map((service, index) => <Link href="/services" key={service.id} className="lift-card group rounded-2xl border border-[#0d3369]/10 bg-white p-6 hover:border-[#1474ed]/35"><div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-[#126ce5] transition duration-300 group-hover:scale-110 group-hover:bg-[#126ce5] group-hover:text-white"><Icon name={(service.icon || "building") as any} className="h-5 w-5" /></span><span className="text-xs font-bold text-[#9aa8ba]">0{index + 1}</span></div><h3 className="mt-7 text-lg font-extrabold leading-6 text-[#09295a]">{service.title}</h3><p className="mt-3 text-sm leading-6 text-[#63728a]">{service.short_description || service.summary || service.description}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#126ce5]">Explore <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" /></span></Link>)}</div>
    ) : (
      <div className="mt-12 rounded-2xl border border-[#0d3369]/10 bg-white p-12 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#f6f9fd] text-[#9aa8ba]">
          <Icon name="search" className="h-8 w-8" />
        </div>
        <h3 className="mt-5 text-lg font-extrabold text-[#09295a]">Services are being updated</h3>
        <p className="mt-2 text-sm text-[#63728a]">Please check back shortly or contact our team directly for assistance with your requirements.</p>
      </div>
    )}
    <Link href="/services" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#09295a] transition hover:gap-3">View all services <Icon name="arrow" className="h-4 w-4" /></Link></div></section>

    <section className="px-5 py-16 sm:px-8 lg:py-24"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.86fr_1.14fr]"><div className="lift-card rounded-[2rem] bg-[#e6f1ff] p-8 sm:p-10"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#126ce5]">Our approach</p><h2 className="mt-4 text-3xl font-black tracking-[-0.045em] text-[#09295a] sm:text-4xl">Proper guidance begins by listening.</h2><p className="mt-5 text-base leading-7 text-[#59708f]">We approach every requirement with care, clear communication, and respect for the details involved.</p><Link href="/about" className="interactive-button mt-8 inline-flex items-center gap-2 rounded-full bg-[#09295a] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#126ce5]">About {siteConfig.name} <Icon name="arrow" className="h-4 w-4" /></Link></div><div className="grid divide-y divide-[#0c3267]/10">{steps.map(([number, title, copy]) => <div key={number} className="group grid gap-4 py-6 first:pt-0 sm:grid-cols-[80px_1fr] sm:gap-7"><p className="text-sm font-black text-[#1474ed] transition group-hover:translate-x-1">{number}</p><div><h3 className="text-xl font-extrabold text-[#09295a] transition group-hover:text-[#126ce5]">{title}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-[#63728a]">{copy}</p></div></div>)}</div></div></section>

    <section className="relative overflow-hidden bg-[#071e45] px-5 py-16 text-white sm:px-8 lg:py-24"><div className="hero-glow-two absolute -left-20 top-4 h-64 w-64 rounded-full bg-[#126ce5]/30 blur-3xl" /><div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1fr_0.85fr]"><div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#82c5ff]"><Icon name="sparkle" className="h-4 w-4" />Guidance assistant</p><h2 className="mt-4 max-w-2xl text-3xl font-black tracking-[-0.045em] sm:text-5xl">Helpful first answers. Human support when it counts.</h2><p className="mt-5 max-w-xl text-base leading-7 text-[#c1d4f1]">Our upcoming AI Guidance Assistant will help visitors understand relevant services and prepare a structured enquiry. Final advice always comes from the {siteConfig.name} team after reviewing the case.</p><Link href="/contact" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#8bc9ff] transition hover:gap-3">Get guidance from our team <Icon name="arrow" className="h-4 w-4" /></Link></div><div className="tilt-card relative rounded-[1.7rem] border border-white/15 bg-white/[0.07] p-5 shadow-2xl backdrop-blur"><div className="absolute -right-8 -top-8 h-24 w-24 rounded-full border-[16px] border-[#83c4ff]/10" /><div className="relative flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#1977ed] shadow-[0_0_22px_rgba(71,156,255,.6)]"><Icon name="sparkle" className="h-4 w-4" /></span><div><p className="text-sm font-bold">S.P Guidance Assistant</p><p className="text-xs text-[#b6cae8]">Client-approved service guidance</p></div></div><div className="relative mt-6 rounded-2xl bg-white p-4 text-sm leading-6 text-[#1e426f] shadow-lg">“I need help with my housing society’s conveyance. Which service should I start with?”</div><div className="relative mt-3 rounded-2xl border border-white/10 bg-[#0b3168] p-4 text-sm leading-6 text-[#d7e7fc]">I can help you understand the usual starting point and collect the details our team needs. For final case-specific guidance, {siteConfig.name} will review your documents directly.</div><div className="relative mt-5 flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm text-[#b7ceec] transition hover:bg-white/[.15]"><Icon name="chat" className="h-4 w-4" />Ask a general question <span className="ml-auto text-[#83c4ff]">Soon</span></div></div></div></section>

    <section className="px-5 py-16 sm:px-8 lg:py-24"><div className="lift-card mx-auto flex max-w-7xl flex-col justify-between gap-8 rounded-[2rem] bg-[linear-gradient(115deg,#e4f1ff_0%,#f7fbff_58%,#d8ecff_100%)] px-7 py-9 sm:px-10 sm:py-12 lg:flex-row lg:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#126ce5]">Let’s begin</p><h2 className="mt-4 max-w-2xl text-3xl font-black tracking-[-0.05em] text-[#09295a] sm:text-5xl">Tell us what you need. We’ll help you find the right next step.</h2></div><Link href="/contact" className="interactive-button inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#0a2c61] px-6 py-4 text-sm font-bold text-white transition hover:-translate-y-1 hover:bg-[#126ce5]">Start an enquiry <Icon name="arrow" className="h-4 w-4" /></Link></div></section>
  </>;
}
