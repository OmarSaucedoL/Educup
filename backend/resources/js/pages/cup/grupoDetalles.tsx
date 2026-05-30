import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { BookOpen, Users, Clock, User, ChevronLeft, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GrupoDetallesPage({ cup, grupo, clases }: { cup: any; grupo: any; clases: any[] }) {
    const bloque = clases.length > 0 ? (clases[0].bloque_horario ?? clases[0].bloqueHorario) : null;
    const turnoDelGrupo = bloque?.TURNO ?? 'No definido';
    
    // Todos los estudiantes del grupo están en la primera clase
    const estudiantes = clases.length > 0 ? (clases[0].estudiante_cups ?? clases[0].estudianteCups ?? []) : [];

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Gestión Académica', href: '#' },
        { title: 'CUP', href: '/cup' },
        { title: `CUP #${cup.ID_CUP}`, href: `/cup/${cup.ID_CUP}` },
        { title: 'Clases y Grupos', href: `/cup/${cup.ID_CUP}/clases` },
        { title: `Grupo ${grupo.NOMBRE}`, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Grupo ${grupo.NOMBRE} - CUP #${cup.ID_CUP}`} />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 max-w-5xl mx-auto w-full">
                {/* ── Header ── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
                            <BookOpen className="h-7 w-7 text-neutral-900 dark:text-neutral-100" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight">Detalles del Grupo {grupo?.NOMBRE ?? 'N/A'}</h1>
                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-neutral-100 text-neutral-800 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700">
                                    Turno: {turnoDelGrupo}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Información sobre docentes, materias, horarios y estudiantes.
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" asChild className="shrink-0 gap-1.5 font-semibold text-sm">
                        <Link href={`/cup/${cup.ID_CUP}/clases`}>
                            <ChevronLeft className="h-4 w-4" /> Volver a Grupos
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Materias y Docentes */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <GraduationCap className="h-5 w-5" /> Materias y Docentes
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                            {clases.map((clase: any, idx: number) => {
                                const materia = clase.materia;
                                const docente = clase.docente_cup?.docente?.usuario ?? clase.docenteCup?.docente?.usuario;
                                const heb = clase.bloque_horario?.horarios_en_bloque ?? clase.bloqueHorario?.horariosEnBloque ?? [];
                                
                                return (
                                    <div key={idx} className="rounded-xl border border-neutral-200 bg-card text-card-foreground shadow-sm dark:border-neutral-800 p-4 flex flex-col gap-3">
                                        <div className="flex justify-between items-start">
                                            <div className="font-bold text-base text-neutral-800 dark:text-neutral-200">
                                                {materia?.NOMBRE ?? 'Materia no definida'}
                                            </div>
                                            <div className="text-sm font-semibold text-neutral-500 flex items-center gap-1.5 bg-neutral-50 dark:bg-neutral-900/50 px-2 py-1 rounded-md border border-neutral-100 dark:border-neutral-800">
                                                <User className="h-4 w-4" />
                                                {docente ? `${docente.NOMBRE} ${docente.APELLIDO}` : 'Sin Docente'}
                                            </div>
                                        </div>
                                        {heb.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {heb.map((hObj: any, i: number) => {
                                                    const h = hObj.horario;
                                                    return (
                                                        <span key={i} className="inline-flex items-center gap-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-2.5 py-1 text-xs font-bold text-neutral-700 dark:text-neutral-300">
                                                            <Clock className="h-3.5 w-3.5" /> {h?.DIA} {h?.HORA_INI?.substring(0,5)} - {h?.HORA_FIN?.substring(0,5)}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Estudiantes */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <Users className="h-5 w-5" /> Estudiantes Inscritos ({estudiantes.length})
                        </h3>
                        <div className="rounded-xl border border-neutral-200 bg-card text-card-foreground shadow-sm dark:border-neutral-800 overflow-hidden flex-1">
                            <div className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-[600px] overflow-y-auto">
                                {estudiantes.length > 0 ? estudiantes.map((ec: any, idx: number) => {
                                    const est = ec.estudiante;
                                    return (
                                        <div key={idx} className="flex flex-col px-4 py-3 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                            <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                                                {idx + 1}. {est ? `${est.NOMBRE} ${est.APELLIDO}` : `Estudiante #${ec.ID_ESTUDIANTE}`}
                                            </span>
                                            <span className="text-xs text-neutral-500 mt-1 ml-4 font-medium">
                                                CI: {est?.CARNET ?? '—'}
                                            </span>
                                        </div>
                                    );
                                }) : (
                                    <div className="p-8 text-center text-neutral-500">
                                        <Users className="h-8 w-8 mx-auto mb-3 opacity-20" />
                                        <p className="text-sm italic">No hay estudiantes en este grupo.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
