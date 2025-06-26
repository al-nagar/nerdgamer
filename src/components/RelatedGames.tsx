import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

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

function GameGrid({ games, showCount }: { games: RelatedGame[], showCount?: number }) {
  const [showAll, setShowAll] = useState(false);
  const maxToShow = showAll || !showCount ? games.length : showCount;
  const visibleGames = games.slice(0, maxToShow);
  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '22px',
          margin: '0 auto',
          width: '100%',
          maxWidth: 900,
          justifyItems: 'center',
        }}
      >
        {visibleGames.map((game) => (
          <Link
            key={game.id}
            href={`/game/${game.slug}`}
            style={{
              background: 'rgba(20,20,20,0.82)',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 2px 10px 0 rgba(0,0,0,0.13)',
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 260,
              maxWidth: 340,
              width: '100%',
              transition: 'background 0.3s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(40,40,40,0.95)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(20,20,20,0.82)')}
          >
            <div style={{ position: 'relative', height: 130, width: '100%' }}>
              {game.background_image ? (
                <Image
                  src={game.background_image}
                  alt={game.name}
                  fill
                  style={{ objectFit: 'cover', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', background: '#444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#bbb', fontSize: 15 }}>No Image</span>
                </div>
              )}
            </div>
            <div style={{ padding: '18px 18px 12px 18px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <h3 style={{ fontWeight: 700, color: '#fff', marginBottom: 10, fontSize: '1.13em', lineHeight: 1.2, minHeight: 44, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {game.name}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, color: '#bbb', fontWeight: 500 }}>
                {game.released && (
                  <span>{new Date(game.released).getFullYear()}</span>
                )}
                {game.rating && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <span style={{ color: '#fbbf24', fontSize: 17 }}>★</span>
                    {game.rating.toFixed(1)}
                  </span>
                )}
                {game.metacritic && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <span style={{ color: '#4ade80', fontSize: 17 }}>●</span>
                    {game.metacritic}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
      {games.length > (showCount || 6) && (
        <button
          onClick={() => setShowAll(!showAll)}
          style={{
            margin: '24px auto 0 auto',
            display: 'block',
            background: 'none',
            border: 'none',
            color: '#60a5fa',
            fontWeight: 700,
            fontSize: '1.08em',
            textDecoration: 'underline',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          {showAll ? 'Show Less' : `Show More (${games.length - (showCount || 6)} more)`}
        </button>
      )}
    </>
  );
}

export default function RelatedGames({ additions, gameSeries, parentGames }: RelatedGamesProps) {
  if (!((additions && additions.length) || (gameSeries && gameSeries.length) || (parentGames && parentGames.length))) {
    return (
      <div style={{
        background: 'rgba(20,20,20,0.82)',
        borderRadius: '18px',
        boxShadow: '0 2px 10px 0 rgba(0,0,0,0.13)',
        padding: '32px 0 28px 0',
        textAlign: 'center',
        maxWidth: 900,
        margin: '32px auto',
      }}>
        <h2 style={{ marginBottom: 10, fontSize: '1.6rem', fontWeight: 700, textAlign: 'center' }}>Related Games</h2>
        <div style={{ marginBottom: 18, color: '#bbb', fontSize: '1.05rem', textAlign: 'center' }}>
          No related games, DLCs, or series found for this title.
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(20,20,20,0.82)',
      borderRadius: '18px',
      boxShadow: '0 2px 10px 0 rgba(0,0,0,0.13)',
      padding: '32px 0 28px 0',
      textAlign: 'center',
      maxWidth: 900,
      margin: '32px auto',
    }}>
      <h2 style={{ marginBottom: 10, fontSize: '1.6rem', fontWeight: 700, textAlign: 'center' }}>Related Games</h2>
      <div style={{ marginBottom: 18, color: '#bbb', fontSize: '1.05rem', textAlign: 'center' }}>
        Discover related games, DLCs, and series.
      </div>
      {additions && additions.length > 0 && (
        <>
          <h3 style={{ fontSize: '1.08em', fontWeight: 700, color: '#fff', margin: '18px 0 8px 0', textAlign: 'left', paddingLeft: 32 }}>DLCs & Editions</h3>
          <GameGrid games={additions} showCount={6} />
        </>
      )}
      {gameSeries && gameSeries.length > 0 && (
        <>
          <h3 style={{ fontSize: '1.08em', fontWeight: 700, color: '#fff', margin: '18px 0 8px 0', textAlign: 'left', paddingLeft: 32 }}>Game Series</h3>
          <GameGrid games={gameSeries} showCount={6} />
        </>
      )}
      {parentGames && parentGames.length > 0 && (
        <>
          <h3 style={{ fontSize: '1.08em', fontWeight: 700, color: '#fff', margin: '18px 0 8px 0', textAlign: 'left', paddingLeft: 32 }}>Parent Games</h3>
          <GameGrid games={parentGames} showCount={6} />
        </>
      )}
    </div>
  );
} 