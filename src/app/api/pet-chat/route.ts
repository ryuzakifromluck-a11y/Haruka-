import { headers } from "next/headers";
import { isLanguage, type Language } from "@/i18n/core";
import { petSystemPrompt } from "@/lib/pet-chat/personas";
import { rateLimit } from "@/lib/pet-chat/rate-limit";
import { ERROR_MARKER, REFUSAL_MARKER } from "@/lib/pet-chat/protocol";
import { getServerSupabase } from "@/lib/supabase/server";
import { isAllowed, supabaseConfigured } from "@/lib/supabase/config";
import type { PetSpecies } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SPECIES: PetSpecies[] = ["cat", "dog", "rabbit", "fox"];
const MODEL = process.env.PET_CHAT_MODEL?.trim() || "llama-3.3-70b-versatile";
// Groq's OpenAI-compatible API. GROQ_BASE_URL is only for tests or a proxy.
const BASE_URL = (process.env.GROQ_BASE_URL?.trim() || "https://api.groq.com/openai/v1").replace(/\/+$/, "");
const MAX_TURNS = 24; // messages kept from the open chat
const MAX_CHARS = 2000; // per message


function apiKey(): string | null {
  return process.env.GROQ_API_KEY?.trim() || null;
}

function json(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store", ...extra } });
}

/** Who is asking. Cloud mode: the signed-in, invited user. Local mode: only where the app itself is allowed to run unprotected. */
async function identify(): Promise<{ ok: true; key: string } | { ok: false }> {
  if (supabaseConfigured) {
    const supabase = await getServerSupabase();
    const { data } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
    const user = data.user;
    if (!user || !isAllowed(user.email)) return { ok: false };
    return { ok: true, key: `u:${user.id}` };
  }
  const allowLocal = process.env.NODE_ENV !== "production" || process.env.ALLOW_UNPROTECTED_LOCAL_MODE === "true";
  if (!allowLocal) return { ok: false };
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "local";
  return { ok: true, key: `ip:${ip}` };
}

/** Lets the chat show a "not set up yet" state without spending a request. */
export async function GET() {
  const who = await identify();
  if (!who.ok) return json({ error: "unauthorized" }, 401);
  return json({ configured: Boolean(apiKey()) });
}

interface Body {
  species: PetSpecies;
  name: string;
  lang: Language;
  messages: { role: "user" | "assistant"; content: string }[];
}

function parse(raw: unknown): Body | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (!SPECIES.includes(r.species as PetSpecies)) return null;
  if (!isLanguage(r.lang)) return null;
  const name = typeof r.name === "string" ? r.name.trim().slice(0, 24) : "";
  if (!name || !Array.isArray(r.messages)) return null;
  const messages = r.messages
    .filter((m): m is Body["messages"][number] => !!m && typeof m === "object" && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim().length > 0)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }))
    .slice(-MAX_TURNS);
  // The conversation must start with and end on a user turn.
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") return null;
  return { species: r.species as PetSpecies, name, lang: r.lang, messages };
}

export async function POST(req: Request) {
  const who = await identify();
  if (!who.ok) return json({ error: "unauthorized" }, 401);

  const key = apiKey();
  if (!key) return json({ error: "not_configured" }, 503);

  const limit = rateLimit(who.key);
  if (!limit.ok) return json({ error: "rate_limited", retryAfter: limit.retryAfter }, 429, { "retry-after": String(limit.retryAfter) });

  let body: Body | null = null;
  try {
    body = parse(await req.json());
  } catch {
    body = null;
  }
  if (!body) return json({ error: "bad_request" }, 400);

  let upstream: Response;
  try {
    upstream = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        max_tokens: 1024,
        temperature: 0.7,
        messages: [{ role: "system", content: petSystemPrompt(body.species, body.name, body.lang) }, ...body.messages],
      }),
      signal: AbortSignal.any([req.signal, AbortSignal.timeout(60_000)]),
    });
  } catch (err) {
    if (req.signal.aborted) return new Response(null, { status: 499 });
    console.error("pet-chat failed:", err);
    return streamOf(ERROR_MARKER);
  }
  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    console.error(`pet-chat failed: Groq ${upstream.status} ${detail.slice(0, 300)}`);
    return streamOf(ERROR_MARKER);
  }

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const out = new ReadableStream<Uint8Array>({
    async start(controller) {
      let sent = false;
      let buffer = "";
      let finish: string | null = null;
      try {
        // Server-sent events: lines of `data: {json}` ending with `data: [DONE]`.
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let nl: number;
          while ((nl = buffer.indexOf("\n")) >= 0) {
            const line = buffer.slice(0, nl).trim();
            buffer = buffer.slice(nl + 1);
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (data === "[DONE]") continue;
            let chunk: { choices?: { delta?: { content?: string | null }; finish_reason?: string | null }[]; error?: { message?: string } };
            try {
              chunk = JSON.parse(data);
            } catch {
              continue;
            }
            if (chunk.error) throw new Error(chunk.error.message ?? "stream error");
            const choice = chunk.choices?.[0];
            const delta = choice?.delta?.content;
            if (delta) {
              sent = true;
              controller.enqueue(encoder.encode(delta));
            }
            if (choice?.finish_reason) finish = choice.finish_reason;
          }
        }
        if (!sent) controller.enqueue(encoder.encode(finish === "content_filter" ? REFUSAL_MARKER : ERROR_MARKER));
      } catch (err) {
        if (!req.signal.aborted) {
          console.error("pet-chat failed:", err);
          // The client shows a friendly retry message when the stream ends with this marker.
          controller.enqueue(encoder.encode(ERROR_MARKER));
        }
      } finally {
        controller.close();
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });

  return new Response(out, { headers: TEXT_HEADERS });
}

const TEXT_HEADERS = { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", "x-accel-buffering": "no" };

function streamOf(text: string) {
  return new Response(text, { headers: TEXT_HEADERS });
}
