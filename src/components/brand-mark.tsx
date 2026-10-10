import Image from "next/image";
import Link from "next/link";

export function BrandMark({ compact = false, inverted = false }: { compact?: boolean; inverted?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-3" aria-label="S.P Consultant home">
      <span className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-0.5 shadow-sm ring-1 ring-white/15">
        <Image
          src="/brand/sp-consultant-logo.png"
          alt="S.P Consultant"
          width={56}
          height={56}
          priority
          className="h-full w-full object-contain"
        />
      </span>
      {!compact && (
        <span className="leading-none">
          <span className={`block text-xs sm:text-sm font-extrabold tracking-[0.12em] ${inverted ? "text-white" : "text-[#08295d]"}`}>
            S.P CONSULTANT
          </span>
          <span className={`mt-1 block text-[8px] sm:text-[9px] font-semibold tracking-[0.14em] ${inverted ? "text-[#8bc4ff]" : "text-[#607088]"}`}>
            CONVEYANCE &amp; DOCUMENTATION
          </span>
        </span>
      )}
    </Link>
  );
}
