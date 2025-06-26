"use client";
import { useState } from "react";
import AlternativeNamesList from './AlternativeNamesList';

interface GameDetailsTabProps {
  game: any;
}

const pillClass = "font-semibold text-white mr-2 mb-2 inline-block";

function formatDate(dateStr?: string) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString();
}

// Helper to map age rating to a simple label (from GameDetailsSidebar)
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

export default function GameDetailsTab({ game }: GameDetailsTabProps) {
  const [showAllTags, setShowAllTags] = useState(false);
  const tags = game.tags || [];
  const tagsToShow = showAllTags ? tags : tags.slice(0, 10);
  const platforms = game.platforms || [];
  const ratings = game.age_ratings || [];

  return (
    <div className="space-y-8">
      {/* Name at the top */}
      <h2 className="text-2xl font-bold text-white mb-2">{game.name}</h2>
      {/* Two-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Core Facts */}
        <div>
          <h4 className="text-gray-300 font-semibold mb-3 text-lg">Core Facts</h4>
          <div className="mb-2">
            <span className="text-gray-400 font-medium">Release Date: </span>
            <span className="text-white">{formatDate(game.released)}</span>
          </div>
          <div className="mb-2">
            <span className="text-gray-400 font-medium">Platforms: </span>
            <span>
              {platforms.length > 0 ? (
                platforms.map((p: any, idx: number) => (
                  <span key={p.platform?.id || idx} className={pillClass}>{p.platform?.name}</span>
                ))
              ) : (
                <span className="text-gray-400">N/A</span>
              )}
            </span>
          </div>
          <div className="mb-2">
            <span className="text-gray-400 font-medium">Developer: </span>
            <span className="text-white-200 font-semibold">{game.developers?.map((d: any) => d.name).join(", ") || "N/A"}</span>
          </div>
          <div className="mb-2">
            <span className="text-gray-400 font-medium">Publisher: </span>
            <span className="text-white-200 font-semibold">{game.publishers?.map((p: any) => p.name).join(", ") || "N/A"}</span>
          </div>
          <div className="mb-2">
            <span className="text-gray-400 font-medium">Game Engine: </span>
            <span className="text-white-200 font-semibold">{game.game_engines?.[0]?.name || "N/A"}</span>
          </div>
          {game.metacritic && (
            <div className="mb-2">
              <span className="text-gray-400 font-medium">Metacritic: </span>
              <span className="bg-green-700 text-white px-2 py-1 rounded text-xs font-semibold ml-1">{game.metacritic}</span>
            </div>
          )}
          <div className="mb-2">
            <span className="text-gray-400 font-medium">Average Playtime: </span>
            <span className="text-white">{game.playtime ? `${game.playtime}h` : 'N/A'}</span>
          </div>
          {/* Age Rating in Core Facts */}
          {getSimpleAgeRating(ratings) && (
            <div className="mb-2">
              <span className="text-gray-400 font-medium">Age Rating: </span>
              <span className="font-semibold text-white ml-1">
                {getSimpleAgeRating(ratings)}
              </span>
            </div>
          )}
          {game.website && (
            <div className="mb-2">
              <span className="text-gray-400 font-medium">Official Website: </span>
              <a
                href={game.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline break-all hover:text-blue-300 font-semibold"
              >
                {game.website}
              </a>
            </div>
          )}
        </div>
        {/* Right: Classification */}
        <div>
          <h4 className="text-gray-300 font-semibold mb-3 text-lg">Classification</h4>
          <div className="mb-2">
            <span className="text-gray-400 font-medium">Genres: </span>
            <span>
              {game.genres && game.genres.length > 0 ? (
                game.genres.map((g: any, idx: number) => (
                  <span key={g.id || idx} className={pillClass}>{g.name}</span>
                ))
              ) : (
                <span className="text-gray-400">N/A</span>
              )}
            </span>
          </div>
          <div className="mb-2">
            <span className="text-gray-400 font-medium">Themes: </span>
            <span>
              {game.themes && game.themes.length > 0 ? (
                game.themes.map((t: any, idx: number) => (
                  <span key={t.id || idx} className={pillClass}>{t.name}</span>
                ))
              ) : (
                <span className="text-gray-400">N/A</span>
              )}
            </span>
          </div>
          <div className="mb-2">
            <span className="text-gray-400 font-medium">Game Modes: </span>
            <span>
              {game.game_modes && game.game_modes.length > 0 ? (
                game.game_modes.map((m: any, idx: number) => (
                  <span key={m.id || idx} className={pillClass}>{m.name}</span>
                ))
              ) : (
                <span className="text-gray-400">N/A</span>
              )}
            </span>
          </div>
          <div className="mb-2">
            <span className="text-gray-400 font-medium">Player Perspectives: </span>
            <span>
              {game.player_perspectives && game.player_perspectives.length > 0 ? (
                game.player_perspectives.map((p: any, idx: number) => (
                  <span key={p.id || idx} className={pillClass}>{p.name}</span>
                ))
              ) : (
                <span className="text-gray-400">N/A</span>
              )}
            </span>
          </div>
          {/* Tags in Classification */}
          <div className="mb-2">
            <span className="text-gray-400 font-medium">Tags: </span>
            <span>
              {tagsToShow.length > 0 ? (
                tagsToShow.map((tag: any, idx: number) => (
                  <span key={tag.id || idx} className={pillClass}>{tag.name}</span>
                ))
              ) : (
                <span className="text-gray-400">N/A</span>
              )}
            </span>
            {tags.length > 10 && (
              <div>
                <button
                  className="mt-2 text-blue-400 font-bold underline hover:text-blue-300 transition-colors text-base px-0 py-0 border-0 bg-transparent shadow-none outline-none"
                  style={{ boxShadow: 'none', border: 'none', background: 'none' }}
                  onClick={() => setShowAllTags((v) => !v)}
                >
                  {showAllTags ? "Show Less" : `Show All ${tags.length} Tags`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Alternative Names Section */}
      {game.alternative_names?.length > 0 && (
        <div>
          <h4 className="text-gray-300 font-semibold mb-1">Alternative Names</h4>
          <AlternativeNamesList names={game.alternative_names} />
        </div>
      )}
    </div>
  );
} 