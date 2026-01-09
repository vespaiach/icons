'use client';

import { usePageContext } from './PageContext';

export default function DrawerToggler() {
    const { selectedRepository, setSelectedRepository } = usePageContext();

    return (
        <input
            id="drawer_toggler"
            type="checkbox"
            checked={Boolean(selectedRepository)}
            readOnly
            className="d-drawer-toggle"
            onChange={() => {
                setSelectedRepository(null);
            }}
        />
    );
}
