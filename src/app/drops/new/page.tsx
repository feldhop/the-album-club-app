'use client';

import Image from "next/image";
import { useState, useEffect } from "react";

interface Artist {
  id: number;
  name: string;
}

interface Album {
  id: number;
  title: string;
  cover: string;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
}

interface ArtistResponse {
  artists: Artist[];
}

interface AlbumResponse {
  albums: Album[];
}

interface UserResponse {
  users: User[];
}

export default function Home() {
  const [artist, setArtist] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [album, setAlbum] = useState<Album | null>(null);
  const [suggestions, setSuggestions] = useState<Artist[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState<number>(-1);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [showAlbumList, setShowAlbumList] = useState<boolean>(true);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [usersLoading, setUsersLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data: UserResponse = await res.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedArtist || !album || !selectedUser) {
      setError('Please select an artist, an album, and a user.');
      return;
    }

    try {
      const res = await fetch('/api/drops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artistName: selectedArtist.name,
          artistId: selectedArtist.id + '',
          albumTitle: album.title,
          albumId: album.id + '',
          albumCover: album.cover,
          userId: selectedUser.id
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create drop');
      }

      setSuccess(true);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      setSuccess(false);
    }
  };

  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const res = await fetch(`/api/artists?query=${query}`);
    const data: ArtistResponse = await res.json();
    setSuggestions(data.artists);
    setShowSuggestions(true);
  };

  const fetchAlbums = async (artistId: number) => {
    const res = await fetch(`/api/artists/${artistId}`);
    const data: AlbumResponse = await res.json();
    if (data && data.albums) {
      setAlbums(data.albums);
    } else {
      setAlbums([]);
    }
  };

  useEffect(() => {
    if (!selectedArtist) {
      fetchSuggestions(artist);
    }
  }, [artist, selectedArtist]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      setActiveSuggestion((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      setActiveSuggestion((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      if (activeSuggestion >= 0 && activeSuggestion < suggestions.length) {
        const selectedArtist = suggestions[activeSuggestion];
        setSelectedArtist(selectedArtist);
        setArtist(selectedArtist.name);
        fetchAlbums(selectedArtist.id);
        setShowSuggestions(false);
      }
    }
  };

  const handleSuggestionClick = (suggestion: Artist) => {
    setSelectedArtist(suggestion);
    setArtist(suggestion.name);
    fetchAlbums(suggestion.id);
    setShowSuggestions(false);
  };

  const handleAlbumClick = (album: Album) => {
    setAlbum(album);
    setShowAlbumList(false);
  };

  const handleBackToAlbumList = () => {
    setShowAlbumList(true);
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 sm:p-20 bg-gray-900 text-white">
      <main className="flex flex-col row-start-2 items-center">
        <form onSubmit={handleSubmit} className="mt-8 w-full max-w-md bg-gray-800 shadow-md rounded-lg p-6">
          <div className="mb-4">
            <label htmlFor="artist" className="block text-sm font-medium text-gray-300">Who&apos;s the Artist?</label>
            <input
              type="text"
              id="artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              onKeyDown={handleKeyDown}
              className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
              disabled={!!selectedArtist}
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="border border-gray-600 rounded-md mt-1 bg-gray-700 shadow-lg max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={suggestion.id}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-600 ${index === activeSuggestion ? 'bg-gray-600' : ''}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {selectedArtist && showAlbumList && albums.length > 0 && (
            <div className="mb-4">
              <h2 className="text-lg font-medium text-gray-300">Select Album</h2>
              <ul className="mt-4">
                {albums.map((album) => (
                  <li
                    key={album.id}
                    className="mb-4 flex items-center cursor-pointer hover:bg-gray-600 p-2 rounded-md"
                    onClick={() => handleAlbumClick(album)}
                  >
                    <Image
                      src={album.cover}
                      alt={album.title}
                      width={50}
                      height={50}
                      className="mr-4"
                    />
                    <span>{album.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {selectedArtist && album && !showAlbumList && (
            <div className="mb-4">
              <label htmlFor="album" className="block text-sm font-medium text-gray-300">Album</label>
              <div className="">
                <Image
                  src={album.cover}
                  alt={album.title}
                  width={400}
                  height={400}
                  className="mr-4"
                />
                <p className="text-lg mt-4">{album.title}</p>
                <button
                  type="button"
                  onClick={handleBackToAlbumList}
                  className="text-sm text-indigo-400 hover:underline"
                >
                  Change
                </button>
              </div>
            </div>
          )}
          {selectedArtist && album && (
            <div className="mb-4">
              <label htmlFor="user" className="block text-sm font-medium text-gray-300">Select User</label>
              {usersLoading ? (
                <div>Loading users...</div>
              ) : (
                users?.length > 0 ? (
                  <select
                    id="user"
                    value={selectedUser?.id || ''}
                    onChange={(e) => {
                      const userId = parseInt(e.target.value, 10);
                      const user = users.find((user) => user.id === userId) || null;
                      setSelectedUser(user);
                    }}
                    className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  >
                    <option value="" disabled>Select a user</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.first_name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div>No users available</div>
                )
              )}
            </div>
          )}
          {error && (
            <div className="mb-4 text-red-500 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 text-green-500 text-sm">
              Drop created successfully!
            </div>
          )}
          {selectedArtist && album && selectedUser && (
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Submit
            </button>
          )}
        </form>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        {/* Add footer content here if needed */}
      </footer>
    </div>
  );
}
