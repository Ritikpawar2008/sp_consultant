import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { Icon } from "@/components/icons";
import { siteConfig as defaultSiteConfig, type SiteConfig } from "@/lib/site";

export function SiteFooter({ config }: { config?: SiteConfig | any }) {
  const siteConfig = config || defaultSiteConfig;
  const mapQuery = encodeURIComponent(siteConfig.officeAddress);

  return <footer className="bg-[#061d43] text-white">
    {/* Top Links Section */}
    <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1.4fr_0.8fr_1fr]">
      <div>
        <BrandMark />
        <p className="mt-5 max-w-sm text-sm leading-6 text-[#b5c5de]">Professional support for society conveyance, documentation, registration, stamp-duty matters, and related compliance processes.</p>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-[#78b3ff]">{siteConfig.tagline}</p>
        {(siteConfig.instagramUrl || siteConfig.linkedinUrl) && (
          <div className="mt-6 flex items-center gap-3">
            {siteConfig.instagramUrl && (
              <a
                href={siteConfig.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="grid h-10 w-10 place-items-center rounded-xl bg-[#133267] text-[#78b3ff] border border-white/10 transition hover:bg-[#126ce5] hover:text-white hover:border-[#126ce5]"
              >
                <Icon name="instagram" className="h-5 w-5" />
              </a>
            )}
            {siteConfig.linkedinUrl && (
              <a
                href={siteConfig.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="grid h-10 w-10 place-items-center rounded-xl bg-[#133267] text-[#78b3ff] border border-white/10 transition hover:bg-[#126ce5] hover:text-white hover:border-[#126ce5]"
              >
                <Icon name="linkedin" className="h-5 w-5" />
              </a>
            )}
          </div>
        )}
      </div>
      <div><h2 className="text-sm font-bold uppercase tracking-[0.16em] text-[#78b3ff]">Explore</h2><div className="mt-5 grid gap-3 text-sm text-[#dce7f7]"><Link href="/services">Services</Link><Link href="/expertise">Expertise</Link><Link href="/about">About us</Link><Link href="/reviews">Reviews</Link><Link href="/contact">Contact us</Link></div></div>
      <div>
        <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-[#78b3ff]">Speak with us</h2>
        <div className="mt-5 grid gap-4 text-sm text-[#dce7f7]">
          <a className="flex items-center gap-3 hover:text-white transition" href={`tel:+91${siteConfig.phones[0]}`}><Icon name="phone" className="h-4 w-4 shrink-0 text-[#78b3ff]" />+91 {siteConfig.phones[0]}</a>
          <a className="flex items-center gap-3 hover:text-white transition" href={`mailto:${siteConfig.email}`}><Icon name="mail" className="h-4 w-4 shrink-0 text-[#78b3ff]" />{siteConfig.email}</a>
          <span className="flex items-start gap-3"><Icon name="search" className="h-4 w-4 mt-1 shrink-0 text-[#78b3ff]" /><span>Serving {siteConfig.serviceArea}</span></span>
        </div>
      </div>
    </div>

    {/* New Business Location Section */}
    <div className="border-t border-white/10 mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr] items-center bg-[#0d2753] p-7 sm:p-9 rounded-[2rem]">
        {/* Left: Office Address */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-[#78b3ff]">Our Office</h2>
          <div className="mt-5 flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#133267] text-[#78b3ff]">
              <Icon name="location" className="h-5 w-5" />
            </span>
            <p className="text-[#dce7f7] leading-relaxed max-w-[320px] font-medium text-[15px]">
              {siteConfig.officeAddress}
            </p>
          </div>
        </div>

        {/* Right: Clickable Map Preview */}
        <a 
          href={siteConfig.mapUrl || "https://maps.app.goo.gl/er2iKkXCu9dxVWXA7?g_st=iw"}
          target="_blank" 
          rel="noreferrer"
          className="relative block h-[220px] w-full overflow-hidden rounded-2xl border border-white/10 group shadow-lg"
          aria-label="View our office on Google Maps"
        >
          {/* Hover Overlay */}
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#061d43]/0 transition-all duration-300 group-hover:bg-[#061d43]/50">
            <span className="translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 flex items-center gap-2 bg-[#126ce5] text-white px-5 py-3 rounded-full text-sm font-bold shadow-xl">
              View on Google Maps <Icon name="arrow" className="h-4 w-4" />
            </span>
          </div>
          
          {/* Unclickable iframe so parent <a> handles click */}
          <iframe
            title="S.P. Consultant Office Location Map"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
            className="absolute inset-0 z-10 w-full h-full object-cover pointer-events-none transition-transform duration-700 group-hover:scale-105"
          />
        </a>
      </div>
    </div>

    <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-[#9eb2cf]">© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</div>
  </footer>
}
