export default function IconsGridSkeleton({ iconCount }: { iconCount: number }) {
    return (
        <div className="ic-grid">
            {Array.from({ length: iconCount }, (_, index) => (
                <div key={index} className="ic-skeleton" />
            ))}
        </div>
    );
}
