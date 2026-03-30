import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

function getSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
    const root = document.documentElement;
    const resolved = theme === 'system' ? getSystemTheme() : theme;
    if (resolved === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
}

export function useTheme() {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window === 'undefined') return 'dark';
        return (localStorage.getItem('theme') as Theme) || 'dark';
    });

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    // Apply on mount immediately
    useEffect(() => {
        const stored = (localStorage.getItem('theme') as Theme) || 'dark';
        applyTheme(stored);
    }, []);

    // Listen for system theme changes
    useEffect(() => {
        if (theme !== 'system') return;
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => applyTheme('system');
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, [theme]);

    const setTheme = (t: Theme) => {
        localStorage.setItem('theme', t);
        setThemeState(t);
    };

    const toggleTheme = () => {
        const current = theme === 'system' ? getSystemTheme() : theme;
        setTheme(current === 'dark' ? 'light' : 'dark');
    };

    const isDark = theme === 'system' ? getSystemTheme() === 'dark' : theme === 'dark';

    return { theme, setTheme, toggleTheme, isDark };
}
