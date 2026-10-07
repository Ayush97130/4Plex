import Link from "next/link";
export default function Logo() {
  return (
    <Link href="/" aria-label="4PLEX home" className="group flex items-center gap-1 text-2xl font-black tracking-[-0.08em]">
      <span className="grid h-8 w-7 place-items-center rounded-md bg-ember text-xl leading-none text-ink shadow-lg shadow-ember/20 transition-transform group-hover:rotate-[-6deg]">4</span>
      <span>PLEX</span>
    </Link>
  );
}
