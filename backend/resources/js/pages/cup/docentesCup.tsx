import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, Building2, ChevronLeft, Clock, User, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export default function CupDocentesPage({ cup }: { cup: any }) {
    const [expandedDocentes, setExpandedDocentes] = useState<Record<number, boolean>>({});

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Gestión Académica', href: '#' },
        { title: 'CUP', href: '/cup' },
        { title: `CUP #${cup.ID_CUP}`, href: `/cup/${cup.ID_CUP}` },
        { title: 'Docentes Asignados', href: '#' },
    ];

    const docenteCups: any[] = cup.docente_cups ?? cup.docenteCups ?? [];

    const toggleDocente = (id: number) => {
        setExpandedDocentes(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const expandAll = () => {
        const next: Record<number, boolean> = {};
        docenteCups.forEach((dc: any) => {
            next[dc.ID] = true;
        });
        setExpandedDocentes(next);
    };

    const collapseAll = () => {
        setExpandedDocentes({});
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Docentes CUP #${cup.ID_CUP}`} />

            <div className="mx-auto flex h-full w-full max-w-5xl flex-1 flex-col gap-6 rounded-xl p-4">
                {/* ── Header ── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/60">
                            <User className="h-7 w-7 text-neutral-900 dark:text-neutral-100" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Docentes Asignados al CUP</h1>
                            <p className="text-muted-foreground mt-0.5 text-sm">
                                Periodo: {cup.ANIO} - {cup.SEMESTRE} · Total: {docenteCups.length} docente(s)
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" asChild className="shrink-0 gap-1.5 text-sm font-semibold">
                        <Link href={`/cup/${cup.ID_CUP}`}>
                            <ChevronLeft className="h-4 w-4" /> Volver a CUP
                        </Link>
                    </Button>
                </div>

                {/* ── Controles de Acordeón ── */}
                {docenteCups.length > 0 && (
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

                {/* ── Docente cards ── */}
                <div className="flex flex-col gap-4">
                    {docenteCups.length > 0 ? (
                        docenteCups.map((dc: any) => {
                            const docente = dc.docente;
                            const clases: any[] = dc.clases ?? [];
                            const materiasDc: any[] = (dc.docente_cup_mats ?? dc.docenteCupMats ?? []).map((m: any) => m.materia);
                            const isExpanded = !!expandedDocentes[dc.ID];

                            // Obtener grupos únicos asignados al docente
                            const uniqueGroups = Array.from(
                                new Map(
                                    clases
                                        .map((clase: any) => clase.grupo)
                                        .filter(Boolean)
                                        .map((grupo: any) => [grupo.ID_GRUPO, grupo])
                                ).values()
                            );

                            return (
                                <div
                                    key={dc.ID}
                                    className="border-neutral-150 bg-card overflow-hidden rounded-xl border shadow-xs transition-all dark:border-neutral-800"
                                >
                                    {/* Docente Header */}
                                    <div 
                                        onClick={() => toggleDocente(dc.ID)}
                                        className="flex flex-col md:flex-row md:items-center gap-3 border-b border-neutral-100 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900/40 cursor-pointer select-none hover:bg-neutral-100/70 dark:hover:bg-neutral-900/60 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800">
                                                <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                                                    {docente?.usuario?.APELLIDO?.substring(0, 1)}
                                                    {docente?.usuario?.NOMBRE?.substring(0, 1)}
                                                </span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-bold text-neutral-900 dark:text-neutral-100">
                                                    {docente?.usuario
                                                        ? `${docente.usuario.APELLIDO} ${docente.usuario.NOMBRE}`
                                                        : `Docente #${dc.CODIGO_DOCENTE}`}
                                                </p>
                                                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Código: {dc.CODIGO_DOCENTE}</p>
                                            </div>
                                        </div>

                                        {/* Badges y Chevron toggle */}
                                        <div className="md:ml-auto flex flex-wrap items-center justify-between md:justify-end gap-2 w-full md:w-auto">
                                            <div className="flex items-center gap-1.5">
                                                {/* Badges de Grupos */}
                                                {uniqueGroups.map((grupo: any, i: number) => (
                                                    <span
                                                        key={i}
                                                        className="inline-flex items-center gap-1 rounded-full border border-neutral-350 bg-neutral-200/50 px-2.5 py-0.5 text-[10px] font-bold text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                                                    >
                                                        <Users className="h-2.5 w-2.5 text-neutral-500 dark:text-neutral-400" />
                                                        {grupo.NOMBRE ? `Grupo ${grupo.NOMBRE}` : `Grupo #${grupo.ID_GRUPO}`}
                                                    </span>
                                                ))}

                                                {uniqueGroups.length > 0 && (
                                                    <div className="hidden md:block h-4 w-px bg-neutral-300 dark:bg-neutral-750 mx-1" />
                                                )}

                                                {/* Badges de Nombre de Materias */}
                                                <div className="flex flex-wrap gap-1">
                                                    {materiasDc.map((m: any, i: number) => (
                                                        <span
                                                            key={i}
                                                            className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-300"
                                                        >
                                                            {m?.NOMBRE ?? '—'}
                                                        </span>
                                                    ))}
                                                </div>
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

                                    {/* Clases (Desplegables) */}
                                    {isExpanded && (
                                        <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60 bg-neutral-50/10 dark:bg-neutral-950/10">
                                            {clases.length > 0 ? (
                                                clases.map((clase: any) => {
                                                    const bloque = clase.bloque_horario ?? clase.bloqueHorario;
                                                    const horariosEnBloque: any[] = bloque?.horarios_en_bloque ?? bloque?.horariosEnBloque ?? [];
                                                    return (
                                                        <div key={clase.ID_CLASE} className="space-y-2 px-4 py-3">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <BookOpen className="h-3.5 w-3.5 shrink-0 text-neutral-500 dark:text-neutral-400" />
                                                                <span className="text-neutral-850 dark:text-neutral-250 text-xs font-extrabold">
                                                                    {clase.materia?.NOMBRE ?? `Clase #${clase.ID_CLASE}`}
                                                                </span>
                                                                {clase.grupo && (
                                                                    <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[10px] font-bold text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-300">
                                                                        <Users className="h-2.5 w-2.5" />
                                                                        {clase.grupo.NOMBRE ? `Grupo ${clase.grupo.NOMBRE}` : `Grupo #${clase.grupo.ID_GRUPO}`}
                                                                    </span>
                                                                )}
                                                                {clase.aula && (
                                                                    <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[10px] font-bold text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-300">
                                                                        <Building2 className="h-2.5 w-2.5" />
                                                                        {clase.aula.NOMBRE ?? `Aula #${clase.aula.ID_AULA}`}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {bloque?.TURNO && (
                                                                <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                                                                    <Clock className="h-3 w-3" /> Turno: {bloque.TURNO}
                                                                </div>
                                                            )}
                                                            {horariosEnBloque.length > 0 && (
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {horariosEnBloque.map((heb: any, i: number) => {
                                                                        const h = heb.horario;
                                                                        return (
                                                                            <span
                                                                                key={i}
                                                                                className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                                                                            >
                                                                                {h?.DIA} {h?.HORA_INI} – {h?.HORA_FIN}
                                                                            </span>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <p className="px-4 py-3 text-xs text-neutral-400 italic">Sin clases asignadas todavía.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="rounded-xl border border-dashed border-neutral-200 p-8 text-center dark:border-neutral-800">
                            <User className="mx-auto mb-2 h-8 w-8 text-neutral-300 dark:text-neutral-700" />
                            <p className="text-sm text-neutral-400">No hay docentes asignados a este CUP todavía.</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
