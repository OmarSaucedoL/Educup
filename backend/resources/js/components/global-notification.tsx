import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, ShieldAlert, X } from 'lucide-react';

export function GlobalNotification() {
    const { flash } = usePage<any>().props;
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState<'success' | 'error' | 'forbidden'>('success');

    useEffect(() => {
        if (flash?.forbidden) {
            setMessage(flash.forbidden);
            setType('forbidden');
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), 5500);
            return () => clearTimeout(timer);
        } else if (flash?.success) {
            setMessage(flash.success);
            setType('success');
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), 4500);
            return () => clearTimeout(timer);
        } else if (flash?.error) {
            setMessage(flash.error);
            setType('error');
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), 4500);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    if (!visible || !message) return null;

    const icons = {
        success:   <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
        error:     <AlertCircle className="h-5 w-5 text-rose-500" />,
        forbidden: <ShieldAlert className="h-5 w-5 text-amber-500" />,
    };

    const titles = {
        success:   'Proceso Completado',
        error:     'Advertencia / Error',
        forbidden: 'Acceso Denegado',
    };

    return (
        <div className="fixed top-5 right-5 z-[100] max-w-sm w-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg border border-neutral-200/50 dark:border-neutral-800 rounded-xl p-4 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex gap-3">
                <div className="shrink-0">
                    {icons[type]}
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                        {titles[type]}
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed font-medium">
                        {message}
                    </p>
                </div>
                <button
                    onClick={() => setVisible(false)}
                    className="shrink-0 h-5 w-5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}
