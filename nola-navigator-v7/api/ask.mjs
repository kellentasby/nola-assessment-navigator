// Server function: receives the chat, adds the rules + knowledge base, asks Claude,
// and returns the answer. The API key stays here on the server (an environment
// variable on Vercel) and is never sent to the browser.
//
// Diagnostics: open /api/ask?check=1 in a browser. It sends a tiny test request to
// Claude and reports whether the key, credit and model work, with Claude's error
// message if not. It never shows the key.
import { buildRules } from "../kb.mjs";
import { lookup, findAddresses } from "../lib/parcels.mjs";
import { options, taxEvaluation, normalizeFacts } from "../lib/options.mjs";

const PRIMARY = process.env.CLAUDE_MODEL || "claude-sonnet-5-5";
const FALLBACKS = ["claude-sonnet-4-5", "claude-haiku-4-5"]; // tried only if the primary model id is not found
const API_VERSION = process.env.ANTHROPIC_VERSION || "2023-06-01";
const MAX_TURNS = 8;
const MAX_CHARS = 1500;

function explain(status, type, message) {
  const m = (message || "").toLowerCase();
  if (status === 401 || type === "authentication_error") return "The API key was rejected. Re-copy the key into ANTHROPIC_API_KEY on Vercel and redeploy.";
  if (status === 403 || type === "permission_error") return "This API key isn't allowed to use that model or workspace.";
  if (m.includes("credit") || m.includes("billing") || m.includes("balance")) return "The Claude API account has no credit. Add credit in the Claude Console billing page.";
  if (status === 404 || type === "not_found_error") return "The model name wasn't found. Set CLAUDE_MODEL on Vercel to a current model id.";
  if (status === 429 || type === "rate_limit_error") return "Too many requests or a spend limit was reached.";
  if (status === 529 || type === "overloaded_error") return "Claude is temporarily overloaded. Try again in a minute.";
  return "Claude returned an error.";
}

// Send the key as "Authorization: Bearer" (current docs); if Claude rejects that, retry once with the older "x-api-key" header.
async function callClaude(key, model, system, messages, maxTokens) {
  const body = JSON.stringify({ model, max_tokens: maxTokens, system, messages });
  const base = { "anthropic-version": API_VERSION, "content-type": "application/json" };
  let res;
  for (const auth of [{ authorization: `Bearer ${key}` }, { "x-api-key": key }]) {
    const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { ...base, ...auth }, body });
    let data = null; try { data = await r.json(); } catch {}
    res = { ok: r.ok, status: r.status, data, model };
    if (r.status !== 401) break;
  }
  return res;
}

async function askWithFallback(key, system, messages, maxTokens) {
  const models = [PRIMARY, ...FALLBACKS.filter(m => m !== PRIMARY)];
  let last;
  for (const model of models) {
    last = await callClaude(key, model, system, messages, maxTokens);
    const type = last.data?.error?.type;
    if (last.ok || !(last.status === 404 || type === "not_found_error")) return last; // only retry when the model id is unknown
  }
  return last;
}

function failure(res) {
  const type = res.data?.error?.type || "unknown";
  const message = String(res.data?.error?.message || "").slice(0, 300);
  console.error("Claude API error", res.status, type, message);
  return { status: res.status, type, message, hint: explain(res.status, type, message) };
}

// Trim spaces, line breaks and stray quotes that sneak in when a key is pasted.
const readKey = () => (process.env.ANTHROPIC_API_KEY || "").trim().replace(/^["']|["']$/g, "");

export async function POST(request) {
  const key = readKey();
  if (!key) return Response.json({ error: "Server is missing ANTHROPIC_API_KEY.", hint: "Add it in Vercel → Settings → Environment Variables, then redeploy." }, { status: 500 });

  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "Bad request." }, { status: 400 }); }

  let messages = (Array.isArray(body?.messages) ? body.messages : [])
    .filter(m => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-MAX_TURNS)
    .map(m => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return Response.json({ error: "Ask a question first." }, { status: 400 });
  }

  const today = new Date().toLocaleDateString("en-US", { timeZone: "America/Chicago", weekday: "short", year: "numeric", month: "short", day: "numeric" });
  // Layer 2: if the newest question names addresses (or the page sent some), look them up in the 2026 roll.
  const asked = Array.isArray(body?.addresses) ? body.addresses.map(String) : [];
  const addrs = [...new Set([...asked, ...findAddresses(messages.at(-1).content)])].slice(0, 10);
  const facts = normalizeFacts(body?.facts);
  const properties = addrs.map(a => { try { const r = lookup(a); if (r.status === "MATCHED") { r.tax_eval = taxEvaluation(r); r.options = options(r, facts); } return r; } catch (e) { console.error("lookup failed", e); return { input: a, status: "ERROR" }; } });
  let system = buildRules(today);
  if (properties.length) system += `\n\nPROPERTY RECORDS FOR THIS QUESTION [S21] (looked up in the 2026 tax roll for the addresses the owner typed; JSON):\n${JSON.stringify(properties)}\n\nowner_facts (ticked by the owner, not verified): ${JSON.stringify(facts)}`;
  const res = await askWithFallback(key, system, messages, 4000);

  if (!res.ok) {
    const f = failure(res);
    return Response.json({ error: "The AI service did not answer.", ...f }, { status: f.status === 429 ? 429 : 502 });
  }
  const text = (res.data?.content || []).filter(b => b.type === "text").map(b => b.text).join("\n").trim();
  if (!text) return Response.json({ error: "Empty answer." }, { status: 502 });
  return Response.json({ text, truncated: res.data.stop_reason === "max_tokens", model: res.model, properties });
}

export async function GET(request) {
  const url = new URL(request.url);
  const key = readKey();
  const info = { ok: true, model: PRIMARY, apiVersion: API_VERSION, keyPresent: !!key, keyLooksRight: key.startsWith("sk-ant-"), keyLength: key.length };
  if (url.searchParams.get("check") !== "1") return Response.json(info);
  if (!key) return Response.json({ ...info, ok: false, hint: "ANTHROPIC_API_KEY is not set on Vercel." });
  const res = await askWithFallback(key, "Reply with the single word: ready", [{ role: "user", content: "Status check" }], 5);
  if (res.ok) return Response.json({ ...info, check: "passed", answeredBy: res.model });
  return Response.json({ ...info, ok: false, check: "failed", ...failure(res) });
}
