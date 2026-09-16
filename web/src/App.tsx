
import { useHashRoute } from "@/site/hooks";
import { Darshan } from "@/site/darshan";
import { Album } from "@/site/hero";
import { PrivacyChoices, Terms } from "@/site/legal";
import { Details, Gallery, Ritual, Venue } from "@/site/sections";
import { Atmosphere, Cursor, Footer, Grain, Header, Loader, SmoothScroll } from "@/site/shell";

// Divi Garba. Darshan opens on Mataji — She is the head of the page and everything below turns around Her.
// Then the album, the pinned ritual scroll from the approved design, the nights, the date, the ground and
// the closing page.
const pages: Record<string, () => React.ReactElement> = { terms: Terms, "privacy-choices": PrivacyChoices };

export default function App() {
  const route = useHashRoute();

  const Page = pages[route];
  if (Page) return <Page />;
  return (
    <SmoothScroll>
      <Loader />
      <Atmosphere />
      <Cursor />
      <Grain />
      <Header />
      <main id="top" className="relative" style={{ zIndex: "var(--z-content)" }}>
        <Darshan />
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
