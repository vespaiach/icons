'use client';

import { usePageContext } from './PageContext';

export default function DrawerToggler() {
    const { selectedRepositoryId, setSelectedRepositoryId } = usePageContext();

    return (
        <input
            id="drawer_toggler"
            type="checkbox"
            checked={Boolean(selectedRepositoryId)}
            readOnly
            className="d-drawer-toggle"
            onChange={() => {
                setSelectedRepositoryId(null);
            }}
        />
    );
}
