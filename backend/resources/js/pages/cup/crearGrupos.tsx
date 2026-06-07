import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { 
    Users, Clock, 
    ChevronLeft, AlertCircle, Save,
    Calculator, CheckSquare, Square
} from 'lucide-react';
import { FormEventHandler } from 'react';

interface CrearGruposProps {
    cup: any;
    inscritos: number;
    conGrupo: number;
    sinGrupo: number;
    turnos: { nombre: string; horarios: string[] }[];
}

export default function CrearGrupos({ cup, inscritos, conGrupo, sinGrupo, turnos }: CrearGruposProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        EST_MIN: 20,
        EST_MAX: 40,
        turnos: [] as string[],
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Gestión Académica', href: '#' },
        { title: 'CUPs', href: '/cup' },
        { title: `CUP #${cup.ID_CUP}`, href: `/cup/${cup.ID_CUP}` },
        { title: 'Generar Paquetes de Clases', href: '#' },
    ];

    const toggleTurno = (nombre: string) => {
        if (data.turnos.includes(nombre)) {
            setData('turnos', data.turnos.filter(t => t !== nombre));
        } else {
            setData('turnos', [...data.turnos, nombre]);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/cup/${cup.ID_CUP}/clases`);
    };

    const isSubmitDisabled = data.turnos.length === 0 || data.EST_MIN < 1 || data.EST_MAX < data.EST_MIN || processing;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Generar Paquetes de Clases" />

            <div className="flex flex-1 flex-col gap-6 rounded-xl p-4 md:p-6 lg:p-8 max-w-5xl mx-auto w-full">
                {/* ── Header ── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                            Algoritmo de Generación de Clases
                        </h1>
                        <p className="text-sm text-neutral-500 mt-1 max-w-2xl">
                            Configura el tamaño de los grupos y selecciona los turnos. El sistema calculará cuántos grupos crear basándose en los inscritos y repartirá las materias automáticamente.
                        </p>
                    </div>
                    <Button variant="outline" asChild className="shrink-0 gap-1.5 font-semibold text-sm">
                        <Link href={`/cup/${cup.ID_CUP}`}>
                            <ChevronLeft className="h-4 w-4" /> Volver al CUP
                        </Link>
                    </Button>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-6">
                    {/* Panel de Información */}
                    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-4">
                        <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-200 mb-3">Resumen de Estudiantes Inscritos</h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="flex flex-col items-center rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2.5">
                                <span className="text-2xl font-bold tabular-nums text-neutral-900 dark:text-neutral-100">{inscritos}</span>
                                <span className="text-[11px] font-semibold text-neutral-500 text-center leading-tight mt-0.5">Total inscritos</span>
                            </div>
                            <div className="flex flex-col items-center rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2.5">
                                <span className="text-2xl font-bold tabular-nums text-neutral-900 dark:text-neutral-100">{conGrupo}</span>
                                <span className="text-[11px] font-semibold text-neutral-500 text-center leading-tight mt-0.5">Con grupo</span>
                            </div>
                            <div className="flex flex-col items-center rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2.5">
                                <span className="text-2xl font-bold tabular-nums text-neutral-900 dark:text-neutral-100">{sinGrupo}</span>
                                <span className="text-[11px] font-semibold text-neutral-500 text-center leading-tight mt-0.5">Sin grupo</span>
                            </div>
                        </div>
                        <p className="text-xs text-neutral-500 mt-2.5">
                            {sinGrupo === 0
                                ? 'Todos los estudiantes inscritos ya tienen grupo asignado.'
                                : `El algoritmo procesará los ${sinGrupo} estudiantes sin grupo asignado.`}
                        </p>
                    </div>

                    {(errors as any).inscritos && (
                        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20 p-3 text-sm text-red-700 dark:text-red-300">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {(errors as any).inscritos}
                        </div>
                    )}
                    
                    {(errors as any).error && (
                        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20 p-3 text-sm text-red-700 dark:text-red-300">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {(errors as any).error}
                        </div>
                    )}
                    
                    {(errors as any).cup && (
                        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20 p-3 text-sm text-red-700 dark:text-red-300">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {(errors as any).cup}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Configuración de Grupo */}
                        <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 bg-card shadow-sm">
                            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
                                <Users className="h-5 w-5 text-neutral-500" />
                                Tamaño de Grupos
                            </h2>
                            
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                                        Tamaño Mínimo
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={(data.EST_MIN as any) === '' || Number.isNaN(data.EST_MIN as any) ? '' : data.EST_MIN}
                                        onChange={e => {
                                            const val = parseInt(e.target.value);
                                            setData('EST_MIN', Number.isNaN(val) ? ('' as any) : val);
                                        }}
                                        className="block w-full rounded-md border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-sm shadow-sm focus:border-neutral-500 focus:ring-neutral-500"
                                        required
                                    />
                                    {errors.EST_MIN && <p className="text-xs text-red-600 font-medium">{errors.EST_MIN}</p>}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                                        Tamaño Máximo
                                    </label>
                                    <input
                                        type="number"
                                        min={(data.EST_MIN as any) === '' || Number.isNaN(data.EST_MIN as any) ? 1 : data.EST_MIN}
                                        value={(data.EST_MAX as any) === '' || Number.isNaN(data.EST_MAX as any) ? '' : data.EST_MAX}
                                        onChange={e => {
                                            const val = parseInt(e.target.value);
                                            setData('EST_MAX', Number.isNaN(val) ? ('' as any) : val);
                                        }}
                                        className="block w-full rounded-md border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-sm shadow-sm focus:border-neutral-500 focus:ring-neutral-500"
                                        required
                                    />
                                    {errors.EST_MAX && <p className="text-xs text-red-600 font-medium">{errors.EST_MAX}</p>}
                                </div>
                            </div>
                            <p className="text-xs text-neutral-500 mt-2">
                                Los estudiantes sobrantes se asignarán a un grupo nuevo solo si superan el tamaño mínimo.
                            </p>
                        </div>

                        {/* Turnos / Horarios */}
                        <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 bg-card shadow-sm h-full">
                            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
                                <Clock className="h-5 w-5 text-neutral-500" />
                                Selección de Horarios
                            </h2>

                            {errors.turnos && (
                                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20 p-2 text-xs text-red-700 dark:text-red-300">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    {errors.turnos}
                                </div>
                            )}

                            <div className="flex flex-col gap-3 overflow-y-auto pt-2">
                                {turnos.length > 0 ? turnos.map((turno) => {
                                    const selected = data.turnos.includes(turno.nombre);
                                    return (
                                        <button
                                            key={turno.nombre}
                                            type="button"
                                            onClick={() => toggleTurno(turno.nombre)}
                                            className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                                                selected
                                                    ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900 shadow-md'
                                                    : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:border-neutral-700 dark:hover:bg-neutral-900'
                                            }`}
                                        >
                                            <div className="mt-0.5 shrink-0">
                                                {selected ? (
                                                    <CheckSquare className={`h-5 w-5 ${selected ? 'text-white dark:text-neutral-900' : 'text-neutral-400'}`} />
                                                ) : (
                                                    <Square className="h-5 w-5 text-neutral-400" />
                                                )}
                                            </div>
                                            <div className="flex flex-col min-w-0 w-full gap-1">
                                                <span className="font-bold text-sm tracking-tight">Turno {turno.nombre}</span>
                                                <div className="flex flex-wrap gap-1.5 mt-1">
                                                    {turno.horarios.map((h, i) => (
                                                        <span key={i} className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                                            selected 
                                                                ? 'bg-white/20 text-white dark:bg-neutral-900/20 dark:text-neutral-900' 
                                                                : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
                                                        }`}>
                                                            {h}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                }) : (
                                    <p className="text-xs text-neutral-500 italic py-4">No hay horarios configurados en el sistema.</p>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Acciones */}
                    <div className="flex items-center justify-end gap-4 pt-4">
                        <Button type="button" variant="ghost" onClick={() => reset()} disabled={processing}>
                            Restablecer
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isSubmitDisabled} 
                            className="bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 shadow-sm font-bold px-8"
                        >
                            <Calculator className="h-4 w-4 mr-2" />
                            {processing ? 'Procesando...' : 'Ejecutar Algoritmo de Grupos'}
                        </Button>
                    </div>

                </form>
            </div>
        </AppLayout>
    );
}
