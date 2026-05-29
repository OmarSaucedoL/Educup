import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GraduationCap, Calendar, CheckCircle2, XCircle, ClipboardList, BookOpen, MapPin, User, Mail, Award } from 'lucide-react';

export interface Carrera {
    ID_CARRERA: number;
    NOMBRE: string;
}

export interface Cup {
    ID_CUP: number;
    ANIO: number;
    SEMESTRE: string;
}

export interface OpcionCarrera {
    ID: number;
    ESTUDIANTE_CUP_ID: number;
    CARRERA_CUP_ID: number;
    OPCION: number;
    carrera_cup?: {
        ID: number;
        ID_CARRERA: number;
        ID_CUP: number;
        carrera?: Carrera;
    };
}

export interface Materia {
    ID_MATERIA: number;
    SIGLA: string;
    NOMBRE: string;
}

export interface Aula {
    ID_AULA: number;
    NOMBRE: string;
    UBICACION?: string;
    CAPACIDAD?: number;
}

export interface Grupo {
    ID_GRUPO: number;
    NOMBRE: string;
}

export interface Usuario {
    ID: number;
    NOMBRE: string;
    APELLIDO: string;
    name?: string;
    CORREO?: string;
    email?: string;
}

export interface Docente {
    CODIGO_DOCENTE: number;
    usuario?: Usuario;
}

export interface DocenteCup {
    ID: number;
    CODIGO_DOCENTE: number;
    docente?: Docente;
}

export interface Clase {
    ID_CLASE: number;
    DOCENTE_CUP_ID: number;
    ID_BLOQUE_HORARIO: number;
    ID_MATERIA: number;
    ID_GRUPO: number;
    ID_AULA: number;
    materia?: Materia;
    aula?: Aula;
    grupo?: Grupo;
    docente_cup?: DocenteCup;
    docenteCup?: DocenteCup;
}

export interface Calificacion {
    ID_CALIFICACIONES: number;
    NOMBRE: string;
    CALIFICACION: number;
    PONDERACION: number | string;
    ESTUDIANTE_CUP_ID: number;
    ID_CLASE: number;
    clase?: Clase;
}

export interface HistorialCup {
    ID: number;
    ID_ESTUDIANTE: number;
    ID_CUP: number;
    FECHA: string;
    ESTADO: string;
    NOTA_FINAL: number;
    CARRERA: string | null;
    cup: Cup;
    opciones_carrera?: OpcionCarrera[];
    opcionesCarrera?: OpcionCarrera[];
    calificaciones?: Calificacion[];
}

interface DetalleHistorialModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    activeHistoryDetail: HistorialCup | null;
}

