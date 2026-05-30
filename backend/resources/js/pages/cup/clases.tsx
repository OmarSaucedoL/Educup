import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { BookOpen, Users, Building2, Clock, User, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VerClasesPage({ cup }: { cup: any }) {
    const todasLasClases: any[] = cup.clases ?? [];

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Gestión Académica', href: '#' },
        { title: 'CUP', href: '/cup' },
        { title: `CUP #${cup.ID_CUP}`, href: `/cup/${cup.ID_CUP}` },
        { title: 'Clases', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Clases CUP #${cup.ID_CUP}`} />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 max-w-4xl mx-auto w-full">
                {/* ── Header ── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
                            <BookOpen className="h-7 w-7 text-neutral-900 dark:text-neutral-100" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Clases del CUP #{cup.ID_CUP}</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Lista de todas las clases asignadas en este curso universitario de preparación.
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" asChild className="shrink-0 gap-1.5 font-semibold text-sm">
                        <Link href={`/cup/${cup.ID_CUP}`}>
                            <ChevronLeft className="h-4 w-4" /> Volver a CUP
                        </Link>
                    </Button>
                </div>

                <div className="flex-1 space-y-4">
                    {todasLasClases.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 p-8 text-center bg-white dark:bg-neutral-950">
                            <BookOpen className="h-8 w-8 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
                            <p className="text-sm text-neutral-500">No hay clases registradas en este CUP.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {todasLasClases.map((clase: any, i: number) => {
                                const bloque = clase.bloque_horario ?? clase.bloqueHorario;
                                const horariosEnBloque: any[] = bloque?.horarios_en_bloque ?? bloque?.horariosEnBloque ?? [];
                                const docente = clase.docente_cup?.docente ?? clase.docenteCup?.docente;
                                const codigoDocente = clase.docente_cup?.CODIGO_DOCENTE ?? clase.docenteCup?.CODIGO_DOCENTE;
                                
                                return (
                                    <div key={`${clase.ID_CLASE}-${i}`} className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 p-4 shadow-sm flex flex-col gap-3">
                                        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800/60 pb-2">
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="h-4 w-4 text-violet-500" />
                                                <span className="font-extrabold text-neutral-800 dark:text-neutral-200 text-sm">
                                                    {clase.materia?.NOMBRE ?? `Clase #${clase.ID_CLASE}`}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {clase.grupo && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold rounded-full border px-2 py-0.5 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-800">
                                                        <Users className="h-3 w-3" />
                                                        Grupo {clase.grupo.NOMBRE ?? `#${clase.grupo.ID_GRUPO}`}
                                                    </span>
                                                )}
                                                {clase.aula && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold rounded-full border px-2 py-0.5 bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/20 dark:text-sky-300 dark:border-sky-800">
                                                        <Building2 className="h-3 w-3" />
                                                        {clase.aula.NOMBRE ?? `Aula #${clase.aula.ID_AULA}`}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center shrink-0">
                                                    <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300">
                                                        {docente?.usuario?.NOMBRE?.substring(0, 1) ?? 'D'}
                                                        {docente?.usuario?.APELLIDO?.substring(0, 1) ?? ''}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-xs text-neutral-800 dark:text-neutral-200">
                                                        {docente?.usuario ? `${docente.usuario.NOMBRE} ${docente.usuario.APELLIDO}` : (codigoDocente ? `Docente #${codigoDocente}` : 'Sin asignar')}
                                                    </p>
                                                    <p className="text-[10px] text-neutral-500 flex items-center gap-1 mt-0.5">
                                                        <User className="h-3 w-3" />
                                                        {docente ? 'Docente' : 'Pendiente de asignación'}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-col justify-center">
                                                {bloque?.TURNO && (
                                                    <div className="flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400 mb-1">
                                                        <Clock className="h-3 w-3" /> Turno: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{bloque.TURNO}</span>
                                                    </div>
                                                )}
                                                {horariosEnBloque.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {horariosEnBloque.map((heb: any, idx: number) => {
                                                            const h = heb.horario;
                                                            return (
                                                                <span key={idx} className="inline-flex items-center gap-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-2 py-0.5 text-[10px] font-bold text-neutral-600 dark:text-neutral-300">
                                                                    {h?.DIA} {h?.HORA_INI} – {h?.HORA_FIN}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
