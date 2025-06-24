"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

const PAGE_SIZE = 30;

export default function AllPopularGamesPage() {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const loader = useRef<HTMLDivElement | null>(null);

  const loadGames = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/games/all-popular?skip=${page * PAGE_SIZE}&take=${PAGE_SIZE}`);
    const data = await res.json();
    setGames((prev) => {
      const allGames = [...prev, ...data.games];
      const uniqueGames = Array.from(new Map(allGames.map(g => [g.slug, g])).values());
      return uniqueGames;
    });
    setHasMore(data.hasMore);
    setLoading(false);
  }, [page]);

  useEffect(() => {
    loadGames();
    // eslint-disable-next-line
  }, [page]);

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );
    if (loader.current) observer.observe(loader.current);
    return () => {
      if (loader.current) observer.unobserve(loader.current);
    };
  }, [hasMore, loading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">All Popular Games</h1>
        {!games.length && loading ? (
          <div className="text-center text-gray-400">Loading games...</div>
        ) : !games.length ? (
          <div className="text-center text-gray-400">No games found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {games.map((game, idx) => (
              <Link key={game.slug + '-' + idx} href={`/game/${game.slug}`} className="bg-gray-800 rounded-lg shadow hover:bg-gray-700 transition-colors flex flex-col">
                <div className="relative h-40 w-full rounded-t-lg overflow-hidden">
                  {game.background_image ? (
                    <Image src={game.background_image} alt={game.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No Image</span>
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <h2 className="font-semibold text-white text-lg mb-2 line-clamp-2">{game.name}</h2>
                  <div className="text-xs text-gray-400">{game.views} views</div>
                </div>
              </Link>
            ))}
          </div>
        )}
        <div ref={loader} />
        {loading && games.length > 0 && <div className="text-center text-gray-400 mt-4">Loading more games...</div>}
        {!hasMore && games.length > 0 && <div className="text-center text-gray-500 mt-8">No more games to load.</div>}
      </div>
    </div>
  );
} 