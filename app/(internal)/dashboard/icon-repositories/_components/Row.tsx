'use client';

import { useActionState } from 'react';
import { importFromRepositoryAction } from '../actions';
import Form from './Form';

export default function Row({
    repository,
    order
}: {
    order: number;
    repository: RepositoryVariantsWithIconCount;
}) {
    const [formState, formAction, isPending] = useActionState(importFromRepositoryAction, {
        ...repository,
        errors: {}
    });

    return (
        <tr>
            <th>{order}</th>
            <td>
                <a
                    href={`https://github.com/${formState.owner}/${formState.name}`}
                    className="d-link"
                    target="_blank"
                    rel="noopener noreferrer">
                    {formState.owner}/{formState.name}
                </a>
            </td>
            <td>
                <div className="flex flex-wrap gap-1">
                    {repository.variants.map((variant) => (
                        <span key={variant.id} className="d-badge d-badge-sm">
                            {variant.name}
                        </span>
                    ))}
                </div>
            </td>
            {/* TODO: fix this icon count to make it realtime */}
            <td>{repository.iconCount.toLocaleString()}</td>
            <td>{formState.lastImportedAt ? formState.lastImportedAt.toLocaleString() : 'Never'}</td>
            <td>
                <Form formState={formState} isPending={isPending} formAction={formAction} />
            </td>
        </tr>
    );
}
