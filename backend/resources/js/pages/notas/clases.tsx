import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { BookMarked, Users, BookOpen, UserCheck, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface NotasClasesProps {
    cup: any;
    cups: any[];
    clases: any[];
}

export default function NotasClases({ cup, cups, clases }: NotasClasesProps) {
    const [selectedCupId, setSelectedCupId] = useState<number | null>(cup?.ID_CUP ?? null);
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

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

    const toggleGroup = (grupoId: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [grupoId]: !prev[grupoId]
        }));
    };

    const expandAll = () => {
        const newExpanded: Record<string, boolean> = {};
        grupos.forEach((groupData: any) => {
            const grupoId = groupData.grupo?.ID_GRUPO ?? 'sin_grupo';
            newExpanded[grupoId] = true;
        });
        setExpandedGroups(newExpanded);
    };

    const collapseAll = () => {
        setExpandedGroups({});
    };

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
                                Selecciona un grupo para ver sus materias y gestionar las notas de los estudiantes.
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

                {/* ── Controles de Acordeón y Listado de Grupos ── */}
                {cup && (
                    <div className="flex flex-col gap-4">
                        {/* Controles de expansión masiva */}
                        {grupos.length > 0 && (
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={expandAll}
                                    className="text-xs font-semibold h-8"
                                >
                                    Expandir Todos
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={collapseAll}
                                    className="text-xs font-semibold h-8"
                                >
                                    Colapsar Todos
                                </Button>
                            </div>
                        )}

                        {/* Listado de Grupos */}
                        <div className="flex flex-col gap-4">
                            {grupos.length > 0 ? (
                                grupos.map((groupData: any, i: number) => {
                                    const { grupo, clases: gClases } = groupData;
                                    const grupoId = grupo?.ID_GRUPO ?? 'sin_grupo';
                                    const isExpanded = !!expandedGroups[grupoId];

                                    const bloque = gClases[0]?.bloque_horario ?? gClases[0]?.bloqueHorario;
                                    const turno = bloque?.TURNO ?? 'No definido';
                                    const totalEstudiantes = gClases[0]?.estudiante_cups_count ?? gClases[0]?.estudianteCupsCount ?? 0;
                                    const docentesAsignados = gClases.filter((c: any) => c.docente_cup || c.docenteCup).length;

                                    return (
                                        <div
                                            key={grupoId}
                                            className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 rounded-xl overflow-hidden shadow-xs hover:border-neutral-300 dark:hover:border-neutral-750 transition-all duration-200"
                                        >
                                            {/* Header del dropdown */}
                                            <div
                                                onClick={() => toggleGroup(grupoId)}
                                                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer select-none gap-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/60 text-neutral-800 dark:text-neutral-200">
                                                        <Layers className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">
                                                            {grupo?.NOMBRE ?? 'Sin grupo'}
                                                        </h3>
                                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                                            <span className="inline-flex items-center rounded-md border border-neutral-200/60 bg-neutral-50 px-2 py-0.5 text-[11px] font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
                                                                Turno: {turno}
                                                            </span>
                                                            <span className="inline-flex items-center rounded-md border border-neutral-200/60 bg-neutral-50 px-2 py-0.5 text-[11px] font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
                                                                {gClases.length} {gClases.length === 1 ? 'Materia' : 'Materias'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between sm:justify-end gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-100/60 px-2.5 py-0.5 text-xs font-semibold text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800/40 dark:text-neutral-300">
                                                            <Users className="h-3 w-3 opacity-70" />
                                                            {totalEstudiantes} Alumnos
                                                        </span>
                                                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                            docentesAsignados === gClases.length 
                                                                ? 'border border-green-200 bg-green-50 text-green-700 dark:border-green-900/60 dark:bg-green-950/20 dark:text-green-400' 
                                                                : 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-400'
                                                        }`}>
                                                            <UserCheck className="h-3 w-3" />
                                                            {docentesAsignados}/{gClases.length} Docentes
                                                        </span>
                                                    </div>

                                                    <div className="text-neutral-450 dark:text-neutral-500">
                                                        {isExpanded ? (
                                                            <ChevronUp className="h-5 w-5" />
                                                        ) : (
                                                            <ChevronDown className="h-5 w-5" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Materias del Grupo */}
                                            {isExpanded && (
                                                <div className="border-t border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/20 dark:bg-neutral-950/20 p-4">
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-sm">
                                                            <thead>
                                                                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-semibold text-xs uppercase tracking-wider text-left">
                                                                    <th className="pb-3 font-semibold text-left w-1/2">Materia</th>
                                                                    <th className="pb-3 font-semibold text-left">Docente</th>
                                                                    <th className="pb-3 font-semibold text-center w-[120px]">Estudiantes</th>
                                                                    <th className="pb-3 font-semibold text-right w-[140px]">Acciones</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
                                                                {gClases.map((c: any) => {
                                                                    const docenteName = c.docente_cup?.docente?.usuario 
                                                                        ? `${c.docente_cup.docente.usuario.APELLIDO} ${c.docente_cup.docente.usuario.NOMBRE}` 
                                                                        : c.docenteCup?.docente?.usuario 
                                                                            ? `${c.docenteCup.docente.usuario.APELLIDO} ${c.docenteCup.docente.usuario.NOMBRE}` 
                                                                            : null;

                                                                    return (
                                                                        <tr key={c.ID_CLASE} className="hover:bg-neutral-100/30 dark:hover:bg-neutral-800/10 transition-colors">
                                                                            <td className="py-3.5 pr-4 align-middle">
                                                                                <div className="flex items-center gap-2.5">
                                                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200/60 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/40">
                                                                                        <BookOpen className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
                                                                                    </div>
                                                                                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                                                                                        {c.materia?.NOMBRE ?? '—'}
                                                                                    </span>
                                                                                </div>
                                                                            </td>

                                                                            <td className="py-3.5 px-2 align-middle">
                                                                                {docenteName ? (
                                                                                    <div className="flex items-center text-neutral-700 dark:text-neutral-300">
                                                                                        <span className="font-medium text-xs truncate max-w-[200px]" title={docenteName}>
                                                                                            {docenteName}
                                                                                        </span>
                                                                                    </div>
                                                                                ) : (
                                                                                    <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400 border border-amber-200/40 dark:border-amber-900/30">
                                                                                        Sin docente asignado
                                                                                    </span>
                                                                                )}
                                                                            </td>

                                                                            <td className="py-3.5 px-2 text-center align-middle">
                                                                                <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-100/50 px-2.5 py-0.5 text-xs font-bold text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/40 dark:text-neutral-300">
                                                                                    <Users className="h-3 w-3 opacity-70" />
                                                                                    {c.estudiante_cups_count ?? c.estudianteCupsCount ?? 0}
                                                                                </span>
                                                                            </td>

                                                                            <td className="py-3.5 pl-4 text-right align-middle">
                                                                                <Button variant="default" size="sm" asChild className="h-8 gap-1.5 text-xs font-semibold bg-neutral-900 text-neutral-50 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200">
                                                                                    <Link href={`/notas/clases/${c.ID_CLASE}?cup_id=${cup.ID_CUP}`}>
                                                                                        Gestionar Notas
                                                                                    </Link>
                                                                                </Button>
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-12 text-center dark:border-neutral-800 dark:bg-neutral-900/40">
                                    <BookOpen className="h-10 w-10 text-neutral-400" />
                                    <p className="text-muted-foreground text-sm">No hay grupos registrados en este CUP.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
