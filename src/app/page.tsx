"use client";

import { useState, useEffect } from 'react';
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
  useEffect(() => {
    fetch('/api/games/popular')
      .then(res => res.json())
      .then(setGames)
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <div className="text-center text-gray-400 mb-8">Loading popular games...</div>;
  if (!games.length) return <div className="text-center text-gray-400 mb-8">No popular games yet.</div>;
  return (
    <section className="mb-12 animate-fade-in">
      <h2 className="text-2xl font-bold text-white mb-4">Most Searched Games</h2>
      <div className="flex gap-6 overflow-x-auto no-scrollbar pb-2">
        {games.map(game => (
          <Link key={game.slug} href={`/game/${game.slug}`} className="min-w-[200px] bg-gray-800 rounded-lg shadow hover:bg-gray-700 transition-colors flex-shrink-0">
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
      </div>
    </section>
  );
}

function LastAddedGamesSection() {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/games/recent')
      .then(res => res.json())
      .then(setGames)
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <div className="text-center text-gray-400 mb-8">Loading recent games...</div>;
  if (!games.length) return <div className="text-center text-gray-400 mb-8">No recent games found.</div>;
  return (
    <section className="mb-12 animate-fade-in">
      <h2 className="text-2xl font-bold text-white mb-4">Last Added Games</h2>
      <div className="flex gap-6 overflow-x-auto no-scrollbar pb-2">
        {games.map(game => (
          <Link key={game.slug} href={`/game/${game.slug}`} className="min-w-[200px] bg-gray-800 rounded-lg shadow hover:bg-gray-700 transition-colors flex-shrink-0">
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
    <div className="relative min-h-screen flex flex-col justify-center items-center py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 animate-gradient-move overflow-x-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-900 via-gray-900 to-purple-900 opacity-70 animate-gradient-move" />
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4">
        {/* Hero Section */}
        <header className="mb-12 text-center animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-gradient-text drop-shadow-lg">NerdGamer</h1>
          <p className="text-2xl text-gray-200 mb-8 animate-fade-in">Your one-stop, ad-free resource for everything gaming.</p>
          <SearchInput />
          <PopularGamesSection />
          <LastAddedGamesSection />
        </header>
        {/* Quick Links */}
        <section className="mb-12 animate-fade-in">
          <div className="flex flex-wrap gap-6 justify-center">
            <a href="/faq" className="bg-gray-700 hover:bg-gray-600 rounded-lg px-6 py-4 text-white font-semibold shadow transition flex items-center gap-2">
              <span role="img" aria-label="FAQ">❓</span> FAQ
            </a>
            <a href="/donate" className="bg-gray-700 hover:bg-gray-600 rounded-lg px-6 py-4 text-white font-semibold shadow transition flex items-center gap-2">
              <span role="img" aria-label="Donate">💖</span> Donate
            </a>
            <a href="/contact" className="bg-gray-700 hover:bg-gray-600 rounded-lg px-6 py-4 text-white font-semibold shadow transition flex items-center gap-2">
              <span role="img" aria-label="Contact">📬</span> Contact
            </a>
          </div>
        </section>
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
