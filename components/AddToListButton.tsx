"use client";
import { usePathname, useRouter } from "next/navigation";
import { useMyList } from "@/hooks/useMyList";
import { createClient } from "@/lib/supabase/client";
import type { Media } from "@/types/media";
import { useState } from "react";
import { scheduleRecordEvent } from "@/lib/recommendations";
export default function AddToListButton({ media, compact }: { media: Media; compact?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { has, toggle } = useMyList();
  const on = has(media);
  const [checkingAuth, setCheckingAuth] = useState(false);
  const handleToggle = async () => {
    setCheckingAuth(true);
    try {
      const { data, error } = await createClient().auth.getUser();
      if (error) throw error;
      if (!data.user) {
        router.push(`/auth?next=${encodeURIComponent(pathname)}`);
        return;
      }
    } catch (error) {
      console.error("Unable to verify authentication before updating My List.", error);
      router.push(`/auth?next=${encodeURIComponent(pathname)}`);
      return;
    } finally {
      setCheckingAuth(false);
    }
    toggle(media);
    if (!on) scheduleRecordEvent({ type: "list_add", contentId: media.id, contentType: media.type, genreIds: media.genreIds, title: media.title });
  };
  return (
    <button onClick={handleToggle} aria-pressed={on} aria-label={on ? `Remove ${media.title} from My List` : `Add ${media.title} to My List`}
      disabled={checkingAuth}
      className={compact ? "grid h-11 w-11 place-items-center rounded-full bg-white/15 text-lg hover:bg-white/25 disabled:opacity-60" : "min-h-11 rounded-lg bg-white/10 px-6 py-3 font-semibold hover:bg-white/20 disabled:opacity-60"}>
      {compact ? (on ? "✓" : "+") : on ? "✓ In My List" : "+ My List"}
    </button>
  );
}
