'use client';

export default function Drawer() {
    return (
        <div className="d-drawer-side">
            <label htmlFor="drawer_toggler" aria-label="close sidebar" className="d-drawer-overlay" />
            <div className="bg-white dark:bg-base-200 w-80 p-5 min-h-full"></div>
        </div>
    );
}
