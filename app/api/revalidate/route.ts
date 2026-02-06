import { revalidatePath } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const { secret } = await req.json();

    if (!secret || secret !== process.env.REVALIDATE_SECRET) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    // Revalidate all external routes
    revalidatePath('/(external)', 'layout');

    // Revalidate icon routes
    revalidatePath('/ficons/icons', 'page');

    return NextResponse.json({
        revalidated: true,
        timestamp: new Date().toISOString()
    });
}
