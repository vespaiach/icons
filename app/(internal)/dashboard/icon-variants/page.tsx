import Box, { BoxHeader } from '@/components/Box';
import { loadVariantsAction } from './actions';

export const dynamic = 'force-dynamic';

export default async function VariantsManagementPage() {
    const variants = await loadVariantsAction();

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-xl font-semibold">Icon Variants</h1>
                <a href="/dashboard/icon-variants/new" className="d-btn d-btn-primary">
                    Add New Variant
                </a>
            </div>
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
                                            {[
                                                variant.stroke && `stroke: ${variant.stroke}`,
                                                variant.fill && `fill: ${variant.fill}`,
                                                variant.strokeWidth && `strokeWidth: ${variant.strokeWidth}`
                                            ]
                                                .filter(Boolean)
                                                .join(', ') || 'None'}
                                        </div>
                                    </td>
                                    <td>
                                        <a
                                            href={`/dashboard/icon-variants/${variant.id}`}
                                            className="d-btn d-btn-sm d-btn-primary">
                                            Update
                                        </a>
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
