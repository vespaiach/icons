'use client';

export default function SkeletonIconsContainer({ iconCount }: { iconCount: number }) {
    return Array.from({ length: iconCount }, (_, index) => (
        <div key={index} className="w-14 h-14 bg-gray-200 rounded-md animate-pulse"></div>
    ));
}
