import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, GraduationCap, Clock, ClipboardList, CalendarDays, ChevronRight, Award, Calendar, Users, DoorOpen, AlertCircle } from 'lucide-react';

interface DashboardDocenteProps {
    cup: any;
    clases: any[];
}

export default function DashboardDocente({ cup, clases }: DashboardDocenteProps) {
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '—';
        try {
            // dateStr comes in format "YYYY-MM-DD" or similar
            const cleanStr = dateStr.split('T')[0];
            const [year, month, day] = cleanStr.split('-');
            const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
            return `${parseInt(day)} de ${months[parseInt(month) - 1]} de ${year}`;
        } catch (e) {
            return dateStr;
        }
    };

    const formatClassSchedules = (clase: any) => {
        const hebList = clase.bloqueHorario?.horariosEnBloque ?? clase.bloque_horario?.horarios_en_bloque ?? [];
        if (hebList.length === 0) return 'Horario no definido';
        
        return hebList.map((heb: any) => {
            const h = heb.horario;
            if (!h) return '';
            const formatTime = (timeStr: string) => {
                if (!timeStr) return '';
                const parts = timeStr.split(':');
                return `${parts[0]}:${parts[1]}`;
            };
            return `${h.DIA} ${formatTime(h.HORA_INI)}-${formatTime(h.HORA_FIN)}`;
        }).filter(Boolean).join(', ');
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard Docente', href: '/dashboard' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Docente" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 md:p-6">
                
                {/* ── Header de Bienvenida ── */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Panel de Control de Docente</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Bienvenido</h1>
                    <p className="text-muted-foreground">
                        Gestiona tus clases asignadas, consulta información del CUP actual y registra calificaciones.
                    </p>
                </div>

                {/* ── Sección de Información del CUP Activo ── */}
                <div className="rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50 overflow-hidden">
                    <div className="border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-950/20 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <BookOpen className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
                            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Información del CUP Actual</h2>
                        </div>
                        {cup && (
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                cup.ESTADO === 'En curso' 
                                    ? 'border border-green-250/30 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400' 
                                    : 'border border-amber-250/30 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                            }`}>
                                Estado: {cup.ESTADO}
                            </span>
                        )}
                    </div>

                    {cup ? (
                        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase flex items-center gap-1.5">
                                    <Award className="h-3.5 w-3.5" /> Nombre Convocatoria
                                </span>
                                <p className="mt-1 text-sm font-bold text-neutral-800 dark:text-neutral-200">
                                    CUP #{cup.ID_CUP} — Convocatoria {cup.ANIO}/{cup.SEMESTRE}
                                </p>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" /> Fecha de Inicio
                                </span>
                                <p className="mt-1 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                    {formatDate(cup.FECHA_INICIO)}
                                </p>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" /> Fecha de Finalización
                                </span>
                                <p className="mt-1 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                    {formatDate(cup.FECHA_FIN)}
                                </p>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase flex items-center gap-1.5">
                                    <GraduationCap className="h-3.5 w-3.5" /> Nota Mínima Aprobatoria
                                </span>
                                <p className="mt-1 text-sm font-bold text-neutral-800 dark:text-neutral-200">
                                    {Number(cup.NOTA_MINIMA).toFixed(1)} puntos
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
                            <AlertCircle className="h-8 w-8 text-neutral-400" />
                            <p className="text-sm text-neutral-500 font-medium">
                                No se encuentra ningún CUP registrado o activo en el sistema.
                            </p>
                        </div>
                    )}
                </div>

                {/* ── Sección de Clases Asignadas ── */}
                <div className="rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50 overflow-hidden flex-1 flex flex-col">
                    <div className="border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-950/20 px-5 py-4 flex items-center gap-2.5">
                        <ClipboardList className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
                        <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Mis Clases Asignadas</h2>
                    </div>

                    <div className="flex-1">
                        {clases && clases.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-semibold text-xs uppercase tracking-wider text-left bg-neutral-50/30 dark:bg-neutral-950/10">
                                            <th className="px-5 py-3.5 font-semibold text-left">Materia</th>
                                            <th className="px-5 py-3.5 font-semibold text-left">Grupo</th>
                                            <th className="px-5 py-3.5 font-semibold text-left">Turno / Horario</th>
                                            <th className="px-5 py-3.5 font-semibold text-left">Aula</th>
                                            <th className="px-5 py-3.5 font-semibold text-center w-[140px]">Postulantes</th>
                                            <th className="px-5 py-3.5 font-semibold text-right w-[160px]">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
                                        {clases.map((clase: any) => (
                                            <tr key={clase.ID_CLASE} className="hover:bg-neutral-50/40 dark:hover:bg-neutral-800/10 transition-colors">
                                                <td className="px-5 py-4 align-middle">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200/60 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/40">
                                                            <BookOpen className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
                                                        </div>
                                                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                                                            {clase.materia?.NOMBRE ?? '—'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 align-middle font-medium text-neutral-700 dark:text-neutral-300">
                                                    Grupo {clase.grupo?.NOMBRE ?? '—'}
                                                </td>
                                                <td className="px-5 py-4 align-middle">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="inline-flex w-fit items-center rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                                                            {clase.bloqueHorario?.TURNO ?? clase.bloque_horario?.TURNO ?? 'No definido'}
                                                        </span>
                                                        <span className="text-xs text-neutral-500 font-medium leading-relaxed">
                                                            {formatClassSchedules(clase)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 align-middle">
                                                    <div className="inline-flex items-center gap-1 text-neutral-700 dark:text-neutral-300">
                                                        <DoorOpen className="h-4 w-4 opacity-70" />
                                                        <span className="font-semibold text-xs">
                                                            {clase.aula?.NOMBRE ?? '—'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-center align-middle">
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-100/50 px-2.5 py-0.5 text-xs font-bold text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/40 dark:text-neutral-300">
                                                        <Users className="h-3 w-3 opacity-70" />
                                                        {clase.estudiante_cups_count ?? clase.estudianteCupsCount ?? 0}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-right align-middle">
                                                    {cup && (
                                                        <Link
                                                            href={`/notas/clases/${clase.ID_CLASE}?cup_id=${cup.ID_CUP}`}
                                                            className="inline-flex h-8 items-center justify-center rounded-lg bg-neutral-900 px-3 text-xs font-bold text-neutral-50 shadow-xs hover:bg-neutral-850 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200 gap-1 group/btn"
                                                        >
                                                            <span>Gestionar Notas</span>
                                                            <ChevronRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                                                        </Link>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                                <ClipboardList className="h-10 w-10 text-neutral-450" />
                                <p className="text-sm text-neutral-500 max-w-sm">
                                    No tienes clases asignadas en esta convocatoria del CUP.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
