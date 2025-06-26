import Image from 'next/image';
import { FaArrowAltCircleUp, FaArrowAltCircleDown, FaArrowUp, FaArrowDown, FaThumbsUp, FaThumbsDown, FaWindows, FaPlaystation, FaXbox, FaApple, FaLinux, FaAndroid, FaGlobe, FaGamepad } from 'react-icons/fa';
import { MdCheckCircleOutline, MdChecklist } from 'react-icons/md';
import React, { useState, useRef, useEffect } from 'react';

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
  genres?: Array<{ name: string }>;
  ratingTop?: number;
  platforms?: Array<{ platform: { name: string, slug: string } }>;
  description?: string;
  onPlayedClick?: () => void;
  onWantToPlayClick?: () => void;
  onUpvote?: () => void;
  onDownvote?: () => void;
  userGameStatus?: 'played' | 'want_to_play' | null;
  statusLoading?: boolean;
  upvotes?: number;
  downvotes?: number;
  playtime?: number;
  userVote?: 'upvote' | 'downvote' | null;
  age_ratings?: any[];
}

function yearsSinceRelease(released: string): string | null {
  const releaseDate = new Date(released);
  const now = new Date();
  const years = now.getFullYear() - releaseDate.getFullYear();
  return years > 0 ? `${years} years ago` : null;
}

function truncateHtmlPreserveTags(html: string, maxLength: number): string {
  // Truncate HTML but preserve tags (simple version: strip tags, truncate at last space, then wrap in <span>)
  const div = document.createElement('div');
  div.innerHTML = html;
  let text = div.textContent || div.innerText || '';
  if (text.length > maxLength) {
    let truncated = text.slice(0, maxLength);
    // Cut at last space to avoid breaking words
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 0) truncated = truncated.slice(0, lastSpace);
    return truncated;
  }
  return text;
}

function injectShowLessButton(html: string, buttonHtml: string): string {
  // If there are <p> tags, inject the button at the end of the last <p>
  const pTagMatch = html.match(/<p[\s\S]*?>[\s\S]*?<\/p>/gi);
  if (pTagMatch && pTagMatch.length > 0) {
    const lastP = pTagMatch[pTagMatch.length - 1];
    const newLastP = lastP.replace(/<\/p>$/, buttonHtml + '</p>');
    return html.replace(lastP, newLastP);
  }
  // Otherwise, just append to the end
  return html + buttonHtml;
}

