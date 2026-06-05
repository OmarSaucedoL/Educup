import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { BookMarked, Users, BookOpen, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface NotasClasesProps {
    cup: any;
    cups: any[];
    clases: any[];
}

export default function NotasClases({ cup, cups, clases }: NotasClasesProps) {
    const [selectedCupId, setSelectedCupId] = useState<number | null>(cup?.ID_CUP ?? null);

    const handleCupChange = (id: number) => {
        setSelectedCupId(id);
        router.get('/notas/clases', { cup_id: id }, { preserveState: false });
    };

    // Agrupar clases por ID_GRUPO
    const clasesPorGrupo = clases.reduce((acc: any, clase: any) => {
        const grupoId = clase.grupo?.ID_GRUPO ?? 'sin_grupo';
        if (!acc[grupoId]) {
            acc[grupoId] = { grupo: clase.grupo, clases: [] };
        }
        acc[grupoId].clases.push(clase);
        return acc;
    }, {});

    const grupos = Object.values(clasesPorGrupo).sort((a: any, b: any) =>
        String(a.grupo?.NOMBRE || '').localeCompare(String(b.grupo?.NOMBRE || ''), undefined, { numeric: true, sensitivity: 'base' })
    );

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Módulo Notas', href: '#' },
        { title: 'Clases', href: '/notas/clases' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notas — Clases" />

            <div className="mx-auto flex h-full w-full max-w-5xl flex-1 flex-col gap-6 rounded-xl p-4">

                {/* ── Header ── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/60">
                            <BookMarked className="h-7 w-7 text-neutral-900 dark:text-neutral-100" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Módulo de Notas — Clases</h1>
                            <p className="text-muted-foreground mt-0.5 text-sm">
                                Selecciona un grupo para gestionar las notas de sus estudiantes.
                            </p>
                        </div>
                    </div>

                    {/* Selector de CUP */}
                    {cups.length > 0 && (
                        <select
                            value={selectedCupId ?? ''}
                            onChange={e => handleCupChange(Number(e.target.value))}
                            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium shadow-xs dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                        >
                            {cups.map(c => (
                                <option key={c.ID_CUP} value={c.ID_CUP}>
                                    CUP #{c.ID_CUP} — {c.ANIO}/{c.SEMESTRE} ({c.ESTADO})
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* ── Sin CUP ── */}
                {!cup && (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-12 text-center dark:border-neutral-800 dark:bg-neutral-900/40">
                        <BookOpen className="h-10 w-10 text-neutral-400" />
                        <p className="text-muted-foreground text-sm">No hay ningún CUP registrado en el sistema.</p>
                    </div>
                )}

                {/* ── Tabla de Grupos ── */}
                {cup && (
                    <div className="border-sidebar-border/70 dark:border-sidebar-border bg-card text-card-foreground relative overflow-hidden rounded-xl border shadow-sm">
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="hover:bg-muted/50 border-b transition-colors">
                                        <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Grupo</th>
                                        <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Turno</th>
                                        <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Materias</th>
                                        <th className="text-muted-foreground h-12 px-4 text-center align-middle font-medium">Estudiantes</th>
                                        <th className="text-muted-foreground h-12 px-4 text-center align-middle font-medium">Docentes</th>
                                        <th className="text-muted-foreground h-12 w-[120px] px-4 text-right align-middle font-medium">Notas</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {grupos.length > 0 ? grupos.map((groupData: any, i: number) => {
                                        const { grupo, clases: gClases } = groupData;
                                        const bloque = gClases[0]?.bloque_horario ?? gClases[0]?.bloqueHorario;
                                        const turno = bloque?.TURNO ?? '—';
                                        const totalEstudiantes = gClases[0]?.estudiante_cups_count ?? 0;
                                        const docentesAsignados = gClases.filter((c: any) => c.docente_cup).length;

                                        return (
                                            <tr key={i} className="hover:bg-muted/50 border-b transition-colors">
                                                <td className="p-4 align-middle font-bold text-neutral-900 dark:text-neutral-100">
                                                    {grupo?.NOMBRE ?? 'Sin grupo'}
                                                </td>
                                                <td className="p-4 align-middle text-neutral-600 dark:text-neutral-300">
                                                    {turno}
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <div className="flex flex-wrap gap-1">
                                                        {gClases.map((c: any) => (
                                                            <span key={c.ID_CLASE} className="inline-flex items-center rounded-md border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                                                                {c.materia?.NOMBRE ?? '—'}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center align-middle">
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                                                        <Users className="h-3 w-3" />{totalEstudiantes}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center align-middle">
                                                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${docentesAsignados === gClases.length ? 'border border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-400' : 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400'}`}>
                                                        <UserCheck className="h-3 w-3" />
                                                        {docentesAsignados}/{gClases.length}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right align-middle">
                                                    <Button variant="outline" size="sm" asChild className="h-8 gap-1.5 text-xs font-semibold">
                                                        <Link href={`/notas/grupos/${grupo?.ID_GRUPO}?cup_id=${cup.ID_CUP}`}>
                                                            Gestionar Notas
                                                        </Link>
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan={6} className="text-muted-foreground p-8 text-center">
                                                No hay grupos registrados en este CUP.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
