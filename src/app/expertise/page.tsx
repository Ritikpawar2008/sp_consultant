import Link from "next/link";
import { Icon } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ExpertisePage() {
  let expertiseItems: any[] = [];
  try {
    const pool = getPool();
    const result = await pool.query(
      "SELECT * FROM expertise WHERE is_active = true ORDER BY display_order ASC"
    );
    expertiseItems = result.rows;
  } catch (error) {
    console.error("Error fetching expertise:", error);
  }

  return <>
    <PageHero compact={true} eyebrow="Our expertise" title="The details matter. So does the way they’re managed." copy="Society and property processes often involve many documents, stakeholders, and steps. Our expertise brings structure to that work." />
    <section className="px-5 py-16 sm:px-8 lg:py-24"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.82fr_1.18fr]"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#1474ed]">Our focus</p><h2 className="mt-4 text-3xl font-black tracking-[-.05em] text-[#09295a] sm:text-5xl">From documents to direction.</h2><p className="mt-6 text-base leading-8 text-[#62728a]">S.P Consultant is focused on housing society conveyance, registration, stamp duty, documentation management, land and building record analysis, and associated compliance support.</p><p className="mt-4 text-base leading-8 text-[#62728a]">We help turn a complex requirement into a defined sequence of actions—while ensuring every case gets appropriate human attention.</p></div><div className="rounded-[2rem] bg-[#f3f8ff] p-6 sm:p-9"><p className="text-sm font-bold text-[#09295a]">A straightforward working approach</p><div className="mt-6 grid gap-2">{expertiseItems.map((item, index) => <div key={item.id} className="grid gap-3 rounded-2xl bg-white p-5 sm:grid-cols-[42px_1fr] sm:gap-5"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#e5f1ff] text-xs font-black text-[#126ce5]">0{index + 1}</span><div><h3 className="font-extrabold text-[#09295a]">{item.title}</h3><p className="mt-1 text-sm leading-6 text-[#62728a]">{item.description}</p></div></div>)}</div></div></div></section>
    <section className="bg-[#e4f1ff] px-5 py-16 sm:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#126ce5]">Need a clear starting point?</p><h2 className="mt-3 text-3xl font-black tracking-[-.05em] text-[#09295a]">Talk through your requirement with us.</h2></div><Link href="/contact" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#09295a] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#126ce5]">Contact S.P Consultant <Icon name="arrow" className="h-4 w-4" /></Link></div></section>
  </>;
}
