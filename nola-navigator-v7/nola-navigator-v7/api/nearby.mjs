// Clickable tax map: GET /api/nearby?lat=..&lon=.. -> the nearest property on the 2026 roll (no owner names).
import { lookup } from "../lib/parcels.mjs";
import { taxEvaluation } from "../lib/options.mjs";
import { market, nearestParcel, hasLocations } from "../lib/market.mjs";

export async function GET(request) {
  const u = new URL(request.url);
  const lat = Number(u.searchParams.get("lat")), lon = Number(u.searchParams.get("lon"));
  if (!isFinite(lat) || !isFinite(lon) || lat < 29.8 || lat > 30.2 || lon < -90.2 || lon > -89.6)
    return Response.json({ error: "Click inside New Orleans." }, { status: 400 });
  if (!hasLocations()) return Response.json({ error: "Property points aren't loaded on the site yet." }, { status: 503 });
  const near = nearestParcel(lat, lon);
  if (!near) return Response.json({ error: "No property within about 60 meters. Zoom in and click on a house." }, { status: 404 });
  const r = lookup(near.pid);
  if (r.status !== "MATCHED") return Response.json({ error: "Couldn't read that property." }, { status: 404 });
  r.tax_eval = taxEvaluation(r); r.market = market(r); r.meters_from_click = near.meters;
  return Response.json(r);
}
