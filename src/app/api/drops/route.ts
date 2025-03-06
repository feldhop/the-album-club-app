import { NextResponse } from 'next/server';
import { get, run } from '../../lib/db';

interface DropRequestBody {
    artistName: string;
    artistId: number;
    albumTitle: string;
    albumId: number;
    albumCover: string;
    userId: number;
}

export async function GET() {
  try {
    
    const result = await get(`
        SELECT
            Drops.id AS drop_id,
            Users.first_name AS user_first_name,
            Users.last_name AS user_last_name,
            Albums.name AS album_name,
            Artists.name AS artist_name,
            Drops.date AS drop_date,
            Albums.cover_url AS cover_url,
            Users.email AS user_email
        FROM 
            Drops
        INNER JOIN
            Users ON Drops.user = Users.id
        INNER JOIN
            Albums ON Drops.album = Albums.id
        INNER JOIN
            Artists ON Albums.artist = Artists.id
        ORDER BY
            Drops.date DESC
        LIMIT 1
    `);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Failed to fetch drops: ${error}` }, { status: 500 });
  }
}

export async function POST(request: Request) {

    const { artistName, artistId, albumTitle, albumId, albumCover, userId } = await request.json() as DropRequestBody;
  
    // Check if the artist already exists
    let artist = await get('SELECT * FROM artists WHERE name = ?', [artistName]);
    if (!artist) {
      // Create a new artist
      artist = await run('INSERT INTO artists (name, deezer_id) VALUES (?,?)', [artistName, artistId]);
    }
  
    // Create a new album
    const album = await run('INSERT INTO albums (name, deezer_id, cover_url, artist) VALUES (?, ?, ?, ?)', [albumTitle, albumId, albumCover, artist?.id]);
  
    // Create a new drop
    const date = new Date().getTime();
    const drop = await run('INSERT INTO drops (artist, album, date, user) VALUES (?, ?, ?, ?)', [artist?.id, album?.id, date, userId]);
  
    return new Response(JSON.stringify({ drop }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }