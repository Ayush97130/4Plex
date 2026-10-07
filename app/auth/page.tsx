import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { createClient } from "@/lib/supabase/server";
import { getSafeNextPath } from "@/lib/auth/redirect";

export const dynamic = "force-dynamic";

export default async function AuthPage({ searchParams }: { searchParams: { next?: string; error?: string; message?: string } }) {
  let authenticated = false;
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    authenticated = Boolean(user);
  } catch {
    authenticated = false;
  }

  if (authenticated) redirect(getSafeNextPath(searchParams.next) ?? "/");

  return <AuthForm nextPath={getSafeNextPath(searchParams.next)} configError={searchParams.error === "config"} oauthError={searchParams.error === "oauth"} oauthMessage={searchParams.message} />;
}
