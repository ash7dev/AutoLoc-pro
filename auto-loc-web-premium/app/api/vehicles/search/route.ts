import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/config';

export const dynamic = 'force-dynamic';

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const baseUrl = API_URL || 'https://api.autoloc.sn';

  try {
    const backendUrl = `${baseUrl}/vehicles/search?${searchParams.toString()}`;
    const res = await fetch(backendUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, { headers: CACHE_HEADERS });
    }

    // Fallback feed si la recherche directe ne renvoie rien
    const feedRes = await fetch(`${baseUrl}/vehicles/feed`, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 },
    });
    if (feedRes.ok) {
      const feedData = await feedRes.json();
      const list = feedData?.premium || feedData?.data?.premium || [];
      return NextResponse.json(
        { data: list, total: list.length, page: 1 },
        { headers: CACHE_HEADERS }
      );
    }

    return NextResponse.json({ data: [], total: 0, page: 1 }, { headers: CACHE_HEADERS });
  } catch (error: any) {
    console.error('[API Route /api/vehicles/search] Error:', error);
    return NextResponse.json({ data: [], total: 0, page: 1 }, { status: 500 });
  }
}
