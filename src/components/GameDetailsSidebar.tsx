'use client';
import AgeRatingDisplay from './AgeRatingDisplay';
import LanguageSupportTable from './LanguageSupportTable';
import AlternativeNamesList from './AlternativeNamesList';
import StoreLinks from './StoreLinks';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

interface GameDetailsSidebarProps {
  game: {
    platforms?: Array<{ platform: { name: string } }>;
    released?: string;
    developers?: Array<{ name: string }>;
    publishers?: Array<{ name: string }>;
    genres?: Array<{ name: string }>;
    themes?: Array<{ name: string }>;
    game_modes?: Array<{ name: string }>;
    player_perspectives?: Array<{ name: string }>;
    game_engines?: Array<{ name: string }>;
    franchises?: Array<{ name: string }>;
    stores?: Array<{
      store: { name: string; slug: string; domain: string };
      url: string;
    }>;
    age_ratings?: Array<any>;
    supported_languages?: Record<string, { audio: boolean; subtitles: boolean; interface: boolean }>;
    alternative_names?: Array<string>;
    rating?: number;
    rating_top?: number;
    ratings_count?: number;
    metacritic?: number | null;
    added?: number;
    playtime?: number;
    suggestions_count?: number;
    achievements_count?: number;
    reviews_count?: number;
    website?: string;
    completion_times?: {
      hastily?: { value: number; unit: string };
      normally?: { value: number; unit: string };
      completely?: { value: number; unit: string };
    };
    game_series?: Array<{
      id: number;
      name: string;
      slug: string;
      background_image?: string;
      released?: string;
      rating?: number;
      metacritic?: number | null;
    }>;
    parent_games?: Array<{
      id: number;
      name: string;
      slug: string;
      background_image?: string;
      released?: string;
      rating?: number;
      metacritic?: number | null;
    }>;
    additions?: Array<{
      id: number;
      name: string;
      slug: string;
      background_image?: string;
      released?: string;
      rating?: number;
      metacritic?: number | null;
    }>;
    upvotes?: number;
    downvotes?: number;
    slug?: string;
  };
}

const DetailItem = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex justify-between items-start py-3 border-b border-gray-700 last:border-b-0">
    <span className="text-gray-400 text-sm font-medium">{label}</span>
    <span className="text-right text-sm text-white max-w-[60%]">{children}</span>
  </div>
);

const renderPills = (items?: Array<{ name: string }>) => {
  if (!items || items.length === 0) {
    return <span className="text-gray-400">N/A</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item, index) => (
        <span
          key={index}
          className="bg-gray-700 px-2 py-1 rounded text-xs"
        >
          {item.name}
        </span>
      ))}
    </div>
  );
};

const renderGameCard = (game: { id: number; name: string; slug: string; background_image?: string; released?: string; rating?: number; metacritic?: number | null }) => (
  <Link
    key={game.id}
    href={`/game/${game.slug}`}
    className="bg-gray-700 rounded-lg overflow-hidden hover:bg-gray-600 transition-colors block"
  >
    <div className="relative h-20">
      {game.background_image ? (
        <Image
          src={game.background_image}
          alt={game.name}
          fill
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gray-600 flex items-center justify-center">
          <span className="text-gray-400 text-xs">No Image</span>
        </div>
      )}
    </div>
    <div className="p-3">
      <h4 className="font-semibold text-white text-sm mb-1 line-clamp-2">
        {game.name}
      </h4>
      <div className="flex items-center gap-2 text-xs text-gray-300">
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
          <span className="text-green-400">{game.metacritic}</span>
        )}
      </div>
    </div>
  </Link>
);

