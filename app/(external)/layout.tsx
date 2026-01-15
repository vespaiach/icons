import { GoogleTagManager } from '@next/third-parties/google';

export default function Layout({ children }: { children: React.ReactNode }) {
    const isProduction = process.env.NODE_ENV === 'production';

    return (
        <>
            {isProduction && <GoogleTagManager gtmId="GTM-WSJZT79T" />}
            {children}
        </>
    );
}
