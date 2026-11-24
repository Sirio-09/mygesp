import { NextResponse } from "next/server";

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  /** Secondi consigliati prima di riprovare (0 se non bloccato). */
  retryAfter: number;
};

// ── Fallback in memoria (sviluppo locale o istanza singola) ──────────────────
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Limite massimo di voci in memoria: oltre questa soglia si rimuovono le scadute.
const MAX_ENTRIES = 10_000;

function memoryRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();

  // Pulizia periodica per evitare una crescita illimitata della mappa.
  if (rateLimitMap.size >= MAX_ENTRIES) {
    for (const [key, record] of rateLimitMap) {
      if (now > record.resetTime) rateLimitMap.delete(key);
    }
  }

  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, retryAfter: 0 };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((record.resetTime - now) / 1000)),
    };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count, retryAfter: 0 };
}

// ── Store distribuito: Upstash Redis / Vercel KV via REST ────────────────────
// Nessuna dipendenza aggiuntiva: si usa direttamente l'API REST.
function getRedisConfig(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  return { url: url.replace(/\/$/, ""), token };
}

export function isDistributedRateLimiterEnabled(): boolean {
  return getRedisConfig() !== null;
}

async function redisRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitResult> {
  const config = getRedisConfig();
  if (!config) return memoryRateLimit(identifier, maxRequests, windowMs);

  const key = `ratelimit:${identifier}`;

  try {
    const res = await fetch(`${config.url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["PEXPIRE", key, String(windowMs), "NX"],
        ["PTTL", key],
      ]),
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
    });

    if (!res.ok) {
      throw new Error(`Upstash ha risposto ${res.status}`);
    }

    const data = (await res.json()) as Array<{ result?: number | null }>;
    const count = Number(data?.[0]?.result ?? 0);
    const ttlMs = Number(data?.[2]?.result ?? windowMs);
    const blocked = count > maxRequests;

    return {
      allowed: !blocked,
      remaining: Math.max(0, maxRequests - count),
      retryAfter: blocked ? Math.max(1, Math.ceil(ttlMs / 1000)) : 0,
    };
  } catch (error) {
    // Fail-open sul rate limiting: meglio accettare traffico che bloccare tutto
    // il sito perché Redis non risponde. Il fallback in memoria copre l'istanza.
    console.error(
      "[rate-limiter] Redis non raggiungibile, uso il fallback in memoria:",
      error instanceof Error ? error.message : String(error)
    );
    return memoryRateLimit(identifier, maxRequests, windowMs);
  }
}

export function rateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitResult> {
  return redisRateLimit(identifier, maxRequests, windowMs);
}

export async function rateLimitResponse(
  identifier: string,
  maxRequests: number,
  windowMs: number
): Promise<NextResponse | null> {
  const result = await rateLimit(identifier, maxRequests, windowMs);

  if (result.allowed) return null;

  return NextResponse.json(
    { error: "Troppi tentativi. Riprova più tardi." },
    {
      status: 429,
      headers: { "Retry-After": String(result.retryAfter || 60) },
    }
  );
}