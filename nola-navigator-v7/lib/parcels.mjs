// Layer 2: look up Orleans Parish properties in the 2026 tax roll and estimate their 2026 tax.
// Data: data/parcels.csv.gz (built by build_parcel_index.py from the LTC roll; no owner names) and data/ward_stats.json.
// Same matching method as address_match.py (tested: 14/15 hand-picked, 990/1,000 random, 0 wrong).
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";

const SUFFIX = {STREET:"ST",ST:"ST",AVENUE:"AV",AVE:"AV",AV:"AV",BOULEVARD:"BL",BLVD:"BL",BL:"BL",DRIVE:"DR",DR:"DR",ROAD:"RD",RD:"RD",
  PLACE:"PL",PL:"PL",COURT:"CT",CT:"CT",HIGHWAY:"HW",HWY:"HW",HW:"HW",LANE:"LN",LN:"LN",PARKWAY:"PW",PKWY:"PW",PW:"PW",
  CIRCLE:"CR",CIR:"CR",CR:"CR",WAY:"WY",WY:"WY",TERRACE:"TR",TER:"TR",TR:"TR",WALK:"WALK"};
const WORDS = [["MARTIN LUTHER KING JR","MARTIN L KING"],["MARTIN LUTHER KING","MARTIN L KING"],["MLK","MARTIN L KING"],["SAINT","ST"],["GENERAL","GEN"],["FORT","FT"]];
const DIRS = new Set(["NORTH","SOUTH","EAST","WEST","N","S","E","W"]);

// 2026 millage (S2): mills reduced by homestead vs. police/fire levied without it; levee by bank (S2, S17)
const CITY_HS_MILLS = 109.69, POLICE_FIRE_MILLS = 11.51, LEVEE_EAST = 10.79, LEVEE_WEST = 10.81;

export function parse(text) {
  let t = String(text).toUpperCase().replace(/\./g, " ").replace(/#/g, " # ");
  t = t.replace(/,?\s*NEW ORLEANS\b.*$/, "").replace(/,?\s*\bLA\b\s*(\d{5})?\s*$/, "").replace(/\b7\d{4}\s*$/, "").replace(/,/g, " ");
  t = t.replace(/\s+/g, " ").trim();
  let unit = null;
  const um = t.match(/\b(?:APT|APARTMENT|UNIT|STE|SUITE|#)\s*([A-Z0-9-]+)\s*$/);
  if (um) { unit = um[1]; t = t.slice(0, um.index).trim(); }
  const m = t.match(/^(\d+)[A-Z]?\s+(.*)$/);
  if (!m) return null;
  const num = m[1]; let rest = m[2];
  for (const [k, v] of WORDS) rest = rest.replace(new RegExp(`\\b${k}\\b`, "g"), v);
  const toks = rest.split(" ").filter(x => x && !DIRS.has(x));
  let suf = null;
  if (toks.length && SUFFIX[toks.at(-1)]) suf = SUFFIX[toks.pop()];
  else if (toks.length >= 2 && SUFFIX[toks.at(-2)]) { const u = toks.pop(); unit = unit || u; suf = SUFFIX[toks.pop()]; }
  const name = toks.join(" ");
  return { num, name, squash: name.replace(/ /g, ""), suffix: suf, unit };
}

let INDEX = null, STATS = null, BY_PID = null;
function load() {
  if (INDEX) return;
  const csv = gunzipSync(readFileSync(new URL("../data/parcels.csv.gz", import.meta.url))).toString("utf8");
  STATS = JSON.parse(readFileSync(new URL("../data/ward_stats.json", import.meta.url), "utf8"));
  const lines = csv.split("\n"); const head = lines[0].split(",");
  INDEX = new Map(); BY_PID = new Map();
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i]) continue;
    const c = lines[i].split(","); const r = {};
    head.forEach((h, j) => { r[h] = c[j]; });
    for (const k of ["land","impr","mv","av","hs","vet","oth","fr","tav","frz","multi"]) r[k] = Number(r[k]) || 0;
    BY_PID.set(String(r.pid).toUpperCase(), r);
    const p = parse(r.addr); if (!p) continue;
    Object.assign(r, { _name: p.name, _squash: p.squash, _suffix: p.suffix, _unit: p.unit });
    if (!INDEX.has(p.num)) INDEX.set(p.num, []);
    INDEX.get(p.num).push(r);
  }
}

// Ratcliff-Obershelp-style similarity (close to Python's difflib ratio) for the fuzzy street-name fallback
function similarity(a, b) {
  const match = (s1, s2) => {
    if (!s1 || !s2) return 0;
    let best = 0, bi = 0, bj = 0;
    for (let i = 0; i < s1.length; i++) for (let j = 0; j < s2.length; j++) {
      let k = 0; while (s1[i + k] && s1[i + k] === s2[j + k]) k++;
      if (k > best) { best = k; bi = i; bj = j; }
    }
    if (!best) return 0;
    return best + match(s1.slice(0, bi), s2.slice(0, bj)) + match(s1.slice(bi + best), s2.slice(bj + best));
  };
  return (2 * match(a, b)) / (a.length + b.length);
}

