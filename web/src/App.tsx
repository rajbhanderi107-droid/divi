import { useState } from "react";
import { useHashRoute } from "@/site/hooks";
import { Album, Hero } from "@/site/hero";
import { PrivacyChoices, Terms } from "@/site/legal";
import { Details, Gallery, Ritual, Venue } from "@/site/sections";
import { Atmosphere, Cursor, Footer, Grain, Header, Loader, SmoothScroll } from "@/site/shell";

// The Divi Garba site as designed on divigarba.vercel.app, with the 3D venue map in Location and a few slow mandalas.
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
      <main id="top" className="relative" style={{ zIndex: "var(--z-content)" }}>
        <Hero start={ready} />
        <Album />
        <Ritual />
        <Gallery />
        <Details />
        <Venue />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
