import { fetchMoviesForProvider, Movie, POPULAR_GENRES } from "@/lib/tmdb";

export async function GET(request: Request): Promise<Response> {
  const providers = new URL(request.url).searchParams.get("providers");
  if (!providers) {
    return Response.json({ error: "providers required" }, { status: 400 });
  }

  const providerIds = providers.split(",").map(Number).filter(Boolean);
  if (providerIds.length === 0) {
    return Response.json({ error: "providers required" }, { status: 400 });
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const genre = POPULAR_GENRES[Math.floor(Math.random() * POPULAR_GENRES.length)];
  const page = Math.floor(Math.random() * 3) + 1;

  const results = await Promise.all(
    providerIds.map((id) => fetchMoviesForProvider(id, apiKey, genre.id, page))
  );

  const allMovies = results.flat();

  const seen = new Map<number, Movie>();
  for (const movie of allMovies) {
    if (!seen.has(movie.id)) {
      seen.set(movie.id, movie);
    }
  }

  const deduplicated = Array.from(seen.values())
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 20);

  return Response.json(deduplicated);
}
