'use client';
import { useEffect, useState, useRef } from 'react';
import { notFound, useParams } from 'next/navigation';
import GameHeader from '@/components/GameHeader';
import MediaTabs from '@/components/MediaTabs';
import GameDetailsSidebar from '@/components/GameDetailsSidebar';
import SystemRequirements from '@/components/SystemRequirements';
import RelatedGames from '@/components/RelatedGames';
import CommentsSection from '../../../components/CommentsSection';

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
  playtime?: number;
}

const statusLabels = {
  played: 'Played',
  want_to_play: 'Want to Play',
};

export default function GamePage() {
  const { slug } = useParams();
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userGameStatus, setUserGameStatus] = useState<null | 'played' | 'want_to_play'>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const lastIncrementedSlug = useRef<string | null>(null);
  const [upvotes, setUpvotes] = useState<number>(0);
  const [downvotes, setDownvotes] = useState<number>(0);
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null);

  useEffect(() => {
    setGame(null);
    setLoading(true);
    fetch(`/api/game/${slug}`)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        setGame(data);
        setUpvotes(data.upvotes || 0);
        setDownvotes(data.downvotes || 0);
        setError(null);
      })
      .catch(() => setError('Game not found'))
      .finally(() => setLoading(false));
    lastIncrementedSlug.current = null;
    // Fetch user vote
    fetch(`/api/game/${slug}?userVote=1`).then(res => res.json()).then(data => {
      if (data.vote === 'upvote' || data.vote === 'downvote') setUserVote(data.vote);
      else setUserVote(null);
    });
  }, [slug]);

  useEffect(() => {
    if (game && game.slug && lastIncrementedSlug.current !== game.slug) {
      fetch(`/api/game/${game.slug}/view`, { method: 'POST' });
      lastIncrementedSlug.current = game.slug;
    }
  }, [game]);

  // Fetch user game status
  useEffect(() => {
    if (!game?.slug) return;
    setStatusLoading(true);
    fetch(`/api/game/${game.slug}?userGameList=1`)
      .then(res => res.json())
      .then(data => setUserGameStatus(data.status))
      .finally(() => setStatusLoading(false));
  }, [game?.slug]);

  const handleStatusClick = async (type: 'played' | 'want_to_play') => {
    if (statusLoading) return;
    setStatusLoading(true);
    // Optimistic update
    setUserGameStatus(prev => (prev === type ? null : type));
    await fetch(`/api/game/${game.slug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    });
    setStatusLoading(false);
  };

  const handleUpvote = async () => {
    if (!game?.slug) return;
    const res = await fetch(`/api/game/${game.slug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'upvote' }),
    });
    if (res.ok) {
      const data = await res.json();
      setUpvotes(data.upvotes);
      setDownvotes(data.downvotes);
      setUserVote(data.userVote || 'upvote');
    }
  };

  const handleDownvote = async () => {
    if (!game?.slug) return;
    const res = await fetch(`/api/game/${game.slug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'downvote' }),
    });
    if (res.ok) {
      const data = await res.json();
      setUpvotes(data.upvotes);
      setDownvotes(data.downvotes);
      setUserVote(data.userVote || 'downvote');
    }
  };

  if (loading) return <div className="text-center text-gray-400 mt-12">Loading game...</div>;
  if (error || !game) return notFound();

  const pcPlatform = game.platforms?.find((p: any) => p.platform.slug === 'pc');

  return (
    <main className="relative min-h-screen text-white">
      {/* Full-page background image */}
      {game.background_image && (
        <div
          className="fixed inset-0 z-0 w-full h-full"
          style={{
            backgroundImage: `url(${game.background_image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="absolute inset-0 bg-black/30" />
        </div>
      )}
      {/* Hero + Played/Want to Play Buttons (locked at top) */}
      <div className="relative z-10 flex flex-col items-start justify-end min-h-[80vh] pb-8 pl-4">
        <div className="w-full max-w-5xl">
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
            platforms={game.platforms}
            description={game.description}
            onPlayedClick={() => handleStatusClick('played')}
            onWantToPlayClick={() => handleStatusClick('want_to_play')}
            userGameStatus={userGameStatus}
            statusLoading={statusLoading}
            upvotes={upvotes}
            downvotes={downvotes}
            onUpvote={handleUpvote}
            onDownvote={handleDownvote}
            playtime={game.playtime}
            userVote={userVote}
          />
        </div>
      </div>
      {/* Scroll-to-reveal content */}
      <div className="relative z-10">
        <div className="container mx-auto px-2 sm:px-4 py-4 md:py-8 flex flex-col gap-8">
          {/* Main Content */}
          <div className="w-full space-y-8">
            

            {/* Media Tabs */}
            <MediaTabs screenshots={game.screenshots} videos={game.video_data} />

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

          {/* Sidebar: now below main content */}
          <aside className="w-full max-w-2xl mx-auto mt-8">
            <GameDetailsSidebar game={game} />
          </aside>
        </div>
      </div>
    </main>
  );
}