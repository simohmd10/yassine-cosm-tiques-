import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MIN_RESPONSE_MS = 900;
const WINDOW_MS = 10 * 60 * 1000;
const LOCK_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS_PER_KEY = 5;
const GLOBAL_IP_LIMIT = 30;
const BASE_DELAY_MS = 250;
const MAX_DELAY_MS = 4_000;
const GENERIC_ERROR = "Invalid login credentials.";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? SUPABASE_SERVICE_ROLE_KEY;
const RATE_LIMIT_SALT = Deno.env.get("RATE_LIMIT_SALT") ?? "default-rate-limit-salt";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function hashValue(value: string): Promise<string> {
  const data = new TextEncoder().encode(`${RATE_LIMIT_SALT}:${value}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function delay(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function withMinTiming<T>(startedAt: number, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } finally {
    const elapsed = Date.now() - startedAt;
    if (elapsed < MIN_RESPONSE_MS) await delay(MIN_RESPONSE_MS - elapsed);
  }
}

async function upsertIpWindow(ipHash: string): Promise<{ blocked: boolean }> {
  const now = new Date();
  const nowMs = now.getTime();
  const { data } = await supabase
    .from("admin_login_ip_window")
    .select("ip_hash, attempts, window_start")
    .eq("ip_hash", ipHash)
    .maybeSingle();

  if (!data) {
    await supabase.from("admin_login_ip_window").insert({ ip_hash: ipHash, attempts: 1, window_start: now.toISOString() });
    return { blocked: false };
  }

  const windowStartMs = Date.parse(data.window_start);
  if (Number.isNaN(windowStartMs) || (nowMs - windowStartMs) > WINDOW_MS) {
    await supabase.from("admin_login_ip_window").update({ attempts: 1, window_start: now.toISOString() }).eq("ip_hash", ipHash);
    return { blocked: false };
  }

  const attempts = Number(data.attempts ?? 0) + 1;
  await supabase.from("admin_login_ip_window").update({ attempts }).eq("ip_hash", ipHash);
  return { blocked: attempts > GLOBAL_IP_LIMIT };
}

async function getKeyAttempt(keyHash: string): Promise<{ attempts: number; lockedUntil: string | null; windowStart: string | null }> {
  const { data } = await supabase
    .from("admin_login_attempts")
    .select("attempts, locked_until, window_start")
    .eq("key_hash", keyHash)
    .maybeSingle();

  if (!data) return { attempts: 0, lockedUntil: null, windowStart: null };
  return {
    attempts: Number(data.attempts ?? 0),
    lockedUntil: data.locked_until ?? null,
    windowStart: data.window_start ?? null,
  };
}

async function resetIfWindowExpired(keyHash: string, windowStart: string | null): Promise<void> {
  if (!windowStart) return;
  const startMs = Date.parse(windowStart);
  if (!Number.isNaN(startMs) && (Date.now() - startMs) > WINDOW_MS) {
    await supabase
      .from("admin_login_attempts")
      .update({ attempts: 0, window_start: new Date().toISOString(), locked_until: null })
      .eq("key_hash", keyHash);
  }
}

async function recordFailure(params: {
  keyHash: string;
  ipHash: string;
  emailHash: string;
  deviceHash: string | null;
}) {
  const now = new Date();
  const row = await getKeyAttempt(params.keyHash);
  const attempts = row.attempts + 1;
  const lockAt = attempts >= MAX_ATTEMPTS_PER_KEY ? new Date(Date.now() + LOCK_MS).toISOString() : null;

  const payload = {
    key_hash: params.keyHash,
    ip_hash: params.ipHash,
    email_hash: params.emailHash,
    device_hash: params.deviceHash,
    attempts,
    window_start: row.windowStart ?? now.toISOString(),
    locked_until: lockAt,
    updated_at: now.toISOString(),
  };

  await supabase.from("admin_login_attempts").upsert(payload, { onConflict: "key_hash" });
}

async function clearFailures(keyHash: string) {
  await supabase.from("admin_login_attempts").delete().eq("key_hash", keyHash);
}

async function authenticatePassword(email: string, password: string): Promise<{ access_token: string; refresh_token: string; user_id: string } | null> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.access_token || !data?.refresh_token || !data?.user?.id) return null;

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    user_id: data.user.id,
  };
}

async function isAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  return data?.role === "admin";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });

  const startedAt = Date.now();
  return withMinTiming(startedAt, async () => {
    try {
      const body = await req.json().catch(() => ({}));
      const email = typeof body?.email === "string" ? normalizeEmail(body.email) : "";
      const password = typeof body?.password === "string" ? body.password : "";
      const deviceFingerprint = typeof body?.deviceFingerprint === "string" ? body.deviceFingerprint.slice(0, 180) : "";
      if (!email || !password) return json({ ok: false, error: GENERIC_ERROR }, 401);

      const ipRaw = getClientIp(req);
      const [ipHash, emailHash, deviceHash] = await Promise.all([
        hashValue(ipRaw),
        hashValue(email),
        deviceFingerprint ? hashValue(deviceFingerprint) : Promise.resolve(null),
      ]);
      const keyHash = await hashValue(`${ipHash}:${emailHash}:${deviceHash ?? "na"}`);

      const ipWindow = await upsertIpWindow(ipHash);
      if (ipWindow.blocked) return json({ ok: false, error: GENERIC_ERROR }, 429);

      const keyRow = await getKeyAttempt(keyHash);
      await resetIfWindowExpired(keyHash, keyRow.windowStart);
      const refreshed = await getKeyAttempt(keyHash);

      const lockedUntilMs = refreshed.lockedUntil ? Date.parse(refreshed.lockedUntil) : 0;
      if (lockedUntilMs && lockedUntilMs > Date.now()) {
        return json({ ok: false, error: GENERIC_ERROR }, 401);
      }

      const progressiveDelay = Math.min(MAX_DELAY_MS, BASE_DELAY_MS * Math.max(1, refreshed.attempts || 1));
      await delay(progressiveDelay);

      const session = await authenticatePassword(email, password);
      if (!session) {
        await recordFailure({ keyHash, ipHash, emailHash, deviceHash });
        return json({ ok: false, error: GENERIC_ERROR }, 401);
      }

      const admin = await isAdmin(session.user_id);
      if (!admin) {
        await recordFailure({ keyHash, ipHash, emailHash, deviceHash });
        return json({ ok: false, error: GENERIC_ERROR }, 401);
      }

      await clearFailures(keyHash);
      return json({
        ok: true,
        session: {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        },
      });
    } catch (_error) {
      return json({ ok: false, error: GENERIC_ERROR }, 401);
    }
  });
});
