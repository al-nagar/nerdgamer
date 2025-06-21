'use client';

import { useState, useEffect, useRef, useCallback, use as useParams } from 'react';
import { searchGames } from '../../../lib/api';
import Link from 'next/link';
import { use } from 'react';

interface SearchResult {
  id: number;
  name: string;
  slug: string;
  background_image: string;
  released?: string;
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
}

interface PageProps {
  params: {
    query: string;
  };
}

// Reuse the same scoring function from SearchInput
const calculateRelevanceScore = (game: SearchResult, searchQuery: string): number => {
  let score = 0;

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

export default function SearchResultsPage({ params }: PageProps) {
  const decodedQuery = decodeURIComponent(params.query || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastResultRef = useCallback((node: HTMLDivElement) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  // Load initial results
  useEffect(() => {
    const loadInitialResults = async () => {
      setIsInitialLoading(true);
      try {
        const data = await searchGames(decodedQuery, 1);
        // Sort results using the same scoring function
        const sortedResults = data.results.sort((a: SearchResult, b: SearchResult) => {
          const scoreA = calculateRelevanceScore(a, decodedQuery);
          const scoreB = calculateRelevanceScore(b, decodedQuery);
          return scoreB - scoreA; // Sort descending (highest score first)
        });
        setResults(sortedResults);
        setHasMore(!!data.next);
      } catch (error) {
        // Handle error silently or show user-friendly message
      }
      setIsInitialLoading(false);
    };

    loadInitialResults();
  }, [decodedQuery]);

  // Load more results when page changes
  useEffect(() => {
    if (page === 1) return;
    
    const loadMoreResults = async () => {
      if (isLoading) return; // Prevent multiple simultaneous requests
      setIsLoading(true);
      try {
        const data = await searchGames(decodedQuery, page);
        // Sort new results and filter out duplicates
        const sortedNewResults = data.results.sort((a: SearchResult, b: SearchResult) => {
          const scoreA = calculateRelevanceScore(a, decodedQuery);
          const scoreB = calculateRelevanceScore(b, decodedQuery);
          return scoreB - scoreA;
        });
        const newResults = sortedNewResults.filter(
          (newGame: SearchResult) => !results.some(existingGame => existingGame.id === newGame.id)
        );
        setResults(prev => [...prev, ...newResults]);
        setHasMore(!!data.next && newResults.length > 0);
      } catch (error) {
        // Handle error silently or show user-friendly message
      }
      setIsLoading(false);
    };

    loadMoreResults();
  }, [page, decodedQuery]);

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-gray-300 text-xl">Loading search results...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Search Results for "{decodedQuery}"</h1>
        
        {results.length === 0 ? (
          <div className="text-gray-300 text-xl text-center">No games found. Try a different search term.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map((game, index) => (
              <div
                key={`${game.id}-${index}`}
                ref={index === results.length - 1 ? lastResultRef : undefined}
              >
                <Link href={`/game/${game.slug}`} className="block">
                  <div className="bg-gray-800 border border-gray-700 rounded-lg flex flex-col h-full hover:bg-gray-700 transition-colors">
                    {game.background_image && (
                      <div className="relative h-40">
                        <img 
                          src={game.background_image} 
                          alt={game.name} 
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                      </div>
                    )}
                    <div className="p-4 flex-1">
                      <h3 className="font-semibold text-lg text-white mb-2">
                        {game.name}
                        {game.released && !game.name.includes(new Date(game.released).getFullYear().toString()) &&
                          ` (${new Date(game.released).getFullYear()})`}
                      </h3>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
        
        {isLoading && (
          <div className="text-center mt-8">
            <div className="text-gray-300">Loading more results...</div>
          </div>
        )}
      </div>
    </div>
  );
} 