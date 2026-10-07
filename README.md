# 4Plex
1. `cp .env.example .env.local` and fill in `TMDB_API_KEY` (and later `NEXSTREAM_API_KEY`, `NEXSTREAM_BASE_URL`).
2. `npm install && npm run dev`
3. Playback: implement `services/nexstreamService.ts → getPlayback()` once Nexstream docs are available.
## Supabase authentication

4PLEX requires a confirmed Supabase email/password account before any application route can be accessed. Add these values to `.env.local` from Supabase Project Settings > API:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

In Supabase Authentication > Providers, enable Email. Configure the Site URL and redirect URLs to include `http://localhost:3006` during local development and your production URL when deployed. Email confirmation is supported; newly registered users must confirm their email if email confirmations are enabled in Supabase.

To allow Google sign-in, enable **Google** under Authentication > Providers. Add this app URL under Authentication > URL Configuration > Redirect URLs:

```text
http://localhost:3006/auth/callback
```

Configure the Google OAuth client in Google Cloud Console with the Supabase callback URL shown in the Supabase Google provider settings, usually:

```text
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

Users can then choose the Google account already signed in to their browser.
