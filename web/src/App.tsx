import { useHashRoute } from "@/site/hooks";
import { Chapters } from "@/site/chapters";
import { Darshan } from "@/site/darshan";
import { Album } from "@/site/hero";
import { PrivacyChoices, Terms } from "@/site/legal";
import { Opening } from "@/site/opening";
import { Details, Gallery, Venue } from "@/site/sections";
import { Atmosphere, Cursor, Footer, Grain, Header, Loader, SmoothScroll } from "@/site/shell";

// Divi Garba, as deployed: the night opens under the lights, Darshan turns to Mataji, the album turns, the
// five chapters take the scroll one film at a time with a line held between them, then the nights, the date,
// the ground and the closing page.
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
        <Opening />
        <Darshan />
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
