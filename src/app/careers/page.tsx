import { ContactForm } from "@/components/contact-form";
import { Icon } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CareersPage() {
  let careers: any[] = [];
  try {
    const pool = getPool();
    const result = await pool.query(
      "SELECT * FROM careers WHERE is_active = true ORDER BY created_at DESC"
    );
    careers = result.rows;
  } catch (error) {
    console.error("Error fetching careers:", error);
  }

  return <>
    <PageHero compact={true} eyebrow="Careers" title="Build careful work that helps people move forward." copy="We welcome thoughtful, organised professionals who value clear communication and responsible client support." />
    <section className="px-5 py-16 sm:px-8 lg:py-24"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.8fr_1.2fr]"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#1474ed]">Join the team</p><h2 className="mt-4 text-3xl font-black tracking-[-.05em] text-[#09295a] sm:text-5xl">Interested in working with us?</h2>
    
    {careers.length === 0 ? (
      <p className="mt-6 text-base leading-8 text-[#62728a]">Current opportunities will be published here. If your experience is relevant to conveyance, documentation, administration, field coordination, or client support, we would still be glad to hear from you.</p>
    ) : (
      <div className="mt-6 grid gap-4">
        {careers.map(job => (
          <div key={job.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-[#09295a]">{job.job_title}</h3>
            <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-gray-500">
              {job.department && <span className="rounded-md bg-gray-100 px-2 py-1">{job.department}</span>}
              {job.location && <span className="rounded-md bg-gray-100 px-2 py-1">{job.location}</span>}
              {job.employment_type && <span className="rounded-md bg-gray-100 px-2 py-1">{job.employment_type}</span>}
            </div>
            {job.description && <p className="mt-4 text-sm text-gray-600 line-clamp-3">{job.description}</p>}
          </div>
        ))}
      </div>
    )}
    
    <div className="mt-8 rounded-2xl bg-[#e7f2ff] p-6"><div className="flex items-center gap-3 text-[#09295a]"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#126ce5]"><Icon name="mail" className="h-5 w-5" /></span><p className="font-bold">Submit your profile</p></div><p className="mt-3 text-sm leading-6 text-[#59708f]">Tell us about your experience and share a secure link to your CV. Do not include sensitive identity documents.</p></div></div><div className="rounded-[2rem] border border-[#0d3369]/10 bg-[#f8fbff] p-6 sm:p-9"><h2 className="text-xl font-extrabold text-[#09295a]">Share your profile</h2><p className="mt-2 text-sm leading-6 text-[#62728a]">We will contact suitable candidates when an opportunity is available.</p><div className="mt-6"><ContactForm career /></div></div></div></section>
  </>;
}