// Helper to map age rating to a simple label
function getSimpleAgeRating(ageRatings?: any[]): string | null {
  if (!ageRatings || ageRatings.length === 0) return null;
  // Prefer ESRB, then PEGI, then any
  const priorities = ['ESRB', 'PEGI', 'CERO', 'USK', 'GRAC', 'CLASSIND', 'ACB'];
  let best: any = null;
  for (const org of priorities) {
    best = ageRatings.find(r => r.organization?.name?.toUpperCase().includes(org));
    if (best) break;
  }
  if (!best) best = ageRatings[0];
  const label = (best.rating_category?.rating || '').toLowerCase();
  // Map common labels to user-friendly ones
  if (label.includes('everyone 10')) return '+10';
  if (label.includes('everyone')) return 'Everyone';
  if (label.includes('teen')) return '+13';
  if (label.includes('mature')) return '+17';
  if (label.includes('adults only') || label.includes('adult')) return '+18';
  if (label.includes('pegi 3')) return '+3';
  if (label.includes('pegi 7')) return '+7';
  if (label.includes('pegi 12')) return '+12';
  if (label.includes('pegi 16')) return '+16';
  if (label.includes('pegi 18')) return '+18';
  // Handle single-letter ESRB codes
  if (label === 'e') return 'Everyone';
  if (label === 'e10+' || label === 'e 10+') return '+10';
  if (label === 't') return '+13';
  if (label === 'm') return '+17';
  if (label === 'ao') return '+18';
  if (label.match(/\d+/)) return `+${label.match(/\d+/)[0]}`;
  return best.rating_category?.rating || null;
}

