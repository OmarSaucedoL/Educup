import { SidebarProvider } from '@/components/ui/sidebar';
import { useState, useEffect } from 'react';

interface AppShellProps {
    children: React.ReactNode;
    variant?: 'header' | 'sidebar';
}

export function AppShell({ children, variant = 'header' }: AppShellProps) {
    const [isOpen, setIsOpen] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('sidebar') !== 'false' : true));

    const handleSidebarChange = (open: boolean) => {
        setIsOpen(open);

        if (typeof window !== 'undefined') {
            localStorage.setItem('sidebar', String(open));
        }
    };

    // Auto-collapse sidebar on smaller screens (width < 1024px)
    useEffect(() => {
        if (typeof window === 'undefined') return;

        let prevWidth = window.innerWidth;

        // Auto-collapse on mount if screen is already small
        if (prevWidth < 1024) {
            setIsOpen(false);
        }

        const handleResize = () => {
            const currentWidth = window.innerWidth;
            // Collapse automatically if transitioning from large to small screen
            if (currentWidth < 1024 && prevWidth >= 1024) {
                setIsOpen(false);
            }
            prevWidth = currentWidth;
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (variant === 'header') {
        return <div className="flex min-h-screen w-full flex-col">{children}</div>;
    }

    return (
        <SidebarProvider defaultOpen={isOpen} open={isOpen} onOpenChange={handleSidebarChange}>
            {children}
        </SidebarProvider>
    );
}
