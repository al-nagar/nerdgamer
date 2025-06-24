import Image from 'next/image';

interface GameHeaderProps {
  name: string;
  backgroundImage?: string;
  gameModes?: Array<{ name: string }>;
  website?: string;
  released?: string;
  rating?: number;
  ratingsCount?: number;
  metacritic?: number | null;
  playerPerspectives?: Array<{ name: string }>;
  ratingTop?: number;
  platforms?: Array<{ platform: { name: string } }>;
}

function yearsSinceRelease(released: string): string | null {
  const releaseDate = new Date(released);
  const now = new Date();
  const years = now.getFullYear() - releaseDate.getFullYear();
  return years > 0 ? `${years} years ago` : null;
}

export default function GameHeader({ 
  name, 
  gameModes, 
  website, 
  released, 
  rating, 
  ratingsCount, 
  metacritic, 
  playerPerspectives,
  ratingTop,
  platforms
}: GameHeaderProps) {
  const modeNames = gameModes?.map(m => m.name).join(', ') || '';
  const perspectiveNames = playerPerspectives?.map(p => p.name).join(', ') || '';

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-8 pt-8 pb-4">
      {/* Game Name */}
      <h1 className="text-3xl sm:text-5xl font-bold mb-4 drop-shadow-lg">{name}</h1>
      {/* Release, Rating, Website */}
      <div className="flex flex-wrap gap-4 items-center mb-4 text-base md:text-lg">
        {released && (
          <span className="bg-gray-800/80 px-3 py-1 rounded-full text-gray-200">
            {new Date(released).toLocaleDateString()}
            {yearsSinceRelease(released) && (
              <span className="ml-2 text-gray-400 text-sm">({yearsSinceRelease(released)})</span>
            )}
          </span>
        )}
        {platforms && platforms.length > 0 && (
          <span className="bg-gray-800/80 px-3 py-1 rounded-full text-gray-200">
            {platforms.map(p => p.platform.name).join(', ')}
          </span>
        )}
        {rating && (
          <span className="bg-gray-800/80 px-3 py-1 rounded-full flex items-center gap-1 text-yellow-300">
            ★ {rating.toFixed(1)}{ratingTop ? `/` + ratingTop : ''}
            {ratingsCount && (
              <span className="text-gray-400">({ratingsCount.toLocaleString()})</span>
            )}
          </span>
        )}
        {metacritic && (
          <span className="bg-gray-800/80 px-3 py-1 rounded-full flex items-center gap-1 text-green-400">
            ● {metacritic}/100
          </span>
        )}
        {website && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-blue-400 hover:underline font-semibold"
          >
            Official Website
          </a>
        )}
      </div>
      {/* Game Modes and Player Perspectives */}
      <div className="flex flex-col sm:flex-row gap-4 mt-2">
        {modeNames && (
          <div className="flex-1">
            <span className="text-gray-200">{modeNames}</span>
          </div>
        )}
        {perspectiveNames && (
          <div className="flex-1">
            <span className="text-gray-200">{perspectiveNames}</span>
          </div>
        )}
      </div>
    </div>
  );
} 