export default function DetalleHistorialModal({ open, onOpenChange, activeHistoryDetail }: DetalleHistorialModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl p-6 border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-xl">
                {activeHistoryDetail && (
                    <>
                        <DialogHeader className="border-b border-neutral-100 dark:border-neutral-800 pb-4 mb-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 shadow-2xs shrink-0">
                                        <GraduationCap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-xl font-bold tracking-tight text-neutral-800 dark:text-neutral-200">
                                            Expediente de Admisión
                                        </DialogTitle>
                                        <DialogDescription className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5" />
                                            CUP {activeHistoryDetail.cup.ANIO} — Semestre {activeHistoryDetail.cup.SEMESTRE}
                                        </DialogDescription>
                                    </div>
                                </div>
                                <span className={`self-start sm:self-center inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-wide shadow-2xs ${
                                    activeHistoryDetail.ESTADO === 'APROBADO'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-800'
                                        : activeHistoryDetail.ESTADO === 'REPROBADO'
                                        ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-300 dark:border-rose-800'
                                        : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-300 dark:border-indigo-800'
                                }`}>
                                    {activeHistoryDetail.ESTADO === 'APROBADO' ? (
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                    ) : activeHistoryDetail.ESTADO === 'REPROBADO' ? (
                                        <XCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                                    ) : (
                                        <ClipboardList className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                                    )}
                                    {activeHistoryDetail.ESTADO}
                                </span>
                            </div>
                        </DialogHeader>

                        <div className="space-y-6">
                            {/* Admissions Summary Banner Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-neutral-50/50 dark:bg-neutral-900/20 border border-neutral-100 dark:border-neutral-800/80 rounded-xl p-4 flex flex-col justify-between shadow-2xs">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Nota Final Admisión</span>
                                    <div className="flex items-baseline gap-1 mt-1">
                                        <span className={`text-3xl font-extrabold tracking-tight ${
                                            activeHistoryDetail.ESTADO === 'APROBADO'
                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                : activeHistoryDetail.ESTADO === 'REPROBADO'
                                                ? 'text-rose-600 dark:text-rose-400'
                                                : 'text-neutral-700 dark:text-neutral-200'
                                        }`}>
                                            {activeHistoryDetail.NOTA_FINAL != null 
                                                ? parseFloat(activeHistoryDetail.NOTA_FINAL.toString()).toFixed(2)
                                                : '0.00'}
                                        </span>
                                        <span className="text-xs font-semibold text-neutral-400">pts</span>
                                    </div>
                                </div>

                                <div className="md:col-span-2 bg-neutral-50/50 dark:bg-neutral-900/20 border border-neutral-100 dark:border-neutral-800/80 rounded-xl p-4 flex flex-col justify-between shadow-2xs">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Carrera de Ingreso Consolidada</span>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className={`p-2 rounded-lg shrink-0 ${
                                            activeHistoryDetail.CARRERA 
                                                ? 'bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50'
                                                : 'bg-neutral-100 dark:bg-neutral-800'
                                        }`}>
                                            <Award className={`h-5 w-5 ${activeHistoryDetail.CARRERA ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-400'}`} />
                                        </div>
                                        <span className={`font-bold text-sm leading-tight ${
                                            activeHistoryDetail.CARRERA 
                                                ? 'text-neutral-800 dark:text-neutral-200'
                                                : 'text-neutral-400 italic font-semibold'
                                        }`}>
                                            {activeHistoryDetail.CARRERA || 'Ninguna / Postulante no admitido'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Career Options chosen in this CUP */}
                            <div>
                                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                    <ClipboardList className="h-4 w-4 text-indigo-500" /> Preferencias de Carreras Postuladas
                                </h4>
                                {(() => {
                                    const options = activeHistoryDetail.opciones_carrera || activeHistoryDetail.opcionesCarrera;
                                    if (!options || options.length === 0) {
                                        return (
                                            <div className="text-xs text-neutral-400 italic bg-neutral-50/30 dark:bg-neutral-900/10 p-3 rounded-lg border border-neutral-100/50 dark:border-neutral-800/50">
                                                Ninguna opción de carrera fue registrada en este periodo.
                                            </div>
                                        );
                                    }
                                    return (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {[...options].sort((a, b) => a.OPCION - b.OPCION).map((op) => (
                                                <div key={op.ID} className="flex items-center justify-between bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800/80 p-3 rounded-xl shadow-3xs">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 border border-indigo-100/40 dark:border-indigo-900/40 shrink-0">
                                                            OP {op.OPCION}
                                                        </span>
                                                        <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 truncate">
                                                            {op.carrera_cup?.carrera?.NOMBRE || 'Carrera no disponible'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Grouped Academics: Materias, Aulas, Docentes & Calificaciones */}
                            <div>
                                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <BookOpen className="h-4 w-4 text-indigo-500" /> Detalle de Asignaturas y Calificaciones
                                </h4>
                                {(() => {
                                    const grouped = activeHistoryDetail.calificaciones?.reduce<Record<number, { clase: Clase; list: Calificacion[] }>>((acc, curr) => {
                                        if (!curr.ID_CLASE || !curr.clase) return acc;
                                        if (!acc[curr.ID_CLASE]) {
                                            acc[curr.ID_CLASE] = {
                                                clase: curr.clase,
                                                list: []
                                            };
                                        }
                                        acc[curr.ID_CLASE].list.push(curr);
                                        return acc;
                                    }, {}) || {};

                                    const groupsList = Object.values(grouped);

                                    if (groupsList.length === 0) {
                                        return (
                                            <div className="text-xs text-neutral-400 italic bg-neutral-50/30 dark:bg-neutral-900/10 p-4 rounded-xl border border-neutral-100/50 dark:border-neutral-800/50 flex flex-col items-center justify-center py-6 gap-2">
                                                <BookOpen className="h-8 w-8 text-neutral-300 dark:text-neutral-700" />
                                                <span>No se encontraron materias o calificaciones registradas para este periodo.</span>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="space-y-4">
                                            {groupsList.map(({ clase, list }) => {
                                                const docenteName = clase.docenteCup?.docente?.usuario 
                                                    ? `${clase.docenteCup.docente.usuario.NOMBRE} ${clase.docenteCup.docente.usuario.APELLIDO}` 
                                                    : clase.docenteCup?.docente?.usuario?.name || 'Por asignar';
                                                const docenteMail = clase.docenteCup?.docente?.usuario?.CORREO || clase.docenteCup?.docente?.usuario?.email;
                                                
                                                return (
                                                    <div key={clase.ID_CLASE} className="border border-neutral-200/70 dark:border-neutral-800 rounded-xl overflow-hidden shadow-2xs bg-white dark:bg-neutral-900">
                                                        {/* Subject Header */}
                                                        <div className="bg-neutral-50/55 dark:bg-neutral-900/50 border-b border-neutral-100 dark:border-neutral-800 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="inline-flex items-center rounded-md bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 text-[10px] font-extrabold text-indigo-700 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/50 uppercase tracking-wide">
                                                                        {clase.materia?.SIGLA || 'SIGLA'}
                                                                    </span>
                                                                    <span className="font-extrabold text-xs text-neutral-400">
                                                                        Grupo: {clase.grupo?.NOMBRE || 'N/A'}
                                                                    </span>
                                                                </div>
                                                                <h5 className="font-bold text-sm text-neutral-800 dark:text-neutral-200 mt-1 leading-snug">
                                                                    {clase.materia?.NOMBRE || 'Materia desconocida'}
                                                                </h5>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-lg self-start sm:self-center border border-neutral-200/30 dark:border-neutral-700/30">
                                                                <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                                                                <span>{clase.aula?.NOMBRE || 'Aula no asignada'}</span>
                                                            </div>
                                                        </div>

                                                        {/* Details Body */}
                                                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {/* Teacher Details */}
                                                            <div className="flex flex-col gap-2.5">
                                                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Docente Asignado</span>
                                                                <div className="flex items-start gap-2.5">
                                                                    <div className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 border border-neutral-200/50 dark:border-neutral-700/50">
                                                                        <User className="h-4 w-4 text-neutral-500" />
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <span className="font-bold text-xs text-neutral-700 dark:text-neutral-300 block leading-tight truncate">
                                                                            {docenteName}
                                                                        </span>
                                                                        {docenteMail && (
                                                                            <span className="text-[10px] font-medium text-neutral-400 flex items-center gap-1 mt-0.5 truncate">
                                                                                <Mail className="h-3 w-3 text-neutral-400" />
                                                                                {docenteMail}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Grades breakdown list */}
                                                            <div className="flex flex-col gap-2">
                                                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-0.5">Desglose de Calificaciones</span>
                                                                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                                                                    {list.map((calif) => (
                                                                        <div key={calif.ID_CALIFICACIONES} className="flex justify-between items-center bg-neutral-50/50 dark:bg-neutral-900/50 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/40 p-2 rounded-lg border border-neutral-100 dark:border-neutral-800/80 text-[11px] font-semibold transition-all">
                                                                            <span className="text-neutral-500 dark:text-neutral-400 truncate pr-3">{calif.NOMBRE}</span>
                                                                            <span className="font-extrabold text-neutral-800 dark:text-neutral-200 shrink-0 flex items-center gap-1">
                                                                                <span>{parseFloat((calif.CALIFICACION ?? 0).toString()).toFixed(1)} pts</span>
                                                                                <span className="text-[10px] text-neutral-400 font-semibold">({parseFloat(calif.PONDERACION.toString()).toFixed(0)}%)</span>
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
