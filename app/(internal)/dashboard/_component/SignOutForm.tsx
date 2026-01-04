'use client';

import { LogOut } from 'lucide-react';
import { useActionState } from 'react';
import { signOutAction } from '../actions';

export default function SignOutForm() {
    const [_, formAction, isPending] = useActionState(signOutAction, null);

    return (
        <form action={formAction}>
            {!isPending && (
                <button type="submit" className="flex gap-2 items-center basis-full">
                    <LogOut className="w-4" />
                    Sign Out
                </button>
            )}
            {isPending && (
                <span className="flex gap-2 items-center basis-full">
                    <span className="d-loading d-loading-spinner d-loading-sm"></span>
                    Sign Out
                </span>
            )}
        </form>
    );
}
