import Link from "next/link";
import Logo from "./Logo";
export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-panel/60 px-4 py-10 md:px-10 hidden md:block">
      <div className="mx-auto flex max-w-[1500px] flex-wrap justify-between gap-8">
        <div><Logo /><p className="mt-3 max-w-xs text-sm text-mute">Discover movies and TV shows in one cinematic place.</p></div>
        <div className="flex gap-16 text-sm text-mute">
          <ul className="space-y-2">{[["Home","/"],["Movies","/movies"],["TV Shows","/tv"],["Genres","/genres"],["My List","/my-list"]].map(([l,h])=><li key={h}><Link className="hover:text-bone" href={h}>{l}</Link></li>)}</ul>
          <ul className="space-y-2">{["About","Contact","Privacy","Terms"].map(l=><li key={l}><Link className="hover:text-bone" href={`/${l.toLowerCase()}`}>{l}</Link></li>)}</ul>
        </div>
      </div>
    </footer>
  );
}
