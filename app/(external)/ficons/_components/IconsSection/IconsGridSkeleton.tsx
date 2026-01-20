import { cx } from '@/utils/common-helpers';

export default function IconsGridSkeleton({
    repositoryId,
    checked,
    variant
}: {
    repositoryId: number;
    checked: boolean;
    variant: Variant;
}) {
    return (
        <>
            <input
                type="radio"
                className={cx('d-tab', checked && 'd-tab-active')}
                name={`icon-variant-tab-${repositoryId}`}
                aria-label={`${variant.name} (${variant.iconCount})`}
                disabled={!checked}
            />
            <div className="d-tab-content bg-base-100 border-base-300 p-2">
                <div className="ic-grid">
                    {checked
                        ? Array.from({ length: variant.iconCount }, (_, index) => (
                              <div key={index} className="ic-skeleton" />
                          ))
                        : null}
                </div>
            </div>
        </>
    );
}
