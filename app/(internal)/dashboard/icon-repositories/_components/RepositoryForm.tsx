'use client';

import { useActionState } from 'react';
import { assertArray } from '@/db/assert.helpers';

interface FormState {
    errors: Record<string, string[]>;
}

interface RepositoryFormProps {
    mode: 'create' | 'edit';
    formAction: (prevState: FormState, formData: FormData) => Promise<FormState>;
    initialData?: {
        id?: number;
        owner: string;
        name: string;
        ref: string;
    };
}

export default function RepositoryForm({ mode, formAction, initialData }: RepositoryFormProps) {
    const [formState, action, isPending] = useActionState(formAction, { errors: {} });

    return (
        <form action={action} className="space-y-6">
            {assertArray(formState.errors?.global) && (
                <div className="d-alert d-alert-error">
                    {formState.errors.global.map((err: string) => (
                        <div key={err}>{err}</div>
                    ))}
                </div>
            )}

            {mode === 'edit' && initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

            <div className="form-control">
                <label htmlFor="owner" className="d-label">
                    <span className="d-label-text">Repository Owner</span>
                </label>
                <input
                    id="owner"
                    type="text"
                    name="owner"
                    defaultValue={initialData?.owner}
                    className="d-input d-input-bordered"
                    placeholder="e.g., lucide-icons"
                    required
                />
                {assertArray(formState.errors?.owner) && (
                    <div className="d-label">
                        <span className="d-label-text-alt text-error">
                            {formState.errors.owner.join(', ')}
                        </span>
                    </div>
                )}
            </div>

            <div className="form-control">
                <label htmlFor="name" className="d-label">
                    <span className="d-label-text">Repository Name</span>
                </label>
                <input
                    id="name"
                    type="text"
                    name="name"
                    defaultValue={initialData?.name}
                    className="d-input d-input-bordered"
                    placeholder="e.g., lucide"
                    required
                />
                {assertArray(formState.errors?.name) && (
                    <div className="d-label">
                        <span className="d-label-text-alt text-error">
                            {formState.errors.name.join(', ')}
                        </span>
                    </div>
                )}
            </div>

            <div className="form-control">
                <label htmlFor="ref" className="d-label">
                    <span className="d-label-text">Branch/Tag Reference</span>
                </label>
                <input
                    id="ref"
                    type="text"
                    name="ref"
                    defaultValue={initialData?.ref}
                    className="d-input d-input-bordered"
                    placeholder="e.g., main"
                    required
                />
                {assertArray(formState.errors?.ref) && (
                    <div className="d-label">
                        <span className="d-label-text-alt text-error">{formState.errors.ref.join(', ')}</span>
                    </div>
                )}
            </div>

            <div className="flex gap-4">
                <button type="submit" className="d-btn d-btn-primary" disabled={isPending}>
                    {isPending ? (
                        <>
                            <span className="d-loading d-loading-spinner"></span>
                            {mode === 'create' ? 'Creating...' : 'Updating...'}
                        </>
                    ) : mode === 'create' ? (
                        'Create Repository'
                    ) : (
                        'Update Repository'
                    )}
                </button>
                <a href="/dashboard/icon-repositories" className="d-btn d-btn-ghost">
                    Cancel
                </a>
            </div>
        </form>
    );
}
