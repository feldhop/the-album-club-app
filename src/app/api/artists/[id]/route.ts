import { NextResponse } from 'next/server';
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  if (id) {
    const libraryURL = getCloudflareContext().env.LIBRARY_API_URL;
    const res = await fetch(`${libraryURL}/artist/${id}/albums`);
    const dataJSON: DeezerAlbumsResponse = await res.json();

    // Extract unique albums from the artist response
    const albums = dataJSON.data.map((album: DeezerAlbum) => ({
      id: album.id,
      title: album.title,
      cover: album.cover_big
    }));
    console.log('albums', albums);

    return NextResponse.json({ albums });
  } else {
    return NextResponse.json({ albums: [] });
  }
}