import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, ChevronLeft, Search, Users, X } from 'lucide-react';
import { useState } from 'react';

interface Estudiante {
    ID_ESTUDIANTE: number;
    CARNET: number;
    NOMBRE: string;
    APELLIDO: string;
    CORREO: string;
    TELEFONO: string | null;
    SEXO: string;
}

interface EstudianteCupEntry {
    ID: number;
    ID_ESTUDIANTE: number;
    ID_CUP: number;
    FECHA: string;
    ESTADO: string;
    NOTA_FINAL: string | null;
    CARRERA: string | null;
    estudiante: Estudiante | null;
}

interface EstudiantesCupProps {
    cup: any;
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

function getEstadoBadgeColor(estado: string) {
    switch (estado?.toUpperCase()) {
        case 'APROBADO':
            return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50';
        case 'REPROBADO':
            return 'border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50';
        case 'INSCRITO':
        case 'ACTIVO':
            return 'border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50';
        default:
            return 'border-neutral-200 bg-neutral-50 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800';
    }
}

export default function EstudiantesCupPage({ cup, estudianteCups, filters }: EstudiantesCupProps) {
    const [search, setSearch] = useState(filters.search || '');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Gestión Académica', href: '#' },
        { title: 'CUP', href: '/cup' },
        { title: `CUP #${cup.ID_CUP}`, href: `/cup/${cup.ID_CUP}` },
        { title: 'Estudiantes Inscritos', href: '#' },
    ];

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(`/cup/${cup.ID_CUP}/estudiantes`, { search }, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        setSearch('');
        router.get(`/cup/${cup.ID_CUP}/estudiantes`, { search: '' }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Estudiantes CUP #${cup.ID_CUP}`} />

            <div className="mx-auto flex h-full w-full max-w-5xl flex-1 flex-col gap-6 rounded-xl p-4 md:p-6">
                {/* ── Header ── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/60">
                            <Users className="h-7 w-7 text-neutral-900 dark:text-neutral-100" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Estudiantes Inscritos</h1>
                            <p className="text-muted-foreground mt-0.5 text-sm">
                                Periodo: {cup.ANIO} - Semestre {cup.SEMESTRE} · Total: {estudianteCups.total} estudiante(s)
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" asChild className="shrink-0 gap-1.5 text-sm font-semibold">
                        <Link href={`/cup/${cup.ID_CUP}`}>
                            <ChevronLeft className="h-4 w-4" /> Volver a CUP
                        </Link>
                    </Button>
                </div>

                {/* ── Filtro de Búsqueda ── */}
                <div className="grid gap-4 rounded-xl border border-neutral-200/60 bg-white/50 p-4 shadow-sm backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/50">
                    <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute top-2.5 left-3 h-4 w-4 text-neutral-400" />
                            <input
                                type="text"
                                aria-label="Buscar estudiantes por nombre, apellido o carnet (CI)"
                                placeholder="Buscar por nombre, apellido o carnet (CI)..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="focus:ring-primary focus:border-primary w-full rounded-lg border border-neutral-200 bg-white py-2 pr-4 pl-10 text-sm text-neutral-800 transition-all placeholder:text-neutral-400 focus:ring-2 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" variant="default" className="text-sm font-semibold shadow-sm">
                                Buscar
                            </Button>
                            {search && (
                                <Button type="button" variant="ghost" onClick={clearFilters} className="text-neutral-500 dark:text-neutral-400">
                                    <X className="mr-2 h-4 w-4" /> Limpiar
                                </Button>
                            )}
                        </div>
                    </form>
                </div>

                {/* ── Tabla de Estudiantes ── */}
                <div className="relative flex-1 overflow-hidden rounded-xl border border-neutral-200/60 bg-white/70 shadow-xs backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/60">
                    <div className="w-full overflow-x-auto">
                        <table className="w-full caption-bottom border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-neutral-200 bg-neutral-50/50 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950/20 dark:text-neutral-400">
                                    <th className="h-12 px-4 text-left align-middle font-semibold">Estudiante</th>
                                    <th className="h-12 w-[150px] px-4 text-left align-middle font-semibold">Carnet (CI)</th>
                                    <th className="h-12 w-[150px] px-4 text-left align-middle font-semibold">Fecha Insc.</th>
                                    <th className="h-12 w-[130px] px-4 text-center align-middle font-semibold">Estado</th>
                                    <th className="h-12 w-[120px] px-4 text-right align-middle font-semibold">Nota Final</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                                {estudianteCups.data && estudianteCups.data.length > 0 ? (
                                    estudianteCups.data.map((ec) => {
                                        const est = ec.estudiante;

                                        return (
                                            <tr key={ec.ID} className="transition-colors hover:bg-neutral-50/40 dark:hover:bg-neutral-900/40">
                                                {/* Estudiante details */}
                                                <td className="p-4 align-middle">
                                                    <div className="flex min-w-0 flex-col">
                                                        <span className="truncate font-bold text-neutral-800 dark:text-neutral-200">
                                                            {est ? `${est.APELLIDO} ${est.NOMBRE}` : `Estudiante #${ec.ID_ESTUDIANTE}`}
                                                        </span>
                                                        <span className="truncate text-[11px] text-neutral-500 dark:text-neutral-400">
                                                            {est?.CORREO ?? 'Sin correo registrado'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Carnet */}
                                                <td className="p-4 align-middle font-medium text-neutral-700 dark:text-neutral-300">
                                                    {est?.CARNET ?? '—'}
                                                </td>

                                                {/* Fecha Inscripción */}
                                                <td className="p-4 align-middle text-xs text-neutral-600 dark:text-neutral-400">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                                                        {ec.FECHA
                                                            ? new Date(ec.FECHA).toLocaleDateString('es-ES', {
                                                                  day: '2-digit',
                                                                  month: '2-digit',
                                                                  year: 'numeric',
                                                              })
                                                            : '—'}
                                                    </div>
                                                </td>

                                                {/* Estado */}
                                                <td className="p-4 text-center align-middle">
                                                    <span
                                                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${getEstadoBadgeColor(ec.ESTADO)}`}
                                                    >
                                                        {ec.ESTADO || '—'}
                                                    </span>
                                                </td>

                                                {/* Nota Final */}
                                                <td className="p-4 text-right align-middle font-extrabold text-neutral-900 dark:text-neutral-100">
                                                    {ec.NOTA_FINAL ? parseFloat(ec.NOTA_FINAL).toFixed(2) : '—'}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="dark:text-neutral-550 p-12 text-center align-middle font-medium text-neutral-400 italic"
                                        >
                                            No se encontraron estudiantes inscritos.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Paginación ── */}
                {estudianteCups.links && estudianteCups.links.length > 3 && (
                    <div className="flex justify-center">
                        <div className="flex flex-wrap gap-1 rounded-xl border border-neutral-200/60 bg-white/40 p-1.5 dark:border-neutral-800 dark:bg-neutral-900/40">
                            {(() => {
                                let ellipsisCount = 0;
                                return estudianteCups.links.map((link) => {
                                    const key = link.label === '...' ? `ellipsis-${++ellipsisCount}` : link.label;
                                    if (link.url === null) {
                                        return (
                                            <div
                                                key={key}
                                                className="cursor-not-allowed rounded-lg px-3 py-1.5 text-xs text-neutral-400 select-none dark:text-neutral-600"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    }
                                    return (
                                        <Link
                                            key={key}
                                            href={link.url}
                                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                                                link.active
                                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                                    : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
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
        </AppLayout>
    );
}
