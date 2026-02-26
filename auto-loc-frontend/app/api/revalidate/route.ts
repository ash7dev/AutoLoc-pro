import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(req: NextRequest) {
    const secret = req.headers.get('x-revalidate-secret');
    if (secret !== process.env.REVALIDATE_SECRET) {
        return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { path, tag } = body;

        if (path) {
            revalidatePath(path);
        }
        if (tag) {
            revalidateTag(tag);
        }

        if (!path && !tag) {
            return NextResponse.json({ message: 'Missing path or tag' }, { status: 400 });
        }

        return NextResponse.json({ revalidated: true, now: Date.now() });
    } catch (err) {
        return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
    }
}
