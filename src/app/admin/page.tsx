"use client";

import { useState } from 'react';
import SearchInput from '@/components/SearchInput';
import { useAuth } from '@/context/AuthContext';

// Type for a game result (from SearchInput)
type Game = {
  id: number;
  name: string;
  background_image: string | null;
  released: string;
  slug: string;
  [key: string]: any;
};

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [gameData, setGameData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!user || user.role !== 'ADMIN') {
    return <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}><h2>Access Denied</h2><p>You do not have permission to view this page.</p></div>;
  }

  async function handleSelect(game: Game) {
    setSelectedGame(game);
    setLoading(true);
    setMessage('');
    // Fetch full game data (cached or not)
    const res = await fetch(`/api/game/${game.slug}`);
    if (res.ok) {
      const data = await res.json();
      setGameData(data);
    } else {
      setGameData(null);
      setMessage('Failed to fetch game data.');
    }
    setLoading(false);
  }

  function handleFieldChange(field: string, value: string) {
    setGameData((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  async function handleSave() {
    if (!selectedGame || !gameData) return;
    setLoading(true);
    setMessage('');
    const res = await fetch(`/api/admin/game/${selectedGame.slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameData }),
    });
    if (res.ok) {
      setMessage('Game updated successfully!');
    } else {
      setMessage('Failed to update game.');
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!selectedGame) return;
    if (!window.confirm('Are you sure you want to delete this game from the cache?')) return;
    setLoading(true);
    setMessage('');
    const res = await fetch(`/api/admin/game/${selectedGame.slug}`, { method: 'DELETE' });
    if (res.ok) {
      setMessage('Game deleted from cache.');
      setSelectedGame(null);
      setGameData(null);
    } else {
      setMessage('Failed to delete game.');
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 32 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24 }}>Admin Dashboard</h1>
      <div style={{ marginBottom: 32 }}>
        <SearchInput onSelect={handleSelect} />
      </div>
      {loading && <div>Loading...</div>}
      {message && <div style={{ marginBottom: 16, color: message.includes('success') ? 'green' : 'red' }}>{message}</div>}
      {gameData && (
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSave();
          }}
          style={{ background: '#232323', padding: 24, borderRadius: 12 }}
        >
          {Object.entries(gameData).map(([key, value]) => (
            <div key={key} style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600 }}>{key}</label>
              <textarea
                style={{ width: '100%', minHeight: 40, background: '#181818', color: '#fff', border: '1px solid #444', borderRadius: 6, padding: 8 }}
                value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value !== undefined && value !== null ? String(value) : ''}
                onChange={e => handleFieldChange(key, e.target.value)}
              />
            </div>
          ))}
          <button type="submit" style={{ marginRight: 16, padding: '8px 24px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600 }}>Save</button>
          <button type="button" onClick={handleDelete} style={{ padding: '8px 24px', background: '#c00', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600 }}>Delete</button>
        </form>
      )}
    </div>
  );
} 