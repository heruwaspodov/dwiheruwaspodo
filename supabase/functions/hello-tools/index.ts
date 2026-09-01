const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let payload: unknown = null;

  if (req.method !== "GET") {
    const contentType = req.headers.get("content-type") ?? "";
    payload = contentType.includes("application/json")
      ? await req.json().catch(() => null)
      : await req.text().catch(() => "");
  }

  return Response.json(
    {
      ok: true,
      message: "Hello from Supabase Edge Functions",
      method: req.method,
      received: payload,
      timestamp: new Date().toISOString(),
    },
    { headers: corsHeaders },
  );
});
