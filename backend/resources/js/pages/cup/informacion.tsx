import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    BookOpen,
    Calendar,
    CheckCircle2,
    CheckSquare,
    ChevronLeft,
    Clock,
    GraduationCap,
    Hash,
    Layers,
    Plus,
    Square,
    User,
    UserPlus,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface RequerimientoDocente {
    materia_id: number;
    materia_nombre: string;
    docentes_necesitados: number;
    docentes_disponibles_perfil: number;
    docentes_asignados_actuales: number;
    docentes_faltantes_perfil: number;
    docentes_faltantes_asignacion: number;
}

interface CupInformacionProps {
    cup: any;
    docentesActivos: any[];
    requerimientoDocentes?: RequerimientoDocente[];
}

const DEFAULT_REQUERIMIENTO_DOCENTES: RequerimientoDocente[] = [];

function estadoBadge(estado: string) {
    const map: Record<string, string> = {
        Inscripciones: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-800',
        'En curso': 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/20 dark:text-sky-300 dark:border-sky-800',
        Concluido: 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700',
    };
    return map[estado] ?? 'bg-neutral-100 text-neutral-600 border-neutral-200';
}

/* ── Asignar Docentes Modal ── */
function AsignarDocentesModal({
    cup,
    docentesActivos,
    open,
    onOpenChange,
}: {
    cup: any;
    docentesActivos: any[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const materiasCup: any[] = cup.materias ?? [];
    const [asignaciones, setAsignaciones] = useState<Record<string, number[]>>(() => {
        const initial: Record<string, number[]> = {};
        const docenteCups: any[] = cup.docente_cups ?? cup.docenteCups ?? [];

        docenteCups.forEach((dc: any) => {
            const docenteId = dc.CODIGO_DOCENTE.toString();
            const materiasDc = (dc.docente_cup_mats ?? dc.docenteCupMats ?? []).map((m: any) => m.MATERIA_ID);
            initial[docenteId] = materiasDc;
        });
        return initial;
    });
    const [processing, setProcessing] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    function toggleMateria(docenteId: string, materiaId: number) {
        setAsignaciones((prev) => {
            const currentMaterias = prev[docenteId] || [];
            const newMaterias = currentMaterias.includes(materiaId)
                ? currentMaterias.filter((id) => id !== materiaId)
                : [...currentMaterias, materiaId];
            return { ...prev, [docenteId]: newMaterias };
        });
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setErrorMsg(null);

        const assignmentsToSubmit = Object.entries(asignaciones).map(([codigo, mats]) => ({
            CODIGO_DOCENTE: parseInt(codigo, 10),
            materias: mats,
        }));

        setProcessing(true);
        router.post(
            `/cup/${cup.ID_CUP}/docentes`,
            { asignaciones: assignmentsToSubmit },
            {
                onSuccess: () => {
                    onOpenChange(false);
                    setProcessing(false);
                },
                onError: (err) => {
                    setErrorMsg(err.error || 'Hubo un error al asignar los docentes.');
                    setProcessing(false);
                },
            },
        );
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(val) => {
                if (!processing) onOpenChange(val);
            }}
        >
            <DialogContent className="animate-in fade-in zoom-in-95 flex max-h-[90vh] flex-col overflow-hidden rounded-xl border border-neutral-100 bg-white p-0 shadow-xl duration-200 sm:max-w-3xl dark:border-neutral-800 dark:bg-neutral-950">
                <DialogHeader className="border-b border-neutral-100 bg-neutral-50 px-6 pt-6 pb-4 dark:border-neutral-800 dark:bg-neutral-900/40">
                    <DialogTitle className="flex items-center gap-2 text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                        <UserPlus className="h-5 w-5 text-neutral-900 dark:text-neutral-100" />
                        Asignar Docentes al CUP
                    </DialogTitle>
                    <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400">
                        Selecciona las materias que impartirá cada docente activo en este CUP.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 space-y-4 overflow-y-auto bg-neutral-50/30 px-6 py-4 dark:bg-neutral-950/50">
                    {errorMsg && (
                        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-300">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            {errorMsg}
                        </div>
                    )}

                    {docentesActivos.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-neutral-200 p-8 text-center dark:border-neutral-800">
                            <User className="mx-auto mb-2 h-8 w-8 text-neutral-300 dark:text-neutral-700" />
                            <p className="text-sm text-neutral-500">No hay docentes activos en el sistema.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {docentesActivos.map((d: any) => {
                                const selectedMaterias = asignaciones[d.CODIGO_DOCENTE] || [];
                                const hasSelection = selectedMaterias.length > 0;
                                return (
                                    <div
                                        key={d.CODIGO_DOCENTE}
                                        className={`space-y-3 rounded-xl border p-4 transition-colors ${
                                            hasSelection
                                                ? 'border-neutral-900 bg-neutral-50 shadow-sm dark:border-neutral-100 dark:bg-neutral-900'
                                                : 'border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                                    hasSelection
                                                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                                                        : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'
                                                }`}
                                            >
                                                <span className="text-xs font-bold">
                                                    {d.usuario?.NOMBRE?.substring(0, 1)}
                                                    {d.usuario?.APELLIDO?.substring(0, 1)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                                                    {d.usuario ? `${d.usuario.NOMBRE} ${d.usuario.APELLIDO}` : `Docente #${d.CODIGO_DOCENTE}`}
                                                </p>
                                                <p className="text-[10px] text-neutral-500">Código: {d.CODIGO_DOCENTE}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-1 dark:border-neutral-800/60">
                                            {materiasCup.map((m: any) => {
                                                const selected = selectedMaterias.includes(m.ID_MATERIA);
                                                return (
                                                    <button
                                                        key={m.ID_MATERIA}
                                                        type="button"
                                                        onClick={() => toggleMateria(d.CODIGO_DOCENTE, m.ID_MATERIA)}
                                                        className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all ${
                                                            selected
                                                                ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm dark:border-white dark:bg-white dark:text-neutral-900'
                                                                : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-400'
                                                        }`}
                                                    >
                                                        {selected ? (
                                                            <CheckSquare className="h-3.5 w-3.5 shrink-0 text-white dark:text-neutral-900" />
                                                        ) : (
                                                            <Square className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                                                        )}
                                                        {m.NOMBRE}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <DialogFooter className="flex justify-end gap-2 border-t border-neutral-100 bg-neutral-50/50 px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900/20">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={submit}
                        disabled={processing}
                        className="bg-neutral-900 px-6 font-bold text-white shadow-sm hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                    >
                        {processing ? 'Guardando...' : 'Guardar Asignaciones'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/* ── Summary Cards Section ── */
interface SummaryCardsSectionProps {
    cup: any;
}

function SummaryCardsSection({ cup }: SummaryCardsSectionProps) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
                { label: 'Cupos Totales', value: cup.CUPOS, icon: Users, color: 'text-blue-500' },
                { label: 'Nota Mínima', value: cup.NOTA_MINIMA, icon: GraduationCap, color: 'text-violet-500' },
                {
                    label: 'Fecha Inicio',
                    value: cup.FECHA_INICIO
                        ? new Date(cup.FECHA_INICIO).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
                        : null,
                    icon: Calendar,
                    color: 'text-emerald-500',
                },
                {
                    label: 'Fecha Fin',
                    value: cup.FECHA_FIN
                        ? new Date(cup.FECHA_FIN).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
                        : null,
                    icon: Calendar,
                    color: 'text-rose-400',
                },
            ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-card flex flex-col gap-1 rounded-xl border border-neutral-100 p-4 shadow-sm dark:border-neutral-800">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-neutral-400 uppercase">
                        <Icon className={`h-3.5 w-3.5 ${color}`} /> {label}
                    </span>
                    <span className="text-base font-extrabold text-neutral-800 dark:text-neutral-100">{value ?? '—'}</span>
                </div>
            ))}
        </div>
    );
}

/* ── Left Column Section ── */
interface LeftColumnSectionProps {
    carreraCups: any[];
    materias: any[];
    cup: any;
}

function LeftColumnSection({ carreraCups, materias, cup }: LeftColumnSectionProps) {
    return (
        <div className="flex flex-col gap-6">
            {/* Carreras */}
            <section className="bg-card overflow-hidden rounded-xl border border-neutral-100 shadow-sm dark:border-neutral-800">
                <div className="flex items-center gap-2 border-b border-neutral-100 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900/40">
                    <Layers className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
                    <h2 className="text-sm font-bold text-neutral-700 dark:text-neutral-200">Carreras</h2>
                    <span className="ml-auto text-xs font-bold text-neutral-400">{carreraCups.length}</span>
                </div>
                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {carreraCups.length > 0 ? (
                        carreraCups.map((cc: any) => (
                            <div key={cc.ID} className="flex items-center justify-between px-4 py-3 text-sm">
                                <span className="truncate font-semibold text-neutral-700 dark:text-neutral-300">
                                    {cc.carrera?.NOMBRE ?? `Carrera #${cc.ID_CARRERA}`}
                                </span>
                                <span className="ml-3 inline-flex shrink-0 items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300">
                                    {cc.CUPOS} cupos
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="px-4 py-3 text-xs text-neutral-400 italic">Sin carreras asignadas.</p>
                    )}
                </div>
            </section>

            {/* Materias */}
            <section className="bg-card overflow-hidden rounded-xl border border-neutral-100 shadow-sm dark:border-neutral-800">
                <div className="flex items-center gap-2 border-b border-neutral-100 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900/40">
                    <BookOpen className="h-4 w-4 text-violet-500" />
                    <h2 className="text-sm font-bold text-neutral-700 dark:text-neutral-200">Materias del CUP</h2>
                    <span className="ml-auto text-xs font-bold text-neutral-400">{materias.length}</span>
                </div>
                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {materias.length > 0 ? (
                        materias.map((m: any) => (
                            <div key={m.ID_MATERIA} className="flex items-center gap-2 px-4 py-3 text-sm">
                                <BookOpen className="h-3.5 w-3.5 shrink-0 text-violet-400" />
                                <span className="font-semibold text-neutral-700 dark:text-neutral-300">{m.NOMBRE}</span>
                            </div>
                        ))
                    ) : (
                        <p className="px-4 py-3 text-xs text-neutral-400 italic">Sin materias asignadas.</p>
                    )}
                </div>
            </section>

            {/* Administrador */}
            <section className="bg-card overflow-hidden rounded-xl border border-neutral-100 shadow-sm dark:border-neutral-800">
                <div className="flex items-center gap-2 border-b border-neutral-100 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900/40">
                    <User className="h-4 w-4 text-amber-500" />
                    <h2 className="text-sm font-bold text-neutral-700 dark:text-neutral-200">Administrador</h2>
                </div>
                <div className="px-4 py-3 text-sm">
                    {cup.usuario ? (
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-100 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/30">
                                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                                    {cup.usuario.NOMBRE?.substring(0, 1)}
                                    {cup.usuario.APELLIDO?.substring(0, 1)}
                                </span>
                            </div>
                            <div>
                                <p className="font-bold text-neutral-800 dark:text-neutral-200">
                                    {cup.usuario.NOMBRE} {cup.usuario.APELLIDO}
                                </p>
                                <p className="text-xs text-neutral-400">{cup.usuario.CORREO}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs text-neutral-400 italic">Sin administrador asignado.</p>
                    )}
                </div>
            </section>
        </div>
    );
}

export default function Informacion({ cup, docentesActivos, requerimientoDocentes = DEFAULT_REQUERIMIENTO_DOCENTES }: CupInformacionProps) {
    const { props } = usePage<any>();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const flash = props.flash as { success?: string } | undefined;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Gestión Académica', href: '#' },
        { title: 'CUP', href: '/cup' },
        { title: `CUP #${cup.ID_CUP} — ${cup.ANIO} Sem. ${cup.SEMESTRE}`, href: `/cup/${cup.ID_CUP}` },
    ];

    const carreraCups: any[] = cup.carrera_cups ?? cup.carreraCups ?? [];
    const materias: any[] = cup.materias ?? [];
    const docenteCups: any[] = cup.docente_cups ?? cup.docenteCups ?? [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`CUP #${cup.ID_CUP} — Información`} />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                {/* Flash success */}
                {flash?.success && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        {flash.success}
                    </div>
                )}

                {props.errors && Object.keys(props.errors).length > 0 && (
                    <div className="flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-800/40 dark:bg-red-950/20 dark:text-red-300">
                        {Object.entries(props.errors).map(([key, err]) => (
                            <div key={key} className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                                <span>{String(err)}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Header ── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/60">
                            <Hash className="h-7 w-7 text-neutral-900 dark:text-neutral-100" />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight">CUP #{cup.ID_CUP}</h1>
                                <span
                                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${estadoBadge(cup.ESTADO)}`}
                                >
                                    {cup.ESTADO ?? '—'}
                                </span>
                            </div>
                            <p className="text-muted-foreground mt-0.5 text-sm">
                                Gestión {cup.ANIO} · Semestre {cup.SEMESTRE}
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" asChild className="shrink-0 gap-1.5 text-sm font-semibold">
                        <Link href="/cup">
                            <ChevronLeft className="h-4 w-4" /> Volver a CUPs
                        </Link>
                    </Button>
                </div>

                {/* ── Summary Cards ── */}
                <SummaryCardsSection cup={cup} />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* ── Left column ── */}
                    <LeftColumnSection carreraCups={carreraCups} materias={materias} cup={cup} />

                    {/* ── Right column: Docentes ── */}
                    <div className="flex flex-col gap-6 lg:col-span-2">
                        {/* ── Tarjeta de Control de Requerimiento de Docentes ── */}
                        <section className="bg-card overflow-hidden rounded-xl border border-neutral-100 shadow-xs dark:border-neutral-800">
                            <div className="flex items-center gap-2 border-b border-neutral-100 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900/40">
                                <Clock className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
                                <h2 className="text-sm font-bold text-neutral-700 dark:text-neutral-200">Requerimiento de Docentes por Materia</h2>
                                <span className="ml-auto rounded-md bg-neutral-900 px-2 py-0.5 text-[10px] font-extrabold text-neutral-50 uppercase dark:bg-neutral-100 dark:text-neutral-950">
                                    Control Operativo
                                </span>
                            </div>

                            <div className="w-full overflow-auto">
                                <table className="w-full caption-bottom text-xs">
                                    <thead className="bg-neutral-50/50 dark:bg-neutral-900/20 [&_tr]:border-b">
                                        <tr className="border-b border-neutral-100 transition-colors dark:border-neutral-800">
                                            <th className="text-muted-foreground h-10 px-4 text-left align-middle font-semibold">Materia</th>
                                            <th className="text-muted-foreground h-10 px-4 text-center align-middle font-semibold">
                                                Docentes Necesitados
                                            </th>
                                            <th className="text-muted-foreground h-10 px-4 text-center align-middle font-semibold">
                                                Docentes Disponibles
                                            </th>
                                            <th className="text-muted-foreground h-10 px-4 text-center align-middle font-semibold">
                                                Docentes Asignados
                                            </th>
                                            <th className="text-muted-foreground h-10 px-4 text-center align-middle font-semibold">
                                                Docentes Faltantes
                                            </th>
                                            <th className="text-muted-foreground h-10 px-4 text-center align-middle font-semibold">
                                                Docentes Sin Asignar
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 [&_tr:last-child]:border-0">
                                        {requerimientoDocentes.length > 0 ? (
                                            requerimientoDocentes.map((req) => (
                                                <tr
                                                    key={req.materia_id}
                                                    className="transition-colors hover:bg-neutral-50/30 dark:hover:bg-neutral-900/10"
                                                >
                                                    <td className="p-4 align-middle font-bold text-neutral-900 dark:text-neutral-100">
                                                        {req.materia_nombre}
                                                    </td>
                                                    <td className="p-4 text-center align-middle font-medium text-neutral-800 dark:text-neutral-200">
                                                        {req.docentes_necesitados}
                                                    </td>
                                                    <td className="p-4 text-center align-middle font-medium text-neutral-800 dark:text-neutral-200">
                                                        {req.docentes_disponibles_perfil}
                                                    </td>
                                                    <td className="p-4 text-center align-middle font-medium text-neutral-800 dark:text-neutral-200">
                                                        {req.docentes_asignados_actuales}
                                                    </td>
                                                    <td className="p-4 text-center align-middle">
                                                        {req.docentes_faltantes_perfil > 0 ? (
                                                            <span className="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-2 py-0.5 text-[10px] font-bold text-neutral-50 shadow-xs dark:bg-neutral-100 dark:text-neutral-950">
                                                                {req.docentes_faltantes_perfil}
                                                            </span>
                                                        ) : (
                                                            <span className="font-medium text-neutral-400 dark:text-neutral-600">—</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-center align-middle">
                                                        {req.docentes_faltantes_asignacion > 0 ? (
                                                            <span className="inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-800 shadow-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                                                                {req.docentes_faltantes_asignacion}
                                                            </span>
                                                        ) : (
                                                            <span className="font-medium text-neutral-400 dark:text-neutral-600">—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="text-muted-foreground p-8 text-center align-middle">
                                                    No hay clases programadas en este CUP.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
                            <h2 className="text-sm font-bold tracking-widest text-neutral-700 uppercase dark:text-neutral-200">Docentes Asignados</h2>
                            <span className="ml-auto text-xs font-bold text-neutral-400">{docenteCups.length} docente(s)</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
                            <Button
                                variant="outline"
                                onClick={() => setIsModalOpen(true)}
                                className="w-full gap-2 border-neutral-200 bg-white font-semibold text-neutral-900 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900"
                            >
                                <UserPlus className="h-4 w-4" />
                                Administrar Docentes
                            </Button>

                            <Button
                                asChild
                                variant="outline"
                                className="w-full gap-2 border-neutral-200 bg-white font-semibold text-neutral-900 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900"
                            >
                                <Link href={`/cup/${cup.ID_CUP}/clases`}>
                                    <BookOpen className="h-4 w-4" />
                                    Ver Clases
                                </Link>
                            </Button>

                            <Button
                                asChild
                                className="w-full gap-2 bg-neutral-900 font-bold text-white shadow-sm hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                            >
                                <Link href={`/cup/${cup.ID_CUP}/clases/crear`}>
                                    <Plus className="h-4 w-4" />
                                    Crear grupos
                                </Link>
                            </Button>
                        </div>

                        {isModalOpen && (
                            <AsignarDocentesModal cup={cup} docentesActivos={docentesActivos} open={isModalOpen} onOpenChange={setIsModalOpen} />
                        )}

                        {/* Botón para navegar a la lista independiente de docentes */}
                        <Button
                            asChild
                            variant="outline"
                            className="h-11 w-full gap-2 rounded-xl border-neutral-200 bg-white font-semibold text-neutral-900 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900"
                        >
                            <Link href={`/cup/${cup.ID_CUP}/docentes`}>
                                <User className="h-4 w-4 shrink-0 text-neutral-500" />
                                Ver Lista de Docentes ({docenteCups.length})
                            </Link>
                        </Button>

                        {/* Botón para navegar a la lista independiente de estudiantes */}
                        <Button
                            asChild
                            variant="outline"
                            className="h-11 w-full gap-2 rounded-xl border-neutral-200 bg-white font-semibold text-neutral-900 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900"
                        >
                            <Link href={`/cup/${cup.ID_CUP}/estudiantes`}>
                                <Users className="h-4 w-4 shrink-0 text-neutral-500" />
                                Ver Lista de Estudiantes Inscritos ({cup.estudiante_cups_count ?? 0})
                            </Link>
                        </Button>

                        {/* Botón para navegar al cierre de gestión */}
                        <Button
                            asChild
                            className="h-11 w-full gap-2 rounded-xl bg-neutral-900 font-bold text-white shadow-sm hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                        >
                            <Link href={`/cup/${cup.ID_CUP}/cierre`}>
                                <CheckSquare className="h-4 w-4 shrink-0" />
                                Cierre de Gestión / Asignación de Plazas
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
