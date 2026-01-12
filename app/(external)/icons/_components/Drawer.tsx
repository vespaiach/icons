'use client';

import AttributesAdjuster from '@/components/AttributesAdjuster';
import { usePageContext } from './PageContext';
import RepositoryInfo from './RepositoryInfo';

export default function Drawer() {
    const { selectedRepository, getVariantsByRepositoryId } = usePageContext();
    const variants = getVariantsByRepositoryId(selectedRepository?.id || 0);

    return (
        <div className="d-drawer-side">
            <label htmlFor="drawer_toggler" aria-label="close sidebar" className="d-drawer-overlay" />
            <div className="bg-white dark:bg-base-200 w-80 p-4 min-h-full">
                {selectedRepository && (
                    <>
                        <h2 className="font-semibold text-lg capitalize mb-3">{selectedRepository.name}</h2>
                        <RepositoryInfo selectedRepository={selectedRepository} />
                        <h2 className="font-semibold text-lg capitalize mt-4 mb-3">Settings</h2>
                        <SettingForm repository={selectedRepository} />
                    </>
                )}
            </div>
        </div>
    );
}

function SettingForm({ repository }: { repository: Repository }) {
    const { getVariantsByRepositoryId, updatedVariant } = usePageContext();
    const variants = getVariantsByRepositoryId(repository.id);

    return (
        <>
            {variants.map((variant) => {
                if (!variant.svgAttributes) return null;
                return (
                    <div key={variant.id}>
                        <h3 className="font-semibold text-sm capitalize mt-6 mb-2">
                            {variant.name} Settings
                        </h3>
                        <AttributesAdjuster
                            value={variant.svgAttributes}
                            onChange={(svgAttributes) => {
                                updatedVariant({ ...variant, svgAttributes });
                            }}
                        />
                    </div>
                );
            })}
        </>
    );
}
