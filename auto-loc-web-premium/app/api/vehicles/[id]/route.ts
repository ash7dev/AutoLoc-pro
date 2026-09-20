import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const baseUrl = API_URL || 'https://api.autoloc.sn';

  try {
    const res = await fetch(`${baseUrl}/vehicles/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      // Fallback: Si le backend direct échoue ou retourne 404, chercher dans search/feed
      const feedRes = await fetch(`${baseUrl}/vehicles/feed`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (feedRes.ok) {
        const feedData = await feedRes.json();
        const allVehicles = feedData?.premium || feedData?.data?.premium || [];
        const found = allVehicles.find((v: any) => v.id === id);
        if (found) {
          return NextResponse.json(found);
        }
      }
      return NextResponse.json(
        { message: `Véhicule introuvable pour l'id: ${id}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`[API Route /api/vehicles/${id}] Error:`, error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des détails du véhicule' },
      { status: 500 }
    );
  }
}
