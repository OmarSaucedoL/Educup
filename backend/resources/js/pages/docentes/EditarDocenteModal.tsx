import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User, Mail, Shield, UserCheck, BookOpen, Calendar, Clock, Users, Building2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface EditarDocenteModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedDocente: any;
}

function CupCard({ dc }: { dc: any }) {
    const [expanded, setExpanded] = useState(true);
    // Laravel serializes to snake_case
    const cup = dc.cup;
    const clases: any[] = dc.clases ?? [];

    return (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
            {/* CUP Header */}
            <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between px-4 py-3 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 transition-colors text-left"
            >
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="font-bold text-sm text-indigo-800 dark:text-indigo-200">
                        CUP {cup?.ANIO} — Sem. {cup?.SEMESTRE}
                    </span>
                    <span className={`ml-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide ${
                        cup?.ESTADO === 'EN CURSO'
                            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800'
                            : cup?.ESTADO === 'CONCLUIDO'
                            ? 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800'
                    }`}>
                        {cup?.ESTADO ?? '—'}
                    </span>
                </div>
                {expanded
                    ? <ChevronUp className="h-4 w-4 text-indigo-500" />
                    : <ChevronDown className="h-4 w-4 text-indigo-500" />}
            </button>

            {/* Clases */}
            {expanded && (
                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {clases.length > 0 ? (
                        clases.map((clase: any) => {
                            // Laravel serializes bloque_horario, horarios_en_bloque, etc.
                            const bloque = clase.bloque_horario ?? clase.bloqueHorario;
                            const horariosEnBloque: any[] =
                                bloque?.horarios_en_bloque ?? bloque?.horariosEnBloque ?? [];

                            return (
                                <div key={clase.ID_CLASE} className="px-4 py-3 bg-white dark:bg-neutral-950 space-y-2">
                                    {/* Materia */}
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                                        <span className="text-xs font-extrabold text-neutral-800 dark:text-neutral-200">
                                            {clase.materia?.NOMBRE ?? `Clase #${clase.ID_CLASE}`}
                                        </span>
                                    </div>

                                    {/* Grupo & Aula */}
                                    <div className="flex flex-wrap gap-3">
                                        <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                                            <Users className="h-3 w-3 text-amber-500" />
                                            <span className="font-semibold">Grupo</span>
                                            <span className="font-bold text-neutral-700 dark:text-neutral-300">
                                                #{clase.grupo?.ID_GRUPO ?? '—'}
                                                {clase.grupo?.EST_MIN != null && clase.grupo?.EST_MAX != null
                                                    ? ` (${clase.grupo.EST_MIN}–${clase.grupo.EST_MAX} est.)`
                                                    : ''}
                                            </span>
                                        </div>
                                        {clase.aula && (
                                            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                                                <Building2 className="h-3 w-3 text-sky-500" />
                                                <span className="font-semibold">Aula</span>
                                                <span className="font-bold text-neutral-700 dark:text-neutral-300">
                                                    {clase.aula.NOMBRE ?? `#${clase.aula.ID_AULA}`}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Turno del bloque */}
                                    {bloque?.TURNO && (
                                        <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-semibold">
                                            <Clock className="h-3 w-3" />
                                            Turno: {bloque.TURNO}
                                        </div>
                                    )}

                                    {/* Horario chips */}
                                    {horariosEnBloque.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5">
                                            {horariosEnBloque.map((heb: any, i: number) => {
                                                const h = heb.horario;
                                                return (
                                                    <span
                                                        key={i}
                                                        className="inline-flex items-center gap-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-2 py-0.5 text-[10px] font-bold text-neutral-600 dark:text-neutral-300"
                                                    >
                                                        {h?.DIA ?? '?'} {h?.HORA_INI} – {h?.HORA_FIN}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-[11px] text-neutral-400 italic">Sin horario asignado</p>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="px-4 py-3 text-[11px] text-neutral-400 italic">
                            Sin clases asignadas en este CUP.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function EditarDocenteModal({ open, onOpenChange, selectedDocente }: EditarDocenteModalProps) {
    // Laravel serializes docenteCups → docente_cups
    const docenteCups: any[] = selectedDocente?.docente_cups ?? selectedDocente?.docenteCups ?? [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-0 shadow-xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                <DialogHeader className="border-b border-neutral-100 dark:border-neutral-800 px-6 pt-6 pb-4">
                    <DialogTitle className="text-lg font-bold tracking-tight text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                        <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        Detalles del Docente
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Información personal y historial académico del docente.
                    </DialogDescription>
                </DialogHeader>

                <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
                    {selectedDocente && (
                        <>
                            {/* Avatar & Personal Info */}
                            <div className="flex items-center gap-4 bg-neutral-50/50 dark:bg-neutral-900/20 border border-neutral-100 dark:border-neutral-800/80 rounded-xl p-4">
                                <div className="h-14 w-14 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center shrink-0">
                                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                                        {selectedDocente.usuario?.NOMBRE?.substring(0, 1)}
                                        {selectedDocente.usuario?.APELLIDO?.substring(0, 1)}
                                    </span>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-extrabold text-base text-neutral-800 dark:text-neutral-200 leading-snug truncate">
                                        {selectedDocente.usuario
                                            ? `${selectedDocente.usuario.NOMBRE} ${selectedDocente.usuario.APELLIDO}`
                                            : 'Docente'}
                                    </h3>
                                    <span className="text-xs font-semibold text-neutral-400 block mt-0.5">
                                        Código Docente: #{selectedDocente.CODIGO_DOCENTE}
                                    </span>
                                </div>
                            </div>

                            {/* Quick Info Grid */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col gap-0.5 bg-neutral-50/30 dark:bg-neutral-900/10 p-2.5 rounded-lg border border-neutral-100/50 dark:border-neutral-800/50">
                                    <span className="text-[10px] text-neutral-400 font-semibold flex items-center gap-1">
                                        <Shield className="h-3 w-3 text-indigo-400" /> Usuario
                                    </span>
                                    <span className="text-xs font-extrabold text-neutral-700 dark:text-neutral-300 truncate">
                                        {selectedDocente.usuario?.USERNAME ?? '—'}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-0.5 bg-neutral-50/30 dark:bg-neutral-900/10 p-2.5 rounded-lg border border-neutral-100/50 dark:border-neutral-800/50">
                                    <span className="text-[10px] text-neutral-400 font-semibold flex items-center gap-1">
                                        <User className="h-3 w-3 text-indigo-400" /> C.I. / Carnet
                                    </span>
                                    <span className="text-xs font-extrabold text-neutral-700 dark:text-neutral-300 truncate">
                                        {selectedDocente.usuario?.CARNET ?? '—'}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-0.5 bg-neutral-50/30 dark:bg-neutral-900/10 p-2.5 rounded-lg border border-neutral-100/50 dark:border-neutral-800/50 col-span-2">
                                    <span className="text-[10px] text-neutral-400 font-semibold flex items-center gap-1">
                                        <Mail className="h-3 w-3 text-indigo-400" /> Correo
                                    </span>
                                    <span className="text-xs font-extrabold text-neutral-700 dark:text-neutral-300 truncate">
                                        {selectedDocente.usuario?.CORREO ?? '—'}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-0.5 bg-neutral-50/30 dark:bg-neutral-900/10 p-2.5 rounded-lg border border-neutral-100/50 dark:border-neutral-800/50 col-span-2">
                                    <span className="text-[10px] text-neutral-400 font-semibold flex items-center gap-1">
                                        <UserCheck className="h-3 w-3 text-indigo-400" /> Estado
                                    </span>
                                    <span className={`inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide ${
                                        selectedDocente.usuario?.ESTADO === 'ACTIVO' || selectedDocente.usuario?.ESTADO === 1
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-800'
                                            : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-300 dark:border-rose-800'
                                    }`}>
                                        {selectedDocente.usuario?.ESTADO === 'ACTIVO' || selectedDocente.usuario?.ESTADO === 1 ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                            </div>

                            {/* Academic History */}
                            <div>
                                <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                                    Historial Académico
                                </h4>

                                {docenteCups.length > 0 ? (
                                    <div className="space-y-3">
                                        {docenteCups.map((dc: any) => (
                                            <CupCard key={dc.ID} dc={dc} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 p-6 text-center">
                                        <Calendar className="h-8 w-8 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
                                        <p className="text-xs text-neutral-400">
                                            Este docente no ha participado en ningún CUP todavía.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter className="border-t border-neutral-100 dark:border-neutral-800 px-6 py-4 flex justify-end">
                    <Button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 shadow-sm"
                    >
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
