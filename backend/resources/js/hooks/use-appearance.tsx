import { useEffect, useState, useSyncExternalStore } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

const applyTheme = (appearance: Appearance) => {
    const isDark = appearance === 'dark' || (appearance === 'system' && prefersDark());

    document.documentElement.classList.toggle('dark', isDark);
};

const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

const handleSystemThemeChange = () => {
    const currentAppearance = localStorage.getItem('appearance') as Appearance;
    applyTheme(currentAppearance || 'system');
};

export function initializeTheme() {
    const savedAppearance = (localStorage.getItem('appearance') as Appearance) || 'system';

    applyTheme(savedAppearance);

    // Add the event listener for system theme changes...
    mediaQuery.addEventListener('change', handleSystemThemeChange);
}

const appearanceStore = {
    subscribe(callback: () => void) {
        if (typeof window === 'undefined') return () => {};
        window.addEventListener('storage', callback);
        window.addEventListener('appearance-change', callback);
        return () => {
            window.removeEventListener('storage', callback);
            window.removeEventListener('appearance-change', callback);
        };
    },
    getSnapshot() {
        if (typeof window === 'undefined') return 'system';
        return (localStorage.getItem('appearance') as Appearance) || 'system';
    },
    getServerSnapshot() {
        return 'system';
    }
};

const updateAppearance = (mode: Appearance) => {
    localStorage.setItem('appearance', mode);
    applyTheme(mode);
    window.dispatchEvent(new Event('appearance-change'));
};

export function useAppearance() {
    const appearance = useSyncExternalStore(
        appearanceStore.subscribe,
        appearanceStore.getSnapshot,
        appearanceStore.getServerSnapshot
    );

    useEffect(() => {
        mediaQuery.addEventListener('change', handleSystemThemeChange);
        return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }, []);

    return { appearance, updateAppearance };
}
