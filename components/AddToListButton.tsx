"use client";
import { useMyList } from "@/hooks/useMyList";
import type { Media } from "@/types/media";
import { scheduleRecordEvent } from "@/lib/recommendations";
export default function AddToListButton({ media, compact }: { media: Media; compact?: boolean }) {
  const { has, toggle } = useMyList();
  const on = has(media);
  const handleToggle = () => {
    toggle(media);
    if (!on) scheduleRecordEvent({ type: "list_add", contentId: media.id, contentType: media.type, genreIds: media.genreIds, title: media.title });
  };
  return (
    <button onClick={handleToggle} aria-pressed={on} aria-label={on ? `Remove ${media.title} from My List` : `Add ${media.title} to My List`}
      className={compact ? "grid h-9 w-9 place-items-center rounded-full bg-white/15 text-lg hover:bg-white/25" : "rounded-lg bg-white/10 px-6 py-3 font-semibold hover:bg-white/20"}>
      {compact ? (on ? "✓" : "+") : on ? "✓ In My List" : "+ My List"}
    </button>
  );
}
