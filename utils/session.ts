'use server';

import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { RedirectType, redirect } from 'next/navigation';
import { getUserById } from '@/db/users';

export async function retrieveUserFromSession() {
    const session = await getAuthSession();
    const user = await getUserById(session.userId);
    if (user) return user;

    redirect('/admin/sign-in', RedirectType.push);
}

export async function getAuthSession() {
    try {
        const session = await getIronSession<{ userId: number }>(await cookies(), {
            password: Bun.env.COOKIE_SECRET,
            cookieName: 'signed-in'
        });
        if (!session?.userId) throw new Error('No user ID in session');
        return session;
    } catch {
        redirect('/admin/sign-in', RedirectType.push);
    }
}

export async function dropAuthCookie(userId: number, maxAge = Number(Bun.env.COOKIE_MAX_AGE)) {
    const session = await getIronSession<{ userId: number }>(await cookies(), {
        cookieName: 'signed-in',
        password: Bun.env.COOKIE_SECRET,
        cookieOptions: {
            secure: true,
            maxAge,
            httpOnly: true,
            sameSite: 'lax'
        }
    });
    session.userId = userId;
    await session.save();
}
