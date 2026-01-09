'use client';

import { usePageContext } from './PageContext';
import RepositoryInfo from './RepositoryInfo';

export default function Drawer() {
    const { selectedRepository } = usePageContext();

    return (
        <div className="d-drawer-side">
            <label htmlFor="drawer_toggler" aria-label="close sidebar" className="d-drawer-overlay" />
            <div className="bg-white dark:bg-base-200 w-80 p-4 min-h-full">
                {selectedRepository && (
                    <>
                        <h2 className="font-semibold text-lg capitalize mb-3">{selectedRepository.name}</h2>
                        <RepositoryInfo selectedRepository={selectedRepository} />
                        <h2 className="font-semibold text-lg capitalize mt-4 mb-3">Settings</h2>
                    </>
                )}
            </div>
        </div>
    );
}
