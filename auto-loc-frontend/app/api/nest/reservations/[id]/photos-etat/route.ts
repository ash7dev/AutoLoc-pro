import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

/**
 * POST /api/nest/reservations/[id]/photos-etat
 * Proxy FormData upload to NestJS: POST /reservations/:id/photos-etat
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } },
) {
    const token = cookies().get('nest_access')?.value;
    if (!token) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const url = request.nextUrl;
    const type = url.searchParams.get('type') ?? '';
    const categorie = url.searchParams.get('categorie') ?? '';

    const formData = await request.formData();

    const backendUrl = new URL(
        `/reservations/${params.id}/photos-etat?type=${encodeURIComponent(type)}&categorie=${encodeURIComponent(categorie)}`,
        API_URL,
    );

    const res = await fetch(backendUrl.toString(), {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    const data = await res.json().catch(() => ({}));

    return NextResponse.json(data, { status: res.status });
}
