import Link from 'next/link';
import Image from 'next/image';

interface RelatedGame {
  id: number;
  name: string;
  slug: string;
  background_image?: string;
  released?: string;
  rating?: number;
  metacritic?: number | null;
}

interface RelatedGamesProps {
  additions?: RelatedGame[];
  gameSeries?: RelatedGame[];
  parentGames?: RelatedGame[];
}

function GameGrid({ games }: { games: RelatedGame[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {games.map((game) => (
        <Link
          key={game.id}
          href={`/game/${game.slug}`}
          className="bg-gray-700 rounded-lg overflow-hidden hover:bg-gray-600 transition-colors"
        >
          <div className="relative h-32">
            {game.background_image ? (
              <Image
                src={game.background_image}
                alt={game.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                <span className="text-gray-400 text-sm">No Image</span>
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-white mb-2 line-clamp-2">
              {game.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              {game.released && (
                <span>{new Date(game.released).getFullYear()}</span>
              )}
              {game.rating && (
                <span className="flex items-center gap-1">
                  <span className="text-yellow-400">★</span>
                  {game.rating.toFixed(1)}
                </span>
              )}
              {game.metacritic && (
                <span className="flex items-center gap-1">
                  <span className="text-green-400">●</span>
                  {game.metacritic}
                </span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function RelatedGames({ additions, gameSeries, parentGames }: RelatedGamesProps) {
  if (!((additions && additions.length) || (gameSeries && gameSeries.length) || (parentGames && parentGames.length))) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Related Games</h2>
      {additions && additions.length > 0 && (
        <>
          <h3 className="text-lg font-semibold text-gray-200 mb-2">DLCs & Editions</h3>
          <GameGrid games={additions} />
        </>
      )}
      {gameSeries && gameSeries.length > 0 && (
        <>
          <h3 className="text-lg font-semibold text-gray-200 mb-2">Game Series</h3>
          <GameGrid games={gameSeries} />
        </>
      )}
      {parentGames && parentGames.length > 0 && (
        <>
          <h3 className="text-lg font-semibold text-gray-200 mb-2">Parent Games</h3>
          <GameGrid games={parentGames} />
        </>
      )}
    </div>
  );
} 