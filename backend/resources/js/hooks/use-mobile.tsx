import { useSyncExternalStore } from 'react';

const MOBILE_BREAKPOINT = 768;

const mobileStore = {
    subscribe(callback: () => void) {
        if (typeof window === 'undefined') return () => {};
        const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
        mql.addEventListener('change', callback);
        return () => mql.removeEventListener('change', callback);
    },
    getSnapshot() {
        if (typeof window === 'undefined') return false;
        return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches;
    },
    getServerSnapshot() {
        return false;
    }
};

export function useIsMobile() {
    return useSyncExternalStore(
        mobileStore.subscribe,
        mobileStore.getSnapshot,
        mobileStore.getServerSnapshot
    );
}