export function lookup(text) {
  load();
  const pid = String(text).trim().toUpperCase().replace(/^PARCEL\s*(ID)?\s*#?\s*/, "");
  if (/^\d{1,3}W?\d{5,7}$/.test(pid) && BY_PID.has(pid)) return { input: text, status: "MATCHED", how: "parcel ID", ...assess(BY_PID.get(pid)) };
  const q = parse(text);
  if (!q) return { input: text, status: "NOT_FOUND", reason: "No house number found. Type it like '2413 Nashville Ave'." };
  const cand = INDEX.get(q.num) || [];
  if (!cand.length) return { input: text, status: "NOT_FOUND", reason: `No Orleans parcel has house number ${q.num}.` };
  let hit = cand.filter(r => r._squash === q.squash), how = "exact";
  if (!hit.length) {
    let best = null, score = 0;
    for (const s of new Set(cand.map(r => r._squash))) { const v = similarity(q.squash, s); if (v > score) { score = v; best = s; } }
    if (score >= 0.85) { hit = cand.filter(r => r._squash === best); how = `close spelling (${q.name} → ${hit[0]._name})`; }
  }
  if (!hit.length) return { input: text, status: "NOT_FOUND", reason: `House number ${q.num} exists, but not on a street like "${q.name}".` };
  if (q.suffix && hit.some(r => r._suffix === q.suffix)) hit = hit.filter(r => r._suffix === q.suffix);
  if (q.unit) { const u = hit.filter(r => r._unit === q.unit); if (u.length) { hit = u; how += " + unit"; } }
  const base = hit.filter(r => !r._unit);
  if (hit.length > 1 && base.length === 1 && !q.unit) hit = base;
  if (hit.length === 1) return { input: text, status: "MATCHED", how, ...assess(hit[0]) };
  return { input: text, status: "AMBIGUOUS", reason: `${hit.length} records share this address`,
           options: hit.slice(0, 6).map(r => `${r.addr} (parcel ${r.pid})`),
           hint: base.length > 1 ? "This street has North and South sections. Say which one, or give the parcel ID." : "Add the unit number." };
}

function pctBand(mv, deciles) {
  let k = 0; while (k < deciles.length && mv > deciles[k]) k++;
  return k === 0 ? "lowest 10%" : k === 9 ? "highest 10%" : `${k * 10}-${k * 10 + 10}%`;
}

function assess(r) {
  const west = r.dist === "5";
  const levee = west ? LEVEE_WEST : LEVEE_EAST;
  const exempt = r.status === "EX";
  const hsMills = CITY_HS_MILLS + levee;
  const pfBase = exempt ? 0 : r.tav + r.hs;           // police/fire ignore homestead
  const taxHs = exempt ? 0 : r.tav * hsMills / 1000;
  const taxPf = pfBase * POLICE_FIRE_MILLS / 1000;
  const est = Math.round((taxHs + taxPf) * 100) / 100;
  const noHs = r.hs > 0 ? Math.round((r.tav + r.hs) * (hsMills + POLICE_FIRE_MILLS) / 10) / 100 : null;
  const ws = STATS[r.ward];
  const residential = r.occ === "RESIDENTIAL";
  const flags = [];
  if (residential && r.hs === 0 && !exempt) flags.push("No homestead exemption on file. Homestead is only for an owner who lives there.");
  if (r.frz) flags.push("Assessment is frozen (special assessment level), so assessed value can be below 10% of market value.");
  if (r.vet) flags.push(`Disabled veteran exemption on file: $${r.vet.toLocaleString("en-US")} of assessed value.`);
  if (r.multi) flags.push("This tax bill combines several parcels.");
  if (exempt) flags.push("Listed as exempt (for example government, religious or nonprofit).");
  return {
    parcel_id: r.pid, roll_address: r.addr, bank: west ? "West Bank (Algiers)" : "East Bank", ward_code: r.ward, use: r.occ,
    land_value: r.land, building_value: r.impr, market_value: r.mv, assessed_value: r.av,
    assessed_pct_of_market: r.mv ? Math.round(r.av / r.mv * 1000) / 10 : null,
    homestead_exemption: r.hs, veteran_exemption: r.vet, other_exemption: r.oth, first_responder_exemption: r.fr,
    taxable_value: r.tav, frozen: !!r.frz, tax_status: exempt ? "Exempt" : "Taxable",
    est_2026_tax: est,
    est_tax_math: exempt ? "Exempt from tax." :
      `${r.tav.toLocaleString("en-US")} taxable × ${hsMills.toFixed(2)} mills (city ${CITY_HS_MILLS} + levee ${levee}) = $${taxHs.toFixed(2)}; plus police/fire ${POLICE_FIRE_MILLS} mills × ${pfBase.toLocaleString("en-US")} (before homestead) = $${taxPf.toFixed(2)}`,
    est_tax_without_homestead: noHs,
    ward_comparison: residential && ws ? { ward_median_value: ws.median, ward_middle_half: [ws.p25, ws.p75], value_band_in_ward: pctBand(r.mv, ws.deciles),
      ward_homestead_share: ws.homestead_share, homes_in_ward: ws.n } : null,
    flags,
  };
}

// Pull likely street addresses out of a chat message (one per line or several in a sentence)
const ADDR_RE = /\b\d{1,5}[A-Za-z]?\s+(?:(?:N|S|E|W|North|South|East|West)\.?\s+)?(?:[A-Za-z0-9.']+\s+){0,4}?(?:St|Street|Ave|Avenue|Av|Blvd|Boulevard|Bl|Dr|Drive|Rd|Road|Pl|Place|Ct|Court|Hwy|Highway|Hw|Ln|Lane|Pkwy|Parkway|Pw|Cir|Circle|Way|Ter|Terrace|Walk)\b\.?(?:,?\s*(?:Apt|Unit|Suite|Ste|#)\s*[A-Za-z0-9-]+)?/gi;
export function findAddresses(message, max = 10) {
  const found = [...String(message).matchAll(ADDR_RE)].map(m => m[0].trim());
  return [...new Set(found)].slice(0, max);
}
