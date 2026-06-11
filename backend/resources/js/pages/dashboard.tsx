import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    Users,
    GraduationCap,
    XCircle,
    LayoutGrid,
    Award,
    Calendar,
    AlertCircle,
    BarChart3,
} from 'lucide-react';

interface DashboardProps {
    cup: any;
    stats: {
        totalInscritos: number;
        totalAprobados: number;
        totalReprobados: number;
        totalGrupos: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
        const cleanStr = dateStr.split('T')[0];
        const [year, month, day] = cleanStr.split('-');
        const months = [
            'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
        ];
        return `${parseInt(day)} de ${months[parseInt(month) - 1]} de ${year}`;
    } catch {
        return dateStr;
    }
};

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    colorClass: string;
    bgClass: string;
    borderClass: string;
    description: string;
}

function StatCard({ title, value, icon, colorClass, bgClass, borderClass, description }: StatCardProps) {
    return (
        <div className={`rounded-xl border ${borderClass} bg-white dark:bg-neutral-900/50 shadow-xs overflow-hidden`}>
            <div className="p-5 flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                        {title}
                    </span>
                    <span className={`text-4xl font-bold tabular-nums ${colorClass}`}>
                        {value.toLocaleString()}
                    </span>
                    <span className="text-xs text-neutral-500 mt-1">{description}</span>
                </div>
                <div className={`shrink-0 rounded-lg p-3 ${bgClass}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default function Dashboard({ cup, stats }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 md:p-6">

                {/* ── Header ── */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Panel de Control</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Indicadores estadísticos del proceso de admisión universitaria.
                    </p>
                </div>

                {/* ── Tarjetas de Indicadores ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Inscritos"
                        value={stats.totalInscritos}
                        icon={<Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                        colorClass="text-blue-600 dark:text-blue-400"
                        bgClass="bg-blue-50 dark:bg-blue-950/30"
                        borderClass="border-neutral-200 dark:border-neutral-800"
                        description={cup ? `CUP #${cup.ID_CUP} — ${cup.ANIO}/${cup.SEMESTRE}` : 'Sin CUP activo'}
                    />
                    <StatCard
                        title="Total Aprobados"
                        value={stats.totalAprobados}
                        icon={<GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />}
                        colorClass="text-green-600 dark:text-green-400"
                        bgClass="bg-green-50 dark:bg-green-950/30"
                        borderClass="border-neutral-200 dark:border-neutral-800"
                        description="Estudiantes con estado Aprobado"
                    />
                    <StatCard
                        title="Total Reprobados"
                        value={stats.totalReprobados}
                        icon={<XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />}
                        colorClass="text-red-600 dark:text-red-400"
                        bgClass="bg-red-50 dark:bg-red-950/30"
                        borderClass="border-neutral-200 dark:border-neutral-800"
                        description="Estudiantes con estado Reprobado"
                    />
                    <StatCard
                        title="Grupos Habilitados"
                        value={stats.totalGrupos}
                        icon={<LayoutGrid className="h-5 w-5 text-violet-600 dark:text-violet-400" />}
                        colorClass="text-violet-600 dark:text-violet-400"
                        bgClass="bg-violet-50 dark:bg-violet-950/30"
                        borderClass="border-neutral-200 dark:border-neutral-800"
                        description="Grupos con clase asignada"
                    />
                </div>

                {/* ── Información del CUP Activo ── */}
                <div className="rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50 overflow-hidden">
                    <div className="border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-950/20 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <Award className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
                            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                                Información del CUP Activo
                            </h2>
                        </div>
                        {cup && (
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                cup.ESTADO === 'En curso'
                                    ? 'border border-green-200/30 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400'
                                    : 'border border-amber-200/30 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                            }`}>
                                Estado: {cup.ESTADO}
                            </span>
                        )}
                    </div>

                    {cup ? (
                        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase flex items-center gap-1.5">
                                    <Award className="h-3.5 w-3.5" /> Convocatoria
                                </span>
                                <p className="mt-1 text-sm font-bold text-neutral-800 dark:text-neutral-200">
                                    CUP #{cup.ID_CUP} — {cup.ANIO}/{cup.SEMESTRE}
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
                                    <GraduationCap className="h-3.5 w-3.5" /> Calificación Mínima
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
                                No hay ningún CUP activo en el sistema.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </AppLayout>
    );
}
