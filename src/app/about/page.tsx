import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/icons";
import { PageHero } from "@/components/page-hero";

const principles = [
  ["Clear communication", "Plain, practical updates so you know what is happening and what comes next."],
  ["Care for the details", "Documentation work depends on accuracy, completeness, and a methodical approach."],
  ["Reliable coordination", "Focused follow-up and support across the relevant process and formalities."],
];

export default function AboutPage() {
  return <>
    <PageHero compact={true} eyebrow="About S.P Consultant" title="Built around responsible guidance." copy="S.P Consultant is a professional consultancy supporting housing societies, members, and property owners with conveyance, registration, stamp-duty, documentation, and related administrative processes." />
    
    <section className="px-5 py-16 sm:px-8 lg:py-24"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1.05fr]"><div className="relative min-h-[360px] overflow-hidden rounded-[2rem] bg-[#e5f1ff] p-8 sm:p-10"><div className="absolute -right-12 -top-14 h-64 w-64 rounded-full border-[32px] border-[#1474ed]/15"/><div className="absolute bottom-0 left-0 h-[52%] w-full bg-[linear-gradient(150deg,transparent_8%,#0a2c61_8%,#126ce5_60%,#72b7ff_60%)]"/><div className="relative max-w-[210px] rounded-2xl bg-white p-5 shadow-xl"><p className="text-4xl font-black tracking-[-.08em] text-[#09295a]">2021</p><p className="mt-2 text-xs font-bold uppercase tracking-[.13em] text-[#607088]">Established with a service-first promise</p></div><p className="absolute bottom-9 left-8 max-w-[230px] text-2xl font-black leading-7 text-white sm:left-10">Your trust, our responsibility.</p></div><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#1474ed]">The firm</p><h2 className="mt-4 text-3xl font-black tracking-[-.05em] text-[#09295a] sm:text-5xl">A steady partner for complex property formalities.</h2><p className="mt-6 text-base leading-8 text-[#5c6e87]">Established in 2021, S.P Consultant brings together guidance, documentation coordination, and process support for a range of housing society and property-related requirements.</p><p className="mt-4 text-base leading-8 text-[#5c6e87]">Our aim is simple: offer reliable, transparent, and timely assistance with proper guidance throughout the process. Every situation is handled individually, with the care its documents and stakeholders deserve.</p><Link href="/contact" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#09295a] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#126ce5]">Speak with our team <Icon name="arrow" className="h-4 w-4" /></Link></div></div></section>

    {/* Proprietor Section */}
    <section className="bg-white px-5 py-16 sm:px-8 lg:py-24 border-t border-[#0d3369]/10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] items-start">
          <div className="relative aspect-[3/4] w-full max-w-md mx-auto lg:mx-0 overflow-hidden rounded-[2rem] shadow-xl border border-[#0d3369]/10">
            <Image 
              src="/team/pravin-vilas-kadam.jpg" 
              alt="Pravin Vilas Kadam, Proprietor of S.P. Consultant"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#1474ed]">Meet Our Proprietor</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-.05em] text-[#09295a] sm:text-5xl">Pravin Vilas Kadam</h2>
            <p className="mt-3 text-lg font-bold text-[#1474ed]">
              Proprietor <span className="text-[#cecece] font-normal mx-2">|</span> <span className="text-[#09295a]">S.P. Consultant — Society Conveyance & Documentation Consultancy</span>
            </p>
            <p className="mt-6 text-base leading-8 text-[#5c6e87]">
              Pravin Vilas Kadam is the Proprietor of S.P. Consultant, established in 2021, specializing in Society Conveyance and Documentation Consultancy. With over 10 years of experience and having assisted more than 150 housing societies, he provides practical guidance in conveyance procedures, property documentation, and housing society requirements. He is a graduate and holds a GDCA (Government Diploma in Co-operation and Accountancy) qualification in Maharashtra. Currently pursuing legal studies, he is committed to simplifying complex procedures through clear communication, transparency, systematic documentation, and personalized professional support.
            </p>
            
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-[#f6f9fd] p-5 border border-[#0d3369]/5">
                <h4 className="text-sm font-black text-[#09295a]">Experience</h4>
                <p className="mt-2 text-sm leading-6 text-[#62728a]">Over 10 years in society conveyance and documentation-related work.</p>
              </div>
              <div className="rounded-xl bg-[#f6f9fd] p-5 border border-[#0d3369]/5">
                <h4 className="text-sm font-black text-[#09295a]">Societies Assisted</h4>
                <p className="mt-2 text-sm leading-6 text-[#62728a]">More than 150 housing societies.</p>
              </div>
              <div className="rounded-xl bg-[#f6f9fd] p-5 border border-[#0d3369]/5">
                <h4 className="text-sm font-black text-[#09295a]">Education</h4>
                <p className="mt-2 text-sm leading-6 text-[#62728a]">Graduate; GDCA (Government Diploma in Co-operation and Accountancy).</p>
              </div>
              <div className="rounded-xl bg-[#f6f9fd] p-5 border border-[#0d3369]/5">
                <h4 className="text-sm font-black text-[#09295a]">Further Studies</h4>
                <p className="mt-2 text-sm leading-6 text-[#62728a]">Currently pursuing legal studies.</p>
              </div>
              <div className="rounded-xl bg-[#f6f9fd] p-5 border border-[#0d3369]/5">
                <h4 className="text-sm font-black text-[#09295a]">Professional Values</h4>
                <p className="mt-2 text-sm leading-6 text-[#62728a]">Trust, transparency, honest communication, and personal attention.</p>
              </div>
              <div className="rounded-xl bg-[#f6f9fd] p-5 border border-[#0d3369]/5">
                <h4 className="text-sm font-black text-[#09295a]">Vision</h4>
                <p className="mt-2 text-sm leading-6 text-[#62728a]">To establish S.P. Consultant as a trusted consultancy across Virar and the wider Palghar region.</p>
              </div>
              <div className="sm:col-span-2 rounded-xl bg-[#f6f9fd] p-5 border border-[#0d3369]/5">
                <h4 className="text-sm font-black text-[#09295a]">Core Expertise</h4>
                <p className="mt-2 text-sm leading-6 text-[#62728a]">Deemed Conveyance, Direct Conveyance, Housing Society Registration, Stamp Duty Matters, Adjudication, Society Documentation, Building Structure Audit Assistance, Land Survey Coordination, and Feasibility Reports.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="bg-[#f6f9fd] px-5 py-16 sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl"><div className="max-w-xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#1474ed]">How we work</p><h2 className="mt-4 text-3xl font-black tracking-[-.05em] text-[#09295a] sm:text-5xl">Professional support, thoughtfully delivered.</h2></div><div className="mt-12 grid gap-4 md:grid-cols-3">{principles.map(([title, copy], index) => <article key={title} className="rounded-2xl border border-[#0d3369]/10 bg-white p-7"><p className="text-sm font-black text-[#1474ed]">0{index + 1}</p><h3 className="mt-10 text-xl font-extrabold text-[#09295a]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#62728a]">{copy}</p></article>)}</div></div></section>
  </>;
}
