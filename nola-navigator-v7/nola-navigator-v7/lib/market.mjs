// Layer 3: market context for one looked-up property.
// Data (built by build_layer3.py on the Mac, no owner names):
//   data/geo.csv.gz       parcel ID -> census block group + ZIP (Census Geocoder points, ZIP by point-in-polygon on 2026 ZCTA shapes)
//   data/zillow_zip.json  Zillow Home Value Index by Orleans ZIP, Jan 2023 vs latest month (S23)
//   data/blockgroups.json ACS block-group profile + roll medians (S24)
// Everything here is context, not a value opinion. "If it moved with the ZIP" is an Estimate, never a prediction of the Assessor's value.
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";

let GEO = null, Z = null, BG = null;
function load() {
  if (GEO) return;
  GEO = new Map();
  const lines = gunzipSync(readFileSync(new URL("../data/geo.csv.gz", import.meta.url))).toString("utf8").split("\n");
  for (let i = 1; i < lines.length; i++) {
    const [id, bg, zip] = lines[i].split(",");
    if (id) GEO.set(id, { bg, zip: zip || null });
  }
  Z = JSON.parse(readFileSync(new URL("../data/zillow_zip.json", import.meta.url), "utf8"));
  BG = JSON.parse(readFileSync(new URL("../data/blockgroups.json", import.meta.url), "utf8"));
}

const round100 = n => Math.round(n / 100) * 100;

export function market(r) {
  if (!r || !r.parcel_id) return null;
  load();
  const g = GEO.get(String(r.parcel_id));
  const out = { source: ["S23", "S24"], latest_month: Z.meta.latest_month };
  if (!g) {
    out.note = "This parcel couldn't be placed on the map (about 14% of roll records weren't geocoded), so only citywide trends are shown.";
    out.orleans_typical_change_since_jan_2023_pct = Z.meta.orleans_zip_median_change_since_jan_2023_pct;
    return out;
  }
  const z = g.zip && Z.zips[g.zip];
  out.zip = g.zip;
  if (z) {
    const factor = z.typical_value_latest / z.typical_value_jan_2023;
    out.zillow = { typical_value_jan_2023: z.typical_value_jan_2023, typical_value_latest: z.typical_value_latest,
      change_since_jan_2023_pct: z.change_since_jan_2023_pct, change_last_12_months_pct: z.change_last_12_months_pct,
      history_yearly: z.history_yearly };
    if (r.market_value > 0 && r.use === "RESIDENTIAL") {
      out.if_value_moved_with_zip = round100(r.market_value * factor);
      out.if_value_moved_with_zip_math = `Estimate: roll value $${r.market_value.toLocaleString("en-US")} (as of Jan 1, 2023) × ${factor.toFixed(3)} (ZIP ${g.zip} Zillow index, ${Z.meta.latest_month} ÷ Jan 2023)`;
    }
  } else {
    out.note = `Zillow doesn't publish an index for ZIP ${g.zip || "(unknown)"}; the median Orleans ZIP changed ${Z.meta.orleans_zip_median_change_since_jan_2023_pct}% since Jan 2023.`;
  }
  const b = BG[g.bg];
  if (b) {
    out.block_group = { id: g.bg, ...b };
    if (r.market_value > 0 && b.roll_median_home_value) out.vs_block_group_roll_median_pct = Math.round((r.market_value / b.roll_median_home_value - 1) * 100);
  }
  out.citywide = { orleans_zip_median_change_since_jan_2023_pct: Z.meta.orleans_zip_median_change_since_jan_2023_pct };
  return out;
}
