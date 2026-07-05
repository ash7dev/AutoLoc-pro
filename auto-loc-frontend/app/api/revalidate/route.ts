import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(req: NextRequest) {
    const secret = req.headers.get('x-revalidate-secret');
    if (secret !== process.env.REVALIDATE_SECRET) {
        return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { path, paths, tag, tags, reservationId } = body;

        // Revalider des chemins spécifiques
        if (path) {
            revalidatePath(path);
        }
        if (paths && Array.isArray(paths)) {
            paths.forEach((p: string) => revalidatePath(p));
        }

        // Revalider des tags
        if (tag) {
            revalidateTag(tag);
        }
        if (tags && Array.isArray(tags)) {
            tags.forEach((t: string) => revalidateTag(t));
        }

        // Revalider par reservationId
        if (reservationId) {
            revalidatePath(`/dashboard/owner/reservations/${reservationId}`);
            revalidatePath(`/dashboard/reservations/${reservationId}`);
            revalidatePath('/dashboard/owner');
            revalidatePath('/dashboard');
        }

        if (!path && !paths && !tag && !tags && !reservationId) {
            return NextResponse.json({ message: 'Missing path, tag, or reservationId' }, { status: 400 });
        }

        return NextResponse.json({ revalidated: true, now: Date.now() });
    } catch (err) {
        return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
    }
}
