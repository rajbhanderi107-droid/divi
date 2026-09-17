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
  // The head page's portrait: the painting itself, held still except for her eyes, which close and open.
  mataji: { file: a("/assets/loops/mataji-blink.mp4"), poster: a("/assets/cover/mataji-blink.webp"), alt: "Maa Durga, painted on aged canvas" },
  video: { file: a("/assets/graba.mp4"), poster: a("/assets/posters/graba.webp"), alt: "Garba on the ground at night" },
  reelOne: { file: a("/assets/reel/reel-1.mp4"), poster: a("/assets/posters/reel-1.webp"), alt: "Garba on the ground" },
  reelTwo: { file: a("/assets/reel/reel-2.mp4"), poster: a("/assets/posters/reel-2.webp"), alt: "Garba on the ground" },
  heroBg: { file: a("/assets/master-bg-divi.jpg"), fileMobile: a("/assets/master-bg-divi-mobile.jpg"), webp: a("/assets/master-bg-divi.webp"), webpMobile: a("/assets/master-bg-divi-mobile.webp") },
  bell: { file: a("/assets/bell.png"), webp: a("/assets/bell.webp") },
  vector: { file: a("/assets/vector.png"), webp: a("/assets/vector.webp") },
  // The dawn film closes the page on the line the details card ends with, "until the sun returns".
  dawn: { file: a("/assets/scenes/dawn.mp4"), poster: a("/assets/scenes/dawn.webp"), alt: "A diya burning on at dawn as the horizon brightens" },
};

// The painted objects the nights are built around, used one to a place rather than scattered. Each is a short
// film of the painting — only its flame and light move — cut to the object's own outline by its matching still,
// which shares the film's frame exactly and so doubles as both the mask and the poster.
export const figures = {
  garbo: { file: a("/assets/figures/garbo.mp4"), mask: a("/assets/figures/garbo.webp"), alt: "A pierced garbo pot lit from within" },
  diya: { file: a("/assets/figures/diya-lotus.mp4"), mask: a("/assets/figures/diya-lotus.webp"), alt: "A brass diya resting on an open lotus" },
  dhol: { file: a("/assets/figures/dhol-toran.mp4"), mask: a("/assets/figures/dhol-toran.webp"), alt: "A dhol with crossed dandiya sticks" },
};

// A painted toran, hung the way one is: across the top of a threshold.
export const toran = a("/assets/figures/toran.webp");

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
