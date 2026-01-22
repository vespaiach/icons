import { type NextRequest, NextResponse } from 'next/server';
import { getIconsByRepositoryId } from '@/db/icons';

export async function POST(request: NextRequest) {
    try {
        // Validate request origin
        const referer = request.headers.get('referer');
        const origin = request.headers.get('origin');
        const customHeader = request.headers.get('x-ficons-request');

        // Check if request comes from ficons page
        const isValidReferer = referer?.includes('/ficons');
        const isValidOrigin = origin && new URL(request.url).origin === origin;
        const hasValidHeader = customHeader === 'true';

        if (!isValidReferer || !isValidOrigin || !hasValidHeader) {
            return NextResponse.json({ error: 'Error' }, { status: 400 });
        }

        const body = await request.json();
        const repositoryId = body.repositoryId;

        if (!repositoryId) {
            return NextResponse.json({ error: 'Error' }, { status: 400 });
        }

        const parsedRepositoryId = Number.parseInt(repositoryId, 10);

        if (Number.isNaN(parsedRepositoryId)) {
            return NextResponse.json({ error: 'Error' }, { status: 400 });
        }

        const icons = await getIconsByRepositoryId(parsedRepositoryId);

        return NextResponse.json(icons);
    } catch (error) {
        console.error('Error fetching icons:', error);
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}
