import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '8';
  const type = searchParams.get('type') || '';

  const baseUrl = API_URL || 'https://api.autoloc.sn';

  try {
    const fetchLimit = Number(limit) > 20 ? limit : '30';
    let res = await fetch(`${baseUrl}/vehicles/search?limit=${fetchLimit}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    let vehiclesList: any[] = [];

    if (res.ok) {
      const data = await res.json();
      if (data?.data && Array.isArray(data.data)) {
        vehiclesList = data.data;
      }
    }

    if (vehiclesList.length === 0) {
      res = await fetch(`${baseUrl}/vehicles/feed`, {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
      if (res.ok) {
        const feedData = await res.json();
        vehiclesList = feedData?.premium || feedData?.data?.premium || [];
      }
    }

    // Filter by type if provided
    if (type && type !== 'all') {
      vehiclesList = vehiclesList.filter((v: any) =>
        v.type?.toUpperCase() === type.toUpperCase() ||
        (type === 'SUV' && (v.type === 'SUV' || v.type === '4X4'))
      );
    }

    return NextResponse.json(vehiclesList.slice(0, Number(limit)));
  } catch (error: any) {
    console.error('[API Route /api/vehicles/search] Error:', error);
    return NextResponse.json([], { status: 500 });
  }
}
