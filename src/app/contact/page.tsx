import { ContactForm } from "@/components/contact-form";
import { Icon } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { getSiteConfig } from "@/lib/site-server";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const siteConfig = await getSiteConfig();

  return <>
    <PageHero eyebrow="Contact us" title="Tell us what you need." copy="Share the broad details of your requirement and the S.P Consultant team will help you identify the right next step." />
    
    <section className="px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.8fr_1.2fr]">
        
        {/* Left Column: Contact Info & Address */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#1474ed]">Reach out directly</p>
          <h2 className="mt-4 text-3xl font-black tracking-[-.05em] text-[#09295a] sm:text-5xl">We're ready to listen.</h2>
          
          <div className="mt-9 grid gap-6">
            <a href={`tel:+91${siteConfig.phones[0]}`} className="group flex items-center gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#e6f1ff] text-[#126ce5] transition group-hover:bg-[#126ce5] group-hover:text-white"><Icon name="phone" className="h-5 w-5" /></span>
              <span>
                <span className="block text-xs font-bold uppercase tracking-[.13em] text-[#6f7f95]">Call us</span>
                <span className="mt-1 block font-extrabold text-[#09295a]">+91 {siteConfig.phones[0]} {siteConfig.phones[1] ? `/ ${siteConfig.phones[1]}` : ''}</span>
              </span>
            </a>
            
            <a href={`mailto:${siteConfig.email}`} className="group flex items-center gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#e6f1ff] text-[#126ce5] transition group-hover:bg-[#126ce5] group-hover:text-white"><Icon name="mail" className="h-5 w-5" /></span>
              <span>
                <span className="block text-xs font-bold uppercase tracking-[.13em] text-[#6f7f95]">Email</span>
                <span className="mt-1 block font-extrabold text-[#09295a]">{siteConfig.email}</span>
              </span>
            </a>

            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#e6f1ff] text-[#126ce5]"><Icon name="location" className="h-5 w-5" /></span>
              <span>
                <span className="block text-xs font-bold uppercase tracking-[.13em] text-[#6f7f95]">Office Address</span>
                <span className="mt-1 block font-bold text-[#09295a] leading-relaxed max-w-sm">
                  {siteConfig.officeAddress}
                </span>
                <a 
                  href={siteConfig.mapUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[#1474ed] hover:text-[#09295a] transition"
                >
                  Get Directions <Icon name="arrow" className="h-4 w-4" />
                </a>
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-transparent text-[#6f7f95]"><Icon name="search" className="h-5 w-5" /></span>
              <span>
                <span className="block text-xs font-bold uppercase tracking-[.13em] text-[#6f7f95]">Service area</span>
                <span className="mt-1 block font-extrabold text-[#09295a]">{siteConfig.serviceArea}</span>
              </span>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-[#0d3369]/10 bg-[#f8fbff] p-5 text-sm leading-6 text-[#5a6d87]">
            <strong className="text-[#09295a]">Please note:</strong> Do not share Aadhaar/PAN numbers, original property documents, or other sensitive information through this public form. Our team will advise a secure next step if required.
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="flex flex-col gap-8">
          
          {/* Form Section */}
          <div className="rounded-[2rem] border border-[#0d3369]/10 bg-[#f8fbff] p-6 sm:p-9">
            <h2 className="text-2xl font-extrabold text-[#09295a]">Start an enquiry</h2>
            <p className="mt-2 text-sm leading-6 text-[#62728a]">We will use your details only to respond to your requirement.</p>
            <div className="mt-7">
              <ContactForm />
            </div>
          </div>
          
        </div>
      </div>
    </section>
  </>;
}
