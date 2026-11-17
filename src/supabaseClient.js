import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Supabase is optional for the demo UI: on a fresh/partial extract without
 * a .env file the app still boots on seed data instead of crashing with a
 * white screen. A banner in App.jsx tells the operator the env is missing.
 */
export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey);

function fetchWithTimeout(input, init = {}) {
  const controller = new AbortController();
  const externalSignal = init.signal;
  const abortWithExternalSignal = () => controller.abort(externalSignal.reason);
  if (externalSignal?.aborted) {
    abortWithExternalSignal();
  } else {
    externalSignal?.addEventListener("abort", abortWithExternalSignal, { once: true });
  }
  const timeoutId = setTimeout(
    () => controller.abort(new DOMException("Supabase request timed out after 12 seconds.", "TimeoutError")),
    12000,
  );

  return fetch(input, { ...init, signal: controller.signal }).finally(() => {
    clearTimeout(timeoutId);
    externalSignal?.removeEventListener("abort", abortWithExternalSignal);
  });
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder",
  { global: { fetch: fetchWithTimeout } },
);