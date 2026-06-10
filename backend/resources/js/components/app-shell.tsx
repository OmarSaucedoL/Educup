import { SidebarProvider } from '@/components/ui/sidebar';
import { useState, useEffect, useRef, useSyncExternalStore } from 'react';

interface AppShellProps {
    children: React.ReactNode;
    variant?: 'header' | 'sidebar';
}

const isLargeScreenStore = {
    subscribe(callback: () => void) {
        if (typeof window === 'undefined') return () => {};
        const mql = window.matchMedia('(min-width: 1024px)');
        mql.addEventListener('change', callback);
        return () => mql.removeEventListener('change', callback);
    },
    getSnapshot() {
        if (typeof window === 'undefined') return true;
        return window.matchMedia('(min-width: 1024px)').matches;
    },
    getServerSnapshot() {
        return true;
    }
};

export function AppShell({ children, variant = 'header' }: AppShellProps) {
    const [isOpen, setIsOpen] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('sidebar') !== 'false' : true));

    const isLarge = useSyncExternalStore(
        isLargeScreenStore.subscribe,
        isLargeScreenStore.getSnapshot,
        isLargeScreenStore.getServerSnapshot
    );

    const prevIsLargeRef = useRef(true);

    if (isLarge !== prevIsLargeRef.current) {
        prevIsLargeRef.current = isLarge;
        if (!isLarge) {
            setIsOpen(false);
        }
    }

    const handleSidebarChange = (open: boolean) => {
        setIsOpen(open);

        if (typeof window !== 'undefined') {
            localStorage.setItem('sidebar', String(open));
        }
    };

    if (variant === 'header') {
        return <div className="flex min-h-screen w-full flex-col">{children}</div>;
    }

    return (
        <SidebarProvider defaultOpen={isOpen} open={isOpen} onOpenChange={handleSidebarChange}>
            {children}
        </SidebarProvider>
    );
}
