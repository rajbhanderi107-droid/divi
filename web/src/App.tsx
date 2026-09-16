import { useState } from "react";
import { useHashRoute } from "@/site/hooks";
import { Chapters } from "@/site/chapters";
import { Darshan } from "@/site/darshan";
import { Album } from "@/site/hero";
import { PrivacyChoices, Terms } from "@/site/legal";
import { Details, Gallery, Venue } from "@/site/sections";
import { Atmosphere, Cursor, Footer, Grain, Header, Loader, SmoothScroll } from "@/site/shell";

// Divi Garba, as deployed: Darshan opens on Mataji, the album turns, the five chapters take the scroll
// one film at a time, then the nights, the date, the ground and the closing page.
const pages: Record<string, () => React.ReactElement> = { terms: Terms, "privacy-choices": PrivacyChoices };

export default function App() {
  const route = useHashRoute();
  const [ready, setReady] = useState(false);
  const Page = pages[route];
  if (Page) return <Page />;
  return (
    <SmoothScroll>
      <Loader onDone={() => setReady(true)} />
      <Atmosphere />
      <Cursor />
      <Grain />
      <Header />
      {/* The header's Home link points here, so the anchor resolves to the top of the page. */}
      <main id="home" className="relative" style={{ zIndex: "var(--z-content)" }}>
        <Darshan start={ready} />
        <Album />
        <Chapters />
        <Gallery />
        <Details />
        <Venue />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
