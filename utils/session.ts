'use server';

import { getIronSession } from 'iron-session';
import { cookies, headers } from 'next/headers';
import { RedirectType, redirect } from 'next/navigation';
import { getUserById } from '@/db/users';
import { log } from './log.helpers';

const SAFE_FALLBACK = '/';

export async function retrieveUserFromSession() {
    const session = await getAuthSession();
    const user = await getUserById(session.userId);
    if (user) return user;

    redirect('/admin/sign-in', RedirectType.push);
}

export async function getAuthSession() {
    try {
        const session = await getIronSession<Session>(await cookies(), {
            password: Bun.env.COOKIE_SECRET,
            cookieName: 'signed-in'
        });
        if (!session?.userId || !session?.userName) {
            throw new Error('No user ID or user name in session');
        }
        return session;
    } catch {
        redirect(`/auth/sign-in?rt=${await getSafeReturnToPath()}`, RedirectType.push);
    }
}

export async function getReturnToPath() {
    try {
        const session = await getIronSession<{ returnTo: string }>(await cookies(), {
            password: Bun.env.COOKIE_SECRET,
            cookieName: 'rt'
        });
        if (!session?.returnTo) {
            return SAFE_FALLBACK;
        }
        return session.returnTo;
    } catch (err) {
        log('error', 'Failed to get returnTo path from cookie', err);
        return SAFE_FALLBACK;
    }
}

export async function dropAuthCookie(user: User, maxAge = Number(Bun.env.COOKIE_MAX_AGE)) {
    const session = await getIronSession<Session>(await cookies(), {
        cookieName: 'signed-in',
        password: Bun.env.COOKIE_SECRET,
        cookieOptions: {
            secure: true,
            maxAge,
            httpOnly: true,
            sameSite: 'lax'
        }
    });
    session.userId = user.id;
    session.userName = user.name;
    session.userProfilePictureUrl = user.profilePictureUrl;
    await session.save();
}

export async function clearAuthCookie() {
    const session = await getIronSession(await cookies(), {
        cookieName: 'signed-in',
        password: Bun.env.COOKIE_SECRET
    });
    if (session) {
        session.destroy();
    }
}

export async function dropCsrfTokenCookie(csrfToken: string, maxAge = 60 * 60 * 24) {
    const cookieStore = await cookies();
    cookieStore.set('csrf-token', csrfToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge,
        path: '/'
    });
}

export async function dropReturnToCookie(returnTo: string) {
    try {
        const session = await getIronSession<{ returnTo: string }>(await cookies(), {
            cookieName: 'rt',
            password: Bun.env.COOKIE_SECRET,
            cookieOptions: {
                secure: true,
                maxAge: 5 * 60, // 5 minutes
                httpOnly: true,
                sameSite: 'lax'
            }
        });
        session.returnTo = returnTo;
        await session.save();
    } catch (err) {
        log('error', 'Failed to drop returnTo path into cookie', err);
    }
}

export async function clearReturnToCookie() {
    const session = await getIronSession<{ returnTo: string }>(await cookies(), {
        cookieName: 'rt',
        password: Bun.env.COOKIE_SECRET
    });
    if (session) {
        session.destroy();
    }
}

async function getSafeReturnToPath(): Promise<string> {
    const h = await headers();
    const currPath = h.get('X-Curr-Path');

    if (!currPath || !currPath.startsWith('/')) {
        return SAFE_FALLBACK;
    }
    return encodeURIComponent(currPath);
}
