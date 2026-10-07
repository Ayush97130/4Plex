export function getSafeNextPath(value: string | null | undefined): string | undefined {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return undefined;

  try {
    const parsed = new URL(value, "https://4plex.invalid");
    if (parsed.origin !== "https://4plex.invalid" || parsed.pathname === "/auth" || parsed.pathname.startsWith("/auth/")) return undefined;
    return value;
  } catch {
    return undefined;
  }
}
