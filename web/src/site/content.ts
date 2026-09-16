// Content and media for the Divi Garba site, carried over from divigarba.vercel.app (the approved design). Media lives in
// web/public/v and is served under the site base (e.g. /divi/v/assets/...).

const base = import.meta.env.BASE_URL;
export const a = (path: string) => `${base}v${path}`;

export const site = {
  name: "Divi Garba",
  dates: "11 — 20 October 2026",
  location: "Master Farm, B/s Sardardham, Vaishnodevi Circle",
  venueName: "Master Farm",
  venueStreet: "B/s Sardardham, Vaishnodevi Circle",
  gateEntry: "8:00 PM",
  entryCloses: "2:00 AM",
  phone: "+91 99797 87914",
  email: "panchatva@divigarba.com",
  instagram: "https://www.instagram.com/divigarba/",
  instagramHandle: "@divigarba",
  maps: "https://share.google/TpbhF5qgcvUpwjPHC",
  terms: "#terms",
  organiserName: "Panchatva Events",
  organiserUrl: null as string | null,
  brandLine: "Divi Garba",
};

export const brand = { logo: a("/assets/logo-divi.png"), panchatva: a("/assets/panchatva-logo.png") };

export type Media = { file: string; alt: string; poster?: string };

export const media = {
  video: { file: a("/assets/graba.mp4"), poster: a("/assets/posters/graba.webp"), alt: "Garba on the ground at night" },
  reelOne: { file: a("/assets/reel/reel-1.mp4"), poster: a("/assets/posters/reel-1.webp"), alt: "Garba on the ground" },
  reelTwo: { file: a("/assets/reel/reel-2.mp4"), poster: a("/assets/posters/reel-2.webp"), alt: "Garba on the ground" },
  heroBg: { file: a("/assets/master-bg-divi.jpg"), fileMobile: a("/assets/master-bg-divi-mobile.jpg"), webp: a("/assets/master-bg-divi.webp"), webpMobile: a("/assets/master-bg-divi-mobile.webp") },
  bell: { file: a("/assets/bell.png"), webp: a("/assets/bell.webp") },
  vector: { file: a("/assets/vector.png"), webp: a("/assets/vector.webp") },
};

export type Shot = Media & { n: string; title: string; line?: string; focal?: string };

export const nights: Shot[] = [
  ["01", "the-invitation", "The Invitation"],
  ["02", "dhol-comes-first", "Dhol Comes First"],
  ["03", "the-turn", "The Turn"],
  ["04", "the-step", "The Step"],
  ["05", "the-circle", "The Circle"],
  ["06", "the-center", "The Center"],
  ["07", "aajrakh", "Aajrakh"],
  ["08", "blurr", "Blurr"],
  ["09", "rny00498", "The Ground"],
].map(([n, slug, title]) => ({ n, file: a(`/assets/gallery/${slug}.jpg`), title, alt: `${title} — Divi Garba` }));

export const installations: Media[] = [
  ...[1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ file: a(`/assets/installations/installation-${n}.jpg`), alt: `Divi Garba installation ${n}` })),
  // From the organiser's photo folder (Google Drive), cropped to the book's page shape.
  { file: a("/assets/installations/moment-dhs00815.jpg"), alt: "Dancers under the string lights and red fabric strips at Divi Garba" },
  { file: a("/assets/installations/moment-circle-aerial.jpg"), alt: "The Divi Garba ground from above, red fabric strips radiating from the centre of the circle" },
];

// ---------------------------------------------------------------- the opening page
// The head page, in Gujarati. Copy is the organiser's and is reproduced verbatim.

export const opening = {
  backdrop: a("/assets/scenes/lighting.webp"),
  // The backdrop crop is set in opening.tsx rather than here: it differs between a phone and a wide screen,
  // which is a layout concern rather than content.
  eyebrow: "નવરાત્રિ ૨૦૨૬ · અમદાવાદ",
  /** The title, split into grapheme clusters so each can rise on its own. */
  title: ["સાં", "જ", "થી", " ", "પ", "રો", "ઢ"],
  titlePlain: "સાંજથી પરોઢ",
  line: "માસ્ટર ફાર્મ ખાતે દસ રાતનો ગરબો — સાંજથી પરોઢ સુધી ફરતું એક વર્તુળ.",
  book: "ટિકિટ બુક કરો",
  enter: "વર્તુળમાં પ્રવેશો",
  facts: [
    { head: "૧૧ — ૨૦ ઓક્ટોબર ૨૦૨૬", sub: "દસ રાત" },
    { head: "માસ્ટર ફાર્મ", sub: "વૈષ્ણોદેવી સર્કલ" },
    { head: "રાત્રે ૮:૦૦ થી", sub: "છેલ્લો પ્રવેશ ૨:૦૦" },
  ],
};

