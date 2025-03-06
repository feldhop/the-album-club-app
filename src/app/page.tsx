'use client';

import 'tailwindcss/tailwind.css';
import { useEffect, useState } from 'react';

interface Drop {
  id: number;
  user_first_name: string;
  album_name: string;
  artist_name: string;
  drop_date: string;
  cover_url: string;
}

export default function HomePage() {
  const [latestDrop, setLatestDrop] = useState<Drop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLatestDrop() {
      try {
        const response = await fetch('/api/drops');
        if (!response.ok) {
          throw new Error('Failed to fetch latest drop');
        }
        const data: Drop = await response.json();
        setLatestDrop(data || null);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchLatestDrop();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Error: {error}</div>;
  }

  if (!latestDrop) {
    return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">No drops available</div>;
  }

  const dropDate = new Date();
  dropDate.setTime(+latestDrop.drop_date);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 shadow-md rounded-lg p-6 max-w-md">
        <h1 className="text-2xl font-bold mb-4">The Drop</h1>
        <img src={latestDrop.cover_url} alt={latestDrop.album_name} className="w-full h-auto rounded-lg mb-4" />
        <p><strong>Dropper:</strong> {latestDrop.user_first_name}</p>
        <p><strong>Album:</strong> {latestDrop.album_name}</p>
        <p><strong>Artist:</strong> {latestDrop.artist_name}</p>
        <p><strong>Date:</strong> {dropDate.toLocaleDateString()}</p>
      </div>
    </div>
  );
}