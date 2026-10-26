// Server function: receives the chat, adds the rules + knowledge base, asks Claude,
// and returns the answer. The API key stays here on the server (an environment
// variable on Vercel) and is never sent to the browser.
import { buildRules } from "../kb.mjs";

const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-5-5";
const API_VERSION = process.env.ANTHROPIC_VERSION || "2023-06-01";
const MAX_TURNS = 8;          // only the most recent turns are sent
const MAX_CHARS = 1500;       // per message, to keep costs predictable

export async function POST(request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ error: "Server is missing ANTHROPIC_API_KEY." }, { status: 500 });

  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "Bad request." }, { status: 400 }); }

  // Clean the conversation: valid roles, non-empty text, trimmed length, starts and ends on the user.
  let messages = (Array.isArray(body?.messages) ? body.messages : [])
    .filter(m => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-MAX_TURNS)
    .map(m => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return Response.json({ error: "Ask a question first." }, { status: 400 });
  }

  const today = new Date().toLocaleDateString("en-US", { timeZone: "America/Chicago", weekday: "short", year: "numeric", month: "short", day: "numeric" });

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": API_VERSION, "content-type": "application/json" },
    body: JSON.stringify({ model: MODEL, max_tokens: 900, system: buildRules(today), messages }),
  });

  if (!r.ok) {
    const detail = await r.text().catch(() => "");
    console.error("Claude API error", r.status, detail.slice(0, 500));
    return Response.json({ error: "The AI service did not answer." }, { status: r.status === 429 ? 429 : 502 });
  }

  const data = await r.json();
  const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n").trim();
  if (!text) return Response.json({ error: "Empty answer." }, { status: 502 });
  return Response.json({ text, truncated: data.stop_reason === "max_tokens" });
}

export function GET() {
  return Response.json({ ok: true, model: MODEL });
}
