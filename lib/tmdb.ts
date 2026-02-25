export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w300";
const TMDB_API_BASE = "https://api.themoviedb.org/3";

export interface StreamingService {
  id: number;
  name: string;
  logo: string;
}

export interface Movie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string;
  vote_average: number;
  popularity: number;
}

export const POPULAR_GENRES = [
  { id: 28,  name: "Action" },
  { id: 35,  name: "Comedy" },
  { id: 18,  name: "Drama" },
  { id: 27,  name: "Horror" },
  { id: 878, name: "Sci-Fi" },
  { id: 53,  name: "Thriller" },
  { id: 12,  name: "Adventure" },
  { id: 80,  name: "Crime" },
];

export const STREAMING_SERVICES: StreamingService[] = [
  { id: 8, name: "Netflix", logo: "N" },
  { id: 9, name: "Prime Video", logo: "P" },
  { id: 337, name: "Disney+", logo: "D+" },
  { id: 15, name: "Hulu", logo: "H" },
  { id: 350, name: "Apple TV+", logo: "A" },
  { id: 1899, name: "Max", logo: "M" },
  { id: 386, name: "Peacock", logo: "Pc" },
  { id: 531, name: "Paramount+", logo: "P+" },
];

interface TMDBMovieRaw {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  vote_average: number;
  popularity: number;
}

interface TMDBDiscoverResponse {
  results: TMDBMovieRaw[];
}

export async function fetchMoviesForProvider(
  providerId: number,
  apiKey: string,
  genreId: number,
  page: number
): Promise<Movie[]> {
  const url = `${TMDB_API_BASE}/discover/movie?api_key=${apiKey}&watch_region=US&with_watch_providers=${providerId}&with_genres=${genreId}&sort_by=popularity.desc&page=${page}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  const data: TMDBDiscoverResponse = await res.json();
  return data.results
    .filter((r) => r.poster_path !== null)
    .slice(0, 20)
    .map((r) => ({
      id: r.id,
      title: r.title,
      release_date: r.release_date,
      poster_path: r.poster_path as string,
      vote_average: r.vote_average,
      popularity: r.popularity,
    }));
}

export async function fetchMovieRuntime(
  movieId: number,
  apiKey: string
): Promise<number | null> {
  try {
    const url = `${TMDB_API_BASE}/movie/${movieId}?api_key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data: { runtime: number | null } = await res.json();
    return data.runtime ?? null;
  } catch {
    return null;
  }
}
