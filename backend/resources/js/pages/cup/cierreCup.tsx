import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Activity, Award, Calendar, CheckCircle2, ChevronLeft, Lock, Search, Users, X, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';

interface CarreraOcupacion {
    carrera_cup_id: number;
    nombre: string;
    cupos_totales: number;
    cupos_ocupados: number;
    porcentaje: number;
}

interface Estudiante {
    ID_ESTUDIANTE: number;
    CARNET: number;
    NOMBRE: string;
    APELLIDO: string;
    CORREO: string;
}

interface EstudianteCupEntry {
    ID: number;
    ID_ESTUDIANTE: number;
    ID_CUP: number;
    FECHA: string;
    ESTADO: string;
    NOTA_FINAL: string | null;
    CARRERA: string | null;
    preferencia_asignada: number | null;
    estudiante: Estudiante | null;
}

interface CierreCupProps {
    cup: any;
    ocupacion: CarreraOcupacion[];
    estudianteCups: {
        data: EstudianteCupEntry[];
        current_page: number;
        last_page: number;
        total: number;
        links: any[];
    };
    filters: {
        search?: string;
    };
}

export default function CierreCupPage({ cup, ocupacion, estudianteCups, filters }: CierreCupProps) {
    const { props } = usePage<any>();
    const flash = props.flash as { success?: string } | undefined;
    const [search, setSearch] = useState(filters.search || '');
    const [processing, setProcessing] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);

    useEffect(() => {
        if (flash?.success) {
            setIsSuccessOpen(true);
        }
    }, [flash]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Gestión Académica', href: '#' },
        { title: 'CUP', href: '/cup' },
        { title: `CUP #${cup.ID_CUP}`, href: `/cup/${cup.ID_CUP}` },
        { title: 'Cierre de Gestión', href: '#' },
    ];

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(`/cup/${cup.ID_CUP}/cierre`, { search }, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        setSearch('');
        router.get(`/cup/${cup.ID_CUP}/cierre`, { search: '' }, { preserveState: true, replace: true });
    };

    const handleConfirmCierre = () => {
        setIsConfirmOpen(false);
        setProcessing(true);
        router.post(`/cup/${cup.ID_CUP}/cierre`, {}, {
            onFinish: () => setProcessing(false)
        });
    };

    const isConcluido = cup.ESTADO === 'Concluido';
    const confirmMessage = isConcluido
        ? 'La gestión de este CUP ya está Concluida. ¿Deseas volver a ejecutar el proceso de asignación de cupos? Esto re-calculará las plazas desde cero.'
        : '¿Estás seguro de que deseas cerrar la gestión de este CUP? Esto ejecutará la asignación de plazas por estricto orden de mérito y cambiará el estado del CUP a Concluido.';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Cierre de Gestión CUP #${cup.ID_CUP}`} />

            <div className="mx-auto flex h-full w-full max-w-5xl flex-1 flex-col gap-6 rounded-xl p-4 md:p-6">
                {/* ── Header ── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/60">
                            <Lock className="h-7 w-7 text-neutral-900 dark:text-neutral-100" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Cierre de Gestión y Asignación</h1>
                            <p className="text-muted-foreground mt-0.5 text-sm">
                                Periodo: {cup.ANIO} - Semestre {cup.SEMESTRE} · Estado del CUP: <span className="font-extrabold uppercase">{cup.ESTADO}</span>
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" asChild className="shrink-0 gap-1.5 text-sm font-semibold">
                        <Link href={`/cup/${cup.ID_CUP}`}>
                            <ChevronLeft className="h-4 w-4" /> Volver a CUP
                        </Link>
                    </Button>
                </div>

                {/* Flash success banner removed - handled via Modal popup */}

                {/* ── Resumen y Acciones Principales ── */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Tarjeta de Ocupación por Carrera */}
                    <div className="bg-card rounded-xl border border-neutral-200/60 dark:border-neutral-800 p-5 shadow-xs flex flex-col gap-4">
                        <h2 className="text-sm font-bold text-neutral-700 dark:text-neutral-200 flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            Ocupación de Plazas por Carrera
                        </h2>
                        
                        <div className="flex flex-col gap-3.5 flex-1 justify-center">
                            {ocupacion.map((oc) => (
                                <div key={oc.carrera_cup_id} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs font-bold">
                                        <span className="text-neutral-700 dark:text-neutral-300 truncate max-w-[70%]">{oc.nombre}</span>
                                        <span className="text-neutral-500">
                                            {oc.cupos_ocupados} / {oc.cupos_totales} Plazas ({oc.porcentaje}%)
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-neutral-900 dark:bg-white rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min(oc.porcentaje, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tarjeta de Acción / Estado */}
                    <div className="bg-card rounded-xl border border-neutral-200/60 dark:border-neutral-800 p-5 shadow-xs flex flex-col justify-between gap-4">
                        <div className="space-y-2">
                            <h2 className="text-sm font-bold text-neutral-700 dark:text-neutral-200 flex items-center gap-2">
                                <Activity className="h-4 w-4 text-primary" />
                                Estado del Cierre de Gestión
                            </h2>
                            {isConcluido ? (
                                <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-400 flex items-start gap-2.5">
                                    <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold">¡Gestión Concluida!</p>
                                        <p className="mt-1 text-[11px] leading-relaxed text-emerald-700/90 dark:text-emerald-400/90">
                                            El periodo se encuentra cerrado y las plazas ya están asignadas por mérito. Puedes volver a ejecutar el proceso si modificaste calificaciones.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-400 flex items-start gap-2.5">
                                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold">Cierre Pendiente</p>
                                        <p className="mt-1 text-[11px] leading-relaxed text-amber-700/90 dark:text-amber-400/90">
                                            Al iniciar el cierre, el sistema organizará a los postulantes aprobados y les otorgará cupos en sus carreras seleccionadas priorizando su promedio y notas individuales.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Button 
                            onClick={() => setIsConfirmOpen(true)} 
                            disabled={processing}
                            className={`w-full py-5 rounded-xl font-bold transition-all shadow-sm ${
                                isConcluido 
                                    ? 'bg-white border border-neutral-350 hover:bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:border-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-900' 
                                    : 'bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200'
                            }`}
                        >
                            {processing ? 'Procesando asignaciones...' : isConcluido ? 'Re-calcular Cierre de Gestión' : 'Ejecutar Cierre de Gestión'}
                        </Button>
                    </div>
                </div>

                {/* ── Sección de Resultados ── */}
                {isConcluido && (
                    <div className="space-y-4 pt-4 border-t border-neutral-150 dark:border-neutral-850">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Postulantes Aprobados y Plazas Asignadas</h2>
                            <p className="text-xs text-neutral-500">Ordenados por estricto orden de mérito académico.</p>
                        </div>

                        {/* Buscador */}
                        <div className="grid gap-4 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md border border-neutral-200/60 dark:border-neutral-800 rounded-xl p-4 shadow-xs">
                            <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                                    <input
                                        type="text"
                                        aria-label="Buscar postulante por nombre, apellido o carnet"
                                        placeholder="Buscar postulante por nombre, apellido o carnet..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-neutral-800 dark:text-neutral-200"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button type="submit" variant="default" className="font-semibold text-sm">
                                        Buscar
                                    </Button>
                                    {search && (
                                        <Button type="button" variant="ghost" onClick={clearFilters} className="text-neutral-500 dark:text-neutral-400">
                                            <X className="h-4 w-4 mr-2" /> Limpiar
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Tabla */}
                        <div className="border border-neutral-200/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md relative rounded-xl shadow-xs overflow-hidden">
                            <div className="w-full overflow-x-auto">
                                <table className="w-full caption-bottom text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20 text-neutral-500 dark:text-neutral-400">
                                            <th className="h-12 px-4 text-left align-middle font-semibold w-[60px] text-center">Pos</th>
                                            <th className="h-12 px-4 text-left align-middle font-semibold">Postulante</th>
                                            <th className="h-12 w-[140px] px-4 text-left align-middle font-semibold">Carnet (CI)</th>
                                            <th className="h-12 w-[100px] px-4 text-right align-middle font-semibold">Promedio</th>
                                            <th className="h-12 w-[110px] px-4 text-center align-middle font-semibold">Preferencia</th>
                                            <th className="h-12 w-[240px] px-4 text-right align-middle font-semibold">Carrera Asignada</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                                        {estudianteCups.data && estudianteCups.data.length > 0 ? (
                                            estudianteCups.data.map((ec, idx) => {
                                                const est = ec.estudiante;
                                                const globalIndex = (estudianteCups.current_page - 1) * 15 + idx + 1;
                                                const hasCarrera = !empty(ec.CARRERA);

                                                return (
                                                    <tr key={ec.ID} className="hover:bg-neutral-50/40 dark:hover:bg-neutral-900/40 transition-colors">
                                                        {/* Posición de mérito */}
                                                        <td className="p-4 align-middle text-center font-bold text-neutral-500 text-xs">
                                                            #{globalIndex}
                                                        </td>

                                                        {/* Estudiante */}
                                                        <td className="p-4 align-middle font-semibold text-neutral-800 dark:text-neutral-200">
                                                            <div className="flex flex-col">
                                                                <span className="truncate">{est ? `${est.APELLIDO} ${est.NOMBRE}` : `Postulante #${ec.ID_ESTUDIANTE}`}</span>
                                                                <span className="text-[10px] text-neutral-500 font-medium truncate">{est?.CORREO}</span>
                                                            </div>
                                                        </td>

                                                        {/* Carnet */}
                                                        <td className="p-4 align-middle font-medium text-neutral-600 dark:text-neutral-400">
                                                            {est?.CARNET ?? '—'}
                                                        </td>

                                                        {/* Promedio */}
                                                        <td className="p-4 align-middle text-right font-extrabold text-neutral-900 dark:text-neutral-100">
                                                            {ec.NOTA_FINAL ? parseFloat(ec.NOTA_FINAL).toFixed(2) : '—'}
                                                        </td>

                                                        {/* Preferencia de opción asignada */}
                                                        <td className="p-4 align-middle text-center">
                                                            {hasCarrera ? (
                                                                ec.preferencia_asignada === 1 ? (
                                                                    <span className="inline-flex items-center rounded-full border border-emerald-250 bg-emerald-100/50 px-2 py-0.5 text-[9px] font-bold text-emerald-800 dark:border-emerald-850 dark:bg-emerald-950/40 dark:text-emerald-400">
                                                                        1ª Opción
                                                                    </span>
                                                                ) : ec.preferencia_asignada === 2 ? (
                                                                    <span className="inline-flex items-center rounded-full border border-amber-250 bg-amber-100/50 px-2 py-0.5 text-[9px] font-bold text-amber-800 dark:border-amber-850 dark:bg-amber-950/40 dark:text-amber-400">
                                                                        2ª Opción
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-neutral-400 dark:text-neutral-600">—</span>
                                                                )
                                                            ) : (
                                                                <span className="text-neutral-400 dark:text-neutral-600">—</span>
                                                            )}
                                                        </td>

                                                        {/* Carrera Asignada */}
                                                        <td className="p-4 align-middle text-right">
                                                            {hasCarrera ? (
                                                                <span className="font-extrabold text-neutral-900 dark:text-neutral-100 text-xs tracking-tight uppercase">
                                                                    {ec.CARRERA}
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center rounded-full border border-neutral-250 bg-neutral-100/50 px-2 py-0.5 text-[9px] font-bold text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-400">
                                                                    Sin Plaza (Cupos Llenos)
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="text-neutral-400 dark:text-neutral-550 p-12 text-center align-middle font-medium italic">
                                                    No se encontraron asignaciones.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Paginación */}
                        {estudianteCups.links && estudianteCups.links.length > 3 && (
                            <div className="flex justify-center">
                                <div className="flex flex-wrap gap-1 bg-white/40 dark:bg-neutral-900/40 p-1.5 rounded-xl border border-neutral-200/60 dark:border-neutral-800">
                                    {(() => {
                                        let ellipsisCount = 0;
                                        return estudianteCups.links.map((link) => {
                                            const key = link.label === '...' ? `ellipsis-${++ellipsisCount}` : link.label;
                                            if (link.url === null) {
                                                return (
                                                    <div
                                                        key={key}
                                                        className="px-3 py-1.5 text-xs text-neutral-400 dark:text-neutral-600 rounded-lg cursor-not-allowed select-none"
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                );
                                            }
                                            return (
                                                <Link
                                                    key={key}
                                                    href={link.url}
                                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                                        link.active
                                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                                            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                                    }`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                    preserveState
                                                />
                                            );
                                        });
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal de Confirmación */}
            <Dialog open={isConfirmOpen} onOpenChange={(val) => { if (!processing) setIsConfirmOpen(val); }}>
                <DialogContent className="sm:max-w-md animate-in fade-in-50 zoom-in-95 duration-200">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100 font-bold">
                            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                            Confirmar Cierre de Gestión
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                            {confirmMessage}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                        <Button type="button" variant="outline" onClick={() => setIsConfirmOpen(false)} disabled={processing}>
                            Cancelar
                        </Button>
                        <Button 
                            type="button" 
                            onClick={handleConfirmCierre} 
                            disabled={processing}
                            className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 font-semibold shadow-xs"
                        >
                            {processing ? 'Procesando...' : 'Confirmar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de Éxito */}
            <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
                <DialogContent className="sm:max-w-md animate-in fade-in-50 zoom-in-95 duration-200">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                            <CheckCircle2 className="h-5 w-5 shrink-0" />
                            Cierre de Gestión Ejecutado
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                            {flash?.success}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-end pt-2 border-t border-neutral-100 dark:border-neutral-800">
                        <Button type="button" onClick={() => setIsSuccessOpen(false)} className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 font-semibold shadow-xs">
                            Aceptar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

// Helper para verificar si un valor está vacío
function empty(val: any): boolean {
    return val === null || val === undefined || val === '';
}
