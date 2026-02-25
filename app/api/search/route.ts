import { Movie, STREAMING_SERVICES } from "@/lib/tmdb";

const TMDB_API_BASE = "https://api.themoviedb.org/3";

export interface SearchResult extends Movie {
  available: boolean;
  availableOn: string[];
}

interface TMDBMovieRaw {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  vote_average: number;
  popularity: number;
}

interface TMDBProvider {
  provider_id: number;
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const providers = searchParams.get("providers");

  if (!query) return Response.json({ error: "query required" }, { status: 400 });
  if (!providers) return Response.json({ error: "providers required" }, { status: 400 });

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return Response.json({ error: "Server misconfigured" }, { status: 500 });

  const providerIds = providers.split(",").map(Number).filter(Boolean);

  const searchRes = await fetch(
    `${TMDB_API_BASE}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&page=1`
  );
  if (!searchRes.ok) return Response.json({ error: "Search failed" }, { status: 500 });

  const searchData = await searchRes.json();
  const topResults = (searchData.results as TMDBMovieRaw[])
    .filter((r) => r.poster_path)
    .slice(0, 5);

  const results: SearchResult[] = await Promise.all(
    topResults.map(async (movie) => {
      try {
        const providerRes = await fetch(
          `${TMDB_API_BASE}/movie/${movie.id}/watch/providers?api_key=${apiKey}`
        );
        const providerData = await providerRes.json();
        const usProviders: TMDBProvider[] = providerData.results?.US?.flatrate ?? [];
        const availableProviderIds = usProviders.map((p) => p.provider_id);
        const availableOn = STREAMING_SERVICES
          .filter((s) => providerIds.includes(s.id) && availableProviderIds.includes(s.id))
          .map((s) => s.name);

        return {
          id: movie.id,
          title: movie.title,
          release_date: movie.release_date,
          poster_path: movie.poster_path as string,
          vote_average: movie.vote_average,
          popularity: movie.popularity,
          available: availableOn.length > 0,
          availableOn,
        };
      } catch {
        return {
          id: movie.id,
          title: movie.title,
          release_date: movie.release_date,
          poster_path: movie.poster_path as string,
          vote_average: movie.vote_average,
          popularity: movie.popularity,
          available: false,
          availableOn: [],
        };
      }
    })
  );

  return Response.json(results);
}
