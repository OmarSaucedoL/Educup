import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    Calendar, Users, BookOpen, User, Building2,
    Clock, ChevronLeft, Hash, GraduationCap, Layers,
    Plus, CheckSquare, Square, UserPlus, AlertCircle, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface CupInformacionProps {
    cup: any;
    docentesActivos: any[];
}

function estadoBadge(estado: string) {
    const map: Record<string, string> = {
        'Inscripciones': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-800',
        'En curso':      'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/20 dark:text-sky-300 dark:border-sky-800',
        'Concluido':     'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700',
    };
    return map[estado] ?? 'bg-neutral-100 text-neutral-600 border-neutral-200';
}

/* ── Asignar Docentes Modal ── */
function AsignarDocentesModal({ cup, docentesActivos, open, onOpenChange }: { cup: any; docentesActivos: any[], open: boolean, onOpenChange: (open: boolean) => void }) {
    const materiasCup: any[] = cup.materias ?? [];
    const [asignaciones, setAsignaciones] = useState<Record<string, number[]>>({});
    const [processing, setProcessing] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            const initial: Record<string, number[]> = {};
            const docenteCups: any[] = cup.docente_cups ?? cup.docenteCups ?? [];
            
            docenteCups.forEach((dc: any) => {
                const docenteId = dc.CODIGO_DOCENTE.toString();
                const materiasDc = (dc.docente_cup_mats ?? dc.docenteCupMats ?? []).map((m: any) => m.MATERIA_ID);
                initial[docenteId] = materiasDc;
            });
            setAsignaciones(initial);
        }
    }, [open, cup]);

    function toggleMateria(docenteId: string, materiaId: number) {
        setAsignaciones(prev => {
            const currentMaterias = prev[docenteId] || [];
            const newMaterias = currentMaterias.includes(materiaId)
                ? currentMaterias.filter(id => id !== materiaId)
                : [...currentMaterias, materiaId];
            return { ...prev, [docenteId]: newMaterias };
        });
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setErrorMsg(null);
        
        const assignmentsToSubmit = Object.entries(asignaciones)
            .map(([codigo, mats]) => ({
                CODIGO_DOCENTE: parseInt(codigo, 10),
                materias: mats
            }));

        setProcessing(true);
        router.post(`/cup/${cup.ID_CUP}/docentes`, { asignaciones: assignmentsToSubmit }, {
            onSuccess: () => {
                onOpenChange(false);
                setProcessing(false);
            },
            onError: (err) => {
                setErrorMsg(err.error || "Hubo un error al asignar los docentes.");
                setProcessing(false);
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={(val) => { if(!processing) onOpenChange(val); }}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-0 shadow-xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                <DialogHeader className="border-b border-neutral-100 dark:border-neutral-800 px-6 pt-6 pb-4 bg-neutral-50 dark:bg-neutral-900/40">
                    <DialogTitle className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-neutral-900 dark:text-neutral-100" />
                        Asignar Docentes al CUP
                    </DialogTitle>
                    <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400">
                        Selecciona las materias que impartirá cada docente activo en este CUP.
                    </DialogDescription>
                </DialogHeader>

                <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4 bg-neutral-50/30 dark:bg-neutral-950/50">
                    {errorMsg && (
                        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20 p-3 text-xs text-red-700 dark:text-red-300">
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            {errorMsg}
                        </div>
                    )}
                    
                    {docentesActivos.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 p-8 text-center">
                            <User className="h-8 w-8 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
                            <p className="text-sm text-neutral-500">No hay docentes activos en el sistema.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {docentesActivos.map((d: any) => {
                                const selectedMaterias = asignaciones[d.CODIGO_DOCENTE] || [];
                                const hasSelection = selectedMaterias.length > 0;
                                return (
                                    <div key={d.CODIGO_DOCENTE} className={`rounded-xl border transition-colors p-4 space-y-3 ${
                                        hasSelection 
                                        ? 'border-neutral-900 bg-neutral-50 dark:border-neutral-100 dark:bg-neutral-900 shadow-sm' 
                                        : 'border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950'
                                    }`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                                                hasSelection ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'
                                            }`}>
                                                <span className="text-xs font-bold">
                                                    {d.usuario?.NOMBRE?.substring(0, 1)}{d.usuario?.APELLIDO?.substring(0, 1)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-neutral-800 dark:text-neutral-200">
                                                    {d.usuario ? `${d.usuario.NOMBRE} ${d.usuario.APELLIDO}` : `Docente #${d.CODIGO_DOCENTE}`}
                                                </p>
                                                <p className="text-[10px] text-neutral-500">Código: {d.CODIGO_DOCENTE}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-2 pt-1 border-t border-neutral-100 dark:border-neutral-800/60">
                                            {materiasCup.map((m: any) => {
                                                const selected = selectedMaterias.includes(m.ID_MATERIA);
                                                return (
                                                    <button
                                                        key={m.ID_MATERIA}
                                                        type="button"
                                                        onClick={() => toggleMateria(d.CODIGO_DOCENTE, m.ID_MATERIA)}
                                                        className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all ${
                                                            selected
                                                                ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900 shadow-sm'
                                                                : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-400'
                                                        }`}
                                                    >
                                                        {selected
                                                            ? <CheckSquare className="h-3.5 w-3.5 text-white dark:text-neutral-900 shrink-0" />
                                                            : <Square className="h-3.5 w-3.5 text-neutral-400 shrink-0" />}
                                                        {m.NOMBRE}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <DialogFooter className="border-t border-neutral-100 dark:border-neutral-800 px-6 py-4 flex justify-end gap-2 bg-neutral-50/50 dark:bg-neutral-900/20">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
                        Cancelar
                    </Button>
                    <Button onClick={submit} disabled={processing} className="bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 font-bold shadow-sm px-6">
                        {processing ? 'Guardando...' : 'Guardar Asignaciones'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function Informacion({ cup, docentesActivos }: CupInformacionProps) {
    const { props } = usePage<any>();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const flash = props.flash as { success?: string } | undefined;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Gestión Académica', href: '#' },
        { title: 'CUP', href: '/cup' },
        { title: `CUP #${cup.ID_CUP} — ${cup.ANIO} Sem. ${cup.SEMESTRE}`, href: `/cup/${cup.ID_CUP}` },
    ];

    const carreraCups: any[] = cup.carrera_cups ?? cup.carreraCups ?? [];
    const materias: any[]    = cup.materias ?? [];
    const docenteCups: any[] = cup.docente_cups ?? cup.docenteCups ?? [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`CUP #${cup.ID_CUP} — Información`} />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">

                {/* Flash success */}
                {flash?.success && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20 px-4 py-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        {flash.success}
                    </div>
                )}

                {/* ── Header ── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
                            <Hash className="h-7 w-7 text-neutral-900 dark:text-neutral-100" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-2xl font-bold tracking-tight">CUP #{cup.ID_CUP}</h1>
                                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${estadoBadge(cup.ESTADO)}`}>
                                    {cup.ESTADO ?? '—'}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Gestión {cup.ANIO} · Semestre {cup.SEMESTRE}
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" asChild className="shrink-0 gap-1.5 font-semibold text-sm">
                        <Link href="/cup">
                            <ChevronLeft className="h-4 w-4" /> Volver a CUPs
                        </Link>
                    </Button>
                </div>

                {/* ── Summary Cards ── */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                        { label: 'Cupos Totales', value: cup.CUPOS,        icon: Users,        color: 'text-blue-500' },
                        { label: 'Nota Mínima',   value: cup.NOTA_MINIMA,  icon: GraduationCap, color: 'text-violet-500' },
                        { label: 'Fecha Inicio',  value: cup.FECHA_INICIO, icon: Calendar,      color: 'text-emerald-500' },
                        { label: 'Fecha Fin',     value: cup.FECHA_FIN,    icon: Calendar,      color: 'text-rose-400' },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="rounded-xl border border-neutral-100 dark:border-neutral-800 bg-card p-4 shadow-sm flex flex-col gap-1">
                            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                                <Icon className={`h-3.5 w-3.5 ${color}`} /> {label}
                            </span>
                            <span className="text-base font-extrabold text-neutral-800 dark:text-neutral-100">{value ?? '—'}</span>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                    {/* ── Left column ── */}
                    <div className="flex flex-col gap-6">

                        {/* Carreras */}
                        <section className="rounded-xl border border-neutral-100 dark:border-neutral-800 bg-card shadow-sm overflow-hidden">
                            <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 px-4 py-3">
                                <Layers className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
                                <h2 className="text-sm font-bold text-neutral-700 dark:text-neutral-200">Carreras</h2>
                                <span className="ml-auto text-xs font-bold text-neutral-400">{carreraCups.length}</span>
                            </div>
                            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {carreraCups.length > 0 ? carreraCups.map((cc: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                                        <span className="font-semibold text-neutral-700 dark:text-neutral-300 truncate">
                                            {cc.carrera?.NOMBRE ?? `Carrera #${cc.ID_CARRERA}`}
                                        </span>
                                        <span className="shrink-0 ml-3 inline-flex items-center rounded-full border bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800 px-2 py-0.5 text-[10px] font-bold">
                                            {cc.CUPOS} cupos
                                        </span>
                                    </div>
                                )) : (
                                    <p className="px-4 py-3 text-xs text-neutral-400 italic">Sin carreras asignadas.</p>
                                )}
                            </div>
                        </section>

                        {/* Materias */}
                        <section className="rounded-xl border border-neutral-100 dark:border-neutral-800 bg-card shadow-sm overflow-hidden">
                            <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 px-4 py-3">
                                <BookOpen className="h-4 w-4 text-violet-500" />
                                <h2 className="text-sm font-bold text-neutral-700 dark:text-neutral-200">Materias del CUP</h2>
                                <span className="ml-auto text-xs font-bold text-neutral-400">{materias.length}</span>
                            </div>
                            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {materias.length > 0 ? materias.map((m: any, i: number) => (
                                    <div key={i} className="flex items-center gap-2 px-4 py-3 text-sm">
                                        <BookOpen className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                                        <span className="font-semibold text-neutral-700 dark:text-neutral-300">{m.NOMBRE}</span>
                                    </div>
                                )) : (
                                    <p className="px-4 py-3 text-xs text-neutral-400 italic">Sin materias asignadas.</p>
                                )}
                            </div>
                        </section>

                        {/* Administrador */}
                        <section className="rounded-xl border border-neutral-100 dark:border-neutral-800 bg-card shadow-sm overflow-hidden">
                            <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 px-4 py-3">
                                <User className="h-4 w-4 text-amber-500" />
                                <h2 className="text-sm font-bold text-neutral-700 dark:text-neutral-200">Administrador</h2>
                            </div>
                            <div className="px-4 py-3 text-sm">
                                {cup.usuario ? (
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 flex items-center justify-center shrink-0">
                                            <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                                                {cup.usuario.NOMBRE?.substring(0, 1)}{cup.usuario.APELLIDO?.substring(0, 1)}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-neutral-800 dark:text-neutral-200">{cup.usuario.NOMBRE} {cup.usuario.APELLIDO}</p>
                                            <p className="text-xs text-neutral-400">{cup.usuario.CORREO}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-neutral-400 italic">Sin administrador asignado.</p>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* ── Right column: Docentes ── */}
                    <div className="lg:col-span-2 flex flex-col gap-4">

                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
                            <h2 className="text-sm font-bold text-neutral-700 dark:text-neutral-200 uppercase tracking-widest">
                                Docentes Asignados
                            </h2>
                            <span className="ml-auto text-xs font-bold text-neutral-400">{docenteCups.length} docente(s)</span>
                        </div>

                        {/* Asignar Docentes Button */}
                        <Button
                            variant="outline"
                            onClick={() => setIsModalOpen(true)}
                            className="w-full gap-2 border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900 font-semibold"
                        >
                            <UserPlus className="h-4 w-4" />
                            Administrar Docentes
                        </Button>
                        
                        <AsignarDocentesModal cup={cup} docentesActivos={docentesActivos} open={isModalOpen} onOpenChange={setIsModalOpen} />

                        {/* Docente cards */}
                        {docenteCups.length > 0 ? docenteCups.map((dc: any) => {
                            const docente = dc.docente;
                            const clases: any[] = dc.clases ?? [];
                            const materiasDc: any[] = (dc.docente_cup_mats ?? dc.docenteCupMats ?? []).map((m: any) => m.materia);

                            return (
                                <div key={dc.ID} className="rounded-xl border border-neutral-100 dark:border-neutral-800 bg-card shadow-sm overflow-hidden">
                                    {/* Docente Header */}
                                    <div className="flex items-center gap-3 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 px-4 py-3">
                                        <div className="h-9 w-9 rounded-full bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center shrink-0">
                                            <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                                                {docente?.usuario?.NOMBRE?.substring(0, 1)}
                                                {docente?.usuario?.APELLIDO?.substring(0, 1)}
                                            </span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-sm text-neutral-900 dark:text-neutral-100 truncate">
                                                {docente?.usuario
                                                    ? `${docente.usuario.NOMBRE} ${docente.usuario.APELLIDO}`
                                                    : `Docente #${dc.CODIGO_DOCENTE}`}
                                            </p>
                                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                                                Código: {dc.CODIGO_DOCENTE}
                                            </p>
                                        </div>
                                        {/* Materias assigned to this docente */}
                                        <div className="ml-auto flex flex-wrap gap-1 justify-end">
                                            {materiasDc.map((m: any, i: number) => (
                                                <span key={i} className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/20 dark:text-violet-300 dark:border-violet-800">
                                                    <BookOpen className="h-2.5 w-2.5" />
                                                    {m?.NOMBRE ?? '—'}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Clases */}
                                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                        {clases.length > 0 ? clases.map((clase: any) => {
                                            const bloque = clase.bloque_horario ?? clase.bloqueHorario;
                                            const horariosEnBloque: any[] = bloque?.horarios_en_bloque ?? bloque?.horariosEnBloque ?? [];
                                            return (
                                                <div key={clase.ID_CLASE} className="px-4 py-3 space-y-2">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <BookOpen className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                                                        <span className="text-xs font-extrabold text-neutral-800 dark:text-neutral-200">
                                                            {clase.materia?.NOMBRE ?? `Clase #${clase.ID_CLASE}`}
                                                        </span>
                                                        {clase.grupo && (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold rounded-full border px-2 py-0.5 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-800">
                                                                <Users className="h-2.5 w-2.5" />
                                                                Grupo #{clase.grupo.ID_GRUPO}
                                                            </span>
                                                        )}
                                                        {clase.aula && (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold rounded-full border px-2 py-0.5 bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/20 dark:text-sky-300 dark:border-sky-800">
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
                                                                    <span key={i} className="inline-flex items-center gap-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-2 py-0.5 text-[10px] font-bold text-neutral-600 dark:text-neutral-300">
                                                                        {h?.DIA} {h?.HORA_INI} – {h?.HORA_FIN}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }) : (
                                            <p className="px-4 py-3 text-xs text-neutral-400 italic">Sin clases asignadas todavía.</p>
                                        )}
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 p-8 text-center">
                                <User className="h-8 w-8 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
                                <p className="text-sm text-neutral-400">No hay docentes asignados a este CUP todavía.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
