// Supabase Edge Function: send-approval-email
// Requires RESEND_API_KEY; Supabase injects the other environment variables.

import { createClient } from "jsr:@supabase/supabase-js@2";

function getCorsHeaders(req: Request) {
  return {
    "Access-Control-Allow-Origin": req.headers.get("origin") || "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function jsonResponse(req: Request, body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(req) });
  }
  if (req.method !== "POST") {
    return jsonResponse(req, { ok: false, error: "method not allowed" }, 405);
  }

  try {
    const authorization = req.headers.get("Authorization");
    const accessToken = authorization?.replace(/^Bearer\s+/i, "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!accessToken || !supabaseUrl || !anonKey) {
      return jsonResponse(req, { ok: false, error: "unauthorized" }, 401);
    }

    const supabase = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
    if (userError || userData.user?.app_metadata?.role !== "admin") {
      return jsonResponse(req, { ok: false, error: "admin access required" }, 403);
    }

    const { userId, email, name } = await req.json();
    let targetEmail = typeof email === "string" && email.trim() ? email.trim() : null;

    if (!targetEmail && userId) {
      const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (!supabaseUrl || !serviceRole) {
        return jsonResponse(req, { ok: false, error: "missing supabase env" }, 500);
      }
      const admin = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });
      const { data, error } = await admin.auth.admin.getUserById(userId);
      if (error) {
        return jsonResponse(req, { ok: false, error: error.message }, 400);
      }
      targetEmail = data?.user?.email || null;
    }

    if (!targetEmail) {
      return jsonResponse(req, { ok: false, error: "no email address to send to" }, 400);
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      return jsonResponse(req, { ok: false, error: "RESEND_API_KEY not configured" }, 500);
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Alumni Tracer <onboarding@resend.dev>",
        to: [targetEmail],
        subject: "Your alumni account has been approved",
        text: `Hi ${name || "there"},\n\nYour Alumni Tracer account has been approved by the Alumni Affairs Office. You can now sign in to access the dashboard and complete the alumni survey.\n\nIf you are already signed in, please sign out and sign in again.`,
        html:
          `<p>Hi ${name || "there"},</p>` +
          `<p>Great news — the Alumni Affairs Office has approved your account. You can now ` +
          `sign in to access the dashboard and complete the alumni survey.</p>` +
          `<p>If you are already signed in, please sign out and sign in again.</p>`,
      }),
    });

    const body = await res.json();
    if (!res.ok) {
      return jsonResponse(req, {
        ok: false,
        error: typeof body?.message === "string" ? body.message : "Email provider rejected the message.",
      }, 502);
    }
    return jsonResponse(req, { ok: true, id: body?.id || null });
  } catch (err) {
    return jsonResponse(req, { ok: false, error: String(err?.message || err) }, 500);
  }
});
