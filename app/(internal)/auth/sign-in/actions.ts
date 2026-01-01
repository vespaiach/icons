'use server';

import { RedirectType, redirect } from 'next/navigation';
import { getUserByEmail } from '@/db/users';
import { dropAuthCookie } from '@/utils/session';
import { parseSignInForm } from './validation';

interface SignInFormState {
    values: {
        email: string;
        password: string;
    };
    errors: {
        email?: string[];
        password?: string[];
    };
}

export async function signInAction(prevState: SignInFormState, formData: FormData) {
    const { success, payload, errors } = await parseSignInForm(formData);
    if (!success) {
        return { values: prevState.values, errors };
    }

    const user = await getUserByEmail(payload.email);

    if (!user || !(await Bun.password.verify(payload.password, user.hashedPassword))) {
        return {
            values: { ...prevState.values, email: payload.email },
            errors: { global: ['Invalid email or password.'] }
        };
    }

    await dropAuthCookie(user.id, payload.keepMeSignedIn === 'on' ? 3 * 30 * 24 * 60 * 60 : undefined);

    redirect('/', RedirectType.push);
}
