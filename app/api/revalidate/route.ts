import { revalidatePath } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const { secret, path } = await req.json();

    if (!secret || secret !== process.env.REVALIDATE_SECRET) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    revalidatePath(path);
    return NextResponse.json({ revalidated: true });
}
