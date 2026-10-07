export const ACCOUNT_PROFILE_KEY = "4plex:account-profile";

export type AccountProfile = {
  displayName: string;
  username: string;
  bio: string;
  avatar: string;
  accent: string;
};

export const DEFAULT_ACCOUNT_PROFILE: AccountProfile = {
  displayName: "4PLEX Guest",
  username: "guest",
  bio: "",
  avatar: "P",
  accent: "#E9A23B",
};

export function readAccountProfile(): AccountProfile {
  if (typeof window === "undefined") return DEFAULT_ACCOUNT_PROFILE;
  try {
    const saved = localStorage.getItem(ACCOUNT_PROFILE_KEY);
    return saved ? { ...DEFAULT_ACCOUNT_PROFILE, ...JSON.parse(saved) } : DEFAULT_ACCOUNT_PROFILE;
  } catch {
    return DEFAULT_ACCOUNT_PROFILE;
  }
}

export function saveAccountProfile(profile: AccountProfile) {
  localStorage.setItem(ACCOUNT_PROFILE_KEY, JSON.stringify(profile));
}