// ---------------------------------------------------------------- the five chapters
// Each chapter is a full-bleed film that plays while its section is pinned. The heading is split so the
// gold word can fall at the start or the end of the line, which it does in both places.

export const loops = {
  headCircle: a("/assets/loops/head-circle.mp4"),
  matajiLight: a("/assets/loops/mataji-light.mp4"),
  matajiMukut: a("/assets/loops/mataji-mukut.mp4"),
  ch1Altar: a("/assets/loops/ch1-altar.mp4"),
  ch2Dhol: a("/assets/loops/ch2-dhol.mp4"),
  ch3Circle: a("/assets/loops/ch3-circle.mp4"),
};

export const figures = {
  garbo: a("/assets/figures/garbo.webp"),
  diyaLotus: a("/assets/figures/diya-lotus.webp"),
  dholToran: a("/assets/figures/dhol-toran.webp"),
};

export const cover = {
  mataji: { jpg: a("/assets/cover/mataji.jpg"), webp: a("/assets/cover/mataji.webp") },
  matajiMukut: { jpg: a("/assets/cover/mataji-mukut.jpg"), webp: a("/assets/cover/mataji-mukut.webp") },
};

export type Chapter = {
  id: string;
  /** Gujarati numeral. */
  n: string;
  eyebrow: string;
  /** Heading, in three parts: the gold word sits between `before` and `after`. Either may be empty. */
  before: string;
  accent: string;
  after: string;
  video: string;
  poster: string;
  side: "left" | "center" | "right";
  /** object-position for the film, so the subject stays clear of the type. */
  focal: string;
  /** The line held on its own after this chapter. The last chapter has none. */
  interlude?: { before: string; accent: string; after: string };
};

export const chapters: Chapter[] = [
  {
    id: "circle", n: "૦૧", eyebrow: "મેદાન ફરે છે",
    before: "દસ રાત. એક ", accent: "વર્તુળ", after: ".",
    video: a("/assets/scenes/circle.mp4"), poster: a("/assets/scenes/circle.webp"),
    side: "center", focal: "50% 50%",
    interlude: { before: "એક વર્તુળ, દસ રાત સુધી ", accent: "ફરતું", after: "." },
  },
  {
    id: "dhol", n: "૦૨", eyebrow: "પહેલાં ઢોલ",
    before: "ઢોલનો પહેલો ", accent: "તાલ", after: ".",
    video: a("/assets/scenes/dhol.mp4"), poster: a("/assets/scenes/dhol.webp"),
    side: "left", focal: "58% 46%",
    interlude: { before: "સાંભળતાં પહેલાં ", accent: "અનુભવાય", after: " છે." },
  },
  {
    id: "rangoli", n: "૦૩", eyebrow: "દરરોજ નવી રંગોળી",
    before: "", accent: "હાથે", after: " દોરેલી.",
    video: a("/assets/scenes/rangoli.mp4"), poster: a("/assets/scenes/rangoli.webp"),
    side: "right", focal: "40% 56%",
    interlude: { before: "સૌ આવે તે પહેલાં હાથે દોરાય ", accent: "છે", after: "." },
  },
  {
    id: "aarti", n: "૦૪", eyebrow: "મધ્યમાં આરતી",
    before: "", accent: "આરતીની", after: " ક્ષણ.",
    video: a("/assets/scenes/aarti.mp4"), poster: a("/assets/scenes/aarti.webp"),
    side: "left", focal: "50% 40%",
    interlude: { before: "આખું મેદાન ", accent: "સ્થિર", after: " થઈ જાય છે." },
  },
  {
    id: "dawn", n: "૦૫", eyebrow: "પરોઢ",
    before: "", accent: "સૂરજ", after: " પાછો આવે ત્યાં સુધી.",
    video: a("/assets/scenes/dawn.mp4"), poster: a("/assets/scenes/dawn.webp"),
    side: "right", focal: "42% 58%",
  },
];
