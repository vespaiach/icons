'use client';

import { ExternalLink } from 'lucide-react';
import { useActionState } from 'react';
import Box, { BoxHeader } from '@/components/Box';
import { assertString, assertTruthy } from '@/utils/assert-helpers';
import { updateVariantAction } from '../../actions';
import UpdateForm from './UpdateFormWrapper';

export default function PageContent({ variant }: { variant: Variant & { repository: Repository } }) {
    const [formState, formAction, isPending] = useActionState(updateVariantAction, {
        values: {
            ...variant,
            ...variant.svgRootAttributes
        },
        errors: {}
    });

    return (
        <Box>
            <BoxHeader>Variant Configuration</BoxHeader>
            <div className="mb-6 p-4 bg-base-200 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <p>
                        <strong>ID:</strong> {formState.values.id}
                    </p>
                    <p>
                        <strong>Name:</strong> {variant.name}
                    </p>
                    <p>
                        <strong>Path:</strong>{' '}
                        <code className="bg-base-300 px-2 py-1 rounded">{formState.values.path}</code>
                    </p>
                    <p>
                        <strong>Regex:</strong>{' '}
                        <code className="bg-base-300 px-2 py-1 rounded">{formState.values.regex}</code>
                    </p>
                    <p>
                        <strong>Created At:</strong> {variant.createdAt.toLocaleDateString()}
                    </p>
                    <p>
                        <strong>Updated At:</strong> {variant.updatedAt.toLocaleDateString()}
                    </p>
                    <p>
                        <strong>Repository:</strong>{' '}
                        <a
                            href={`https://github.com/${variant.repository.owner}/${variant.repository.name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="d-link inline-flex items-center gap-2">
                            {`${variant.repository.owner}/${variant.repository.name}`}
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </p>
                    <div className="col-span-2">
                        <strong>SVG Root Attributes:</strong>
                        <ul className="list-disc pl-6 mt-4">
                            {assertString(formState.values.fill) && (
                                <li>Fill color: {formState.values.fill}</li>
                            )}
                            {assertString(formState.values.stroke) && (
                                <li>Stroke color: {formState.values.stroke}</li>
                            )}
                            {assertTruthy(formState.values.strokeWidth) && (
                                <li>Stroke width: {formState.values.strokeWidth}</li>
                            )}
                            {assertTruthy(formState.values.width) && <li>Width: {formState.values.width}</li>}
                            {assertTruthy(formState.values.height) && (
                                <li>Height: {formState.values.height}</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
            <UpdateForm formAction={formAction} formState={formState} isPending={isPending} />
        </Box>
    );
}
