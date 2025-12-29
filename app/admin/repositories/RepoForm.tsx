'use client';

import { useActionState } from 'react';
import { assertArray } from '@/db/assert.helpers';
import { importFromRepository } from './actions';

export default function RepoForm({ initialState }: { initialState: Repository }) {
    const [state, formAction, isPending] = useActionState(importFromRepository, {
        ...initialState,
        errors: {}
    });

    return (
        <form className="flex items-center gap-4" action={formAction}>
            {assertArray(state.errors.repositoryId) && (
                <div className="text-red-600">
                    {state.errors.repositoryId.map((err, idx) => (
                        <div key={idx}>{err}</div>
                    ))}
                </div>
            )}
            {assertArray(state.errors.global) && (
                <div className="text-red-600">
                    {state.errors.global.map((err, idx) => (
                        <div key={idx}>{err}</div>
                    ))}
                </div>
            )}
            <input type="hidden" name="repositoryId" value={state.id} />
            <div>
                {state.owner}/{state.name} (GitHub ID: {state.githubId})
            </div>
            <div>
                Last Imported At: {state.lastImportedAt ? state.lastImportedAt.toLocaleString() : 'Never'}
            </div>
            {!isPending && (
                <button type="submit" className="p-2 border border-amber-950 rounded">
                    Import
                </button>
            )}
            {isPending && <span>Importing...</span>}
        </form>
    );
}
