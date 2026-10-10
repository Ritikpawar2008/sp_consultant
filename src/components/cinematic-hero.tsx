"use client";

import { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { siteConfig as defaultSiteConfig } from "@/lib/site";

const TOTAL_FRAMES = 240;

function frameSrc(n: number): string {
  return `/hero/frames/frame_${String(n).padStart(6, "0")}.jpg`;
}

// Chapter boundary ranges [start, enterEnd, exitStart, end]
// Across scroll progress p in [0, 1]
const CHAPTER_RANGES = [
  // 0: Intro / First View (0 to 14%)
  { start: 0, enterEnd: 0, exitStart: 0.10, end: 0.14 },
  // 1: The Problem (14% to 29%)
  { start: 0.14, enterEnd: 0.175, exitStart: 0.26, end: 0.295 },
  // 2: What We Do (29.5% to 49%)
  { start: 0.295, enterEnd: 0.33, exitStart: 0.455, end: 0.49 },
  // 3: Expertise (49% to 67%)
  { start: 0.49, enterEnd: 0.525, exitStart: 0.635, end: 0.67 },
  // 4: Trust & Credibility (67% to 81%)
  { start: 0.67, enterEnd: 0.705, exitStart: 0.775, end: 0.81 },
  // 5: The Difference (81% to 91%)
  { start: 0.81, enterEnd: 0.835, exitStart: 0.885, end: 0.915 },
  // 6: Final CTA (91.5% to 100%)
  { start: 0.915, enterEnd: 0.945, exitStart: 1.0, end: 1.0 },
];

export function CinematicHero({ config }: { config?: any }) {
  const siteConfig = config || defaultSiteConfig;
  const sectionRef    = useRef<HTMLDivElement>(null);
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const framesRef     = useRef<HTMLImageElement[]>([]);
  const activeFrameRef = useRef(0);
  const tickRef       = useRef(false);

  // Chapter DOM node refs
  const chapterRefs   = useRef<(HTMLDivElement | null)[]>([]);
  const indicatorRef  = useRef<HTMLDivElement>(null);
  const progressLineRef = useRef<HTMLDivElement>(null);
  const progressTextRef = useRef<HTMLSpanElement>(null);
  const loaderRef     = useRef<HTMLDivElement>(null);

  /* ---- Draw one frame on the canvas (GPU-accelerated cover) ---- */
  const paint = useCallback((idx: number) => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    
    // Disable alpha for a significant rendering performance boost
    const ctx = cvs.getContext("2d", { alpha: false });
    if (!ctx) return;

    const imgs = framesRef.current;
    let img: HTMLImageElement | undefined;

    // Direct lookup, or search outwards for nearest loaded frame
    if (imgs[idx]?.complete && imgs[idx].naturalWidth > 0) {
      img = imgs[idx];
    } else {
      for (let d = 1; d < TOTAL_FRAMES; d++) {
        const prev = imgs[idx - d];
        if (prev?.complete && prev.naturalWidth > 0) {
          img = prev;
          break;
        }
        const next = imgs[idx + d];
        if (next?.complete && next.naturalWidth > 0) {
          img = next;
          break;
        }
      }
    }

    if (!img || img.naturalWidth === 0) return;

    // To preserve aspect ratio correctly with CSS object-cover, we just use the native dimensions.
    // This entirely removes the blurry manual cropping and scaling math.
    if (cvs.width !== img.naturalWidth || cvs.height !== img.naturalHeight) {
      cvs.width = img.naturalWidth;
      cvs.height = img.naturalHeight;
    }

    // Draw the image exactly 1:1. No blurry transformations.
    ctx.drawImage(img, 0, 0);
  }, []);

  /* ---- Sync canvas dimensions to window size with DPR ---- */
  const resize = useCallback(() => {
    // Canvas sizing is now perfectly handled dynamically inside paint() 
    // to match the native resolution of each loaded frame without stretching.
    paint(activeFrameRef.current);
  }, [paint]);

  /* ---- Intelligent sequential frame preloading ---- */
  useEffect(() => {
    const imgs: HTMLImageElement[] = new Array(TOTAL_FRAMES);

    const loadSingle = (index: number, priority: "high" | "auto" | "low" = "auto"): Promise<void> => {
      return new Promise((resolve) => {
        if (imgs[index]) {
          resolve();
          return;
        }
        const el = new Image();
        if ("fetchPriority" in el) {
          (el as unknown as { fetchPriority: string }).fetchPriority = priority;
        }
        el.src = frameSrc(index);

        const onFinish = () => {
          if (index === 0) {
            if (loaderRef.current) {
              loaderRef.current.style.opacity = "0";
              setTimeout(() => {
                if (loaderRef.current) loaderRef.current.style.display = "none";
              }, 300);
            }
            resize();
          } else if (index === activeFrameRef.current) {
            paint(index);
          }
          resolve();
        };

        if (el.complete && el.naturalWidth > 0) {
          onFinish();
        } else {
          el.onload = onFinish;
          el.onerror = () => resolve();
        }
        imgs[index] = el;
      });
    };

    framesRef.current = imgs;

    // Phase 1: Frame 1 immediately
    loadSingle(0, "high").then(() => {
      // Phase 2: Preload initial frames (1-40) for immediate scroll response
      const initial = [];
      for (let i = 1; i < Math.min(40, TOTAL_FRAMES); i++) {
        initial.push(loadSingle(i, "high"));
      }

      Promise.all(initial).then(() => {
        // Phase 3: Background load remaining frames in small batches
        let nextIdx = 40;
        const loadNextChunk = () => {
          if (nextIdx >= TOTAL_FRAMES) return;
          const chunk = [];
          const end = Math.min(nextIdx + 20, TOTAL_FRAMES);
          for (let i = nextIdx; i < end; i++) {
            chunk.push(loadSingle(i, "low"));
          }
          nextIdx = end;
          Promise.all(chunk).then(() => {
            if (typeof requestIdleCallback !== "undefined") {
              requestIdleCallback(loadNextChunk);
            } else {
              setTimeout(loadNextChunk, 40);
            }
          });
        };

        if (typeof requestIdleCallback !== "undefined") {
          requestIdleCallback(loadNextChunk);
        } else {
          setTimeout(loadNextChunk, 40);
        }
      });
    });
  }, [resize, paint]);

  /* ---- Main scroll controller (RAF-throttled, zero setState) ---- */
  useEffect(() => {
    const onScroll = () => {
      if (tickRef.current) return;
      tickRef.current = true;

      requestAnimationFrame(() => {
        tickRef.current = false;
        const sec = sectionRef.current;
        if (!sec) return;

        const rect = sec.getBoundingClientRect();
        const runway = sec.offsetHeight - window.innerHeight;
        if (runway <= 0) return;

        // Overall progress p in [0, 1]
        const p = Math.min(1, Math.max(0, -rect.top / runway));

        // 1. Scrub frames: frames progress across 0 to 0.93; 0.93 to 1.00 holds Frame 240
        const frameProgress = Math.min(1, Math.max(0, p / 0.93));
        const frameIdx = Math.min(
          TOTAL_FRAMES - 1,
          Math.floor(frameProgress * (TOTAL_FRAMES - 1))
        );

        if (frameIdx !== activeFrameRef.current) {
          activeFrameRef.current = frameIdx;
          paint(frameIdx);
        }

        // 2. Animate Chapter text elements (opacity + translateY)
        CHAPTER_RANGES.forEach((range, idx) => {
          const el = chapterRefs.current[idx];
          if (!el) return;

          let opacity = 0;
          let translateY = 20;

          if (p < range.start) {
            opacity = 0;
            translateY = 20;
          } else if (p < range.enterEnd) {
            const t = (p - range.start) / Math.max(0.001, range.enterEnd - range.start);
            opacity = t;
            translateY = Math.round(20 * (1 - t));
          } else if (p <= range.exitStart) {
            opacity = 1;
            translateY = 0;
          } else if (p <= range.end) {
            const t = (p - range.exitStart) / Math.max(0.001, range.end - range.exitStart);
            opacity = 1 - t;
            translateY = Math.round(-20 * t);
          } else {
            opacity = 0;
            translateY = -20;
          }

          if (opacity <= 0.005) {
            el.style.opacity = "0";
            el.style.transform = `translate3d(0, ${translateY}px, 0)`;
            el.style.visibility = "hidden";
            el.style.pointerEvents = "none";
          } else {
            el.style.visibility = "visible";
            el.style.opacity = opacity.toFixed(3);
            el.style.transform = `translate3d(0, ${translateY}px, 0)`;
            el.style.pointerEvents = opacity > 0.5 ? "auto" : "none";
          }
        });

        // 3. Update bottom scroll indicator (fade out by 4% scroll)
        if (indicatorRef.current) {
          const indOpacity = Math.max(0, 1 - p * 25);
          indicatorRef.current.style.opacity = indOpacity.toFixed(3);
          indicatorRef.current.style.pointerEvents = indOpacity > 0.1 ? "auto" : "none";
        }

        // 4. Update right progress bar and chapter indicator
        if (progressLineRef.current) {
          progressLineRef.current.style.height = `${Math.round(p * 100)}%`;
        }
        if (progressTextRef.current) {
          let curCh = 1;
          if (p > 0.14 && p <= 0.295) curCh = 2;
          else if (p > 0.295 && p <= 0.49) curCh = 3;
          else if (p > 0.49 && p <= 0.67) curCh = 4;
          else if (p > 0.67 && p <= 0.81) curCh = 5;
          else if (p > 0.81 && p <= 0.915) curCh = 6;
          else if (p > 0.915) curCh = 7;
          progressTextRef.current.textContent = `0${curCh}`;
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // initial layout sync
    return () => window.removeEventListener("scroll", onScroll);
  }, [paint]);

  /* ---- Re-fit canvas on resize ---- */
  useEffect(() => {
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [resize]);

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#061d43]"
      style={{ height: "600vh" }}
    >
      {/* Sticky Fullscreen Viewport (100vw x 100vh) */}
      <div className="sticky top-0 h-screen [height:100dvh] w-full overflow-hidden text-white">

        {/* FULLSCREEN CANVAS — fills entire 100vw x 100vh */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full block object-cover z-0"
        />

        {/* CINEMATIC OVERLAYS FOR CONTRAST & LEGIBILITY */}
        {/* Left-to-right gradient so left/center-left typography is crisp while right scenery shines */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-[#020e24]/92 via-[#031435]/65 sm:via-[#031435]/50 to-transparent" />
        {/* Top vignette for navbar integration */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 z-10 bg-gradient-to-b from-[#020e24]/85 via-[#020e24]/40 to-transparent" />
        {/* Bottom subtle gradient for indicators */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 z-10 bg-gradient-to-t from-[#020e24]/80 to-transparent" />
        {/* Architectural subtle vignette */}
        <div className="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_100px_rgba(2,12,30,0.5)]" />

        {/* ========================================================== */}
        {/* STORYTELLING CHAPTERS OVERLAY (Z-20)                       */}
        {/* ========================================================== */}
        <div className="relative z-20 flex h-full items-center px-6 sm:px-10 lg:px-20 max-w-7xl mx-auto">
          <div className="relative w-full max-w-3xl pt-16 sm:pt-20">

            {/* ---------------------------------------------------- */}
            {/* CHAPTER 0 — HERO INTRO (0% – 14%)                    */}
            {/* ---------------------------------------------------- */}
            <div
              ref={(el) => { chapterRefs.current[0] = el; }}
              className="transition-transform duration-75 ease-out will-change-[transform,opacity]"
            >
              <p className="flex items-center gap-3 text-xs sm:text-sm font-bold uppercase tracking-[0.22em] text-[#86c6ff]">
                <span className="h-px w-8 bg-[#86c6ff]" />
                Society Conveyance &amp; Documentation
              </p>

              <h1 className="mt-4 sm:mt-6 text-4xl sm:text-6xl lg:text-7xl font-black leading-[0.94] tracking-[-0.055em] text-white">
                Make every<br />
                property decision<br />
                feel <span className="text-[#71b8ff]">clearer.</span>
              </h1>

              <p className="mt-5 sm:mt-7 max-w-xl text-base sm:text-lg leading-relaxed text-[#c0d2eb]">
                S.P. Consultant brings focused support to conveyance, society
                documentation, registration, stamp-duty work, and compliance
                processes—so you can move forward with confidence.
              </p>

              <div className="mt-7 sm:mt-9 flex flex-col sm:flex-row gap-3.5">
                <Link
                  href="/contact"
                  className="interactive-button inline-flex items-center justify-center gap-2 rounded-full bg-[#1474ed] px-7 py-4 text-sm font-bold text-white shadow-[0_12px_30px_rgba(20,116,237,.35)] transition hover:-translate-y-0.5 hover:bg-[#2e8dff] hover:shadow-[0_18px_36px_rgba(20,116,237,.45)]"
                >
                  Discuss your requirement{" "}
                  <Icon name="arrow" className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-8 sm:mt-11 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-[#b5c8e4]">
                <span>Established 2021</span>
                <span className="h-3.5 w-px bg-white/25" />
                <span>{siteConfig.serviceArea}</span>
                <span className="hidden sm:inline h-3.5 w-px bg-white/25" />
                <span className="hidden sm:inline">Professional guidance</span>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* CHAPTER 1 — THE PROBLEM (14% – 29%)                  */}
            {/* ---------------------------------------------------- */}
            <div
              ref={(el) => { chapterRefs.current[1] = el; }}
              className="absolute inset-0 flex flex-col justify-center opacity-0 pointer-events-none transition-transform duration-75 ease-out will-change-[transform,opacity]"
            >
              <p className="flex items-center gap-3 text-xs sm:text-sm font-bold uppercase tracking-[0.22em] text-[#86c6ff]">
                <span className="h-px w-8 bg-[#86c6ff]" />
                The Challenge
              </p>

              <h2 className="mt-4 sm:mt-6 text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.02] tracking-[-0.05em] text-white">
                Property matters<br />
                can be <span className="text-[#71b8ff]">complex.</span>
              </h2>

              <p className="mt-5 sm:mt-7 max-w-xl text-base sm:text-xl leading-relaxed text-[#c0d2eb]">
                From documentation to registration and compliance, every step
                requires accuracy, coordination and the right guidance.
              </p>

              <div className="mt-8 flex items-center gap-2 text-xs font-semibold tracking-wider text-[#9ecbf9] uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-[#71b8ff]" />
                Precision in paperwork • Avoid costly delays
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* CHAPTER 2 — WHAT WE DO (29.5% – 49%)                 */}
            {/* ---------------------------------------------------- */}
            <div
              ref={(el) => { chapterRefs.current[2] = el; }}
              className="absolute inset-0 flex flex-col justify-center opacity-0 pointer-events-none transition-transform duration-75 ease-out will-change-[transform,opacity]"
            >
              <p className="flex items-center gap-3 text-xs sm:text-sm font-bold uppercase tracking-[0.22em] text-[#86c6ff]">
                <span className="h-px w-8 bg-[#86c6ff]" />
                Our Purpose
              </p>

              <h2 className="mt-4 sm:mt-6 text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.02] tracking-[-0.05em] text-white">
                We make the process<br />
                <span className="text-[#71b8ff]">clearer.</span>
              </h2>

              <p className="mt-5 sm:mt-7 max-w-xl text-base sm:text-lg leading-relaxed text-[#c0d2eb]">
                Professional support for conveyance, society documentation,
                registration, stamp-duty work and related compliance processes.
              </p>

              {/* Clean, architectural service list (minimal typography, not SaaS cards) */}
              <div className="mt-8 flex flex-wrap gap-2.5 sm:gap-3 max-w-xl">
                {["Conveyance", "Society Documentation", "Registration", "Stamp Duty", "Compliance"].map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs sm:text-sm font-semibold text-white/90 backdrop-blur-sm"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#71b8ff]" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* CHAPTER 3 — EXPERTISE (49% – 67%)                    */}
            {/* ---------------------------------------------------- */}
            <div
              ref={(el) => { chapterRefs.current[3] = el; }}
              className="absolute inset-0 flex flex-col justify-center opacity-0 pointer-events-none transition-transform duration-75 ease-out will-change-[transform,opacity]"
            >
              <p className="flex items-center gap-3 text-xs sm:text-sm font-bold uppercase tracking-[0.22em] text-[#86c6ff]">
                <span className="h-px w-8 bg-[#86c6ff]" />
                Dedicated Support
              </p>

              <h2 className="mt-4 sm:mt-6 text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.02] tracking-[-0.05em] text-white">
                Expertise that guides<br />
                <span className="text-[#71b8ff]">every step.</span>
              </h2>

              <p className="mt-5 sm:mt-7 max-w-xl text-base sm:text-xl leading-relaxed text-[#c0d2eb]">
                We help you understand the process, organize the required
                documentation, and move forward with greater confidence.
              </p>

              <div className="mt-8 flex items-center gap-3 text-xs sm:text-sm font-semibold text-[#9ecbf9]">
                <span>Thorough Verification</span>
                <span className="h-3 w-px bg-white/20" />
                <span>Structured Coordination</span>
                <span className="h-3 w-px bg-white/20" />
                <span>Timely Follow-up</span>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* CHAPTER 4 — TRUST & CREDIBILITY (67% – 81%)          */}
            {/* ---------------------------------------------------- */}
            <div
              ref={(el) => { chapterRefs.current[4] = el; }}
              className="absolute inset-0 flex flex-col justify-center opacity-0 pointer-events-none transition-transform duration-75 ease-out will-change-[transform,opacity]"
            >
              <p className="flex items-center gap-3 text-xs sm:text-sm font-bold uppercase tracking-[0.22em] text-[#86c6ff]">
                <span className="h-px w-8 bg-[#86c6ff]" />
                Established Credibility
              </p>

              <h2 className="mt-4 sm:mt-6 text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.02] tracking-[-0.05em] text-white">
                Built on trust &amp;<br />
                <span className="text-[#71b8ff]">local expertise.</span>
              </h2>

              <div className="mt-8 grid sm:grid-cols-3 gap-4 max-w-xl">
                <div className="border-l-2 border-[#71b8ff] pl-4 py-1">
                  <p className="text-xl sm:text-2xl font-black text-white">2021</p>
                  <p className="mt-1 text-xs font-semibold tracking-wider uppercase text-[#9ecbf9]">Established</p>
                </div>
                <div className="border-l-2 border-white/30 pl-4 py-1">
                  <p className="text-base sm:text-lg font-bold text-white leading-tight">Palghar &amp; Virar</p>
                  <p className="mt-1 text-xs font-semibold tracking-wider uppercase text-[#9ecbf9]">Region Focus</p>
                </div>
                <div className="border-l-2 border-white/30 pl-4 py-1">
                  <p className="text-base sm:text-lg font-bold text-white leading-tight">Professional</p>
                  <p className="mt-1 text-xs font-semibold tracking-wider uppercase text-[#9ecbf9]">Direct Counsel</p>
                </div>
              </div>

              <p className="mt-7 max-w-xl text-sm sm:text-base leading-relaxed text-[#c0d2eb]">
                Serving housing societies and property owners with direct,
                accountable, and transparent counsel throughout the journey.
              </p>
            </div>

            {/* ---------------------------------------------------- */}
            {/* CHAPTER 5 — THE DIFFERENCE (81% – 91.5%)             */}
            {/* ---------------------------------------------------- */}
            <div
              ref={(el) => { chapterRefs.current[5] = el; }}
              className="absolute inset-0 flex flex-col justify-center opacity-0 pointer-events-none transition-transform duration-75 ease-out will-change-[transform,opacity]"
            >
              <p className="flex items-center gap-3 text-xs sm:text-sm font-bold uppercase tracking-[0.22em] text-[#86c6ff]">
                <span className="h-px w-8 bg-[#86c6ff]" />
                The S.P Consultant Promise
              </p>

              <h2 className="mt-4 sm:mt-6 text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.02] tracking-[-0.05em] text-white">
                Clear process.<br />
                <span className="text-[#71b8ff]">Professional guidance.</span>
              </h2>

              <p className="mt-6 sm:mt-8 max-w-xl text-lg sm:text-2xl font-medium leading-relaxed text-[#d7e6f8]">
                “Because property decisions deserve more than paperwork—they deserve clarity.”
              </p>
            </div>

            {/* ---------------------------------------------------- */}
            {/* CHAPTER 6 — FINAL CTA (91.5% – 100%)                 */}
            {/* ---------------------------------------------------- */}
            <div
              ref={(el) => { chapterRefs.current[6] = el; }}
              className="absolute inset-0 flex flex-col justify-center opacity-0 pointer-events-none transition-transform duration-75 ease-out will-change-[transform,opacity]"
            >
              <p className="flex items-center gap-3 text-xs sm:text-sm font-bold uppercase tracking-[0.22em] text-[#86c6ff]">
                <span className="h-px w-8 bg-[#86c6ff]" />
                Take The Next Step
              </p>

              <h2 className="mt-4 sm:mt-6 text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.02] tracking-[-0.05em] text-white">
                Ready to move forward<br />
                with <span className="text-[#71b8ff]">clarity?</span>
              </h2>

              <p className="mt-5 sm:mt-7 max-w-xl text-base sm:text-xl leading-relaxed text-[#c0d2eb]">
                Tell us about your requirement and we&apos;ll help you understand the next steps.
              </p>

              <div className="mt-7 sm:mt-9 flex flex-col sm:flex-row gap-3.5">
                <Link
                  href="/contact"
                  className="interactive-button inline-flex items-center justify-center gap-2 rounded-full bg-[#1474ed] px-8 py-4 text-sm font-bold text-white shadow-[0_12px_30px_rgba(20,116,237,.35)] transition hover:-translate-y-0.5 hover:bg-[#2e8dff] hover:shadow-[0_18px_36px_rgba(20,116,237,.45)]"
                >
                  Discuss your requirement{" "}
                  <Icon name="arrow" className="h-4 w-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================== */}
        {/* SUBTLE VERTICAL PROGRESS TRACKER (RIGHT SIDE)               */}
        {/* ========================================================== */}
        <div className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 z-30 flex-col items-center gap-3 pointer-events-none">
          <span
            ref={progressTextRef}
            className="text-[11px] font-mono font-bold tracking-widest text-[#71b8ff]"
          >
            01
          </span>
          <div className="relative h-28 w-[1.5px] bg-white/15 overflow-hidden rounded-full">
            <div
              ref={progressLineRef}
              className="absolute top-0 inset-x-0 bg-gradient-to-b from-[#1474ed] to-[#71b8ff] transition-[height] duration-75"
              style={{ height: "0%" }}
            />
          </div>
          <span className="text-[10px] font-mono font-semibold tracking-widest text-white/30">
            07
          </span>
        </div>

        {/* ========================================================== */}
        {/* MINIMAL BOTTOM SCROLL INDICATOR                             */}
        {/* ========================================================== */}
        <div
          ref={indicatorRef}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 transition-opacity duration-200"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#9fcbf9]/60">
            Scroll to explore
          </span>
          <div className="relative h-8 w-px overflow-hidden bg-white/20">
            <span className="scroll-indicator-line absolute inset-x-0 h-1/2 bg-gradient-to-b from-transparent to-[#71b8ff]" />
          </div>
        </div>

        {/* ========================================================== */}
        {/* INITIAL LOAD SPINNER                                       */}
        {/* ========================================================== */}
        <div
          ref={loaderRef}
          className="absolute inset-0 z-40 flex items-center justify-center bg-[#061d43] transition-opacity duration-300"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#71b8ff]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#86c6ff]">
              Preparing Cinematic Journey
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
