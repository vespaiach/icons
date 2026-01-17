'use client';

import AttributesAdjuster from '@/components/AttributesAdjuster';
import { usePageContext } from './PageContext';
import RepositoryInfo from './RepositoryInfo';

export default function Drawer({ repositories }: { repositories: RepositoryVariants[] }) {
    const { selectedRepositoryId } = usePageContext();
    const repository = repositories.find((repo) => repo.id === selectedRepositoryId);

    return (
        <div className="d-drawer-side">
            <label htmlFor="drawer_toggler" aria-label="close sidebar" className="d-drawer-overlay" />
            <div className="bg-white dark:bg-base-200 w-80 p-5 min-h-full">
                {repository && (
                    <>
                        <h2 className="font-semibold text-xl capitalize mb-3">{repository.name}</h2>
                        <RepositoryInfo selectedRepository={repository} />
                        <h2 className="font-semibold text-xl capitalize mt-8 mb-2">Settings</h2>
                        <SettingForm repository={repository} />
                    </>
                )}
            </div>
        </div>
    );
}

function SettingForm({ repository }: { repository: RepositoryVariants }) {
    const { svgAttributeAdjustments, setSvgAttributeAdjustments } = usePageContext();
    const variants = repository.variants;

    return (
        <>
            {variants.map((variant) => {
                // Check if any default attributes are set
                const hasAttributes = Object.keys(variant.defaultSvgAttributes).length > 0;
                if (!hasAttributes) return null;

                return (
                    <div key={variant.id}>
                        <h3 className="font-semibold text-lg capitalize mt-6 mb-2">{variant.name}</h3>
                        <AttributesAdjuster
                            value={{
                                ...variant.defaultSvgAttributes,
                                ...svgAttributeAdjustments[variant.id]
                            }}
                            onChange={(attrs) => {
                                setSvgAttributeAdjustments(variant.id, attrs);
                            }}
                        />
                    </div>
                );
            })}
        </>
    );
}
