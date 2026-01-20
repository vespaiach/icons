'use client';

import { useDrawerAction, useDrawerValue } from './PageContext';

export default function DrawerToggler() {
    const drawerOpen = useDrawerValue();
    const [_, close] = useDrawerAction();
    return (
        <input
            id="drawer_toggler"
            type="checkbox"
            checked={drawerOpen}
            onChange={close}
            readOnly
            className="d-drawer-toggle"
        />
    );
}
