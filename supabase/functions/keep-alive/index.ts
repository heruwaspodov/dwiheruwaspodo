const corsHeaders = {
  "Access-Control-Allow-Origin": "https://dwiheruwaspodo.web.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Cache-Control": "no-store",
};

const throttleHours = 6;

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return Response.json(body, {
    status,
    headers: corsHeaders,
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return jsonResponse({ ok: false, error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ ok: false, error: "Supabase environment is not configured" }, 500);
  }

  const tableUrl = `${supabaseUrl}/rest/v1/keep_alive_checks?id=eq.1`;
  const headers = {
    apikey: serviceRoleKey,
    authorization: `Bearer ${serviceRoleKey}`,
    "content-type": "application/json",
  };

  const latestResponse = await fetch(`${tableUrl}&select=checked_at,hits`, {
    headers,
  });

  if (!latestResponse.ok) {
    return jsonResponse({ ok: false, error: "Failed to read keep-alive state" }, 502);
  }

  const [latest] = (await latestResponse.json()) as Array<{ checked_at: string; hits: number }>;
  const now = Date.now();
  const lastCheckedAt = latest ? new Date(latest.checked_at).getTime() : 0;
  const nextWriteAt = lastCheckedAt + throttleHours * 60 * 60 * 1000;

  if (latest && now < nextWriteAt) {
    return jsonResponse({
      ok: true,
      status: "skipped",
      checked_at: latest.checked_at,
      next_write_at: new Date(nextWriteAt).toISOString(),
    });
  }

  const upsertResponse = await fetch(`${supabaseUrl}/rest/v1/keep_alive_checks`, {
    method: "POST",
    headers: {
      ...headers,
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({
      id: 1,
      checked_at: new Date(now).toISOString(),
      hits: (latest?.hits ?? 0) + 1,
    }),
  });

  if (!upsertResponse.ok) {
    return jsonResponse({ ok: false, error: "Failed to write keep-alive state" }, 502);
  }

  const [updated] = (await upsertResponse.json()) as Array<{ checked_at: string; hits: number }>;

  return jsonResponse({
    ok: true,
    status: "updated",
    checked_at: updated.checked_at,
    hits: updated.hits,
  });
});
