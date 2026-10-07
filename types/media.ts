export type MediaType = "movie" | "tv";
export interface Media {
  id: number; type: MediaType; title: string; overview: string;
  poster: string | null; backdrop: string | null; year: string; rating: number; genreIds: number[];
}
export interface Detail extends Media {
  tagline: string; runtime: string; genres: string[]; seasons?: number;
  cast: { id: number; name: string; character: string; photo: string | null }[];
  trailerKey: string | null; similar: Media[];
}
export interface Episode {
  id: number;
  number: number;
  name: string;
  overview: string;
  still: string | null;
  runtime: number | null;
}
