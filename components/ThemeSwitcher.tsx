'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeSwitcher() {
    const [theme, setTheme] = useState<'light' | 'dracula'>('light');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dracula' | null;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = savedTheme || (prefersDark ? 'dracula' : 'light');
        setTheme(initialTheme);
        document.documentElement.setAttribute('data-theme', initialTheme);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dracula' : 'light';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    if (!mounted) {
        return <div className="d-swap d-swap-rotate w-8 h-8" />;
    }

    return (
        <label className="d-btn d-btn-ghost d-swap d-swap-rotate">
            <input type="checkbox" checked={theme === 'dracula'} onChange={toggleTheme} />
            <Sun className="d-swap-off w-5 h-5" />
            <Moon className="d-swap-on w-5 h-5" />
        </label>
    );
}
