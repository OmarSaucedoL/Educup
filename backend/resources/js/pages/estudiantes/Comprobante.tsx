import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Calendar, CheckCircle2, CreditCard, User, GraduationCap, Printer } from 'lucide-react';
import { useState } from 'react';

export default function Comprobante({ cup, cups_disponibles, pago, estudiante, opciones }: any) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Comprobante de Pago', href: '/comprobante' },
    ];

    const [selectedCupId, setSelectedCupId] = useState<number | null>(cup?.ID_CUP ?? null);

    const handleCupChange = (id: number) => {
        setSelectedCupId(id);
        router.get('/comprobante', { cup_id: id }, { preserveState: true });
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Comprobante de Pago" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 md:p-6 max-w-4xl mx-auto w-full">
                
                {/* Header and Dropdown */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                            Comprobante de Inscripción
                        </h1>
                        <p className="text-sm text-neutral-500">
                            Detalle de tu pago e inscripción al Curso Universitario de Preparación.
                        </p>
                    </div>

                    {cups_disponibles && cups_disponibles.length > 0 && (
                        <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800">
                            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400 pl-2">
                                Gestión:
                            </span>
                            <select
                                value={selectedCupId ?? ''}
                                onChange={(e) => handleCupChange(Number(e.target.value))}
                                className="h-9 rounded-md border-0 bg-transparent py-0 pl-2 pr-8 text-sm font-semibold focus:ring-0 cursor-pointer"
                            >
                                {cups_disponibles.map((c: any) => (
                                    <option key={c.ID_CUP} value={c.ID_CUP} className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
                                        CUP #{c.ID_CUP} — {c.ANIO}/{c.SEMESTRE}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Comprobante Card */}
                {!cup ? (
                    <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 p-8 text-center bg-neutral-50/50 dark:bg-neutral-900/50">
                        <p className="text-neutral-500">No estás inscrito en ningún CUP.</p>
                    </div>
                ) : !pago ? (
                    <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 p-8 text-center bg-neutral-50/50 dark:bg-neutral-900/50">
                        <p className="text-neutral-500">No se encontró información de pago para esta gestión.</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
                        {/* Receipt Header */}
                        <div className="bg-green-50 dark:bg-green-900/20 border-b border-green-100 dark:border-green-900/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-green-800 dark:text-green-300">Pago Completado Exitosamente</h2>
                                    <p className="text-sm text-green-600 dark:text-green-400">Tu inscripción ha sido confirmada.</p>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-center sm:items-end">
                                <span className="text-3xl font-black text-neutral-900 dark:text-neutral-100">
                                    ${Number(pago.MONTO).toFixed(2)}
                                </span>
                                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                    Monto Pagado
                                </span>
                            </div>
                        </div>

                        {/* Receipt Body */}
                        <div className="p-6 grid gap-8 md:grid-cols-2">
                            {/* Student Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                                    <User className="h-4 w-4" /> Datos del Estudiante
                                </h3>
                                <div className="grid gap-2 text-sm">
                                    <div className="grid grid-cols-2 py-1 border-b border-neutral-100 dark:border-neutral-800">
                                        <span className="text-neutral-500">Nombre Completo:</span>
                                        <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-right">
                                            {estudiante.NOMBRE} {estudiante.APELLIDO}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 py-1 border-b border-neutral-100 dark:border-neutral-800">
                                        <span className="text-neutral-500">Carnet de Identidad:</span>
                                        <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-right">
                                            {estudiante.CARNET}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 py-1 border-b border-neutral-100 dark:border-neutral-800">
                                        <span className="text-neutral-500">Correo Electrónico:</span>
                                        <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-right truncate">
                                            {estudiante.CORREO}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" /> Detalles de Transacción
                                </h3>
                                <div className="grid gap-2 text-sm">
                                    <div className="grid grid-cols-2 py-1 border-b border-neutral-100 dark:border-neutral-800">
                                        <span className="text-neutral-500">ID Transacción PayPal:</span>
                                        <span className="font-mono text-xs font-semibold text-neutral-900 dark:text-neutral-100 text-right break-all">
                                            {pago.PAYPAL_ORDER_ID}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 py-1 border-b border-neutral-100 dark:border-neutral-800">
                                        <span className="text-neutral-500">Fecha de Pago:</span>
                                        <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-right">
                                            {formatDate(pago.FECHA_PAGO)}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 py-1 border-b border-neutral-100 dark:border-neutral-800">
                                        <span className="text-neutral-500">Gestión CUP:</span>
                                        <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-right">
                                            {cup.ANIO} / {cup.SEMESTRE}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Opciones Carrera */}
                            <div className="md:col-span-2 space-y-4 mt-2">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4" /> Carreras Postuladas
                                </h3>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {opciones && opciones.map((op: any) => (
                                        <div key={op.ID} className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800">
                                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1 block">
                                                Opción {op.OPCION}
                                            </span>
                                            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                                                {op.carrera_cup?.carrera?.NOMBRE || 'Carrera Desconocida'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        {/* Print Button */}
                        <div className="bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 p-4 flex justify-end">
                            <button
                                onClick={() => window.print()}
                                className="flex items-center gap-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-2 rounded-lg font-semibold text-sm transition-colors hover:bg-neutral-800 dark:hover:bg-neutral-200"
                            >
                                <Printer className="h-4 w-4" />
                                Imprimir Comprobante
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .max-w-4xl, .max-w-4xl * {
                        visibility: visible;
                    }
                    .max-w-4xl {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    button, select {
                        display: none !important;
                    }
                    /* Forzar que se impriman los colores de fondo */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}} />
        </AppLayout>
    );
}
