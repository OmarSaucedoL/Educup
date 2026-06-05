import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { BookOpen, Users, Building2, Clock, User, ChevronLeft, GraduationCap, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function VerClasesPage({ cup }: { cup: any }) {
    const todasLasClases: any[] = cup.clases ?? [];

    // Agrupar clases por ID_GRUPO
    const clasesPorGrupo = todasLasClases.reduce((acc: any, clase: any) => {
        const grupoId = clase.grupo?.ID_GRUPO ?? 'sin_grupo';
        if (!acc[grupoId]) {
            acc[grupoId] = {
                grupo: clase.grupo,
                clases: []
            };
        }
        acc[grupoId].clases.push(clase);
        return acc;
    }, {});

    const grupos = Object.values(clasesPorGrupo).sort((a: any, b: any) => {
        // Ordenar por nombre de grupo de manera natural/numérica
        const nameA = String(a.grupo?.NOMBRE || '');
        const nameB = String(b.grupo?.NOMBRE || '');
        return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
    });

    // Calcular estadísticas de grupos y turnos
    const totalGrupos = grupos.length;
    const turnosCount: Record<string, number> = {
        'MAÑANA': 0,
        'TARDE': 0,
        'NOCHE': 0
    };
    grupos.forEach((groupData: any) => {
        const { clases } = groupData;
        const bloque = clases.length > 0 ? (clases[0].bloque_horario ?? clases[0].bloqueHorario) : null;
        const turno = bloque?.TURNO ? bloque.TURNO.toUpperCase() : null;
        if (turno) {
            turnosCount[turno] = (turnosCount[turno] || 0) + 1;
        } else {
            turnosCount['NO DEFINIDO'] = (turnosCount['NO DEFINIDO'] || 0) + 1;
        }
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Gestión Académica', href: '#' },
        { title: 'CUP', href: '/cup' },
        { title: `CUP #${cup.ID_CUP}`, href: `/cup/${cup.ID_CUP}` },
        { title: 'Clases y Grupos', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Clases CUP #${cup.ID_CUP}`} />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 max-w-5xl mx-auto w-full">
                {/* ── Header ── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
                            <BookOpen className="h-7 w-7 text-neutral-900 dark:text-neutral-100" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Clases y Grupos del CUP</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Periodo: {cup.ANIO} - {cup.SEMESTRE}
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" asChild className="shrink-0 gap-1.5 font-semibold text-sm">
                        <Link href={`/cup/${cup.ID_CUP}`}>
                            <ChevronLeft className="h-4 w-4" /> Volver a CUP
                        </Link>
                    </Button>
                </div>

                {/* ── Resumen de Grupos ── */}
                <Card className="border-neutral-200 dark:border-neutral-800 bg-card overflow-hidden shadow-xs">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-neutral-200 dark:divide-neutral-850">
                            {/* Total Grupos Column */}
                            <div className="flex items-center justify-between pb-6 md:pb-0 md:pr-6">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        Total Grupos
                                    </p>
                                    <h2 className="text-4xl font-extrabold text-neutral-900 dark:text-neutral-50 tracking-tight">
                                        {totalGrupos}
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        Registrados en este periodo
                                    </p>
                                </div>
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100">
                                    <Users className="h-6 w-6" />
                                </div>
                            </div>

                            {/* Turnos Column */}
                            <div className="col-span-2 pt-6 md:pt-0 md:pl-6 space-y-3">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        Distribución por Turno
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {Object.entries(turnosCount)
                                        .filter(([turno, count]) => count > 0 || ['MAÑANA', 'TARDE', 'NOCHE'].includes(turno))
                                        .map(([turno, count]) => {
                                            const colors: Record<string, { bg: string, text: string, dot: string, border: string }> = {
                                                'MAÑANA': { 
                                                    bg: 'bg-neutral-50 dark:bg-neutral-900/40', 
                                                    text: 'bg-neutral-900 text-neutral-50 dark:bg-neutral-100 dark:text-neutral-950', 
                                                    dot: 'bg-neutral-900 dark:bg-neutral-100', 
                                                    border: 'border-neutral-200 dark:border-neutral-800' 
                                                },
                                                'TARDE': { 
                                                    bg: 'bg-neutral-50 dark:bg-neutral-900/40', 
                                                    text: 'bg-neutral-900 text-neutral-50 dark:bg-neutral-100 dark:text-neutral-950', 
                                                    dot: 'bg-neutral-900 dark:bg-neutral-100', 
                                                    border: 'border-neutral-200 dark:border-neutral-800' 
                                                },
                                                'NOCHE': { 
                                                    bg: 'bg-neutral-50 dark:bg-neutral-900/40', 
                                                    text: 'bg-neutral-900 text-neutral-50 dark:bg-neutral-100 dark:text-neutral-950', 
                                                    dot: 'bg-neutral-900 dark:bg-neutral-100', 
                                                    border: 'border-neutral-200 dark:border-neutral-800' 
                                                },
                                                'NO DEFINIDO': { 
                                                    bg: 'bg-neutral-50/50 dark:bg-neutral-900/20', 
                                                    text: 'bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400', 
                                                    dot: 'bg-neutral-400 dark:bg-neutral-600', 
                                                    border: 'border-neutral-200 dark:border-neutral-800/60' 
                                                }
                                            };
                                            const style = colors[turno] ?? colors['NO DEFINIDO'];
                                            const label = turno === 'MAÑANA' ? 'Mañana' : turno === 'TARDE' ? 'Tarde' : turno === 'NOCHE' ? 'Noche' : turno;

                                            return (
                                                <div 
                                                    key={turno} 
                                                    className={`flex items-center justify-between p-3 rounded-xl border ${style.border} ${style.bg} transition-all hover:scale-[1.01]`}
                                                >
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${style.dot} animate-pulse`} style={{ animationDuration: '3s' }} />
                                                        <span className="text-xs font-bold tracking-wide uppercase truncate text-neutral-800 dark:text-neutral-200">
                                                            {label}
                                                        </span>
                                                    </div>
                                                    <span className={`inline-flex items-center justify-center rounded-lg px-2.5 py-1 text-xs font-extrabold shadow-xs ${style.text}`}>
                                                        {count}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="border-sidebar-border/70 dark:border-sidebar-border bg-card text-card-foreground relative flex-1 rounded-xl border shadow-sm overflow-hidden">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Grupo</th>
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Turno</th>
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Aula Asignada</th>
                                    <th className="text-muted-foreground h-12 px-4 text-center align-middle font-medium">Inscritos</th>
                                    <th className="text-muted-foreground h-12 px-4 text-right align-middle font-medium w-[120px]">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {grupos.length > 0 ? (
                                    grupos.map((groupData: any, groupIndex: number) => {
                                        const { grupo, clases } = groupData;
                                        const totalEstudiantes = clases.length > 0 ? (clases[0].estudiante_cups_count || 0) : 0;
                                        const aulaDelGrupo = clases.length > 0 ? clases[0].aula : null;
                                        const bloque = clases.length > 0 ? (clases[0].bloque_horario ?? clases[0].bloqueHorario) : null;
                                        const turnoDelGrupo = bloque?.TURNO ?? 'No definido';

                                        return (
                                            <tr key={`grupo-${groupIndex}`} className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                                                <td className="p-4 align-middle font-bold text-neutral-900 dark:text-neutral-100">
                                                    {grupo?.NOMBRE ?? 'SIN ASIGNAR'}
                                                </td>
                                                <td className="p-4 align-middle font-medium text-neutral-600 dark:text-neutral-300">
                                                    {turnoDelGrupo}
                                                </td>
                                                <td className="p-4 align-middle text-neutral-600 dark:text-neutral-300">
                                                    {aulaDelGrupo ? (aulaDelGrupo.NOMBRE ?? `Aula #${aulaDelGrupo.ID_AULA}`) : <span className="italic text-muted-foreground">Sin asignar</span>}
                                                </td>
                                                <td className="p-4 align-middle text-center">
                                                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700">
                                                        {totalEstudiantes}
                                                    </span>
                                                </td>
                                                <td className="p-4 align-middle text-right">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        asChild
                                                        className="h-8 gap-1.5 text-xs font-semibold"
                                                    >
                                                        <Link href={`/cup/${cup.ID_CUP}/grupos/${grupo?.ID_GRUPO ?? ''}`}>
                                                            <Info className="h-3.5 w-3.5" /> Detalles
                                                        </Link>
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="text-muted-foreground p-8 text-center align-middle">
                                            No hay grupos ni clases registradas en este CUP.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
