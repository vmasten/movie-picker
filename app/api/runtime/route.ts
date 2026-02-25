import { fetchMovieRuntime } from "@/lib/tmdb";

export async function GET(request: Request): Promise<Response> {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return Response.json({ error: "id required" }, { status: 400 });
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const runtime = await fetchMovieRuntime(Number(id), apiKey);
  return Response.json({ id: Number(id), runtime });
}
