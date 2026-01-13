import type { Metadata } from 'next';
import { Geist_Mono, Inclusive_Sans } from 'next/font/google';
import './globals.css';

const inclusiveSans = Inclusive_Sans({
    variable: '--font-inclusive-sans',
    subsets: ['latin']
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin']
});

export const metadata: Metadata = {
    title: 'Ficons - Free Icon Collections - stayon.online',
    description: 'A curated list of free icon collections for designers and developers.',
    openGraph: {
        title: 'Ficons - Free Icon Collections - stayon.online',
        description: 'A curated list of free icon collections for designers and developers.',
        url: 'https://stayon.online/icons',
        siteName: 'Free Icon Collections - stayon.online',
        locale: 'en_US',
        type: 'website'
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Free Icon Collections - stayon.online',
        description: 'A curated list of free icon collections for designers and developers.'
    },
    icons: {
        icon: '/icon.svg',
        shortcut: '/icon.svg',
        apple: '/icon.svg'
    }
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inclusiveSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
        </html>
    );
}
