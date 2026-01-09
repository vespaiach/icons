import { cx } from '@/utils/common-helpers';

export default function Box({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cx('border border-gray-300 rounded-xl bg-white co-p-6', className)}>{children}</div>
    );
}

export function BoxHeader({ children, className }: { children: string; className?: string }) {
    return <h3 className={cx('font-semibold co-mb-6', className)}>{children}</h3>;
}
