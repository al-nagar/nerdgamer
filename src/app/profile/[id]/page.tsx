"use client";
import { useState, useEffect, use } from 'react';
import { useRouter, notFound } from 'next/navigation';
import { headers } from 'next/headers';

async function fetchUserProfile(id) {
  const protocol = window.location.protocol;
  const host = window.location.host;
  const res = await fetch(`${protocol}//${host}/api/profile/${id}`);
  if (!res.ok) return null;
  return res.json();
}

async function fetchUserGameList(id) {
  const protocol = window.location.protocol;
  const host = window.location.host;
  const res = await fetch(`${protocol}//${host}/api/profile/${id}/game-list`);
  if (!res.ok) return [];
  return res.json();
}

export default function PublicProfilePage({ params }) {
  const { id } = use(params);
  const [user, setUser] = useState(null);
  const [gameList, setGameList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameListFilter, setGameListFilter] = useState('played');

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      setLoading(true);
      setError(null);
      const profileData = await fetchUserProfile(id);
      if (!profileData || !profileData.user) {
        setError('User not found');
        setLoading(false);
        return;
      }
      const games = await fetchUserGameList(id);
      if (isMounted) {
        setUser(profileData.user);
        setGameList(games);
        setLoading(false);
      }
    }
    fetchData();
    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;
  }
  if (error || !user) {
    return notFound();
  }

  const initials = (user.name || user.username || 'U').replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase();
  function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${hash % 360}, 60%, 60%)`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 py-16 px-4 flex justify-center items-center">
      <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-xl flex flex-col items-center border border-gray-700">
        <div className="relative mb-6">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.name}
              style={{ width: 140, height: 140, borderRadius: '50%', objectFit: 'cover', border: '4px solid #3b82f6', background: '#222' }}
            />
          ) : (
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: '50%',
                background: stringToColor(user.name || user.username || 'user'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 56,
                fontWeight: 'bold',
                border: '4px solid #3b82f6',
                boxShadow: '0 2px 16px #0004',
              }}
            >
              {initials}
            </div>
          )}
        </div>
        <div className="w-full flex flex-col gap-6">
          <section className="bg-gray-800 rounded-xl p-6 shadow mb-2 flex flex-col items-center">
            <h1 className="text-3xl font-bold text-white mb-2 text-center">{user.name}</h1>
            <div className="text-gray-400 text-lg mb-2">@{user.username}</div>
            <div className="w-full">
              <div className="text-white text-lg font-semibold mb-2">About</div>
              <div className="text-gray-300 whitespace-pre-line min-h-[80px]">{user.about || <span className="italic text-gray-500">No bio provided.</span>}</div>
            </div>
          </section>
          {/* Game List Section */}
          <section className="bg-gray-800 rounded-xl p-6 shadow flex flex-col items-center">
            <h2 className="text-xl font-bold text-white mb-4">Game List</h2>
            <div className="flex gap-4 mb-4">
              <button
                className={`px-4 py-2 rounded font-semibold border transition-colors focus:outline-none ${
                  gameListFilter === 'played'
                    ? 'bg-blue-600 border-blue-700 text-white shadow'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                }`}
                onClick={() => setGameListFilter('played')}
              >
                Played
              </button>
              <button
                className={`px-4 py-2 rounded font-semibold border transition-colors focus:outline-none ${
                  gameListFilter === 'want_to_play'
                    ? 'bg-blue-600 border-blue-700 text-white shadow'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                }`}
                onClick={() => setGameListFilter('want_to_play')}
              >
                Want to Play
              </button>
            </div>
            {gameList.filter(g => g.status === gameListFilter).length === 0 ? (
              <div className="text-gray-400 italic">No games in this list.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {gameList.filter(game => game.status === gameListFilter).map(game => (
                  <div key={game.slug + game.status} className="flex items-center gap-3 bg-gray-900 rounded-lg p-3 shadow">
                    {game.background_image ? (
                      <img src={game.background_image} alt={game.name} className="w-14 h-14 object-cover rounded-md" />
                    ) : (
                      <div className="w-14 h-14 bg-gray-700 rounded-md flex items-center justify-center text-gray-400 text-xs">No Image</div>
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-white text-base line-clamp-1">{game.name}</div>
                      <div className="mt-1">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${game.status === 'played' ? 'bg-green-700 text-green-200' : 'bg-blue-700 text-blue-200'}`}>
                          {game.status === 'played' ? 'Played' : 'Want to Play'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
} 