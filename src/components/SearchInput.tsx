'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDebounce } from '../hooks/useDebounce';
import { searchGames } from '../lib/api';
import { useRouter } from 'next/navigation';

// Define a type for our game results for better type safety
type Game = {
  id: number;
  name: string;
  background_image: string | null;
  released: string;
  slug: string;
  metacritic?: number | null;
  added?: number;
  creators_count?: number;
  ratings_count?: number;
  reviews_count?: number;
  playtime?: number;
  suggestions_count?: number;
  achievements_count?: number;
  screenshots_count?: number;
  movies_count?: number;
  platforms?: Array<{ platform: { id: number; name: string; slug: string } }>;
  stores?: Array<{ store: { id: number; name: string; slug: string } }>;
  rating?: number;
};

// Add a title similarity function
function titleSimilarity(query: string, name: string): number {
  query = query.trim().toLowerCase();
  name = name.trim().toLowerCase();
  if (name === query) return 10000; // Exact match
  if (name.includes(query)) return 5000; // Substring match
  if (query.split(' ').every(word => name.includes(word))) return 2000; // All words present
  return 0;
}

// --- ENHANCED SCORING FUNCTION ---
const calculateRelevanceScore = (game: Game, searchQuery: string): number => {
  let score = 0;

  // Title similarity boost
  score += titleSimilarity(searchQuery, game.name);

  // --- NEW: Year boost if year in query matches game's release year ---
  const yearMatch = searchQuery.match(/(19|20)\d{2}/);
  if (yearMatch && game.released) {
    const queryYear = parseInt(yearMatch[0], 10);
    const gameYear = new Date(game.released).getFullYear();
    if (queryYear === gameYear) {
      score += 3000; // Strong boost for year match
    }
  }

  // 1. User Engagement (Primary Factor) - 40% weight
  score += (game.added || 0) * 0.4;                    // User lists
  score += (game.ratings_count || 0) * 0.1;            // Number of ratings
  score += (game.reviews_count || 0) * 0.05;           // Number of reviews

  // 2. Critical Acclaim - 25% weight
  score += (game.metacritic || 0) * 5;                 // Metacritic score
  score += (game.rating || 0) * 1000;                  // RAWG rating

  // 3. Game Activity & Engagement - 20% weight
  score += (game.playtime || 0) * 10;                  // Average playtime
  score += (game.suggestions_count || 0) * 0.5;        // User suggestions
  score += (game.achievements_count || 0) * 0.1;       // Achievement count

  // 4. Content Richness - 10% weight
  score += (game.screenshots_count || 0) * 2;          // Screenshots
  score += (game.movies_count || 0) * 5;               // Videos
  score += (game.creators_count || 0) * 1;             // Creators

  // 5. Platform Availability - 5% weight
  score += (game.platforms?.length || 0) * 100;        // More platforms = better
  score += (game.stores?.length || 0) * 50;            // More stores = better

  // 6. Recency Boost (Recent popular games)
  if (game.released) {
    const releaseYear = new Date(game.released).getFullYear();
    const currentYear = new Date().getFullYear();
    const yearsSinceRelease = currentYear - releaseYear;
    
    if (yearsSinceRelease <= 1) {
      score += 2000; // Very recent games
    } else if (yearsSinceRelease <= 3) {
      score += 1000; // Recent games
    } else if (yearsSinceRelease <= 5) {
      score += 500;  // Moderately recent
    }
  }

  return Math.round(score);
};
// ----------------------------

export default function SearchInput({ onSelect }: { onSelect?: (game: Game) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300); // 300ms delay
  const router = useRouter();

  useEffect(() => {
    if (debouncedQuery) {
      setIsLoading(true);
      searchGames(debouncedQuery).then((data) => {
        // --- NEW SORTING LOGIC ---
        const sortedGames = data.results.sort((a: Game, b: Game) => {
          const scoreA = calculateRelevanceScore(a, debouncedQuery);
          const scoreB = calculateRelevanceScore(b, debouncedQuery);
          return scoreB - scoreA; // Sort descending (highest score first)
        });
        // -------------------------
        setResults(sortedGames.slice(0, 7)); // Show top 7 sorted results
        setIsLoading(false);
      });
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  return (
    <div style={{ width: '100%' }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for any game as you type..."
        onKeyDown={(e) => {
          if (e.key === 'Enter' && query.trim() && !onSelect) {
            router.push(`/search/${encodeURIComponent(query.trim())}`);
          }
        }}
        style={{
          padding: '12px',
          fontSize: '16px',
          width: '100%',
          border: '1px solid #555',
          borderRadius: '6px',
          backgroundColor: '#2a2a2a',
          color: '#fff',
        }}
      />
      {isLoading && <div style={{ padding: '10px' }}>Searching...</div>}
      {!isLoading && debouncedQuery && results.length > 0 && (
        <div style={{
          marginTop: '20px',
          backgroundColor: 'transparent',
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '24px',
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)',
          paddingLeft: '2vw',
          paddingRight: '2vw',
        }}>
          {results.map((game) => (
            <div
              key={game.id}
              style={{
                width: '100%',
                background: '#232323',
                border: '1px solid #555',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '18px 12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                cursor: 'pointer',
                transition: 'transform 0.15s',
                height: '100%',
              }}
              onClick={() => onSelect ? onSelect(game) : router.push(`/game/${game.slug}`)}
            >
              {game.background_image && (
                <img src={game.background_image} alt={game.name} style={{ width: '100%', height: '160px', objectFit: 'cover', marginBottom: '16px', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }} />
              )}
              <span style={{ fontWeight: 600, fontSize: '1.1rem', textAlign: 'center', color: '#fff' }}>
                {game.name}
                {game.released && !game.name.includes(new Date(game.released).getFullYear().toString()) &&
                  ` (${new Date(game.released).getFullYear()})`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 