// Helper to map age rating to a simple label (copied from GameDetailsSidebar)
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
  genres,
  ratingTop,
  platforms,
  description,
  onPlayedClick,
  onWantToPlayClick,
  onUpvote,
  onDownvote,
  userGameStatus,
  statusLoading,
  upvotes,
  downvotes,
  playtime,
  userVote,
  age_ratings,
}: GameHeaderProps) {
  const modeNames = gameModes?.map(m => m.name).join(', ') || '';
  const perspectiveNames = playerPerspectives?.map(p => p.name).join(', ') || '';
  const genreNames = genres?.map(g => g.name).join(', ') || '';
  const combinedDetails = [modeNames, perspectiveNames].filter(Boolean).join(', ');

  // Map platform names to icons
  function getPlatformIcon(name: string, slug: string): React.ReactElement {
    const n = name.toLowerCase();
    const s = slug.toLowerCase();
    if (n.includes('windows') || n === 'pc' || s === 'pc' || s.includes('windows') || s.includes('microsoft')) return <FaWindows className="text-white" size={28} title={name} />;
    if (n.includes('playstation') || s.includes('playstation') || s === 'ps4' || s === 'ps5') return <FaPlaystation className="text-white" size={28} title={name} />;
    if (n.includes('xbox') || s.includes('xbox')) return <FaXbox className="text-white" size={28} title={name} />;
    if (n.includes('mac') || n.includes('apple') || s.includes('mac')) return <FaApple className="text-white" size={28} title={name} />;
    if (n.includes('linux') || s.includes('linux')) return <FaLinux className="text-white" size={28} title={name} />;
    if (n.includes('android') || s.includes('android')) return <FaAndroid className="text-white" size={28} title={name} />;
    if (n.includes('nintendo') || s.includes('nintendo') || s === 'switch') return <FaGamepad className="text-white" size={28} title={name} />;
    if (n.includes('web') || n.includes('browser') || s.includes('web')) return <FaGlobe className="text-white" size={28} title={name} />;
    return <FaGamepad className="text-white" size={28} title={name} />;
  }

  function getPlatformIcons(platforms: Array<{ platform: { name: string, slug: string } }>): React.ReactElement[] | null {
    if (!platforms) return null;
    // Show an icon for each unique platform type
    const typeSeen = new Set<string>();
    const icons: React.ReactElement[] = [];
    platforms.forEach((p) => {
      const name = p.platform.name;
      const slug = p.platform.slug || '';
      const n = name.toLowerCase();
      const s = slug.toLowerCase();
      let type = 'other';
      if (n.includes('windows') || n === 'pc' || s === 'pc' || s.includes('windows') || s.includes('microsoft')) type = 'windows';
      else if (n.includes('playstation') || s.includes('playstation') || s === 'ps4' || s === 'ps5') type = 'playstation';
      else if (n.includes('xbox') || s.includes('xbox')) type = 'xbox';
      else if (n.includes('mac') || n.includes('apple') || s.includes('mac')) type = 'mac';
      else if (n.includes('linux') || s.includes('linux')) type = 'linux';
      else if (n.includes('android') || s.includes('android')) type = 'android';
      else if (n.includes('nintendo') || s.includes('nintendo') || s === 'switch') type = 'nintendo';
      else if (n.includes('web') || n.includes('browser') || s.includes('web')) type = 'web';
      if (!typeSeen.has(type)) {
        typeSeen.add(type);
        icons.push(React.cloneElement(getPlatformIcon(name, slug), { key: type }));
      }
      // Debug: log all platform names and slugs
      // console.log('Platform:', name, slug);
    });
    return icons;
  }

  const pills = [
    released && (
      <span key="release" className="bg-black/60 px-4 py-1 rounded-full text-gray-200 text-base mr-2 mb-2 inline-block">
        {new Date(released).toLocaleDateString()}
        {(() => {
          const years = yearsSinceRelease(released);
          return years ? (
            <span className="ml-2 bg-gray-800 text-white font-bold text-xs px-2 py-0.5 rounded uppercase">
              {years}
            </span>
          ) : null;
        })()}
      </span>
    ),
    platforms && platforms.length > 0 && (
      <div key="platforms" className="bg-black/60 px-4 py-1 rounded-full mr-2 mb-2 inline-flex flex-row gap-3 items-center">
        {getPlatformIcons(platforms)}
      </div>
    ),
    rating && (
      <span key="rating" className="bg-black/60 px-4 py-1 rounded-full flex items-center gap-2 text-yellow-300 text-base mr-2 mb-2 inline-block">
        <span className="bg-gray-800 text-white font-bold text-xs px-2 py-0.5 rounded mr-1">RAWG</span>
        <span className="mr-1">⭐</span> {rating.toFixed(1)}{ratingTop ? `/${ratingTop}` : ''}
        {ratingsCount && (
          <span className="text-gray-400 ml-2">({ratingsCount.toLocaleString()})</span>
        )}
      </span>
    ),
    playtime && (
      <span key="playtime" className="bg-black/60 px-4 py-1 rounded-full text-white text-base mr-2 mb-2 inline-block font-bold tracking-widest uppercase">
        AVERAGE PLAYTIME: {playtime} HOURS
      </span>
    )
  ].filter(Boolean);

  const [showFullDescription, setShowFullDescription] = useState(false);
  const isLong = (description && (description.replace(/<[^>]+>/g, '').length > 250));
  const descriptionRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    if (showFullDescription && descriptionRef.current) {
      const rect = descriptionRef.current.getBoundingClientRect();
      const isFullyVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
      if (!isFullyVisible) {
        descriptionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [showFullDescription]);

  return (
    <div
      className="w-full h-screen min-h-[100vh] flex items-end justify-start relative"
      style={{ padding: 0 }}
    >
      <div className="z-10 flex flex-col items-start justify-end w-full" style={{padding: 0}}>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-left drop-shadow-lg" style={{fontSize: '3.5rem'}}>{name}</h1>
        <div className="flex flex-wrap gap-2 mb-3">
          {pills}
        </div>
        {combinedDetails && (
          <div className="text-lg mb-3 flex flex-wrap items-center gap-2">
            {modeNames && (
              <span className="bg-gray-900/60 text-white-200 px-3 py-1 rounded-full font-medium text-base">
                {modeNames}
              </span>
            )}
            {modeNames && perspectiveNames && (
              <span className="mx-2 text-gray-400 font-bold text-xl">•</span>
            )}
            {perspectiveNames && (
              <span className="bg-gray-900/60 text-white-200 px-3 py-1 rounded-full font-medium text-base">
                {perspectiveNames}
              </span>
            )}
            {/* Simple Age Rating pill (after player perspectives, before website) */}
            {getSimpleAgeRating(age_ratings) && (
              <span className="bg-gray-900/60 text-white-200 px-3 py-1 rounded-full font-medium text-bas">
                {getSimpleAgeRating(age_ratings)}
              </span>
            )}
            {/* Official Website pill */}
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black-600/80 text-white px-3 py-1 rounded-full font-medium text-base flex items-center gap-1 hover:bg-gray-700 transition-colors"
                style={{ textDecoration: 'none' }}
              >
                <span>Official Website</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="inline-block ml-1" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3h7m0 0v7m0-7L10 14m-7 7h7a2 2 0 002-2v-7" /></svg>
              </a>
            )}
          </div>
        )}
        {/* Genres line below game modes and perspectives */}
        {genreNames && (
          <div className="text-base mb-3 flex flex-wrap items-center gap-2">
            <span className="text-gray-300 font-semibold"></span>
            <span className="bg-gray-900/60 text-white-200 px-3 py-1 rounded-full font-medium text-base">{genreNames}</span>
          </div>
        )}
        {description && (
          <div
            ref={el => {
              descriptionRef.current = el;
              aboutRef.current = el;
            }}
            className={`text-gray-200 text-base mb-5 max-w-2xl bg-black/40 hover:bg-black/70 rounded-lg p-4 transition-colors duration-200 ${showFullDescription ? 'max-h-[40vh] overflow-y-auto no-scrollbar' : ''}`}
            style={{ transition: 'max-height 0.3s' }}
          >
            {showFullDescription || !isLong ? (
              (() => {
                if (showFullDescription && isLong) {
                  const buttonHtml = `<button style='color:#60a5fa;background:none;border:none;cursor:pointer;padding:0;margin-left:0.5em;text-decoration:underline;' onclick='window.__showLessDesc && window.__showLessDesc()'>collapse</button>`;
                  // Attach a global handler for the button
                  if (typeof window !== 'undefined') {
                    (window as any).__showLessDesc = () => setShowFullDescription(false);
                  }
                  return <span dangerouslySetInnerHTML={{ __html: injectShowLessButton(description, buttonHtml) }} />;
                } else {
                  return <span dangerouslySetInnerHTML={{ __html: description }} />;
                }
              })()
            ) : (
              <span>
                {truncateHtmlPreserveTags(description, 250)}
                <button
                  className="ml-1 text-blue-400 hover:underline focus:outline-none inline"
                  style={{display: 'inline', padding: 0, background: 'none', border: 'none'}}
                  onClick={() => setShowFullDescription(true)}
                  aria-label="Show more description"
                >
                  ...
                </button>
              </span>
            )}
          </div>
        )}
        <div className="flex gap-3 mt-2">
          <button
            className={`px-5 py-2 rounded font-semibold border transition-colors focus:outline-none ${userGameStatus === 'played' ? 'bg-blue-600/80 border-blue-700 text-white shadow' : 'bg-gray-800/70 border-gray-700 text-gray-300 hover:bg-gray-700/80'} ${statusLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
            onClick={onPlayedClick}
            disabled={statusLoading}
          >
            {userGameStatus === 'played' && (
              <MdCheckCircleOutline className="inline-block mr-2 text-white text-xl align-middle" />
            )}
            Played
          </button>
          <button
            className={`px-5 py-2 rounded font-semibold border transition-colors focus:outline-none ${userGameStatus === 'want_to_play' ? 'bg-blue-600/80 border-blue-700 text-white shadow' : 'bg-gray-800/70 border-gray-700 text-gray-300 hover:bg-gray-700/80'} ${statusLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
            onClick={onWantToPlayClick}
            disabled={statusLoading}
          >
            {userGameStatus === 'want_to_play' && (
              <MdChecklist className="inline-block mr-2 text-white text-xl align-middle" />
            )}
            Want to Play
          </button>
          <div className="flex gap-4 mt-2 items-center">
            <button
              className={`flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold focus:outline-none transition-colors ${userVote === 'upvote' ? 'bg-blue-600/80 text-white' : 'bg-gray-700/70 hover:bg-gray-600/80 text-white'}`}
              onClick={onUpvote}
              aria-label="Upvote"
            >
              <FaArrowUp />
            </button>
            <span
              className={`text-xl font-bold min-w-[32px] text-center ${typeof upvotes === 'number' && typeof downvotes === 'number' ? (upvotes - downvotes > 0 ? 'text-blue-400' : upvotes - downvotes < 0 ? 'text-red-400' : 'text-white') : 'text-white'}`}
            >
              {typeof upvotes === 'number' && typeof downvotes === 'number' ? upvotes - downvotes : 0}
            </span>
            <button
              className={`flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold focus:outline-none transition-colors ${userVote === 'downvote' ? 'bg-red-600/80 text-white' : 'bg-gray-700/70 hover:bg-gray-600/80 text-white'}`}
              onClick={onDownvote}
              aria-label="Downvote"
            >
              <FaArrowDown />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 