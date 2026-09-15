import * as React from "react";
import { Copy, Crosshair, Minus, Navigation, Plus, Route, Box, MapPin } from "lucide-react";
import { site, venueMap } from "@/content";
import { routeFromVaishnodevi } from "@/lib/venue-route";
import { useInView, useMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

// 3D map of Master Farm: MapLibre (loaded from jsDelivr only when the section nears the viewport) over OpenFreeMap vector
// tiles with extruded buildings, restyled in the site's rust and gold. The camera flies in from the route overview and
// slowly circles the venue until the visitor takes over; paused motion jumps straight to the close-up and never orbits.
// Touch needs two fingers and desktop zoom needs Ctrl/⌘ + scroll, so the page still scrolls past the map.

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    maplibregl?: any;
  }
}

const MAPLIBRE = "https://cdn.jsdelivr.net/npm/maplibre-gl@5.24.0/dist/maplibre-gl";
const STYLE = "https://tiles.openfreemap.org/styles/liberty";
let loader: Promise<any> | null = null;

function loadMapLibre() {
  if (window.maplibregl) return Promise.resolve(window.maplibregl);
  loader ??= new Promise((resolve, reject) => {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = `${MAPLIBRE}.css`;
    document.head.appendChild(css);
    const script = document.createElement("script");
    script.src = `${MAPLIBRE}.js`;
    script.async = true;
    script.onload = () => (window.maplibregl ? resolve(window.maplibregl) : reject(new Error("MapLibre missing")));
    script.onerror = () => {
      loader = null;
      reject(new Error("MapLibre failed to load"));
    };
    document.head.appendChild(script);
  });
  return loader;
}

const hasWebGL = () => {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
};

const VENUE: [number, number] = [venueMap.venue.lng, venueMap.venue.lat];
const LANDMARK: [number, number] = [venueMap.landmark.lng, venueMap.landmark.lat];
const CLOSE = { center: VENUE, zoom: 15.4, pitch: 60, bearing: -32 };

// A circle of `metres` around a point as a GeoJSON ring (for the venue beacon and its glow on the ground).
const circle = ([lng, lat]: [number, number], metres: number, steps = 48) => {
  const dLat = metres / 111320;
  const dLng = metres / (111320 * Math.cos((lat * Math.PI) / 180));
  const ring = Array.from({ length: steps + 1 }, (_, i) => {
    const a = (i / steps) * Math.PI * 2;
    return [lng + Math.cos(a) * dLng, lat + Math.sin(a) * dLat];
  });
  return { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [ring] } };
};

function restyle(map: any) {
  for (const layer of map.getStyle().layers as { id: string; type: string }[]) {
    const { id, type } = layer;
    const paint = (prop: string, value: unknown) => {
      try {
        map.setPaintProperty(id, prop, value);
      } catch {
        /* property not valid for this layer */
      }
    };
    if (type === "background") paint("background-color", "#120806");
    else if (type === "raster") map.setLayoutProperty(id, "visibility", "none");
    else if (type === "fill") {
      if (/water/.test(id)) paint("fill-color", "#0f1a1f");
      else if (/building/.test(id)) paint("fill-color", "#2a130b");
      else {
        paint("fill-color", /park|wood|grass|wetland/.test(id) ? "#1c1409" : "#1b0d08");
        paint("fill-opacity", 0.7);
      }
    } else if (type === "fill-extrusion") {
      paint("fill-extrusion-color", ["interpolate", ["linear"], ["to-number", ["get", "render_height"], 6], 0, "#3b1c0e", 30, "#64280f", 80, "#7d4519"]);
      paint("fill-extrusion-opacity", 0.92);
    } else if (type === "line") {
      if (/boundary/.test(id)) map.setLayoutProperty(id, "visibility", "none");
      else if (/casing/.test(id)) paint("line-color", "#0d0604");
      else if (/waterway/.test(id)) paint("line-color", "#15252c");
      else if (/rail/.test(id)) paint("line-color", "#3b1c0e");
      else if (/motorway|trunk_primary/.test(id)) paint("line-color", "#b98943");
      else if (/secondary_tertiary/.test(id)) paint("line-color", "#8a5a2b");
      else if (/path|pedestrian/.test(id)) paint("line-color", "#3b1c0e");
      else if (/road|bridge|tunnel/.test(id)) paint("line-color", "#5a3317");
    } else if (type === "symbol") {
      paint("text-color", /highway|road/.test(id) ? "#d9b273" : "#f0d49a");
      paint("text-halo-color", "#120806");
      paint("text-halo-width", 1.4);
      paint("icon-opacity", 0.55);
    }
  }
  try {
    map.setSky({ "sky-color": "#1b0d08", "horizon-color": "#4b230f", "fog-color": "#120806", "sky-horizon-blend": 0.7, "horizon-fog-blend": 0.6, "fog-ground-blend": 0.35 });
  } catch {
    /* sky not supported */
  }
}

