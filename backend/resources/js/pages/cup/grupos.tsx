import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { BookOpen, ChevronLeft, Clock, Info, Users, UserCheck, UserX } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const DEFAULT_CUPS_LIST: any[] = [];

interface HeaderSectionProps {
    cup: any;
    cupsList: any[];
    isProcessing: boolean;
    onShowConfirm: () => void;
    onShowRemover: () => void;
}

function HeaderSection({
    cup,
    cupsList,
    isProcessing,
    onShowConfirm,
    onShowRemover,
}: HeaderSectionProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/60">
                    <BookOpen className="h-7 w-7 text-neutral-900 dark:text-neutral-100" />
                </div>
                <div className="flex flex-col justify-center">
                    <h1 className="text-2xl font-bold tracking-tight">Grupos del CUP</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-muted-foreground text-sm">Periodo:</span>
                        {cupsList && cupsList.length > 0 ? (
                            <Select 
                                value={cup.ID_CUP.toString()} 
                                onValueChange={(val) => router.get(`/cup/${val}/clases`)}
                            >
                                <SelectTrigger className="h-7 border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 text-sm py-0 w-[200px]">
                                    <SelectValue placeholder="Seleccionar CUP" />
                                </SelectTrigger>
                                <SelectContent>
                                    {cupsList.map((c: any) => (
                                        <SelectItem key={c.ID_CUP} value={c.ID_CUP.toString()}>
                                            {c.ANIO} - {c.SEMESTRE} {c.ESTADO === 'Concluido' ? '(Concluido)' : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <span className="text-sm font-medium">{cup.ANIO} - {cup.SEMESTRE}</span>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <Button 
                    variant="default" 
                    onClick={onShowConfirm} 
                    disabled={isProcessing || cup.ESTADO === 'Concluido'}
                    title={cup.ESTADO === 'Concluido' ? 'Acción no permitida en CUP concluido' : ''}
                    className="gap-1.5 text-sm font-semibold bg-neutral-900 text-neutral-50 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200"
                >
                    <UserCheck className="h-4 w-4" /> 
                    {isProcessing ? 'Procesando...' : 'Asignar Docentes'}
                </Button>
                <Button 
                    variant="outline"
                    onClick={onShowRemover}
                    disabled={isProcessing || cup.ESTADO === 'Concluido'}
                    title={cup.ESTADO === 'Concluido' ? 'Acción no permitida en CUP concluido' : ''}
                    className="gap-1.5 text-sm font-semibold text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-950/40"
                >
                    <UserX className="h-4 w-4" />
                    Remover Docentes
                </Button>
                <Button variant="outline" asChild className="gap-1.5 text-sm font-semibold">
                    <Link href={`/cup/${cup.ID_CUP}`}>
                        <ChevronLeft className="h-4 w-4" /> Volver a CUP
                    </Link>
                </Button>
            </div>
        </div>
    );
}

interface SummaryCardsSectionProps {
    totalGrupos: number;
    turnosCount: Record<string, number>;
}

function SummaryCardsSection({ totalGrupos, turnosCount }: SummaryCardsSectionProps) {
    return (
        <Card className="bg-card overflow-hidden border-neutral-200 shadow-xs dark:border-neutral-800">
            <CardContent className="p-6">
                <div className="dark:divide-neutral-850 grid grid-cols-1 gap-6 divide-y divide-neutral-200 md:grid-cols-3 md:divide-x md:divide-y-0">
                    {/* Total Grupos Column */}
                    <div className="flex items-center justify-between pb-6 md:pr-6 md:pb-0">
                        <div className="space-y-1">
                            <p className="text-muted-foreground text-xs font-bold tracking-wider uppercase">Total Grupos</p>
                            <h2 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">{totalGrupos}</h2>
                            <p className="text-muted-foreground text-xs">Registrados en este periodo</p>
                        </div>
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100 text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100">
                            <Users className="h-6 w-6" />
                        </div>
                    </div>

                    {/* Turnos Column */}
                    <div className="col-span-2 space-y-3 pt-6 md:pt-0 md:pl-6">
                        <div className="flex items-center gap-2">
                            <Clock className="text-muted-foreground h-4 w-4" />
                            <h3 className="text-muted-foreground text-xs font-bold tracking-wider uppercase">Distribución por Turno</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            {Object.entries(turnosCount).flatMap(([turno, count]) => {
                                if (!(count > 0 || ['MAÑANA', 'TARDE', 'NOCHE'].includes(turno))) {
                                    return [];
                                }
                                const colors: Record<string, { bg: string; text: string; dot: string; border: string }> = {
                                    MAÑANA: {
                                        bg: 'bg-neutral-50 dark:bg-neutral-900/40',
                                        text: 'bg-neutral-900 text-neutral-50 dark:bg-neutral-100 dark:text-neutral-950',
                                        dot: 'bg-neutral-900 dark:bg-neutral-100',
                                        border: 'border-neutral-200 dark:border-neutral-800',
                                    },
                                    TARDE: {
                                        bg: 'bg-neutral-50 dark:bg-neutral-900/40',
                                        text: 'bg-neutral-900 text-neutral-50 dark:bg-neutral-100 dark:text-neutral-950',
                                        dot: 'bg-neutral-900 dark:bg-neutral-100',
                                        border: 'border-neutral-200 dark:border-neutral-800',
                                    },
                                    NOCHE: {
                                        bg: 'bg-neutral-50 dark:bg-neutral-900/40',
                                        text: 'bg-neutral-900 text-neutral-50 dark:bg-neutral-100 dark:text-neutral-950',
                                        dot: 'bg-neutral-900 dark:bg-neutral-100',
                                        border: 'border-neutral-200 dark:border-neutral-800',
                                    },
                                    'NO DEFINIDO': {
                                        bg: 'bg-neutral-50/50 dark:bg-neutral-900/20',
                                        text: 'bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
                                        dot: 'bg-neutral-400 dark:bg-neutral-600',
                                        border: 'border-neutral-200 dark:border-neutral-800/60',
                                    },
                                };
                                const style = colors[turno] ?? colors['NO DEFINIDO'];
                                const label =
                                    turno === 'MAÑANA' ? 'Mañana' : turno === 'TARDE' ? 'Tarde' : turno === 'NOCHE' ? 'Noche' : turno;

                                return [
                                    <div
                                        key={turno}
                                        className={`flex items-center justify-between rounded-xl border p-3 ${style.border} ${style.bg} transition-all hover:scale-[1.01]`}
                                    >
                                        <div className="flex min-w-0 items-center gap-2">
                                            <span
                                                className={`h-2.5 w-2.5 shrink-0 rounded-full ${style.dot} animate-pulse`}
                                            />
                                            <span className="truncate text-xs font-bold tracking-wide text-neutral-800 uppercase dark:text-neutral-200">
                                                {label}
                                            </span>
                                        </div>
                                        <span
                                            className={`inline-flex items-center justify-center rounded-lg px-2.5 py-1 text-xs font-extrabold shadow-xs ${style.text}`}
                                        >
                                            {count}
                                        </span>
                                    </div>
                                ];
                            })}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

interface GroupsTableSectionProps {
    grupos: any[];
    cup: any;
}

function GroupsTableSection({ grupos, cup }: GroupsTableSectionProps) {
    return (
        <div className="border-sidebar-border/70 dark:border-sidebar-border bg-card text-card-foreground relative flex-1 overflow-hidden rounded-xl border shadow-sm">
            <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                        <tr className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                            <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Grupo</th>
                            <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Turno</th>
                            <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Aula Asignada</th>
                            <th className="text-muted-foreground h-12 px-4 text-center align-middle font-medium">Inscritos</th>
                            <th className="text-muted-foreground h-12 w-[120px] px-4 text-right align-middle font-medium">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                        {grupos.length > 0 ? (
                            grupos.map((groupData: any, groupIndex: number) => {
                                const { grupo, clases } = groupData;
                                const totalEstudiantes = clases.length > 0 ? clases[0].estudiante_cups_count || 0 : 0;
                                const aulaDelGrupo = clases.length > 0 ? clases[0].aula : null;
                                const bloque = clases.length > 0 ? (clases[0].bloque_horario ?? clases[0].bloqueHorario) : null;
                                const turnoDelGrupo = bloque?.TURNO ?? 'No definido';

                                return (
                                    <tr
                                        key={`grupo-${groupIndex}`}
                                        className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors"
                                    >
                                        <td className="p-4 align-middle font-bold text-neutral-900 dark:text-neutral-100">
                                            {grupo?.NOMBRE ?? 'SIN ASIGNAR'}
                                        </td>
                                        <td className="p-4 align-middle font-medium text-neutral-600 dark:text-neutral-300">
                                            {turnoDelGrupo}
                                        </td>
                                        <td className="p-4 align-middle text-neutral-600 dark:text-neutral-300">
                                            {aulaDelGrupo ? (
                                                (aulaDelGrupo.NOMBRE ?? `Aula #${aulaDelGrupo.ID_AULA}`)
                                            ) : (
                                                <span className="text-muted-foreground italic">Sin asignar</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center align-middle">
                                            <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                                                {totalEstudiantes}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right align-middle">
                                            <Button variant="outline" size="sm" asChild className="h-8 gap-1.5 text-xs font-semibold">
                                                <Link href={`/cup/${cup.ID_CUP}/grupos/${grupo?.ID_GRUPO ?? ''}`}>
                                                    <Info className="h-3.5 w-3.5" /> Detalles
                                                </Link>
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-muted-foreground p-8 text-center align-middle">
                                    No hay grupos ni clases registradas en este CUP.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

interface AsignacionConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

function AsignacionConfirmDialog({ open, onOpenChange, onConfirm }: AsignacionConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Asignación Automática de Docentes</DialogTitle>
                    <DialogDescription>
                        ¿Está seguro de que desea realizar la asignación automática de docentes para este CUP? Esto buscará y asignará docentes calificados a las clases que aún no tienen docente asignado, respetando la carga máxima de grupos.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button 
                        variant="default"
                        onClick={onConfirm}
                        className="bg-neutral-900 text-neutral-50 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200"
                    >
                        Confirmar Asignación
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface RemoverConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

function RemoverConfirmDialog({ open, onOpenChange, onConfirm }: RemoverConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-red-600 dark:text-red-400">Remover Todos los Docentes</DialogTitle>
                    <DialogDescription>
                        Esta acción quitará el docente asignado de <strong>todas las clases</strong> de este CUP. Las clases quedarán sin docente y deberán ser reasignadas. Esta operación no se puede deshacer.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button 
                        variant="destructive"
                        onClick={onConfirm}
                    >
                        <UserX className="h-4 w-4 mr-1.5" />
                        Sí, remover todos
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function VerClasesPage({ cup, cupsList = DEFAULT_CUPS_LIST }: { cup: any, cupsList?: any[] }) {
    const todasLasClases: any[] = cup.clases ?? [];
    const [isProcessing, setIsProcessing] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showRemoverDialog, setShowRemoverDialog] = useState(false);

    const handleAsignacionAutomatica = () => {
        setShowConfirmDialog(false);
        setIsProcessing(true);
        router.post(`/cup/${cup.ID_CUP}/asignar-docentes-auto`, {}, {
            onFinish: () => setIsProcessing(false)
        });
    };

    const handleRemoverDocentes = () => {
        setShowRemoverDialog(false);
        setIsProcessing(true);
        router.delete(`/cup/${cup.ID_CUP}/remover-docentes`, {
            onFinish: () => setIsProcessing(false)
        });
    };

    // Agrupar clases por ID_GRUPO
    const clasesPorGrupo = todasLasClases.reduce((acc: any, clase: any) => {
        const grupoId = clase.grupo?.ID_GRUPO ?? 'sin_grupo';
        if (!acc[grupoId]) {
            acc[grupoId] = {
                grupo: clase.grupo,
                clases: [],
            };
        }
        acc[grupoId].clases.push(clase);
        return acc;
    }, {});

    const grupos = Object.values(clasesPorGrupo).sort((a: any, b: any) => {
        // Ordenar por nombre de grupo de manera natural/numérica
        const nameA = String(a.grupo?.NOMBRE || '');
        const nameB = String(b.grupo?.NOMBRE || '');
        return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
    });

    // Calcular estadísticas de grupos y turnos
    const totalGrupos = grupos.length;
    const turnosCount: Record<string, number> = {
        MAÑANA: 0,
        TARDE: 0,
        NOCHE: 0,
    };
    grupos.forEach((groupData: any) => {
        const { clases } = groupData;
        const bloque = clases.length > 0 ? (clases[0].bloque_horario ?? clases[0].bloqueHorario) : null;
        const turno = bloque?.TURNO ? bloque.TURNO.toUpperCase() : null;
        if (turno) {
            turnosCount[turno] = (turnosCount[turno] || 0) + 1;
        } else {
            turnosCount['NO DEFINIDO'] = (turnosCount['NO DEFINIDO'] || 0) + 1;
        }
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Gestión Académica', href: '#' },
        { title: 'CUP', href: '/cup' },
        { title: `CUP #${cup.ID_CUP}`, href: `/cup/${cup.ID_CUP}` },
        { title: 'Clases y Grupos', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Clases CUP #${cup.ID_CUP}`} />

            <div className="mx-auto flex h-full w-full max-w-5xl flex-1 flex-col gap-6 rounded-xl p-4">
                <HeaderSection
                    cup={cup}
                    cupsList={cupsList}
                    isProcessing={isProcessing}
                    onShowConfirm={() => setShowConfirmDialog(true)}
                    onShowRemover={() => setShowRemoverDialog(true)}
                />

                <SummaryCardsSection
                    totalGrupos={totalGrupos}
                    turnosCount={turnosCount}
                />

                <GroupsTableSection
                    grupos={grupos}
                    cup={cup}
                />
            </div>

            <AsignacionConfirmDialog
                open={showConfirmDialog}
                onOpenChange={setShowConfirmDialog}
                onConfirm={handleAsignacionAutomatica}
            />

            <RemoverConfirmDialog
                open={showRemoverDialog}
                onOpenChange={setShowRemoverDialog}
                onConfirm={handleRemoverDocentes}
            />
        </AppLayout>
    );
}