function GameVoteButtons({ slug, initialUpvotes, initialDownvotes }: { slug: string, initialUpvotes: number, initialDownvotes: number }) {
  const { user, isLoading } = useAuth();
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track user's vote state (optional: fetch from API if needed)
  // For now, assume user can only see counts and vote (no highlight)

  const handleVote = async (type: 'upvote' | 'downvote') => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/game/${slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (res.ok) {
        setUpvotes(data.upvotes);
        setDownvotes(data.downvotes);
      } else {
        setError(data.error || 'Failed to vote');
      }
    } catch (e) {
      setError('Failed to vote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center mb-6">
      <div className="flex gap-4">
        <button
          className="px-3 py-1 rounded bg-green-700 hover:bg-green-800 disabled:opacity-50"
          onClick={() => handleVote('upvote')}
          disabled={!user || loading}
        >
          👍 {upvotes}
        </button>
        <button
          className="px-3 py-1 rounded bg-red-700 hover:bg-red-800 disabled:opacity-50"
          onClick={() => handleVote('downvote')}
          disabled={!user || loading}
        >
          👎 {downvotes}
        </button>
      </div>
      {!user && !isLoading && <div className="text-xs text-gray-400 mt-2">Login to vote</div>}
      {error && <div className="text-xs text-red-400 mt-2">{error}</div>}
    </div>
  );
}

export default function GameDetailsSidebar({ game }: GameDetailsSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Voting UI */}
      {typeof game.upvotes === 'number' && typeof game.downvotes === 'number' && game.slug && (
        <GameVoteButtons slug={game.slug} initialUpvotes={game.upvotes} initialDownvotes={game.downvotes} />
      )}
      {/* Basic Details */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">Details</h3>
        <div className="space-y-0">
          {game.platforms && game.platforms.length > 0 && (
            <DetailItem label="Platforms">
              {game.platforms.map(p => p.platform.name).join(', ')}
            </DetailItem>
          )}
          {game.developers && game.developers.length > 0 && (
            <DetailItem label="Developers">
              {game.developers.map(d => d.name).join(', ')}
            </DetailItem>
          )}
          {game.publishers && game.publishers.length > 0 && (
            <DetailItem label="Publishers">
              {game.publishers.map(p => p.name).join(', ')}
            </DetailItem>
          )}
          {game.genres && game.genres.length > 0 && (
            <DetailItem label="Genres">
              {game.genres.map(g => g.name).join(', ')}
            </DetailItem>
          )}
        </div>
      </div>

      {/* Game Categories */}
      {(game.themes || game.game_modes || game.player_perspectives || game.game_engines || game.franchises) && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Categories</h3>
          <div className="space-y-4">
            {game.themes && game.themes.length > 0 && (
              <div>
                <h4 className="text-gray-400 text-sm font-medium mb-2">Themes</h4>
                {renderPills(game.themes)}
              </div>
            )}
            {game.game_modes && game.game_modes.length > 0 && (
              <div>
                <h4 className="text-gray-400 text-sm font-medium mb-2">Game Modes</h4>
                {renderPills(game.game_modes)}
              </div>
            )}
            {game.player_perspectives && game.player_perspectives.length > 0 && (
              <div>
                <h4 className="text-gray-400 text-sm font-medium mb-2">Player Perspectives</h4>
                {renderPills(game.player_perspectives)}
              </div>
            )}
            {game.game_engines && game.game_engines.length > 0 && (
              <div>
                <h4 className="text-gray-400 text-sm font-medium mb-2">Game Engines</h4>
                {renderPills(game.game_engines)}
              </div>
            )}
            {game.franchises && game.franchises.length > 0 && (
              <div>
                <h4 className="text-gray-400 text-sm font-medium mb-2">Franchises</h4>
                {renderPills(game.franchises)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Community Stats */}
      {(game.rating || game.metacritic || game.ratings_count || game.added || game.playtime || game.suggestions_count || game.achievements_count || game.reviews_count) && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Community</h3>
          <div className="space-y-0">
            {game.rating && (
              <DetailItem label="Rating">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">★</span>
                  <span>{game.rating.toFixed(1)}</span>
                  {game.rating_top && <span className="text-gray-400">/5</span>}
                </div>
              </DetailItem>
            )}
            {game.ratings_count && (
              <DetailItem label="Ratings Count">
                {game.ratings_count.toLocaleString()}
              </DetailItem>
            )}
            {game.metacritic && (
              <DetailItem label="Metacritic">
                <span className="text-green-400">{game.metacritic}</span>
              </DetailItem>
            )}
            {game.added && (
              <DetailItem label="Added to Lists">
                {game.added.toLocaleString()}
              </DetailItem>
            )}
            {game.playtime && (
              <DetailItem label="Average Playtime">
                {game.playtime}h
              </DetailItem>
            )}
            {game.suggestions_count && (
              <DetailItem label="Suggestions">
                {game.suggestions_count.toLocaleString()}
              </DetailItem>
            )}
            {game.achievements_count && (
              <DetailItem label="Achievements">
                {game.achievements_count.toLocaleString()}
              </DetailItem>
            )}
            {game.reviews_count && (
              <DetailItem label="Reviews">
                {game.reviews_count.toLocaleString()}
              </DetailItem>
            )}
            {/* Simple Age Rating */}
            {getSimpleAgeRating(game.age_ratings) && (
              <DetailItem label="Age Rating">
                {getSimpleAgeRating(game.age_ratings)}
              </DetailItem>
            )}
          </div>
        </div>
      )}

      {/* Store Links */}
      {game.stores && game.stores.length > 0 && (
        <StoreLinks stores={game.stores} />
      )}

      {/* Age Ratings */}
      {game.age_ratings && game.age_ratings.length > 0 && (
        <AgeRatingDisplay ratings={game.age_ratings} />
      )}

      {/* Language Support */}
      {game.supported_languages && Object.keys(game.supported_languages).length > 0 && (
        <LanguageSupportTable data={game.supported_languages} />
      )}

      {/* Alternative Names */}
      {game.alternative_names && game.alternative_names.length > 0 && (
        <AlternativeNamesList names={game.alternative_names} />
      )}

      {/* Completion Times */}
      {game.completion_times && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">How Long to Beat</h3>
          <div className="space-y-0">
            {game.completion_times.hastily && (
              <DetailItem label="Main Story">
                {game.completion_times.hastily.value} {game.completion_times.hastily.unit === 'h' ? 'hours' : game.completion_times.hastily.unit}
              </DetailItem>
            )}
            {game.completion_times.normally && (
              <DetailItem label="Main + Extras">
                {game.completion_times.normally.value} {game.completion_times.normally.unit === 'h' ? 'hours' : game.completion_times.normally.unit}
              </DetailItem>
            )}
            {game.completion_times.completely && (
              <DetailItem label="Completionist">
                {game.completion_times.completely.value} {game.completion_times.completely.unit === 'h' ? 'hours' : game.completion_times.completely.unit}
              </DetailItem>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 