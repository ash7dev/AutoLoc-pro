import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const baseUrl = API_URL || 'https://api.autoloc.sn';

  try {
    const backendUrl = `${baseUrl}/vehicles/search?${searchParams.toString()}`;
    const res = await fetch(backendUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    // Fallback feed si la recherche directe ne renvoie rien
    const feedRes = await fetch(`${baseUrl}/vehicles/feed`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    if (feedRes.ok) {
      const feedData = await feedRes.json();
      const list = feedData?.premium || feedData?.data?.premium || [];
      return NextResponse.json({ data: list, total: list.length, page: 1 });
    }

    return NextResponse.json({ data: [], total: 0, page: 1 });
  } catch (error: any) {
    console.error('[API Route /api/vehicles/search] Error:', error);
    return NextResponse.json({ data: [], total: 0, page: 1 }, { status: 500 });
  }
}