function pin(className: string, html: string) {
  const el = document.createElement("div");
  el.className = className;
  el.innerHTML = html;
  return el;
}

const km = (a: [number, number], b: [number, number]) => {
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLng = (b[0] - a[0]) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLng / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
};

export function VenueMap({ compact = false }: { compact?: boolean } = {}) {
  const [sectionRef, near] = useInView<HTMLDivElement>("600px");
  const [mapRef, visible] = useInView<HTMLDivElement>("0px");
  const container = React.useRef<HTMLDivElement>(null);
  const mapObj = React.useRef<any>(null);
  const userMarker = React.useRef<any>(null);
  const interacted = React.useRef(false);
  const { paused } = useMotion();
  const [state, setState] = React.useState<"idle" | "loading" | "ready" | "failed">("idle");
  const [threeD, setThreeD] = React.useState(true);
  const [status, setStatus] = React.useState("");

  // Fetch the map library while the browser is idle after load, so the download never lands mid-scroll.
  const [, setLibReady] = React.useState(false);
  React.useEffect(() => {
    const idle = (window as any).requestIdleCallback as ((cb: () => void, o?: { timeout: number }) => number) | undefined;
    const run = () => void loadMapLibre().then(() => setLibReady(true)).catch(() => {});
    const timer = window.setTimeout(() => (idle ? idle(run, { timeout: 4000 }) : run()), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Load MapLibre and build the map once the section is near (once per mount).
  const started = React.useRef(false);
  React.useEffect(() => {
    if (!near || started.current || !container.current) return;
    started.current = true;
    if (!hasWebGL()) {
      setState("failed");
      return;
    }
    setState("loading");
    loadMapLibre()
      .then((maplibregl) => {
        if (!container.current) return;
        const map = new maplibregl.Map({
          container: container.current,
          style: STYLE,
          center: [(VENUE[0] + LANDMARK[0]) / 2, (VENUE[1] + LANDMARK[1]) / 2],
          zoom: 13.4,
          pitch: 0,
          bearing: 0,
          maxPitch: 75,
          cooperativeGestures: true,
          attributionControl: { compact: true },
        });
        mapObj.current = map;
        // The style references a few POI icons its sprite lacks; give them an empty image instead of console warnings.
        map.on("styleimagemissing", (e: any) => {
          if (!map.hasImage(e.id)) map.addImage(e.id, { width: 1, height: 1, data: new Uint8Array(4) });
        });
        map.on("style.load", () => {
          restyle(map);
          map.addSource("route", { type: "geojson", lineMetrics: true, data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: routeFromVaishnodevi } } });
          map.addLayer({ id: "route-glow", type: "line", source: "route", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#e07b39", "line-width": 12, "line-blur": 8, "line-opacity": 0.45 } });
          map.addLayer({ id: "route-line", type: "line", source: "route", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#f0d49a", "line-width": 4 } });
          // Venue beacon: a soft glow on the ground and a slim lit column so the pin reads in 3D (a marker, not the farm's outline).
          map.addSource("venue-glow", { type: "geojson", data: circle(VENUE, 90) });
          map.addLayer({ id: "venue-glow", type: "fill", source: "venue-glow", paint: { "fill-color": "#e07b39", "fill-opacity": 0.18 } });
          map.addSource("venue-beacon", { type: "geojson", data: circle(VENUE, 7) });
          map.addLayer({ id: "venue-beacon", type: "fill-extrusion", source: "venue-beacon", paint: { "fill-extrusion-color": "#f0d49a", "fill-extrusion-height": 70, "fill-extrusion-base": 0, "fill-extrusion-opacity": 0.55 } });
          const pins = [
            new maplibregl.Marker({ element: pin("venue-pin", '<span class="venue-pin__pulse"></span><span class="venue-pin__dot"></span><span class="venue-pin__label">Divi Garba<small>Master Farm</small></span>'), anchor: "bottom" }).setLngLat(VENUE).addTo(map),
            new maplibregl.Marker({ element: pin("landmark-pin", `<span class="landmark-pin__dot"></span><span class="landmark-pin__label">${venueMap.landmark.name}</span>`), anchor: "left" }).setLngLat(LANDMARK).addTo(map),
          ];
          // The pins only label what the text beside the map already says, so keep them out of the tab order.
          for (const marker of pins) {
            const el = marker.getElement();
            el.removeAttribute("tabindex");
            el.removeAttribute("role");
            el.setAttribute("aria-hidden", "true");
          }
          setState("ready");
        });
        // Keep the credits collapsed to the (i) button until tapped, so they never cover the map on phones.
        map.once("load", () => container.current?.querySelector(".maplibregl-ctrl-attrib")?.classList.remove("maplibregl-compact-show"));
        map.on("error", (e: any) => {
          if (!map.isStyleLoaded() && e?.error) setState("failed");
        });
        const stopOrbit = (e: any) => {
          if (e?.originalEvent) interacted.current = true;
        };
        map.on("movestart", stopOrbit);
      })
      .catch(() => setState("failed"));
  }, [near]);

  React.useEffect(() => () => mapObj.current?.remove(), []);

  // Intro flight and slow orbit while visible, motion plays and the visitor has not moved the map.
  React.useEffect(() => {
    const map = mapObj.current;
    if (state !== "ready" || !map || !visible) return;
    if (paused) {
      if (!interacted.current) map.jumpTo(CLOSE);
      return;
    }
    let alive = true;
    const orbit = () => {
      if (!alive || interacted.current) return;
      map.easeTo({ bearing: map.getBearing() + 60, duration: 20000, easing: (t: number) => t });
      map.once("moveend", orbit);
    };
    if (!interacted.current) {
      const start = window.setTimeout(() => {
        map.flyTo({ ...CLOSE, duration: 5200, curve: 1.3 });
        map.once("moveend", orbit);
      }, 500);
      return () => {
        alive = false;
        window.clearTimeout(start);
        map.stop();
      };
    }
    return () => {
      alive = false;
    };
  }, [state, visible, paused]);

  const act = (fn: (map: any) => void) => () => {
    const map = mapObj.current;
    if (!map) return;
    interacted.current = true;
    map.stop();
    fn(map);
  };

  const overview = act((map) => {
    const bounds = new window.maplibregl.LngLatBounds(VENUE, VENUE);
    for (const point of routeFromVaishnodevi) bounds.extend(point);
    if (userMarker.current) bounds.extend(userMarker.current.getLngLat());
    map.fitBounds(bounds, { padding: { top: 70, bottom: 70, left: 60, right: 180 }, pitch: threeD ? 45 : 0, bearing: 0, duration: paused ? 0 : 1800 });
  });

  const toggle3D = act((map) => {
    const next = !threeD;
    setThreeD(next);
    map.easeTo({ pitch: next ? 60 : 0, bearing: next ? map.getBearing() : 0, duration: paused ? 0 : 900 });
  });

  const locate = () => {
    const map = mapObj.current;
    if (!map || !navigator.geolocation) {
      setStatus("Location is not available in this browser.");
      return;
    }
    setStatus("Finding you…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const here: [number, number] = [coords.longitude, coords.latitude];
        interacted.current = true;
        userMarker.current?.remove();
        userMarker.current = new window.maplibregl.Marker({ element: pin("user-pin", '<span class="user-pin__dot"></span>') }).setLngLat(here).addTo(map);
        const bounds = new window.maplibregl.LngLatBounds(here, here).extend(VENUE);
        map.fitBounds(bounds, { padding: 80, maxZoom: 16, pitch: threeD ? 45 : 0, duration: paused ? 0 : 1800 });
        setStatus(`You are about ${km(here, VENUE).toFixed(1)} km from Master Farm in a straight line.`);
      },
      () => setStatus("Could not get your location. Use Get directions instead."),
      { enableHighAccuracy: true, timeout: 12000 },
    );
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${site.venue} (${venueMap.plusCode})`);
      setStatus("Address copied.");
    } catch {
      setStatus(`${site.venue} (${venueMap.plusCode})`);
    }
  };

  const control = "inline-flex size-11 items-center justify-center rounded-full border border-gold-600/30 bg-ink/85 text-gold-300 backdrop-blur transition hover:bg-rust-900 disabled:opacity-40";

  const region = (
        <div
          ref={mapRef}
          role="region"
          aria-label={`3D map of Master Farm with the route from ${venueMap.landmark.name}`}
          className={compact ? "relative h-full w-full overflow-hidden bg-obsidian" : "relative h-[26rem] overflow-hidden rounded-3xl border border-gold-600/25 bg-ink sm:h-[32rem]"}
          data-lenis-prevent
        >
          {/* MapLibre sets position: relative on its container, so size it by height/width rather than inset. */}
          <div ref={container} className="venue-map h-full w-full" />
          {state !== "ready" && (
            <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(ellipse_at_center,#3b1c0e_0%,#120806_75%)] p-8 text-center">
              {state === "failed" ? (
                <p className="max-w-xs text-sm text-gold-300/80">The 3D map could not load on this device. The directions buttons still open your maps app.</p>
              ) : (
                <p className="animate-pulse text-sm uppercase tracking-[0.25em] text-gold-500">Loading 3D map…</p>
              )}
            </div>
          )}
          {state === "ready" && (
            <div className="absolute right-3 top-3 flex flex-col gap-2">
              <button type="button" className={control} onClick={act((m) => m.zoomIn())} aria-label="Zoom in"><Plus className="size-4" /></button>
              <button type="button" className={control} onClick={act((m) => m.zoomOut())} aria-label="Zoom out"><Minus className="size-4" /></button>
              <button type="button" className={cn(control, threeD && "border-gold-500 text-gold-400")} onClick={toggle3D} aria-pressed={threeD} aria-label="3D view"><Box className="size-4" /></button>
              <button type="button" className={control} onClick={overview} aria-label="Show the whole route"><Route className="size-4" /></button>
              <button type="button" className={control} onClick={act((m) => m.flyTo({ ...CLOSE, duration: paused ? 0 : 2200 }))} aria-label="Fly to the venue"><MapPin className="size-4" /></button>
              <button type="button" className={control} onClick={locate} aria-label="Show my location"><Crosshair className="size-4" /></button>
            </div>
          )}
        </div>
  );
  // Compact: just the map, sized by its container (the Location section frames it).
  if (compact) return <div ref={sectionRef} className="h-full w-full">{region}</div>;

  return (
    <div ref={sectionRef} className="relative mx-auto mt-20 max-w-7xl px-6 sm:px-10">
      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-stretch">
        {region}
        <div className="flex flex-col justify-center">
          <p className="text-xs uppercase tracking-[0.25em] text-gold-500">Find your way</p>
          <h3 className="mt-3 font-display text-4xl text-gold-300 sm:text-5xl">Reaching Master Farm</h3>
          <p className="mt-4 text-sm text-gold-300/85">{site.venue}</p>
          <p className="mt-1 text-xs tracking-wide text-gold-300/60">Plus code {venueMap.plusCode}</p>
          <ol className="mt-6 space-y-3 text-sm text-gold-300/85">
            <li className="flex gap-3"><span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-gold-500/20 text-[11px] text-gold-400">1</span>Head for {venueMap.landmark.name}.</li>
            <li className="flex gap-3"><span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-gold-500/20 text-[11px] text-gold-400">2</span>{venueMap.routeNote}</li>
            <li className="flex gap-3"><span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-gold-500/20 text-[11px] text-gold-400">3</span>Master Farm is beside Sardardham. Look for the glowing pin on the map.</li>
          </ol>
          <p className="mt-4 text-xs text-gold-300/55">{venueMap.routeCaveat}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href={venueMap.googleDirections} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-gold-500 px-6 text-sm font-semibold text-rust-950 transition hover:bg-gold-400">
              <Navigation className="size-4" /> Get directions
            </a>
            <a href={venueMap.appleDirections} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-gold-500/40 px-5 text-sm text-gold-300 transition hover:bg-gold-500/10">
              Apple Maps
            </a>
            <button type="button" onClick={copy} className="inline-flex min-h-12 items-center gap-2 rounded-full px-4 text-sm text-gold-400 underline-offset-4 hover:underline">
              <Copy className="size-4" /> Copy address
            </button>
          </div>
          <p className="mt-4 min-h-5 text-sm text-gold-400" aria-live="polite">{status}</p>
        </div>
      </div>
    </div>
  );
}
