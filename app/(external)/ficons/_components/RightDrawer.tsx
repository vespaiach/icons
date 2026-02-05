export default function RightDrawer() {
    return (
        <div className="d-drawer d-drawer-end">
            <input id="right_drawer_toggler" type="checkbox" className="d-drawer-toggle" />
            <div className="d-drawer-content"></div>
            <div className="d-drawer-side"></div>
        </div>
    );
}
