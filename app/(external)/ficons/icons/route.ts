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
