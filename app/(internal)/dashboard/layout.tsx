import { CloudDownload, PanelRightClose, PanelRightOpen } from 'lucide-react';

export default function InternalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="d-drawer lg:d-drawer-open">
            <input id="my-drawer-4" type="checkbox" className="d-drawer-toggle peer/toggler" />
            <div className="d-drawer-content bg-base-200">
                <nav className="d-navbar w-full border-b border-b-base-300 bg-white sticky top-0 z-10">
                    <label
                        htmlFor="my-drawer-4"
                        aria-label="open sidebar"
                        className="d-btn d-btn-square d-btn-ghost">
                        <PanelRightClose className="hidden peer-checked/toggler:block" />
                        <PanelRightOpen className="block peer-checked/toggler:hidden" />
                    </label>
                    <div className="px-4">Navbar Title</div>
                </nav>
                <div className="p-5">{children}</div>
            </div>

            <div className="d-drawer-side d-is-drawer-open:overflow-visible">
                <label htmlFor="my-drawer-4" aria-label="close sidebar" className="d-drawer-overlay"></label>
                <div className="flex min-h-full flex-col items-start d-is-drawer-close:w-14 d-is-drawer-open:w-64 border-r border-r-base-300">
                    <div className="pt-4 pb-8 self-stretch px-5">
                        <span className="text-[#38bdf8] font-semibold d-is-drawer-close:hidden">
                            STAY <span className="text-xl">🌐</span> ONLINE
                        </span>
                        <span className="text-[#38bdf8] font-semibold text-xl d-is-drawer-open:hidden">
                            🌐
                        </span>
                    </div>
                    <ul className="d-menu w-full grow">
                        <li>
                            <a
                                href="#"
                                className="d-is-drawer-close:tooltip d-is-drawer-close:tooltip-right"
                                data-tip="Homepage">
                                <CloudDownload />
                                <span className="d-is-drawer-close:hidden">Import Icons</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
