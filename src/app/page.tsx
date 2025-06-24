"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import debounce from 'lodash/debounce';
import SearchInput from '../components/SearchInput';

interface SearchResult {
  id: number;
  name: string;
  slug: string;
  background_image: string;
}

const featuredGames = [
  {
    id: 1,
    name: "Marvel's Spider-Man 2",
    slug: 'marvels-spider-man-2',
    background_image: 'https://media.rawg.io/media/games/7d1/7d112ad515211a01639d22eef5093c47.jpg',
  },
  {
    id: 2,
    name: 'The Last of Us Part II',
    slug: 'the-last-of-us-part-ii',
    background_image: 'https://media.rawg.io/media/games/8e7/8e7e2e7e2e7e2e7e2e7e2e7e2e7e2e7.jpg',
  },
  {
    id: 3,
    name: 'Elden Ring',
    slug: 'elden-ring',
    background_image: 'https://media.rawg.io/media/games/6d6/6d6e2e6d6e2e6d6e2e6d6e2e6d6e2e6d.jpg',
  },
];

const categories = [
  'Action', 'Adventure', 'RPG', 'Shooter', 'Indie', 'Strategy', 'Puzzle', 'Sports', 'Racing', 'Simulation',
];

function PopularGamesSection() {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/games/popular')
      .then(res => res.json())
      .then(setGames)
      .finally(() => setLoading(false));
  }, []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (loading) return <div className="text-center text-gray-400 mb-8">Loading popular games...</div>;
  if (!games.length) return <div className="text-center text-gray-400 mb-8">No popular games yet.</div>;
  
  return (
    <section className="mb-12 animate-fade-in relative">
      <h2 className="text-2xl font-bold text-white mb-4">Most Searched Games</h2>
      <div className="group relative flex items-center">
        {/* Left Arrow */}
        <button
          onClick={scrollLeft}
          className="absolute left-0 z-10 bg-gray-800 hover:bg-gray-700 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-x-1/2"
          aria-label="Scroll left"
          style={{ top: '50%', transform: 'translateY(-50%) translateX(-50%)' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {/* Scrollable Cards */}
        <div ref={scrollContainerRef} className="flex gap-6 overflow-x-auto no-scrollbar pb-2 scroll-smooth px-8 w-full">
          {games.map(game => (
            <Link key={game.slug} href={`/game/${game.slug}`} className="min-w-[150px] sm:min-w-[200px] bg-gray-800 rounded-lg shadow hover:bg-gray-700 transition-colors flex-shrink-0">
              <div className="relative h-32 w-full rounded-t-lg overflow-hidden">
                {game.background_image ? (
                  <Image src={game.background_image} alt={game.name} fill className="object-cover" /> 
                ) : (
                  <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No Image</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-white text-base mb-1 line-clamp-2">{game.name}</h3>
                <div className="text-xs text-gray-400">{game.views} views</div>
              </div>
            </Link>
          ))}
          {/* See All Card */}
          <Link href="/popular" className="min-w-[150px] sm:min-w-[200px] bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow hover:from-blue-500 hover:to-purple-500 transition-all duration-300 flex-shrink-0 flex flex-col justify-center items-center">
            <div className="h-32 w-full rounded-t-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">🎮</div>
                <div className="text-white font-semibold text-lg">See All</div>
              </div>
            </div>
            <div className="p-3 text-center">
              <h3 className="font-semibold text-white text-base mb-1">Popular Games</h3>
              <div className="text-xs text-blue-200">View all trending games</div>
            </div>
          </Link>
        </div>
        {/* Right Arrow */}
        <button
          onClick={scrollRight}
          className="absolute right-0 z-10 bg-gray-800 hover:bg-gray-700 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-1/2"
          aria-label="Scroll right"
          style={{ top: '50%', transform: 'translateY(-50%) translateX(50%)' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  );
}

function LastAddedGamesSection() {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/games/recent')
      .then(res => res.json())
      .then(setGames)
      .finally(() => setLoading(false));
  }, []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (loading) return <div className="text-center text-gray-400 mb-8">Loading recent games...</div>;
  if (!games.length) return <div className="text-center text-gray-400 mb-8">No recent games found.</div>;
  
  return (
    <section className="mb-12 animate-fade-in relative">
      <h2 className="text-2xl font-bold text-white mb-4">Last Added Games</h2>
      <div className="group relative flex items-center">
        {/* Left Arrow */}
        <button
          onClick={scrollLeft}
          className="absolute left-0 z-10 bg-gray-800 hover:bg-gray-700 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-x-1/2"
          aria-label="Scroll left"
          style={{ top: '50%', transform: 'translateY(-50%) translateX(-50%)' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {/* Scrollable Cards */}
        <div ref={scrollContainerRef} className="flex gap-6 overflow-x-auto no-scrollbar pb-2 scroll-smooth px-8 w-full">
          {games.map(game => (
            <Link key={game.slug} href={`/game/${game.slug}`} className="min-w-[150px] sm:min-w-[200px] bg-gray-800 rounded-lg shadow hover:bg-gray-700 transition-colors flex-shrink-0">
              <div className="relative h-32 w-full rounded-t-lg overflow-hidden">
                {game.background_image ? (
                  <Image src={game.background_image} alt={game.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No Image</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-white text-base mb-1 line-clamp-2">{game.name}</h3>
                <div className="text-xs text-gray-400">Added: {new Date(game.createdAt).toLocaleDateString()}</div>
              </div>
            </Link>
          ))}
        </div>
        {/* Right Arrow */}
        <button
          onClick={scrollRight}
          className="absolute right-0 z-10 bg-gray-800 hover:bg-gray-700 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-1/2"
          aria-label="Scroll right"
          style={{ top: '50%', transform: 'translateY(-50%) translateX(50%)' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  );
}

export default function HomePage() {
  useEffect(() => {
    // Animate fade-in on mount
    document.body.classList.add('overflow-x-hidden');
    return () => document.body.classList.remove('overflow-x-hidden');
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center py-10 md:py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 overflow-x-hidden">
      <div className="relative z-10 w-full max-w-5xl mx-auto px-2 sm:px-4">
        {/* Hero Section */}
        <header className="mb-6 md:mb-12 text-center animate-fade-in-up">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold mb-2 md:mb-4 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-gradient-text drop-shadow-lg">NerdGamer</h1>
          <p className="text-lg sm:text-2xl text-gray-200 mb-4 md:mb-8 animate-fade-in">Your one-stop, ad-free resource for everything gaming.</p>
          <SearchInput />
          <PopularGamesSection />
          <LastAddedGamesSection />
        </header>
        {/* Quick Links removed */}
      </div>
    </div>
  );
}

// Tailwind CSS animations (add to your global CSS if not present):
// .animate-gradient-move { background-size: 400% 400%; animation: gradientMove 12s ease-in-out infinite; }
// @keyframes gradientMove { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
// .animate-gradient-text { background-size: 200% 200%; animation: gradientText 4s ease-in-out infinite; }
// @keyframes gradientText { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
// .animate-fade-in { animation: fadeIn 1.2s both; }
// .animate-fade-in-up { animation: fadeInUp 1.2s both; }
// @keyframes fadeIn { from{opacity:0} to{opacity:1} }
// @keyframes fadeInUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
// .no-scrollbar::-webkit-scrollbar { display: none; }
// .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
