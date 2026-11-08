// Layer 2 endpoint: POST {"addresses": ["2413 Nashville Ave", ...]} (up to 10) -> one record per address.
// Data is the public 2026 tax roll without owner names. Values are the roll's; tax is an estimate.
import { lookup } from "../lib/parcels.mjs";
import { options, taxEvaluation, normalizeFacts } from "../lib/options.mjs";

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "Bad request." }, { status: 400 }); }
  const list = (Array.isArray(body?.addresses) ? body.addresses : String(body?.addresses || "").split(/\n|;/))
    .map(s => String(s).trim()).filter(Boolean).slice(0, 10);
  if (!list.length) return Response.json({ error: "Enter at least one address." }, { status: 400 });
  const facts = normalizeFacts(body?.facts);
  const results = list.map(a => { const r = lookup(a); if (r.status === "MATCHED") { r.tax_eval = taxEvaluation(r); r.options = options(r, facts); } return r; });
  return Response.json({ results, source: "2026 Orleans Parish tax roll (Louisiana Tax Commission), values as of Jan 1, 2023" });
}
