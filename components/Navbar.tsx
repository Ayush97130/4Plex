"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useEffect, useState } from "react";
import Logo from "./Logo";
import AccountMenu from "./AccountMenu";
import NavbarSearch from "./NavbarSearch";

const links = [["Home", "/"], ["Trending", "/trending"], ["Movies", "/movies"], ["TV Shows", "/tv"], ["Genres", "/genres"], ["My List", "/my-list"]] as const;

function Navbar() {
  const path = usePathname();
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 24);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-40 border-b transition-colors duration-200 ${solid ? "border-white/10 bg-ink/95 shadow-lg shadow-black/20" : "border-transparent bg-gradient-to-b from-black/80 to-transparent"}`}>
        <nav aria-label="Main" className="mx-auto flex h-[4.5rem] min-w-0 max-w-[1500px] items-center gap-4 px-4 md:gap-8 md:px-10">
          <Logo />
          <ul className="hidden gap-7 text-sm font-semibold md:flex">
            {links.map(([label, href]) => (
              <li key={href}><Link href={href} aria-current={path === href ? "page" : undefined}
                className={`relative py-2 transition-colors hover:text-white ${path === href ? "text-white" : "text-mute"}`}>
                {label}{path === href && <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-ember" />}
              </Link></li>
            ))}
          </ul>
          <div className="ml-auto flex items-center gap-2">
            <NavbarSearch />
            <AccountMenu />
          </div>
        </nav>
      </header>
      <nav aria-label="Mobile" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-white/10 bg-ink/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(0,0,0,.2)] backdrop-blur-xl md:hidden">
        {[["Home", "/"], ["Search", "/search"], ["Movies", "/movies"], ["TV", "/tv"], ["My List", "/my-list"]].map(([label, href]) => (
          <Link key={href} href={href} aria-current={path === href ? "page" : undefined}
            className={`flex min-h-14 items-center justify-center border-t-2 px-1 text-center text-[11px] font-semibold transition-colors ${path === href ? "border-ember text-ember" : "border-transparent text-mute hover:text-bone"}`}>{label}</Link>
        ))}
      </nav>
    </>
  );
}

export default memo(Navbar);
