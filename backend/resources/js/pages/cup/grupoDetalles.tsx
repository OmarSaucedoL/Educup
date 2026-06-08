import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { BookOpen, Users, Clock, User, ChevronLeft, GraduationCap, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';

export default function GrupoDetallesPage({ cup, grupo, clases, estudiantesSinGrupo = [], docentesPorMateria = {} }: { cup: any; grupo: any; clases: any[]; estudiantesSinGrupo?: any[]; docentesPorMateria?: any }) {
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Add student state
    const [openAdd, setOpenAdd] = useState(false);
    const { data: addData, setData: setAddData, post: postAdd, processing: processingAdd, reset: resetAdd, errors: addErrors } = useForm({
        estudiante_cup_id: ''
    });

    // Remove student state
    const [openRemove, setOpenRemove] = useState<number | null>(null);

    // Assign docente state
    const [openAssign, setOpenAssign] = useState<number | null>(null);
    const { data: assignData, setData: setAssignData, put: putAssign, processing: processingAssign, reset: resetAssign, errors: assignErrors } = useForm({
        docente_cup_id: ''
    });

    // Remove docente state
    const [openRemoveDocente, setOpenRemoveDocente] = useState<number | null>(null);

    const bloque = clases.length > 0 ? (clases[0].bloque_horario ?? clases[0].bloqueHorario) : null;
    const turnoDelGrupo = bloque?.TURNO ?? 'No definido';
    
    // Todos los estudiantes del grupo están en la primera clase
    const estudiantes = clases.length > 0 ? (clases[0].estudiante_cups ?? clases[0].estudianteCups ?? []) : [];

    const isCupConcluido = cup.ESTADO === 'Concluido';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Gestión Académica', href: '#' },
        { title: 'CUP', href: '/cup' },
        { title: `CUP #${cup.ID_CUP}`, href: `/cup/${cup.ID_CUP}` },
        { title: 'Clases y Grupos', href: `/cup/${cup.ID_CUP}/clases` },
        { title: `Grupo ${grupo.NOMBRE}`, href: '#' },
    ];

    const handleAddStudent = (e: React.FormEvent) => {
        e.preventDefault();
        postAdd(`/cup/${cup.ID_CUP}/grupos/${grupo.ID_GRUPO}/estudiantes`, {
            onSuccess: () => {
                setOpenAdd(false);
                resetAdd();
            }
        });
    };

    const handleRemoveStudent = (estudianteCupId: number) => {
        setIsProcessing(true);
        router.delete(`/cup/${cup.ID_CUP}/grupos/${grupo.ID_GRUPO}/estudiantes/${estudianteCupId}`, {
            onFinish: () => {
                setIsProcessing(false);
                setOpenRemove(null);
            }
        });
    };

    const handleAssignDocente = (e: React.FormEvent, claseId: number) => {
        e.preventDefault();
        putAssign(`/cup/${cup.ID_CUP}/clases/${claseId}/docente`, {
            onSuccess: () => {
                setOpenAssign(null);
                resetAssign();
            }
        });
    };

    const handleRemoveDocente = (claseId: number) => {
        setIsProcessing(true);
        router.delete(`/cup/${cup.ID_CUP}/clases/${claseId}/docente`, {
            onFinish: () => {
                setIsProcessing(false);
                setOpenRemoveDocente(null);
            }
        });
    };

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
                                        <div className="flex flex-col gap-2">
                                            <div className="font-bold text-base text-neutral-800 dark:text-neutral-200">
                                                {materia?.NOMBRE ?? 'Materia no definida'}
                                            </div>
                                            <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/50 p-2 rounded-md border border-neutral-100 dark:border-neutral-800">
                                                <div className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    {docente ? `${docente.NOMBRE} ${docente.APELLIDO}` : 'Sin Docente'}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Dialog open={openAssign === clase.ID_CLASE} onOpenChange={(val) => {
                                                        setOpenAssign(val ? clase.ID_CLASE : null);
                                                        if (val) setAssignData('docente_cup_id', '');
                                                    }}>
                                                        <DialogTrigger asChild>
                                                            <Button variant="outline" size="sm" className="h-7 text-xs px-2" disabled={isCupConcluido} title={isCupConcluido ? 'Acción no permitida en CUP concluido' : ''}>
                                                                {docente ? 'Cambiar' : 'Asignar'}
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <form onSubmit={(e) => handleAssignDocente(e, clase.ID_CLASE)}>
                                                                <DialogTitle>Asignar Docente</DialogTitle>
                                                                <DialogDescription className="mb-4">
                                                                    Selecciona el docente para la materia <strong>{materia?.NOMBRE}</strong> en el turno <strong>{turnoDelGrupo}</strong>.
                                                                </DialogDescription>
                                                                
                                                                <div className="space-y-4">
                                                                    <div className="flex flex-col gap-2">
                                                                        <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                                                                            Docente Autorizado
                                                                        </label>
                                                                        <select
                                                                            value={assignData.docente_cup_id}
                                                                            onChange={e => setAssignData('docente_cup_id', e.target.value)}
                                                                            className="block w-full rounded-md border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-sm shadow-sm focus:border-neutral-500 focus:ring-neutral-500"
                                                                            required
                                                                        >
                                                                            <option value="" disabled>-- Selecciona un docente --</option>
                                                                            {docentesPorMateria[materia?.ID_MATERIA]?.map((dc: any) => {
                                                                                const doc = dc.docente?.usuario;
                                                                                return (
                                                                                    <option key={dc.ID} value={dc.ID}>
                                                                                        {doc ? `${doc.NOMBRE} ${doc.APELLIDO}` : `ID CUP: ${dc.ID}`}
                                                                                    </option>
                                                                                );
                                                                            })}
                                                                        </select>
                                                                        {assignErrors.docente_cup_id && <p className="text-xs text-red-600 font-medium">{assignErrors.docente_cup_id}</p>}
                                                                        {(assignErrors as any).error && <p className="text-xs text-red-600 font-medium">{(assignErrors as any).error}</p>}
                                                                        {(!docentesPorMateria[materia?.ID_MATERIA] || docentesPorMateria[materia?.ID_MATERIA].length === 0) && (
                                                                            <p className="text-xs text-amber-600 font-medium">No hay docentes autorizados para dictar esta materia en este CUP.</p>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <DialogFooter className="mt-6">
                                                                    <Button type="button" variant="ghost" onClick={() => setOpenAssign(null)} disabled={processingAssign}>
                                                                        Cancelar
                                                                    </Button>
                                                                    <Button type="submit" disabled={processingAssign || !assignData.docente_cup_id} className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200">
                                                                        {processingAssign ? 'Asignando...' : 'Asignar Docente'}
                                                                    </Button>
                                                                </DialogFooter>
                                                            </form>
                                                        </DialogContent>
                                                    </Dialog>

                                                    {docente && (
                                                        <Dialog open={openRemoveDocente === clase.ID_CLASE} onOpenChange={(val) => setOpenRemoveDocente(val ? clase.ID_CLASE : null)}>
                                                            <DialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30" disabled={isCupConcluido} title={isCupConcluido ? 'Acción no permitida en CUP concluido' : ''}>
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogTitle>Remover Docente</DialogTitle>
                                                                <DialogDescription className="text-neutral-600 dark:text-neutral-400">
                                                                    ¿Estás seguro de que deseas desasignar a <strong>{docente.NOMBRE} {docente.APELLIDO}</strong> de la materia de {materia?.NOMBRE}?
                                                                </DialogDescription>
                                                                <DialogFooter>
                                                                    <Button variant="ghost" onClick={() => setOpenRemoveDocente(null)} disabled={isProcessing}>
                                                                        Cancelar
                                                                    </Button>
                                                                    <Button variant="destructive" onClick={() => handleRemoveDocente(clase.ID_CLASE)} disabled={isProcessing}>
                                                                        Sí, remover
                                                                    </Button>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>
                                                    )}
                                                </div>
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
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                                <Users className="h-5 w-5" /> Estudiantes Inscritos ({estudiantes.length})
                            </h3>
                            
                            <Dialog open={openAdd} onOpenChange={setOpenAdd}>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 shadow-sm font-semibold h-8 gap-1" disabled={isCupConcluido} title={isCupConcluido ? 'Acción no permitida en CUP concluido' : ''}>
                                        <Plus className="h-4 w-4" />
                                        Añadir
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <form onSubmit={handleAddStudent}>
                                        <DialogTitle>Añadir estudiante al grupo</DialogTitle>
                                        <DialogDescription className="mb-4">
                                            Selecciona un estudiante inscrito en el CUP que actualmente no tenga grupo.
                                        </DialogDescription>
                                        
                                        <div className="space-y-4">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                                                    Estudiante sin grupo
                                                </label>
                                                <select
                                                    value={addData.estudiante_cup_id}
                                                    onChange={e => setAddData('estudiante_cup_id', e.target.value)}
                                                    className="block w-full rounded-md border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-sm shadow-sm focus:border-neutral-500 focus:ring-neutral-500"
                                                    required
                                                >
                                                    <option value="" disabled>-- Selecciona un estudiante --</option>
                                                    {estudiantesSinGrupo.map((ec: any) => {
                                                        const est = ec.estudiante;
                                                        return (
                                                            <option key={ec.ID} value={ec.ID}>
                                                                {est ? `${est.NOMBRE} ${est.APELLIDO} (CI: ${est.CARNET})` : `ID CUP: ${ec.ID}`}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                                {addErrors.estudiante_cup_id && <p className="text-xs text-red-600 font-medium">{addErrors.estudiante_cup_id}</p>}
                                                {estudiantesSinGrupo.length === 0 && (
                                                    <p className="text-xs text-amber-600 font-medium">No hay estudiantes sin grupo en este momento.</p>
                                                )}
                                            </div>
                                        </div>

                                        <DialogFooter className="mt-6">
                                            <Button type="button" variant="ghost" onClick={() => setOpenAdd(false)} disabled={processingAdd}>
                                                Cancelar
                                            </Button>
                                            <Button type="submit" disabled={processingAdd || !addData.estudiante_cup_id} className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200">
                                                {processingAdd ? 'Añadiendo...' : 'Añadir al grupo'}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="rounded-xl border border-neutral-200 bg-card text-card-foreground shadow-sm dark:border-neutral-800 overflow-hidden flex-1">
                            <div className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-[600px] overflow-y-auto">
                                {estudiantes.length > 0 ? estudiantes.map((ec: any, idx: number) => {
                                    const est = ec.estudiante;
                                    const estudianteCupId = ec.ESTUDIANTE_CUP_ID ?? ec.ID;
                                    return (
                                        <div key={idx} className="flex flex-row items-center justify-between px-4 py-3 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                                                    {idx + 1}. {est ? `${est.NOMBRE} ${est.APELLIDO}` : `Estudiante #${ec.ID_ESTUDIANTE}`}
                                                </span>
                                                <span className="text-xs text-neutral-500 mt-1 font-medium">
                                                    CI: {est?.CARNET ?? '—'}
                                                </span>
                                            </div>
                                            
                                            <Dialog open={openRemove === estudianteCupId} onOpenChange={(open) => setOpenRemove(open ? estudianteCupId : null)}>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30" disabled={isCupConcluido} title={isCupConcluido ? 'Acción no permitida en CUP concluido' : ''}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogTitle>Remover estudiante del grupo</DialogTitle>
                                                    <DialogDescription className="text-neutral-600 dark:text-neutral-400">
                                                        ¿Estás seguro de que deseas remover a <strong>{est ? `${est.NOMBRE} ${est.APELLIDO}` : 'este estudiante'}</strong> del grupo {grupo.NOMBRE}?
                                                        <br/><br/>
                                                        El estudiante se quedará sin asignación y podrá ser asignado a otro grupo posteriormente.
                                                    </DialogDescription>
                                                    <DialogFooter>
                                                        <Button variant="ghost" onClick={() => setOpenRemove(null)} disabled={isProcessing}>
                                                            Cancelar
                                                        </Button>
                                                        <Button variant="destructive" onClick={() => handleRemoveStudent(estudianteCupId)} disabled={isProcessing}>
                                                            Sí, remover
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
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
