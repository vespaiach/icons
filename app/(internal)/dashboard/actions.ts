'use server';

import { RedirectType, redirect } from 'next/navigation';
import { clearAuthCookie } from '@/utils/session';

export async function signOutAction() {
    await clearAuthCookie();
    redirect('/auth/sign-in', RedirectType.push);
}
