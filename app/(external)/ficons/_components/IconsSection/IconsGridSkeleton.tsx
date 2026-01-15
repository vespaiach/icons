export default function IconsGridSkeleton({ iconCount }: { iconCount: number }) {
    return (
        <div className="icons-grid">
            {Array.from({ length: iconCount }, (_, index) => (
                <div key={index} className="icon-skeleton" />
            ))}
        </div>
    );
}
