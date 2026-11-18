// Property map search box: GET /api/suggest?q=2413 nash -> matching roll addresses (no owner names).
import { suggest } from "../lib/parcels.mjs";
export async function GET(request) {
  const q = new URL(request.url).searchParams.get("q") || "";
  return Response.json({ results: suggest(q.slice(0, 80), 8) });
}
