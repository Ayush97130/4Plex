export const ambientImage = (backdrop: string | null, poster: string | null) => {
  const path = backdrop ?? poster;
  return path ? `https://image.tmdb.org/t/p/w1280${path}` : null;
};

export const publishAmbient = (image: string | null) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("4plex:ambient", { detail: { image } }));
};
