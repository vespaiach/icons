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
    title: 'Web development helpers',
    description: 'A collection of web development helper tools and resources.',
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" data-theme="light">
            <body className={`${inclusiveSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
        </html>
    );
}
