"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getSupabaseConfig } from "@/lib/supabase/config";

export default function AuthForm({ nextPath, configError, oauthError, oauthMessage }: { nextPath?: string; configError?: boolean; oauthError?: boolean; oauthMessage?: string }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(configError ? "Add your Supabase URL and anon key to .env.local before signing in." : oauthError ? `Google sign-in was not completed${oauthMessage ? `: ${oauthMessage}` : ". Please try again."}` : "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const supabase = createClient();
      const result = mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { data: { display_name: name.trim() } } });

      if (result.error) throw result.error;
      if (mode === "register" && !result.data.session) {
        setMessage("Account created. Check your email to confirm your address, then sign in.");
      } else {
        window.location.assign(nextPath?.startsWith("/") ? nextPath : "/");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { key } = getSupabaseConfig();
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      if (nextPath?.startsWith("/")) callbackUrl.searchParams.set("next", nextPath);
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl.toString(),
          queryParams: { apikey: key },
        },
      });
      if (oauthError) throw oauthError;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Google sign-in could not be started.");
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-24">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-panel/90 p-7 shadow-2xl shadow-black/40">
        <Link href="/" className="text-sm font-bold text-ember">← Back to 4PLEX</Link>
        <p className="mt-8 text-xs font-bold uppercase tracking-[.25em] text-ember">Members only</p>
        <h1 className="mt-2 text-3xl font-extrabold">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="mt-2 text-sm text-mute">Sign in with your email and password to access 4PLEX.</p>
        <button type="button" onClick={signInWithGoogle} disabled={loading} className="mt-7 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-white font-bold text-slate-900 transition hover:bg-white/90 disabled:cursor-wait disabled:opacity-60">
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M21.35 12.27c0-.79-.07-1.55-.22-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z" />
            <path fill="#34A853" d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.28v2.53A9.74 9.74 0 0 0 12 21.5Z" />
            <path fill="#FBBC05" d="M6.53 13.58A5.86 5.86 0 0 1 6.22 12c0-.55.1-1.09.31-1.58V7.89H3.28A9.5 9.5 0 0 0 2.25 12c0 1.48.35 2.88 1.03 4.11l3.25-2.53Z" />
            <path fill="#EA4335" d="M12 6.39c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.47 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.72 5.39l3.25 2.53C7.3 8.11 9.46 6.39 12 6.39Z" />
          </svg>
          Continue with Google
        </button>
        <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[.2em] text-mute"><span className="h-px flex-1 bg-white/10" />or<span className="h-px flex-1 bg-white/10" /></div>
        <form onSubmit={submit} className="space-y-4">
          {mode === "register" && <label className="block text-sm font-semibold">Display name<input required value={name} onChange={(event) => setName(event.target.value)} className="mt-2 block w-full rounded-xl border border-white/10 bg-raised px-4 py-3 text-bone" maxLength={40} /></label>}
          <label className="block text-sm font-semibold">Email<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 block w-full rounded-xl border border-white/10 bg-raised px-4 py-3 text-bone" /></label>
          <label className="block text-sm font-semibold">Password<input required type="password" minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 block w-full rounded-xl border border-white/10 bg-raised px-4 py-3 text-bone" /></label>
          {error && <p role="alert" className="rounded-xl border border-red-300/20 bg-red-300/10 p-3 text-sm text-red-100">{error}</p>}
          {message && <p role="status" className="rounded-xl border border-ember/20 bg-ember/10 p-3 text-sm text-ember">{message}</p>}
          <button disabled={loading} className="h-12 w-full rounded-xl bg-ember font-extrabold text-ink transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60">{loading ? "Please wait..." : mode === "login" ? "Sign in" : "Register"}</button>
        </form>
        <button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setMessage(""); }} className="mt-6 w-full text-center text-sm text-mute hover:text-bone">
          {mode === "login" ? "New to 4PLEX? Create an account" : "Already have an account? Sign in"}
        </button>
      </section>
    </main>
  );
}
