'use client';

import { Lock, Unlock } from 'lucide-react';
import { useState } from 'react';
import { cx } from '@/utils/common-helpers';

export default function SizeAdjuster({
    width,
    height,
    onSizeChange
}: {
    width: number;
    height: number;
    onSizeChange: (newWidth: number, newHeight: number) => void;
}) {
    const [isLocked, setIsLocked] = useState(false);

    const handleWidthChange = (newWidth: number) => {
        if (isLocked) {
            // Maintain aspect ratio
            const aspectRatio = height / width;
            const newHeight = Math.round(newWidth * aspectRatio);
            onSizeChange(newWidth, newHeight);
        } else {
            onSizeChange(newWidth, height);
        }
    };

    const handleHeightChange = (newHeight: number) => {
        if (isLocked) {
            // Maintain aspect ratio
            const aspectRatio = width / height;
            const newWidth = Math.round(newHeight * aspectRatio);
            onSizeChange(newWidth, newHeight);
        } else {
            onSizeChange(width, newHeight);
        }
    };

    return (
        <div className="relative before:absolute before:top-0 before:right-0 before:bottom-0 before:left-0 before:scale-105 before:rounded before:bg-base-200 before:z-0">
            <div className="grow z-10 relative">
                <fieldset className="d-fieldset">
                    {!isLocked && (
                        <legend className="d-fieldset-legend flex items-center gap-2">
                            Width: {width}px
                        </legend>
                    )}
                    {isLocked && (
                        <legend className="d-fieldset-legend flex items-center gap-2">
                            Width/Height: {width}px / {height}px
                        </legend>
                    )}
                    <input
                        type="range"
                        name="width"
                        min="8"
                        max="512"
                        value={width}
                        onChange={(e) => {
                            handleWidthChange(Number.parseInt(e.target.value, 10));
                        }}
                        className="d-range d-range-xs disabled:opacity-50"
                    />
                </fieldset>
                <fieldset className="d-fieldset">
                    <legend
                        className={cx('d-fieldset-legend flex items-center gap-2', isLocked && 'opacity-0')}>
                        Height: {height}px
                    </legend>
                    <input
                        type="range"
                        name="height"
                        min="8"
                        max="512"
                        value={height}
                        onChange={(e) => {
                            handleHeightChange(Number.parseInt(e.target.value, 10));
                        }}
                        className="d-range d-range-xs disabled:opacity-50"
                    />
                </fieldset>
            </div>
            <div className="absolute top-1 right-1 z-10">
                <button
                    type="button"
                    className="d-button d-btn-ghost d-button-xs cursor-pointer"
                    onClick={() => setIsLocked(!isLocked)}
                    title={
                        isLocked
                            ? 'Unlock to adjust width and height separately'
                            : 'Lock to maintain aspect ratio'
                    }>
                    {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
                </button>
            </div>
        </div>
    );
}
