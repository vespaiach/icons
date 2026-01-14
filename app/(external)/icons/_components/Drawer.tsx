'use client';

import AttributesAdjuster from '@/components/AttributesAdjuster';
import { usePageContext } from './PageContext';
import RepositoryInfo from './RepositoryInfo';

export default function Drawer() {
    const { selectedRepository } = usePageContext();

    return (
        <div className="d-drawer-side">
            <label htmlFor="drawer_toggler" aria-label="close sidebar" className="d-drawer-overlay" />
            <div className="bg-white dark:bg-base-200 w-80 p-5 min-h-full">
                {selectedRepository && (
                    <>
                        <h2 className="font-semibold text-xl capitalize mb-3">{selectedRepository.name}</h2>
                        <RepositoryInfo selectedRepository={selectedRepository} />
                        <h2 className="font-semibold text-xl capitalize mt-8 mb-2">Settings</h2>
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
                // Check if any default attributes are set
                const hasAttributes = Object.keys(variant.defaultSvgAttributes).length > 0;
                if (!hasAttributes) return null;

                return (
                    <div key={variant.id}>
                        <h3 className="font-semibold text-lg capitalize mt-6 mb-2">
                            {variant.name}
                        </h3>
                        <AttributesAdjuster
                            value={{
                                width: variant.defaultSvgAttributes.size ?? 24,
                                height: variant.defaultSvgAttributes.size ?? 24,
                                stroke: variant.defaultSvgAttributes.strokeColor,
                                fill: variant.defaultSvgAttributes.fillColor,
                                strokeWidth: variant.defaultSvgAttributes.strokeWidth
                            }}
                            onChange={(attrs) => {
                                updatedVariant({
                                    ...variant,
                                    defaultSvgAttributes: {
                                        size: attrs.width,
                                        strokeColor: attrs.stroke,
                                        fillColor: attrs.fill,
                                        strokeWidth: attrs.strokeWidth
                                    }
                                });
                            }}
                        />
                    </div>
                );
            })}
        </>
    );
}
