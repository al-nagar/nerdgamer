'use client';
import { useEffect, useState, useRef } from 'react';
import { notFound, useParams } from 'next/navigation';
import GameHeader from '@/components/GameHeader';
import GameDetailsSidebar from '@/components/GameDetailsSidebar';
import AboutSection from '@/components/AboutSection';
import MediaTabs from '@/components/MediaTabs';
import SystemRequirements from '@/components/SystemRequirements';
import CompletionTimes from '@/components/CompletionTimes';
import Link from 'next/link';
import Image from 'next/image';
import CommentsSection from '../../../components/CommentsSection';
import RelatedGames from '@/components/RelatedGames';

interface PlatformWithRequirements {
  platform: {
    id: number;
    name: string;
    slug: string;
  };
  requirements?: {
    minimum?: string;
    recommended?: string;
  };
}

interface UnifiedGameData {
  id: number;
  name: string;
  description?: string;
  background_image?: string;
  rating?: number;
  rating_top?: number;
  ratings_count?: number;
  released: string;
  platforms: Array<{
    platform: {
      id: number;
      name: string;
      slug: string;
    };
    requirements?: {
      minimum?: string;
      recommended?: string;
    };
  }>;
  developers: Array<{
    name: string;
  }>;
  publishers: Array<{
    name: string;
  }>;
  stores: Array<{
    id: number;
    store: {
      id: number;
      name: string;
      slug: string;
      domain: string;
    };
    url: string;
  }>;
  game_modes?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  player_perspectives?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  themes?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  completion_times?: {
    hastily?: { value: number; unit: string };
    normally?: { value: number; unit: string };
    completely?: { value: number; unit: string };
  };
  screenshots?: Array<{
    id: number | string;
    image: string;
  }>;
  video_data?: {
    source: 'igdb';
    videos: { name: string; video_id: string }[];
  } | {
    source: 'rawg';
    clip: {
      clip: string;
      preview: string;
    };
  };
  website?: string;
  supported_languages?: Record<string, { audio: boolean; subtitles: boolean; interface: boolean }>;
  age_ratings?: Array<any>;
  alternative_names?: Array<string>;
  metacritic?: number | null;
  genres?: Array<{
    id: number;
    name: string;
    slug: string;
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
  development_team?: Array<{
    id: number;
    name: string;
    slug: string;
    image?: string;
    games_count?: number;
  }>;
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
}

export default function GamePage() {
  const { slug } = useParams();
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastIncrementedSlug = useRef<string | null>(null);

  useEffect(() => {
    setGame(null);
    setLoading(true);
    fetch(`/api/game/${slug}`)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        setGame(data);
        setError(null);
      })
      .catch(() => setError('Game not found'))
      .finally(() => setLoading(false));
    // Reset the ref so we can increment for the new slug
    lastIncrementedSlug.current = null;
  }, [slug]);

  useEffect(() => {
    if (game && game.slug && lastIncrementedSlug.current !== game.slug) {
      fetch(`/api/game/${game.slug}/view`, { method: 'POST' });
      lastIncrementedSlug.current = game.slug;
    }
  }, [game]);

  if (loading) return <div className="text-center text-gray-400 mt-12">Loading game...</div>;
  if (error || !game) return notFound();

  const pcPlatform = game.platforms?.find((p: any) => p.platform.slug === 'pc');

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* Hero Header */}
      <GameHeader 
        name={game.name}
        backgroundImage={game.background_image}
        gameModes={game.game_modes}
        website={game.website}
        released={game.released}
        rating={game.rating}
        ratingsCount={game.ratings_count}
        metacritic={game.metacritic}
        playerPerspectives={game.player_perspectives}
        ratingTop={game.rating_top}
      />

      {/* Main Content */}
      <div className="container mx-auto px-2 sm:px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* === MAIN CONTENT (LEFT COLUMN) === */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* About Section */}
            <AboutSection description={game.description} />

            {/* Media Tabs (Screenshots & Videos) */}
            <MediaTabs 
              screenshots={game.screenshots} 
              videos={game.video_data} 
            />

            {/* System Requirements */}
            {pcPlatform?.requirements && (
              <SystemRequirements
                minimum={pcPlatform.requirements.minimum}
                recommended={pcPlatform.requirements.recommended}
              />
            )}

            {/* Related Games */}
            <RelatedGames 
              additions={game.additions}
              gameSeries={game.game_series}
              parentGames={game.parent_games}
            />

            {/* Comments Section */}
            <CommentsSection gameSlug={game.slug} initialComments={game.comments} />
          </div>

          {/* === SIDEBAR (RIGHT COLUMN) === */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <GameDetailsSidebar game={game} />
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}