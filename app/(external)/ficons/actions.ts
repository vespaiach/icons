'use server';

import { randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { getIconsByRepositoryId } from '@/db/icons';
import { getRepositoriesWithVariants } from '@/db/repositories';
import { dropCsrfTokenCookie } from '@/utils/session';

export async function ensureCsrfToken(): Promise<string> {
    const cookieStore = await cookies();
    let csrfToken = cookieStore.get('csrf-token')?.value;

    if (!csrfToken) {
        csrfToken = randomBytes(32).toString('base64url');
        await dropCsrfTokenCookie(csrfToken);
    }

    return csrfToken;
}

export async function getRepositoriesAction() {
    return await getRepositoriesWithVariants();
}

export async function getIconsByRepositoryIdAction(repositoryId: number) {
    return await getIconsByRepositoryId(repositoryId);
}
