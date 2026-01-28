import { type NextRequest, NextResponse } from 'next/server';
import * as v from 'valibot';
import { getIconsByVariantId } from '@/db/icons';
import { log } from '@/utils/log.helpers';

const iconsRequestSchema = v.object({
    variantId: v.pipe(v.number(), v.minValue(1, 'Variant ID must be a positive number'))
});

// Next.js will cache responses for 1 day
export const revalidate = 86400; // 1 day in seconds
export const dynamic = 'force-dynamic'; // Mark as dynamic route since we use request.url

export async function GET(request: NextRequest) {
    try {
        // Prevent access from other sites
        const origin = request.headers.get('origin');
        const referer = request.headers.get('referer');
        const host = request.headers.get('host');

        // Check if request comes from the same origin
        const isValidOrigin = origin ? new URL(origin).host === host : true;
        const isValidReferer = referer ? new URL(referer).host === host : true;

        if (!isValidOrigin || !isValidReferer) {
            log('warn', '[icons/route] GET - FORBIDDEN: Invalid origin', { origin, referer, host });
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = request.nextUrl;
        const variantIdParam = searchParams.get('variantId');

        // Parse and validate variantId
        const variantId = variantIdParam ? Number(variantIdParam) : null;

        const validation = v.safeParse(iconsRequestSchema, { variantId });

        if (!validation.success) {
            const errors = validation.issues.map((issue) => issue.message).join(', ');
            return NextResponse.json({ error: errors }, { status: 400 });
        }

        const { variantId: validatedVariantId } = validation.output;

        log('info', '[icons/route] GET - START', { variantId: validatedVariantId });

        const icons = await getIconsByVariantId(validatedVariantId);

        log('info', '[icons/route] GET - END', { count: icons.length });

        return Response.json(icons);
    } catch (error) {
        log('error', '[icons/route] GET - ERROR', error);
        return NextResponse.json({ error: 'Failed to fetch icons' }, { status: 500 });
    }
}
