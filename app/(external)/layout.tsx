import { GoogleTagManager } from '@next/third-parties/google';

export default function Layout({ children }: { children: React.ReactNode }) {
    const isProduction = process.env.NODE_ENV === 'production';

    return (
        <>
            <link rel="canonical" href="https://stayon.online/ficons" />
            {isProduction && <GoogleTagManager gtmId="GTM-WSJZT79T" />}
            {children}
        </>
    );
}
