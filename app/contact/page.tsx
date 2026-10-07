import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("Contact 4PLEX", "Contact the 4PLEX team with questions, feedback, or privacy requests.", "/contact");

export default function ContactPage() {
  return <section className="relative z-10 mx-auto max-w-3xl px-4 py-16 md:px-10"><h1 className="text-4xl font-extrabold">Contact 4PLEX</h1><p className="mt-3 text-mute">Send a question, report a problem, or request help with your account.</p><ContactForm /></section>;
}
