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
}

function yearsSinceRelease(released: string): string | null {
  const releaseDate = new Date(released);
  const now = new Date();
  const years = now.getFullYear() - releaseDate.getFullYear();
  return years > 0 ? `${years} years ago` : null;
}

export default function GameHeader({ 
  name, 
  backgroundImage, 
  gameModes, 
  website, 
  released, 
  rating, 
  ratingsCount, 
  metacritic, 
  playerPerspectives,
  ratingTop
}: GameHeaderProps) {
  const modeNames = gameModes?.map(m => m.name).join(', ') || '';

  return (
    <div className="relative h-[60vh] w-full">
      {backgroundImage && (
        <Image
          src={backgroundImage}
          alt={name}
          fill
          className="object-cover"
          priority
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
        <h1 className="text-3xl sm:text-5xl font-bold mb-2 md:mb-4">{name}</h1>
        {website && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mb-2 md:mb-4 text-blue-400 hover:underline text-base md:text-lg font-semibold"
          >
            Official Website
          </a>
        )}
        <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm">
          {released && (
            <span className="bg-gray-800/80 backdrop-blur-sm px-3 py-1 rounded-full">
              Released: {new Date(released).toLocaleDateString()}
              {yearsSinceRelease(released) && (
                <span className="ml-2 text-gray-400">({yearsSinceRelease(released)})</span>
              )}
            </span>
          )}
          {rating && (
            <span className="bg-gray-800/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
              <span className="text-yellow-400">★</span>
              {rating.toFixed(1)}{ratingTop ? `/` + ratingTop : ''}
              {ratingsCount && (
                <span className="text-gray-400">({ratingsCount.toLocaleString()})</span>
              )}
            </span>
          )}
          {metacritic && (
            <span className="bg-gray-800/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
              <span className="text-green-400">●</span>
              {metacritic}/100
            </span>
          )}
          {modeNames && (
            <span className="bg-gray-800/80 backdrop-blur-sm px-3 py-1 rounded-full">
              {modeNames}
            </span>
          )}
          {playerPerspectives && playerPerspectives.length > 0 && (
            <span className="bg-gray-800/80 backdrop-blur-sm px-3 py-1 rounded-full">
              {playerPerspectives.map((perspective) => perspective.name).join(', ')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 