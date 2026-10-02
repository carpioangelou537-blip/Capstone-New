// Supabase Edge Function: send-approval-email
// Deploy with: npx supabase functions deploy send-approval-email
// Requires secrets: RESEND_API_KEY (Resend.com) — SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY are injected automatically by Supabase.

import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const { userId, email, name } = await req.json();

    let targetEmail = typeof email === "string" && email.trim() ? email.trim() : null;

    if (!targetEmail && userId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (!supabaseUrl || !serviceRole) {
        return new Response(JSON.stringify({ ok: false, error: "missing supabase env" }), { status: 500 });
      }
      const admin = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });
      const { data, error } = await admin.auth.admin.getUserById(userId);
      if (error) {
        return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 400 });
      }
      targetEmail = data?.user?.email || null;
    }

    if (!targetEmail) {
      return new Response(JSON.stringify({ ok: false, error: "no email address to send to" }), { status: 400 });
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      return new Response(JSON.stringify({ ok: false, error: "RESEND_API_KEY not configured" }), { status: 500 });
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
        subject: "Your alumni account is now verified",
        text: `Hi ${name || "there"},\n\nYour Alumni Tracer account has been verified by the Alumni Affairs Office. You can now complete the alumni survey and access the dashboard.\n\nSign in to continue.`,
        html:
          `<p>Hi ${name || "there"},</p>` +
          `<p>Great news — the Alumni Affairs Office has verified your account. You can now ` +
          `complete the alumni survey and access the full dashboard.</p>` +
          `<p>Sign in to continue.</p>`,
      }),
    });

    const body = await res.json();
    return new Response(JSON.stringify({ ok: res.ok, id: body?.id || null }), { status: res.ok ? 200 : 502 });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err?.message || err) }), { status: 500 });
  }
});