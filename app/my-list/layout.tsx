import type { Metadata } from "next";

export const metadata: Metadata = { title: "My List — 4PLEX", robots: { index: false, follow: false } };

export default function MyListLayout({ children }: { children: React.ReactNode }) {
  return children;
}
