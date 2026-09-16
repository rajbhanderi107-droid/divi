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
  ["૦૧", "the-invitation", "આમંત્રણ"],
  ["૦૨", "dhol-comes-first", "પહેલાં ઢોલ"],
  ["૦૩", "the-turn", "ઘૂમર"],
  ["૦૪", "the-step", "પગલું"],
  ["૦૫", "the-circle", "વર્તુળ"],
  ["૦૬", "the-center", "માંડવી"],
  ["૦૭", "aajrakh", "અજરખ"],
  ["૦૮", "blurr", "ઘૂમતું"],
  ["૦૯", "rny00498", "મેદાન"],
].map(([n, slug, title]) => ({ n, file: a(`/assets/gallery/${slug}.jpg`), title, alt: `${title} — દિવી ગરબા` }));

export const installations: Media[] = [
  ...[1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ file: a(`/assets/installations/installation-${n}.jpg`), alt: `Divi Garba installation ${n}` })),
  // From the organiser's photo folder (Google Drive), cropped to the book's page shape.
  { file: a("/assets/installations/moment-dhs00815.jpg"), alt: "Dancers under the string lights and red fabric strips at Divi Garba" },
  { file: a("/assets/installations/moment-circle-aerial.jpg"), alt: "The Divi Garba ground from above, red fabric strips radiating from the centre of the circle" },
];

// ---------------------------------------------------------------- the ritual scroll
// Five photographs of the ground that cross-fade under one pinned frame, carried over from the approved
// divigarba.vercel.app design. Real photography, the organiser's copy, in English as it was written.

export type Scene = {
  id: string;
  /** Where in the pinned scroll this scene starts and ends, 0-1. */
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
  { id: "opening", from: 0.02, to: 0.19, side: "left", align: "start", eyebrow: "દિવી ગરબા ૨૦૨૬", heading: "આપણી દિવી ઝળહળે", body: "જ્યાં પરંપરા જીવંત થાય છે.", image: { file: a("/assets/img-1.jpg"), fileMobile: a("/assets/img1-mobile.jpg"), alt: "સાંજના અજવાળે, ફૂલોથી ઘેરાયેલી માંડવી નીચે શણગારેલો ચંદરવો", focal: "center 40%" } },
  { id: "dhol", from: 0.22, to: 0.39, side: "right", align: "center", eyebrow: "આમંત્રણ", heading: "ઢોલનો પહેલો તાલ", body: "તાલ બોલાવે છે અને પગ તાલે ચાલે છે.", image: { file: a("/assets/scene-invitation.jpg"), fileMobile: a("/assets/scene-invitation.jpg"), alt: "માંડવીની આસપાસ ઢોલ અને શરણાઈ વાગે છે, પાછળ મેદાન ભરાય છે", focal: "center 46%" } },
  { id: "circle", from: 0.41, to: 0.58, side: "left", align: "end", eyebrow: "વર્તુળ", heading: "એક ડગલું. એક વર્તુળ. એક ઊર્જા.", body: "દસ રાત, એની આસપાસ ફરતું.", image: { file: a("/assets/scene-circle.jpg"), fileMobile: a("/assets/scene-circle.jpg"), alt: "મેદાનની વચ્ચે ફૂલોથી ઘેરાયેલી માંડવી, ઉપર ચંદરવો", focal: "center 45%" } },
  { id: "ground", from: 0.61, to: 0.78, side: "right", align: "center", eyebrow: "એક દિશા", heading: "તાલ", body: "હજારો લોકોને એક સાથે દોરે છે.", image: { file: a("/assets/img-4.jpg"), fileMobile: a("/assets/img4-mobile.jpg"), alt: "રાતની ભીડમાં ઢોલીઓ આગળ ચાલતા", focal: "center 48%" } },
  { id: "everyone", from: 0.8, to: 0.97, side: "left", align: "end", eyebrow: "મેદાન", heading: "તમે જાણો છો એ સૌ અહીં છે", body: "જૂના મિત્રો, નવી યાદો, અને સતત વધતું વર્તુળ.", image: { file: a("/assets/scene-everyone.jpg"), fileMobile: a("/assets/scene-everyone.jpg"), alt: "રોશનીની નીચે મિત્રો હાથમાં હાથ પરોવીને મેદાનમાં", focal: "center 30%" } },
];

// ---------------------------------------------------------------- generated design elements
// Loops, painted figures and covers produced through Higgsfield. They are used as ornament — ambient light
// behind a section, a figure set into its geometry layer — never as a stand-in for the event's own photography.

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

