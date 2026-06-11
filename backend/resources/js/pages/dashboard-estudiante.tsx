import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { GraduationCap, Users, BookOpen, Clock, MapPin, UserCheck, AlertCircle } from 'lucide-react';

interface Clase {
    ID_CLASE: number;
    materia: { SIGLA: string; NOMBRE: string };
    docente_cup?: {
        docente: {
            usuario: { NOMBRE: string; APELLIDO: string };
        };
    };
    bloque_horario?: {
        horarios_en_bloque: Array<{
            horario: { DIA: string; HORA_INI: string; HORA_FIN: string };
        }>;
    };
    aula?: {
        NOMBRE: string;
        CAPACIDAD: number;
    };
}

interface Calificacion {
    ID_CALIFICACIONES: number;
    NOMBRE: string;
    CALIFICACION: number;
    PONDERACION: number;
}

interface EstudianteClase {
    ID: number;
    NOTA_FINAL: number;
    ESTADO: string;
    clase: Clase;
    calificaciones: Calificacion[];
}

interface Grupo {
    ID_GRUPO: number;
    NOMBRE: string;
    EST_MAX: number;
    EST_MIN: number;
}

interface DashboardProps {
    cup: any;
    cups_disponibles?: any[];
    clases: EstudianteClase[];
    grupo: Grupo | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard Estudiante',
        href: '/dashboard',
    },
];

export default function DashboardEstudiante({ cup, cups_disponibles, clases, grupo }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard - Estudiante" />
            
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-3">
                            <GraduationCap className="h-8 w-8 text-primary" />
                            Panel del Estudiante
                        </h1>
                        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                            Bienvenido a tu panel principal. Desde aquí podrás acceder a tus materias y ver tu horario en el Curso Universitario de Preparación.
                        </p>
                    </div>

                    {cups_disponibles && cups_disponibles.length > 0 && (
                        <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-2 rounded-lg shadow-sm">
                            <span className="text-sm font-medium text-neutral-500 whitespace-nowrap pl-2">Seleccionar CUP:</span>
                            <select 
                                className="border-none bg-neutral-50 dark:bg-neutral-800 rounded-md text-sm font-semibold text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary py-1.5 pl-3 pr-8 cursor-pointer"
                                value={cup?.ID_CUP || ''}
                                onChange={(e) => {
                                    router.get('/dashboard', { cup_id: e.target.value }, { preserveState: true });
                                }}
                            >
                                {cups_disponibles.map((c) => (
                                    <option key={c.ID_CUP} value={c.ID_CUP}>
                                        Semestre {c.SEMESTRE} / {c.ANIO} {c.ESTADO === 'Concluido' ? '(Concluido)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {(!clases || clases.length === 0) ? (
                    <div className="rounded-xl border border-yellow-200 dark:border-yellow-900/50 bg-yellow-50 dark:bg-yellow-900/20 p-8 flex flex-col items-center justify-center text-center shadow-sm mt-4">
                        <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
                        <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-200 mb-2">No tienes clases asignadas en este momento</h3>
                        <p className="text-yellow-600 dark:text-yellow-400 max-w-md">
                            Tu inscripción ha sido registrada, pero aún no se te ha asignado a un grupo de estudio. Por favor, revisa este panel más adelante o contacta al coordinador.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Tu Grupo Asignado</h2>
                                    <p className="text-2xl font-black text-neutral-900 dark:text-white">
                                        Grupo {grupo?.NOMBRE}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                                    En curso
                                </span>
                            </div>
                        </div>

                        <h2 className="text-xl font-bold mt-4 flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-neutral-500" />
                            Mis Materias
                        </h2>

                        <div className="flex flex-col gap-4">
                            {clases.map((estClase) => {
                                const clase = estClase.clase;
                                return (
                                <div key={clase.ID_CLASE} className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex flex-col md:flex-row">
                                        <div className="flex-1 p-5 border-b md:border-b-0 md:border-r border-neutral-100 dark:border-neutral-800">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <span className="text-xs font-bold text-primary mb-1 block">{clase.materia.SIGLA}</span>
                                                    <h3 className="font-bold text-lg leading-tight text-neutral-900 dark:text-white mb-2">
                                                        {clase.materia.NOMBRE}
                                                    </h3>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 mt-2 text-sm text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800/50 p-2 rounded-lg w-fit">
                                                <UserCheck className="h-4 w-4 shrink-0 text-neutral-400" />
                                                <span className="truncate font-medium">
                                                    {clase.docente_cup 
                                                        ? `${clase.docente_cup.docente.usuario.NOMBRE} ${clase.docente_cup.docente.usuario.APELLIDO}`
                                                        : 'Docente por asignar'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1 p-4 bg-neutral-50/50 dark:bg-neutral-900/20 flex flex-col justify-center space-y-3">
                                            <div className="flex items-start gap-3 text-sm">
                                                <MapPin className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
                                                <div>
                                                    <span className="font-semibold block text-neutral-800 dark:text-neutral-200">Aula {clase.aula?.NOMBRE || 'Por definir'}</span>
                                                    {clase.aula && <span className="text-xs text-neutral-500">Capacidad: {clase.aula.CAPACIDAD}</span>}
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-start gap-3 text-sm">
                                                <Clock className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                                <div className="space-y-1">
                                                    <span className="font-semibold block text-neutral-800 dark:text-neutral-200">Horarios</span>
                                                    {clase.bloque_horario?.horarios_en_bloque?.length ? (
                                                        <ul className="space-y-1">
                                                            {clase.bloque_horario.horarios_en_bloque.map((heb, idx) => (
                                                                <li key={idx} className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600"></span>
                                                                    <span className="font-medium">{heb.horario.DIA}</span> 
                                                                    <span className="tabular-nums opacity-75">{heb.horario.HORA_INI.substring(0,5)} - {heb.horario.HORA_FIN.substring(0,5)}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <span className="text-xs text-neutral-500">Sin horario asignado</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="w-full md:w-64 p-5 bg-neutral-50 dark:bg-neutral-900 border-t md:border-t-0 md:border-l border-neutral-100 dark:border-neutral-800 flex flex-col justify-center">
                                            <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3 block">Calificaciones</span>
                                            {estClase.calificaciones && estClase.calificaciones.length > 0 ? (
                                                <div className="space-y-2 w-full">
                                                    {estClase.calificaciones.map((cal) => (
                                                        <div key={cal.ID_CALIFICACIONES} className="flex justify-between items-center text-sm border-b border-neutral-200 dark:border-neutral-800 pb-1">
                                                            <span className="text-neutral-600 dark:text-neutral-400">{cal.NOMBRE} <span className="text-[10px] text-neutral-400">({Number(cal.PONDERACION)}%)</span></span>
                                                            <span className="font-bold text-neutral-900 dark:text-white">{Number(cal.CALIFICACION)}</span>
                                                        </div>
                                                    ))}
                                                    <div className="flex justify-between items-center text-sm pt-1 mt-2">
                                                        <span className="font-bold text-neutral-800 dark:text-neutral-200">Nota Final</span>
                                                        <span className="font-black text-primary text-lg">{Number(estClase.NOTA_FINAL)}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-sm font-semibold text-neutral-400 text-center">Sin calificaciones registradas</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )})}
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}

