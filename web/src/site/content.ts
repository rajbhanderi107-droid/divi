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

export type Scene = {
  id: string;
  from: number;
  to: number;
  side: "left" | "right";
  align: "start" | "center" | "end";
  eyebrow: string;
  heading: string;
  body: string;
  image: { file: string; fileMobile: string; alt: string; focal: string };
};

export const scenes: Scene[] = [
  { id: "opening", from: 0.02, to: 0.19, side: "left", align: "start", eyebrow: "Divi Garba 2026", heading: "Our Divi Glows", body: "Where tradition comes alive.", image: { file: a("/assets/img-1.jpg"), fileMobile: a("/assets/img1-mobile.jpg"), alt: "A flower-ringed altar beneath a canopy of fabric petals, lit at dusk", focal: "center 40%" } },
  { id: "dhol", from: 0.22, to: 0.39, side: "right", align: "center", eyebrow: "The Invitation", heading: "First beat of dhol", body: "Beats invite and feet follow the rhythm.", image: { file: a("/assets/scene-invitation.jpg"), fileMobile: a("/assets/scene-invitation.jpg"), alt: "The dhol and shehnai band playing in a ring around the shrine as the ground fills behind them", focal: "center 46%" } },
  { id: "circle", from: 0.41, to: 0.58, side: "left", align: "end", eyebrow: "The Circle", heading: "One step. One circle. One energy.", body: "", image: { file: a("/assets/scene-circle.jpg"), fileMobile: a("/assets/scene-circle.jpg"), alt: "The flower-ringed altar at the centre of the ground, under a canopy of fabric petals", focal: "center 45%" } },
  { id: "ground", from: 0.61, to: 0.78, side: "right", align: "center", eyebrow: "One Direction", heading: "Rhythm", body: "Driving thousands of people together.", image: { file: a("/assets/img-4.jpg"), fileMobile: a("/assets/img4-mobile.jpg"), alt: "Young dhol players leading a procession through a packed night crowd", focal: "center 48%" } },
  { id: "everyone", from: 0.8, to: 0.97, side: "left", align: "end", eyebrow: "The Ground", heading: "Everyone you know is here", body: "Old friends, new memories and a circle that keeps growing.", image: { file: a("/assets/scene-everyone.jpg"), fileMobile: a("/assets/scene-everyone.jpg"), alt: "A group of friends in festive attire arm in arm on the ground, under the string lights", focal: "center 30%" } },
];

// ---------------------------------------------------------------- the five chapters
// Recovered from the deployed build. Each chapter is a full-bleed film that plays while
// its 230svh section is pinned; the Gujarati numeral, title and line sit over it.

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
  /** Gujarati numeral shown before the eyebrow. */
  n: string;
  /** Eyebrow, in Gujarati. */
  eyebrow: string;
  /** Heading, in Gujarati. The word in `accent` is lifted into gold. */
  heading: string;
  accent?: string;
  video: string;
  poster: string;
  side: "left" | "center" | "right";
  /** object-position for the film, so the subject stays out from under the type. */
  focal: string;
};

export const chapters: Chapter[] = [
  { id: "circle", n: "૦૧", eyebrow: "મેદાન ફરે છે", heading: "દસ રાત. એક", accent: "વર્તુળ", video: a("/assets/scenes/circle.mp4"), poster: a("/assets/scenes/circle.webp"), side: "center", focal: "50% 50%" },
  { id: "dhol", n: "૦૨", eyebrow: "પહેલાં ઢોલ", heading: "ઢોલનો પહેલો", accent: "તાલ", video: a("/assets/scenes/dhol.mp4"), poster: a("/assets/scenes/dhol.webp"), side: "left", focal: "58% 46%" },
  { id: "rangoli", n: "૦૩", eyebrow: "દરરોજ નવી રંગોળી", heading: "હાથે", accent: "દોરેલી", video: a("/assets/scenes/rangoli.mp4"), poster: a("/assets/scenes/rangoli.webp"), side: "right", focal: "40% 56%" },
  { id: "aarti", n: "૦૪", eyebrow: "મધ્યમાં આરતી", heading: "આરતીની", accent: "ક્ષણ", video: a("/assets/scenes/aarti.mp4"), poster: a("/assets/scenes/aarti.webp"), side: "left", focal: "50% 40%" },
  { id: "dawn", n: "૦૫", eyebrow: "પરોઢ", heading: "સૂરજ પાછો આવે ત્યાં", accent: "સુધી", video: a("/assets/scenes/dawn.mp4"), poster: a("/assets/scenes/dawn.webp"), side: "right", focal: "42% 58%" },
];
