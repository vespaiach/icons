'use server';

import { RedirectType, redirect } from 'next/navigation';
import { getUserByEmail } from '@/db/users';
import { dropAuthCookie } from '@/utils/session';
import { parseSignInForm } from './validation';

export async function signInAction(
    _: { email: string; errors: Record<string, string[]> },
    formData: FormData
) {
    const { success, payload, errors } = await parseSignInForm(formData);

    if (!success) {
        return { errors, email: _.email };
    }

    const user = await getUserByEmail(payload.email);
    if (!user || !(await Bun.password.verify(payload.password, user.hashedPassword))) {
        return { email: _.email, errors: { nokeys: ['Invalid email or password.'] } };
    }

    await dropAuthCookie(user.id);

    redirect('/', RedirectType.push);
}
