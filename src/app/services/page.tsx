import Link from "next/link";
import { Icon } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  let servicesItems: any[] = [];
  let expertiseItems: any[] = [];
  try {
    const pool = getPool();
    const [servicesResult, expertiseResult] = await Promise.all([
      pool.query("SELECT * FROM services WHERE is_active = true ORDER BY display_order ASC"),
      pool.query("SELECT * FROM expertise WHERE is_active = true ORDER BY display_order ASC")
    ]);
    servicesItems = servicesResult.rows;
    expertiseItems = expertiseResult.rows;
  } catch (error) {
    console.error("Error fetching services or expertise:", error);
  }

  return <>
    <PageHero compact={true} eyebrow="Our services" title="Guidance for the process in front of you." copy="Explore the services S.P Consultant can support. Tell us about your situation and we will help identify the most relevant starting point." />
    <section className="px-5 py-16 sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl">
      {servicesItems.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">{servicesItems.map((service, index) => <article key={service.id} className="group rounded-2xl border border-[#0d3369]/10 bg-white p-6 transition hover:border-[#1474ed]/30 hover:shadow-xl hover:shadow-blue-950/5 sm:p-8"><div className="flex justify-between"><span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-[#126ce5]"><Icon name={(service.icon || "building") as any} className="h-6 w-6" /></span><span className="text-sm font-bold text-[#a2aec0]">{String(index + 1).padStart(2, "0")}</span></div><h2 className="mt-7 text-2xl font-extrabold tracking-[-.03em] text-[#09295a]">{service.title}</h2><p className="mt-3 max-w-lg text-sm leading-7 text-[#62728a]">{service.summary || service.short_description || service.description}</p><Link href={`/contact?service=${encodeURIComponent(service.title)}`} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#126ce5]">Discuss this service <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" /></Link></article>)}</div>
      ) : (
        <div className="rounded-2xl border border-[#0d3369]/10 bg-white p-12 text-center">
          <h3 className="text-lg font-extrabold text-[#09295a]">Services are being updated</h3>
          <p className="mt-2 text-sm text-[#63728a]">Please check back shortly.</p>
        </div>
      )}
    </div></section>
    <section className="bg-[#061d43] px-5 py-16 text-white sm:px-8 lg:py-20"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#84c8ff]">Additional support</p><h2 className="mt-4 text-3xl font-black tracking-[-.05em] sm:text-4xl">Related expertise when your requirement is broader.</h2></div>
      {expertiseItems.length > 0 ? (
        <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">{expertiseItems.map((item) => <p key={item.id} className="flex items-start gap-3 text-sm leading-6 text-[#d4e3f8]"><Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-[#87c6ff]" />{item.title}</p>)}</div>
      ) : (
        <div className="text-sm text-[#84c8ff]">Additional expertise areas will be listed here soon.</div>
      )}
    </div></section>
    <section className="px-5 py-16 text-center sm:px-8"><p className="mx-auto max-w-xl text-base leading-7 text-[#62728a]">Not sure which service applies? Share the broad details of your requirement—without sensitive documents—and our team will guide you.</p><Link href="/contact" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#09295a] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#126ce5]">Start an enquiry <Icon name="arrow" className="h-4 w-4" /></Link></section>
  </>;
}
