'use client';

import { useActionState } from 'react';
import { importFromRepository } from './actions';

export default function RepoForm({ children }: { children: React.ReactNode }) {
    const [state, formAction, isPending] = useActionState(
        importFromRepository,
        {}
    );

    return (
        <form className="flex items-center gap-4" action={formAction}>
            {children}
            {!isPending && (
                <button
                    type="submit"
                    className="p-2 border border-amber-950 rounded">
                    Import
                </button>
            )}
            {isPending && <span>Importing...</span>}
        </form>
    );
}
