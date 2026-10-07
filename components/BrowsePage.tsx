import ContentRow from "@/components/ContentRow";
import ErrorState from "@/components/ErrorState";
import type { Media } from "@/types/media";

interface BrowsePageProps {
  title: string;
  rows: { title: string; items: Media[] }[];
}

export default function BrowsePage({ title, rows }: BrowsePageProps) {
  return (
    <section className="mx-auto max-w-[1500px] px-4 pb-20 pt-24 md:px-10">
      <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
      <div className="relative z-10">
        {rows.map((row) => <ContentRow key={row.title} title={row.title} items={row.items} />)}
      </div>
    </section>
  );
}

export function BrowseError() {
  return <div className="pt-24"><ErrorState message="Unable to load this page." /></div>;
}
