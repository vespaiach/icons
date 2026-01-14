import Link from 'next/link';
import Box, { BoxHeader } from '@/components/Box';
import { loadVariantsAction } from './actions';

export default async function VariantsManagementPage() {
    const variants = await loadVariantsAction();

    return (
        <div>
            <h1 className="text-xl font-semibold mb-8">Icon Variants</h1>
            <Box>
                <BoxHeader>List of Variants</BoxHeader>
                <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
                    <table className="d-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Variant Name</th>
                                <th>Repository</th>
                                <th>Path</th>
                                <th>Regex</th>
                                <th>Attributes</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {variants.map((variant) => (
                                <tr key={variant.id}>
                                    <th>{variant.id}</th>
                                    <td>
                                        <span className="d-badge d-badge-primary">{variant.name}</span>
                                    </td>
                                    <td>
                                        <a
                                            href={`https://github.com/${variant.repositoryOwner}/${variant.repositoryName}`}
                                            className="d-link"
                                            target="_blank"
                                            rel="noopener noreferrer">
                                            {variant.repositoryOwner}/{variant.repositoryName}
                                        </a>
                                    </td>
                                    <td>
                                        <code className="text-xs bg-base-200 px-2 py-1 rounded">
                                            {variant.path}
                                        </code>
                                    </td>
                                    <td>
                                        <code className="text-xs bg-base-200 px-2 py-1 rounded">
                                            {variant.regex}
                                        </code>
                                    </td>
                                    <td>
                                        <div className="flex flex-wrap gap-1">
                                            {Object.entries(variant.defaultSvgAttributes).length > 0
                                                ? Object.entries(variant.defaultSvgAttributes)
                                                      .map(([key, value]) => `${key}: ${value}`)
                                                      .join(', ')
                                                : 'None'}
                                        </div>
                                    </td>
                                    <td>
                                        <Link
                                            href={`/dashboard/icon-variants/${variant.id}`}
                                            className="d-btn d-btn-sm d-btn-primary">
                                            Update
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Box>
        </div>
    );
}
