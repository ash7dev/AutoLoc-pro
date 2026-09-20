import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '4';

  const baseUrl = API_URL || 'https://api.autoloc.sn';

  try {
    // 1. Essayer /vehicles/search?limit=N
    let res = await fetch(`${baseUrl}/vehicles/search?limit=${limit}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
        return NextResponse.json(data.data.slice(0, Number(limit)));
      }
    }

    // 2. Fallback sur /vehicles/feed
    res = await fetch(`${baseUrl}/vehicles/feed`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const feedData = await res.json();
      const list = feedData?.premium || feedData?.data?.premium;
      if (Array.isArray(list) && list.length > 0) {
        return NextResponse.json(list.slice(0, Number(limit)));
      }
    }

    return NextResponse.json([]);
  } catch (error: any) {
    console.error('[API Route /api/vehicles/featured] Error:', error);
    return NextResponse.json([], { status: 500 });
  }
}
