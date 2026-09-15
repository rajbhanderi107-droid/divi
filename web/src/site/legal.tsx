import { useState } from "react";
import { brand, site } from "./content";
import { MandalaArt, Rosette } from "./mandala-art";

type Section = { heading: string; paragraphs?: string[]; bullets?: string[] };

function LegalSection({ heading, paragraphs = [], bullets = [] }: Section) {
  return (
    <section className="mt-10">
      <h2 className="label mb-3 text-mukut">{heading}</h2>
      {bullets.length > 0 && (
        <ul className="mt-3 space-y-2.5">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-ivory/65">
              <span aria-hidden className="mt-2 h-1.5 w-1.5 flex-none rotate-45 bg-mukut/60" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
      {paragraphs.map((p, i) => (
        <p key={i} className="mt-3 text-sm leading-relaxed text-ivory/65">
          {p}
        </p>
      ))}
    </section>
  );
}

function LegalPage({ title, effective, intro, sections = [], footnote, children }: { title: string; effective?: string; intro?: string; sections?: Section[]; footnote?: string; children?: React.ReactNode }) {
  return (
    <div className="min-h-svh">
      <header className="sticky top-0 flex items-center justify-between border-b border-antique/15 bg-obsidian/90 px-5 py-2 backdrop-blur-md sm:px-10" style={{ zIndex: "var(--z-nav)" }}>
        <button
          type="button"
          onClick={() => {
            if (window.history.length > 1) window.history.back();
            else window.location.hash = "";
          }}
          className="label cursor-pointer text-ivory/60 transition-colors hover:text-ivory"
        >
          ← Back
        </button>
        <img src={brand.logo} alt={site.brandLine} className="aspect-square w-[clamp(100px,26vw,120px)] object-contain md:w-45" />
      </header>
      <main className="relative overflow-hidden px-5 pt-12 pb-24 sm:px-10">
        <MandalaArt className="-top-[300px] left-1/2 h-[640px] w-[640px] -translate-x-1/2 text-antique opacity-[0.12]" spin={240} />
        <div className="relative mx-auto max-w-2xl">
          <h1 className="display-type text-center text-[clamp(2rem,5vw,3.2rem)] text-ivory">{title}</h1>
          {effective && <p className="mt-4 text-center text-xs text-ivory/35">Effective {effective}</p>}
          <div className="divider-carved mt-8">
            <Rosette />
          </div>
          {intro && <p className="mt-8 text-sm leading-relaxed text-ivory/70">{intro}</p>}
          {sections.map((s) => (
            <LegalSection key={s.heading} {...s} />
          ))}
          {children}
          {footnote && <p className="mt-12 border-t border-antique/15 pt-6 text-xs leading-relaxed text-ivory/35">{footnote}</p>}
        </div>
      </main>
    </div>
  );
}

const entry = [
  "Entry & Passes — Valid event pass required. Non-transferable. QR codes valid for single scan only.",
  "Dress Code — Traditional attire encouraged; must respect cultural values.",
];
const timing = `Timing & Entry — Gates open at ${site.gateEntry}; last entry at ${site.entryCloses}. No re-entry allowed.`;
const refunds = "Refunds — Passes are non-refundable; rescheduling policy applies for cancellations.";

export function Terms() {
  return (
    <LegalPage
      title="Terms & Conditions"
      intro={`${site.brandLine} is owned and operated by ${site.organiserName}, a proprietorship registered in India.`}
      sections={[
        { heading: "Single Pass — Entry Terms", bullets: [...entry, timing, refunds] },
        { heading: "Couple Pass — Entry Terms", bullets: [...entry, "Couple Pass — One male and one female are mandatory on a Couple Pass. 2 male or 2 female are not allowed on couple entry.", timing, refunds] },
      ]}
      footnote={`Event dates: ${site.dates}. Venue: ${site.location}.`}
    />
  );
}

const TRACKING_KEY = "privacy-choices:optional-tracking";

export function PrivacyChoices() {
  const [allowed, setAllowed] = useState(() => {
    try {
      return localStorage.getItem(TRACKING_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [saved, setSaved] = useState(false);
  const choose = (value: boolean) => {
    setAllowed(value);
    setSaved(true);
    try {
      localStorage.setItem(TRACKING_KEY, String(value));
    } catch {
      /* storage unavailable */
    }
  };
  const on = "border-mukut bg-mukut font-medium text-obsidian";
  const off = "border-antique/30 text-ivory/70 hover:border-mukut/70 hover:text-ivory";
  return (
    <LegalPage
      title="Privacy Choices"
      intro={`${site.brandLine} only turns on optional analytics (Meta Pixel) when you allow it here. Rejecting it never affects your ability to use the website, waitlist, or ticketing services — necessary storage for basic page behaviour and waitlist protection stays on either way.`}
    >
      <section className="mt-10">
        <h2 className="label mb-3 text-mukut">Optional tracking</h2>
        <div className="frame-ancient flex flex-wrap items-center justify-between gap-4 bg-maroon/20 px-5 py-5">
          <div>
            <p className="text-sm text-ivory">Allow optional tracking (Meta Pixel)</p>
            <p className="mt-1 text-xs text-ivory/45">Currently {allowed ? "allowed" : "not allowed"}.</p>
          </div>
          <div className="flex gap-2.5">
            <button type="button" onClick={() => choose(false)} aria-pressed={!allowed} className={`rounded-full border px-4 py-2 text-xs transition-colors duration-400 ${allowed ? off : on}`}>
              Reject
            </button>
            <button type="button" onClick={() => choose(true)} aria-pressed={allowed} className={`rounded-full border px-4 py-2 text-xs transition-colors duration-400 ${allowed ? on : off}`}>
              Allow
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs text-ivory/35" aria-live="polite">
          {saved ? "Saved on this device." : "Your last saved choice loads automatically next time."}
        </p>
      </section>
    </LegalPage>
  );
}
