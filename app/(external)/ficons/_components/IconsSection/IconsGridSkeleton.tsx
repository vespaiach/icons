import { Fragment } from 'react/jsx-runtime';

export default function IconsGridSkeleton({ variants }: { variants: Variant[] }) {
    return variants.map((variant, index) => {
        return (
            <Fragment key={variant.id}>
                <input
                    readOnly
                    key={variant.id}
                    type="radio"
                    className="d-tab after:capitalize after:font-semibold"
                    aria-label={`${variant.name} (${variant.iconCount})`}
                    checked={index === 0}
                />

                <div className="d-tab-content bg-base-100 p-2 border-base-300">
                    {index === 0 && (
                        <div className="ic-grid">
                            {Array.from({ length: variant.iconCount }, (_, index) => (
                                <div key={index} className="ic-skeleton" />
                            ))}
                        </div>
                    )}
                </div>
            </Fragment>
        );
    });
}
