'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { FaSearch, FaSpinner, FaBars, FaTimes } from 'react-icons/fa';
import { useDebounce } from '../hooks/useDebounce';
import { searchGames } from '../lib/api';

// Define a type for our game results
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

// Add avatar logic for user
function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 60%, 60%)`;
}

function UserAvatar({ username, profileImage, size = 40 }: { username: string; profileImage?: string | null; size?: number }) {
  if (profileImage) {
    return (
      <img
        src={profileImage}
        alt={username}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: "2px solid #fff" }}
      />
    );
  }
  const initials = username
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: stringToColor(username),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: size / 2,
        fontWeight: "bold",
        border: "2px solid #fff"
      }}
    >
      {initials}
    </div>
  );
}

export default function Navbar() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(searchQuery, 300);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if we're on the home page
  const isHomePage = pathname === '/';

  // Live search effect
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length >= 2) {
      setIsSearchLoading(true);
      searchGames(debouncedQuery).then((data) => {
        setSearchResults(data.results.slice(0, 5)); // Show top 5 results
        setIsSearchLoading(false);
        setShowSearchResults(true);
      }).catch(() => {
        setIsSearchLoading(false);
        setSearchResults([]);
      });
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [debouncedQuery]);

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }
    if (showSearchResults) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearchResults]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await fetch('/api/logout', {
        method: 'POST',
      });
      
      if (res.ok) {
        // Refresh the page to update the auth state
        window.location.reload();
      } else {
        console.error('Logout failed');
        setIsLoggingOut(false);
      }
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search/${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearchResults(false);
    }
  };

  const handleGameSelect = (game: Game) => {
    router.push(`/game/${game.slug}`);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <nav className="bg-gray-800/70 backdrop-blur border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-white">NerdGamer</span>
          </Link>

          {/* Hamburger for mobile */}
          <button
            className="md:hidden ml-2 text-gray-300 hover:text-white focus:outline-none"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>

          {/* Search Bar - Hidden on home page, hidden on mobile */}
          {!isHomePage && (
            <div className="hidden md:flex flex-1 max-w-md mx-8 relative" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                    placeholder="Search games..."
                    className="w-full px-4 py-2 pl-10 pr-4 text-sm bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </form>
              
              {/* Live Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
                  {isSearchLoading ? (
                    <div className="p-4 text-center text-gray-400 text-sm flex items-center justify-center">
                      <FaSpinner className="animate-spin mr-2" />
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div>
                      {searchResults.map((game) => (
                        <div
                          key={game.id}
                          onClick={() => handleGameSelect(game)}
                          className="flex items-center p-3 hover:bg-gray-600 cursor-pointer border-b border-gray-600 last:border-b-0"
                        >
                          {game.background_image && (
                            <img 
                              src={game.background_image} 
                              alt={game.name} 
                              className="w-12 h-12 object-cover rounded mr-3"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-medium truncate">
                              {game.name}
                            </div>
                            {game.released && (
                              <div className="text-gray-400 text-xs">
                                {new Date(game.released).getFullYear()}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {searchQuery.trim() && (
                        <div 
                          onClick={() => {
                            router.push(`/search/${encodeURIComponent(searchQuery.trim())}`);
                            setSearchQuery('');
                            setShowSearchResults(false);
                          }}
                          className="p-3 text-blue-400 hover:bg-gray-600 cursor-pointer text-sm font-medium border-t border-gray-600"
                        >
                          View all results for "{searchQuery}"
                        </div>
                      )}
                    </div>
                  ) : searchQuery.length >= 2 ? (
                    <div className="p-4 text-center text-gray-400 text-sm">No games found</div>
                  ) : null}
                </div>
              )}
            </div>
          )}

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/popular"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Popular
            </Link>
            <Link
              href="/faq"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              FAQ
            </Link>
            <Link
              href="/contact"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/donate"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Donate
            </Link>
            {/* Admin Button */}
            {user && user.role === 'ADMIN' && !isLoading && (
              <Link
                href="/admin"
                className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 py-2 rounded-md text-sm font-bold transition-colors"
              >
                Admin
              </Link>
            )}
            {/* Auth/User Dropdown */}
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="text-gray-400 text-sm">Loading...</div>
              </div>
            ) : user ? (
              // Replace dropdown with direct link to profile
              <Link
                href="/profile"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 focus:outline-none"
                aria-label="User profile"
              >
                <UserAvatar username={user.username} profileImage={user.profileImage} size={36} />
              </Link>
            ) : (
              <div className="flex items-center space-x-2">
                    <Link
                      href="/login"
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Register
                    </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700 px-4 pb-4 z-50">
          {/* Search Bar for mobile */}
          {!isHomePage && (
            <div className="flex flex-col mt-4 mb-2" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                    placeholder="Search games..."
                    className="w-full px-4 py-2 pl-10 pr-4 text-sm bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </form>
              
              {/* Live Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
                  {isSearchLoading ? (
                    <div className="p-4 text-center text-gray-400 text-sm flex items-center justify-center">
                      <FaSpinner className="animate-spin mr-2" />
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div>
                      {searchResults.map((game) => (
                        <div
                          key={game.id}
                          onClick={() => handleGameSelect(game)}
                          className="flex items-center p-3 hover:bg-gray-600 cursor-pointer border-b border-gray-600 last:border-b-0"
                        >
                          {game.background_image && (
                            <img 
                              src={game.background_image} 
                              alt={game.name} 
                              className="w-12 h-12 object-cover rounded mr-3"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-medium truncate">
                              {game.name}
                            </div>
                            {game.released && (
                              <div className="text-gray-400 text-xs">
                                {new Date(game.released).getFullYear()}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {searchQuery.trim() && (
                        <div 
                          onClick={() => {
                            router.push(`/search/${encodeURIComponent(searchQuery.trim())}`);
                            setSearchQuery('');
                            setShowSearchResults(false);
                          }}
                          className="p-3 text-blue-400 hover:bg-gray-600 cursor-pointer text-sm font-medium border-t border-gray-600"
                        >
                          View all results for "{searchQuery}"
                        </div>
                      )}
                    </div>
                  ) : searchQuery.length >= 2 ? (
                    <div className="p-4 text-center text-gray-400 text-sm">No games found</div>
                  ) : null}
                </div>
              )}
            </div>
          )}
          <div className="flex flex-col space-y-2 mt-2">
            <Link href="/popular" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Popular
            </Link>
            <Link href="/faq" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium transition-colors" onClick={() => setMobileMenuOpen(false)}>
              FAQ
            </Link>
            <Link href="/contact" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Contact
            </Link>
            <Link href="/donate" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Donate
            </Link>
            {user && user.role === 'ADMIN' && !isLoading && (
              <Link href="/admin" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 py-2 rounded-md text-base font-bold transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Admin
              </Link>
            )}
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="text-gray-400 text-base">Loading...</div>
              </div>
            ) : user ? (
              <Link href="/profile" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-700 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                <UserAvatar username={user.username} profileImage={user.profileImage} size={32} />
                <span className="text-white font-medium">Profile</span>
              </Link>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link href="/login" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Link>
                <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-base font-medium transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 