import { ChevronDown, ChevronUp, CloudDownload, LogOut, PanelRightClose, PanelRightOpen } from 'lucide-react';
import Image from 'next/image';
import { getAuthSession } from '@/utils/session';
import SignOutForm from './_component/SignOutForm';

export default async function InternalLayout({ children }: { children: React.ReactNode }) {
    const session = await getAuthSession();

    return (
        <div className="d-drawer lg:d-drawer-open">
            <input id="my-drawer-4" type="checkbox" className="d-drawer-toggle peer/toggler" />
            <div className="d-drawer-content bg-base-200">
                <nav className="d-navbar w-full border-b border-b-base-300 bg-white sticky top-0 z-10 flex pr-4 pl-2">
                    <label
                        htmlFor="my-drawer-4"
                        aria-label="open sidebar"
                        className="d-btn d-btn-square d-btn-ghost">
                        <PanelRightClose className="hidden peer-checked/toggler:block" />
                        <PanelRightOpen className="block peer-checked/toggler:hidden" />
                    </label>
                    <div className="px-4">Navbar Title</div>
                    <details className="d-dropdown ml-auto group cursor-pointer">
                        <summary className="flex items-center gap-1">
                            {!!session.userProfilePictureUrl && (
                                <div className="d-avatar">
                                    <div className="w-8 rounded-full">
                                        <Image
                                            src="https://img.daisyui.com/images/profile/demo/yellingcat@192.webp"
                                            alt={`${session.userName}'s profile picture`}
                                        />
                                    </div>
                                </div>
                            )}
                            {!session.userProfilePictureUrl && (
                                <div className="d-avatar d-avatar-placeholder">
                                    <div className="bg-neutral text-neutral-content w-8 rounded-full">
                                        <span>{session.userName.charAt(0).toUpperCase()}</span>
                                    </div>
                                </div>
                            )}
                            <p className="text-sm">{session.userName}</p>
                            <ChevronDown className="w-5 group-open:hidden" />
                            <ChevronUp className="w-5 hidden group-open:block" />
                        </summary>
                        <ul className="d-dropdown-content d-menu d-menu-sm bg-white border border-gray-300 d-rounded-box w-56 right-0 mt-1">
                            <li>
                                <a>Item 1</a>
                            </li>
                            <li>
                                <SignOutForm />
                            </li>
                        </ul>
                    </details>
                </nav>
                <div className="p-5">{children}</div>
            </div>

            <div className="d-drawer-side overflow-visible">
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
                                href="/dashboard/repositories"
                                className="d-is-drawer-close:d-tooltip d-is-drawer-close:d-tooltip-right"
                                data-tip="Import Icons">
                                <CloudDownload className="w-4" />
                                <span className="d-is-drawer-close:hidden">Import Icons</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
