// Venue data for the 3D map in Location. Event copy and media for the rest of the site live in site/content.ts.

export const site = {
  venue: "Master Farm, B/s Sardardham, Vaishnodevi Circle",
};

// 3D venue map. The venue point decodes Google's plus code for the venue (4GWG+3RQ, Khodiyar 382501); the landmark is
// the Vaishnodevi Circle junction on OpenStreetMap.
export const venueMap = {
  venue: { lng: 72.527109, lat: 23.145213 },
  plusCode: "4GWG+3RQ Khodiyar, Gujarat 382501",
  landmark: { name: "Vaishnodevi Circle", lng: 72.5425745, lat: 23.136085 },
  googleDirections: "https://www.google.com/maps/dir/?api=1&destination=23.145213,72.527109&travelmode=driving",
  appleDirections: "https://maps.apple.com/?daddr=23.145213,72.527109&dirflg=d",
  routeNote: "About 3 km from Vaishnodevi Circle: over the Vaishnodevi overbridge, then local roads to the farm.",
  routeCaveat: "The gold line is a suggested route from OpenStreetMap. Follow your navigation app on the night.",
};
