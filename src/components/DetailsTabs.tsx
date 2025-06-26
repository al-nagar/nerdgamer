'use client';

import { useState, FC } from 'react';
import type { ReactElement } from 'react';
import SystemRequirements from './SystemRequirements';
import LanguageSupportTable from './LanguageSupportTable';
import AgeRatingDisplay from './AgeRatingDisplay';
import AlternativeNamesList from './AlternativeNamesList';
import GameDetailsTab from './GameDetailsTab';
import { FaBookOpen, FaPlus, FaTrophy, FaSteam, FaXbox, FaPlaystation, FaApple, FaGooglePlay, FaGlobe, FaGamepad, FaItchIo } from 'react-icons/fa';
import { SiGogdotcom, SiEpicgames, SiNintendo, SiHumblebundle } from 'react-icons/si';
import RelatedGames from './RelatedGames';

interface HowLongToBeatProps {
  times?: {
    hastily?: { value: number; unit: string };
    normally?: { value: number; unit: string };
    completely?: { value: number; unit: string };
  };
}

const HowLongToBeat: FC<HowLongToBeatProps & { playtime?: number }> = ({ times, playtime }) => {
  if (!times) return (
    <div className="bg-gray-900/80 p-4 md:p-6 rounded-xl border border-gray-700 flex flex-col items-center min-w-[220px]">
      <span className="text-gray-400 mb-2">Sorry, the How Long to Beat data is not available for this game.</span>
      <a
        href="https://howlongtobeat.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 underline hover:text-blue-300 font-semibold mt-2"
      >
        Try searching for this game on HowLongToBeat
      </a>
    </div>
  );

  // Use playtime from prop if available, otherwise calculate average
  let avgPlaytime = null;
  if (typeof playtime === 'number' && playtime > 0) {
    avgPlaytime = playtime;
  } else {
    const playtimes = [times.hastily?.value, times.normally?.value, times.completely?.value].filter(v => typeof v === 'number');
    if (playtimes.length > 0) {
      const avg = playtimes.reduce((a, b) => a + b, 0) / playtimes.length;
      avgPlaytime = Math.round(avg);
    }
  }

  const statBlock = [
    {
      icon: <FaBookOpen size={36} color="#60a5fa" />,
      value: times.hastily ? `${times.hastily.value} ${times.hastily.unit}` : 'N/A',
      label: 'Main Story',
    },
    {
      icon: <FaPlus size={36} color="#34d399" />,
      value: times.normally ? `${times.normally.value} ${times.normally.unit}` : 'N/A',
      label: 'Main + Extras',
    },
    {
      icon: <FaTrophy size={36} color="#fbbf24" />,
      value: times.completely ? `${times.completely.value} ${times.completely.unit}` : 'N/A',
      label: 'Completionist',
    },
  ];
  return (
    <div>
      {avgPlaytime && (
        <div className="flex justify-center w-full mb-6">
          <span className="bg-black/60 px-4 py-1 rounded-full text-white text-base font-bold tracking-widest uppercase inline-block">
            AVERAGE PLAYTIME: {avgPlaytime} HOURS
          </span>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
        {statBlock.map((stat, idx) => (
          <div
            key={idx}
            style={{
              background: 'rgba(20,20,20,0.7)',
              borderRadius: '1rem',
              padding: '2rem 1rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 0,
            }}
          >
            <div style={{ marginBottom: '0.5rem' }}>{stat.icon}</div>
            <div style={{ fontSize: '1.7rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.3rem' }}>{stat.value}</div>
            <div style={{ fontSize: '0.95rem', color: '#aaa', fontWeight: 500 }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface Store {
  id: number;
  store: { id: number; name: string; slug: string; domain: string };
  url: string;
}
interface WhereToBuyProps {
  stores?: Store[];
}

const storeIconMap: Record<string, React.ReactNode> = {
  steam: <FaSteam size={28} style={{ marginRight: 10 }} color="#60a5fa" />,
  gog: <SiGogdotcom size={28} style={{ marginRight: 10 }} color="#a3e635" />,
  'epic-games': <SiEpicgames size={28} style={{ marginRight: 10 }} color="#fff" />,
  'xbox-store': <FaXbox size={28} style={{ marginRight: 10 }} color="#22d3ee" />,
  'playstation-store': <FaPlaystation size={28} style={{ marginRight: 10 }} color="#3b82f6" />,
  nintendo: <SiNintendo size={28} style={{ marginRight: 10 }} color="#ef4444" />,
  itch: <FaItchIo size={28} style={{ marginRight: 10 }} color="#f87171" />,
  humble: <SiHumblebundle size={28} style={{ marginRight: 10 }} color="#f472b6" />,
  apple: <FaApple size={28} style={{ marginRight: 10 }} color="#fff" />,
  'google-play': <FaGooglePlay size={28} style={{ marginRight: 10 }} color="#34d399" />,
  web: <FaGlobe size={28} style={{ marginRight: 10 }} color="#fff" />,
};

function getStoreIcon(slug: string) {
  return storeIconMap[slug] || <FaGamepad size={28} style={{ marginRight: 10 }} color="#fff" />;
}

const Download: FC<WhereToBuyProps & { website?: string }> = ({ stores, website }) => {
  // Responsive grid style
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '22px',
    justifyItems: 'center',
    marginTop: 18,
    width: '100%',
    maxWidth: 600,
    marginLeft: 'auto',
    marginRight: 'auto',
  };
  const buttonStyle: React.CSSProperties = {
    padding: '18px 32px',
    background: 'rgba(30,30,30,0.92)',
    borderRadius: '12px',
    textDecoration: 'none',
    color: 'white',
    fontWeight: 700,
    fontSize: '1.18em',
    letterSpacing: '0.04em',
    boxShadow: '0 1px 4px 0 rgba(0,0,0,0.10)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    minWidth: 0,
    width: '100%',
    maxWidth: 320,
    margin: 0,
    transition: 'background 0.3s, color 0.3s',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
  };
  const buttonHoverStyle: React.CSSProperties = {
    background: 'rgba(60,60,60,0.98)',
    color: 'white',
  };
  const websiteButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: 'linear-gradient(90deg, #2563eb 0%, #1e293b 100%)',
    color: '#fff',
    fontWeight: 800,
    fontSize: '1.18em',
    marginBottom: 0,
    maxWidth: 340,
    transition: 'background 0.3s, color 0.3s',
  };
  const websiteButtonHoverStyle: React.CSSProperties = {
    background: 'linear-gradient(90deg, #1e293b 0%, #2563eb 100%)',
    color: '#fff',
  };
  if ((!stores || stores.length === 0) && !website) return (
    <div style={{
      background: 'rgba(20,20,20,0.82)',
      borderRadius: '18px',
      boxShadow: '0 2px 10px 0 rgba(0,0,0,0.13)',
      padding: '32px 0 28px 0',
      textAlign: 'center',
      maxWidth: 700,
      margin: '32px auto',
    }}>
      <h3 style={{ marginBottom: '10px', fontSize: '1.6rem', fontWeight: 700, textAlign: 'center' }}>Download Links</h3>
      <div style={{ marginBottom: 18, color: '#bbb', fontSize: '1.05rem', textAlign: 'center' }}>
        No digital download or store links are available for this game.
      </div>
    </div>
  );
  return (
    <div style={{
      background: 'rgba(20,20,20,0.82)',
      borderRadius: '18px',
      boxShadow: '0 2px 10px 0 rgba(0,0,0,0.13)',
      padding: '32px 0 28px 0',
      textAlign: 'center',
      maxWidth: 700,
      margin: '32px auto',
    }}>
      <h3 style={{ marginBottom: '10px', fontSize: '1.6rem', fontWeight: 700, textAlign: 'center' }}>Download Links</h3>
      <div style={{ marginBottom: 18, color: '#bbb', fontSize: '1.05rem', textAlign: 'center' }}>
        Official digital download and store links for this game.
      </div>
      {/* Official Website Button */}
      {website && (
        <div style={{ marginBottom: 24, width: '100%', display: 'flex', justifyContent: 'center' }}>
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="official-website-btn"
          >
            <FaGlobe size={28} style={{ marginRight: 10 }} />
            Official Website
          </a>
          <style jsx>{`
            .official-website-btn {
              padding: 18px 32px;
              background: linear-gradient(90deg, #2563eb 0%, #1e293b 100%);
              color: #fff;
              font-weight: 800;
              font-size: 1.18em;
              margin-bottom: 0;
              max-width: 340px;
              border-radius: 12px;
              text-decoration: none;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 64px;
              width: 100%;
              box-shadow: 0 1px 4px 0 rgba(0,0,0,0.10);
              letter-spacing: 0.04em;
              border: none;
              outline: none;
              cursor: pointer;
              transition: background 0.5s cubic-bezier(.4,0,.2,1), color 0.3s;
            }
            .official-website-btn:hover {
              background: linear-gradient(90deg, #1e293b 0%, #2563eb 100%);
              color: #fff;
            }
          `}</style>
        </div>
      )}
      {/* Store Links Grid */}
      {stores && stores.length > 0 && (
        <div style={gridStyle}>
          {stores.map((s) => (
            <a
              key={s.id}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              style={buttonStyle}
              onMouseEnter={e => Object.assign(e.currentTarget.style, buttonHoverStyle)}
              onMouseLeave={e => Object.assign(e.currentTarget.style, buttonStyle)}
            >
              {getStoreIcon(s.store.slug)}
              {s.store.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

interface GameDetailsProps {
  game: any;
}

// Helper to map age rating to a simple label (copied from GameDetailsSidebar)
function getSimpleAgeRating(ageRatings?: any[]): string | null {
  if (!ageRatings || ageRatings.length === 0) return null;
  const priorities = ['ESRB', 'PEGI', 'CERO', 'USK', 'GRAC', 'CLASSIND', 'ACB'];
  let best: any = null;
  for (const org of priorities) {
    best = ageRatings.find(r => r.organization?.name?.toUpperCase().includes(org));
    if (best) break;
  }
  if (!best) best = ageRatings[0];
  const label = (best.rating_category?.rating || '').toLowerCase();
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
  if (label === 'e') return 'Everyone';
  if (label === 'e10+' || label === 'e 10+') return '+10';
  if (label === 't') return '+13';
  if (label === 'm') return '+17';
  if (label === 'ao') return '+18';
  if (label.match(/\d+/)) return `+${label.match(/\d+/)[0]}`;
  return best.rating_category?.rating || null;
}

const pillClass = "bg-gray-700 px-2 py-1 rounded text-xs text-white border border-gray-600 mr-2 mb-2 inline-block";

const GameDetails: FC<GameDetailsProps> = ({ game }) => (
  <div className="space-y-6">
    {/* Genres */}
    <div>
      <h4 className="text-gray-300 font-semibold mb-1">Genres</h4>
      <div className="flex flex-wrap gap-2">
        {game.genres && game.genres.length > 0 ? (
          game.genres.map((g: any, idx: number) => (
            <span key={g.id || idx} className={pillClass}>{g.name}</span>
          ))
        ) : (
          <span className="text-gray-400">N/A</span>
        )}
      </div>
    </div>
    {/* Themes */}
    <div>
      <h4 className="text-gray-300 font-semibold mb-1">Themes</h4>
      <div className="flex flex-wrap gap-2">
        {game.themes && game.themes.length > 0 ? (
          game.themes.map((t: any, idx: number) => (
            <span key={t.id || idx} className={pillClass}>{t.name}</span>
          ))
        ) : (
          <span className="text-gray-400">N/A</span>
        )}
      </div>
    </div>
    {/* Tags */}
    <div>
      <h4 className="text-gray-300 font-semibold mb-1">Tags</h4>
      <div className="flex flex-wrap gap-2">
        {game.tags && game.tags.length > 0 ? (
          game.tags.map((tag: any, idx: number) => (
            <span key={tag.id || idx} className={pillClass}>{tag.name}</span>
          ))
        ) : (
          <span className="text-gray-400">N/A</span>
        )}
      </div>
    </div>
    {/* Franchises */}
    <div>
      <h4 className="text-gray-300 font-semibold mb-1">Franchises</h4>
      <div className="flex flex-wrap gap-2">
        {game.franchises && game.franchises.length > 0 ? (
          game.franchises.map((f: any, idx: number) => (
            <span key={f.id || idx} className={pillClass}>{f.name}</span>
          ))
        ) : (
          <span className="text-gray-400">N/A</span>
        )}
      </div>
    </div>
    {/* Game Engine */}
    <div>
      <h4 className="text-gray-300 font-semibold mb-1">Game Engine</h4>
      <span className="text-white">{game.game_engines?.[0]?.name || 'N/A'}</span>
    </div>
    {/* Publishers & Developers */}
    <div className="flex flex-wrap gap-8">
      <div>
        <h4 className="text-gray-300 font-semibold mb-1">Publishers</h4>
        <span className="text-white">{game.publishers?.map((p: any) => p.name).join(', ') || 'N/A'}</span>
      </div>
      <div>
        <h4 className="text-gray-300 font-semibold mb-1">Developers</h4>
        <span className="text-white">{game.developers?.map((d: any) => d.name).join(', ') || 'N/A'}</span>
      </div>
    </div>
    {/* Metacritic, Website, Age Rating */}
    <div className="flex flex-wrap gap-4 items-center">
      {game.metacritic && (
        <span className="bg-green-700 text-white px-3 py-1 rounded text-xs font-semibold">Metacritic: {game.metacritic}</span>
      )}
      {game.website && (
        <a
          href={game.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline break-all hover:text-blue-300 font-semibold"
        >
          Official Website
        </a>
      )}
      {getSimpleAgeRating(game.age_ratings) && (
        <span className="bg-gray-700 text-white px-3 py-1 rounded text-xs font-semibold">Age Rating: {getSimpleAgeRating(game.age_ratings)}</span>
      )}
    </div>
    {/* Alternative Names */}
    {game.alternative_names?.length > 0 && (
      <div>
        <h4 className="text-gray-300 font-semibold mb-1">Alternative Names</h4>
        <AlternativeNamesList names={game.alternative_names} />
      </div>
    )}
  </div>
);

interface DetailsTabsProps {
  game: any;
}

type TabKey = 'details' | 'requirements' | 'howlongtobeat' | 'related' | 'stores' | 'languages' | 'ratings';
interface Tab {
  label: string;
  component: ReactElement;
  available: boolean;
}

const DetailsTabs: FC<DetailsTabsProps> = ({ game }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('details');
  const pcPlatform = game.platforms?.find((p: any) => p.platform.slug === 'pc');
  const minimum = pcPlatform?.requirements?.minimum;
  const recommended = pcPlatform?.requirements?.recommended;

  const tabs: Record<TabKey, Tab> = {
    details: { label: 'Game Details', component: <GameDetailsTab game={game} />, available: true },
    requirements: { label: 'System Requirements', component: <SystemRequirements minimum={minimum} recommended={recommended} />, available: true },
    howlongtobeat: { label: 'How Long to Beat', component: <HowLongToBeat times={game.completion_times} playtime={game.playtime} />, available: !!game.completion_times },
    related: { label: 'Related Games', component: <RelatedGames additions={game.additions} gameSeries={game.game_series} parentGames={game.parent_games} />, available: (game.additions?.length ?? 0) > 0 || (game.game_series?.length ?? 0) > 0 || (game.parent_games?.length ?? 0) > 0 },
    stores: { label: 'Download Links', component: <Download stores={game.stores} website={game.website} />, available: (game.stores?.length ?? 0) > 0 || !!game.website },
    languages: { label: 'Languages', component: <LanguageSupportTable data={game.supported_languages} />, available: game.supported_languages && Object.keys(game.supported_languages).length > 0 },
    ratings: { label: 'Age Rating', component: <AgeRatingDisplay ratings={game.age_ratings} />, available: game.age_ratings?.length > 0 },
  };

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-black/30 backdrop-blur-md py-6 px-2 sm:px-6 mb-8">
      {/* Tab bar */}
      <div className="flex justify-center w-full mb-6">
        <div className="flex gap-2 bg-white/10 backdrop-blur-md rounded-full px-2 py-1 border border-white/10">
          {Object.entries(tabs).map(([key, tab]) =>
            tab.available && (
              <button
                key={key}
                onClick={() => setActiveTab(key as TabKey)}
                className={`px-4 py-1 rounded-full text-base font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 border ${
                  activeTab === key
                    ? 'bg-blue-500/70 text-white border-blue-400'
                    : 'bg-white/10 text-white border-transparent hover:bg-white/20'
                }`}
                aria-selected={activeTab === key}
                tabIndex={0}
              >
                {tab.label}
              </button>
            )
          )}
        </div>
      </div>
      {/* Tab content */}
      <div className="w-full bg-transparent rounded-xl mt-4 p-4 md:p-6">
        {tabs[activeTab]?.component}
      </div>
    </div>
  );
};

export default DetailsTabs; 