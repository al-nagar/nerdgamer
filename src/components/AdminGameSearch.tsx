"use client";

import { useState, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

type Game = {
  id: number;
  name: string;
  background_image: string | null;
  released: string;
  slug: string;
  [key: string]: any;
};

interface AdminGameSearchProps {
  onSelect: (game: Game) => void;
  placeholder?: string;
}

export default function AdminGameSearch({ onSelect, placeholder = "Search for games..." }: AdminGameSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchGames = async () => {
      if (query.length < 2) {
        setResults([]);
        setShowResults(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/games/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data.results || []);
          setShowResults(true);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Search failed');
          setResults([]);
          setShowResults(true);
        }
      } catch (error) {
        console.error('Error searching games:', error);
        setError('Search service unavailable');
        setResults([]);
        setShowResults(true);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchGames, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSelect = (game: Game) => {
    onSelect(game);
    setQuery('');
    setShowResults(false);
    setError(null);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    setError(null);
  };

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-3 border border-gray-600 rounded-md leading-5 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <FiX className="h-5 w-5 text-gray-400 hover:text-gray-300" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {showResults && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm border border-gray-600">
          {loading ? (
            <div className="px-4 py-2 text-sm text-gray-400">Searching...</div>
          ) : error ? (
            <div className="px-4 py-2 text-sm text-red-400">
              {error}
              <div className="text-xs text-gray-500 mt-1">
                Please check your RAWG API key configuration.
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-400">No games found</div>
          ) : (
            results.map((game) => (
              <button
                key={game.id}
                onClick={() => handleSelect(game)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 focus:bg-gray-700 focus:outline-none"
              >
                <div className="flex items-center space-x-3">
                  {game.background_image && (
                    <img
                      src={game.background_image}
                      alt={game.name}
                      className="w-8 h-8 rounded object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {game.name}
                    </p>
                    {game.released && (
                      <p className="text-sm text-gray-400">
                        {new Date(game.released).getFullYear()}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
} 