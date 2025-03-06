import { NextResponse } from 'next/server';
import { getCloudflareContext } from "@opennextjs/cloudflare";

declare global {
  interface DeezerArtist {
    id: number;
    name: string;
  }

  interface DeezerAlbum {
    id: number;
    title: string;
    cover_big: string;
  }

  interface DeezerArtistsResponse {
    data: DeezerArtist[];
  }

  interface DeezerAlbumsResponse {
    data: DeezerAlbum[];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (query) {
    const libraryURL = getCloudflareContext().env.LIBRARY_API_URL;
    console.log('libraryURL', libraryURL);
    const res = await fetch(`${libraryURL}/search/artist?q=${query}`);
    const dataJSON: DeezerArtistsResponse = await res.json();

    // Extract unique artist names and IDs
    const artists = dataJSON.data.map((artist: DeezerArtist) => ({
      id: artist.id,
      name: artist.name
    }));
    console.log('artists', artists);

    return NextResponse.json({ artists: Array.from(artists) });
  } else {
    return NextResponse.json({ artists: ['Yim'] });
  }
}