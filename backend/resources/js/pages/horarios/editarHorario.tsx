import { useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { LoaderCircle, Calendar, Clock, Check, ArrowLeft, Trash2, AlertTriangle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface BloqueHorario {
    ID_BLOQUE_HORARIO: number;
    TURNO: string;
    HORA_INICIO: string;
    DIAS: string[];
    CARGA_HORARIA: number;
}

interface EditarHorarioProps {
    bloque: BloqueHorario;
}

const GRUPO_DIAS_1 = ['LUNES', 'MIERCOLES', 'VIERNES'];
const GRUPO_DIAS_2 = ['MARTES', 'JUEVES', 'SABADO'];

const TURNOS = [
    { value: 'MAÑANA', label: 'Mañana (07:00 - 12:00)' },
    { value: 'TARDE', label: 'Tarde (12:00 - 18:00)' },
    { value: 'NOCHE', label: 'Noche (18:00 - 22:00)' },
];

const TURNO_LIMITS: Record<string, { min: string; max: string }> = {
    MAÑANA: { min: '07:00', max: '11:59' },
    TARDE: { min: '12:00', max: '17:59' },
    NOCHE: { min: '18:00', max: '21:59' }
};

const PRESET_CARGAS = [
    { label: '45 minutos', value: 45 },
    { label: '90 minutos (Recomendado)', value: 90 },
    { label: '120 minutos', value: 120 },
];

interface DiasSemanaSectionProps {
    dias: string[];
    toggleDia: (dia: string) => void;
    selectGrupoDias: (grupo: string[]) => void;
    processing: boolean;
    error?: string;
}

function DiasSemanaSection({
    dias,
    toggleDia,
    selectGrupoDias,
    processing,
    error
}: DiasSemanaSectionProps) {
    return (
        <div className="grid gap-3">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Días de la Semana</Label>
                <div className="flex gap-2">
                    <button
                        type="button"
                        disabled={processing}
                        onClick={() => selectGrupoDias(GRUPO_DIAS_1)}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                        Lun-Mie-Vie
                    </button>
                    <span className="text-muted-foreground/40 text-xs">|</span>
                    <button
                        type="button"
                        disabled={processing}
                        onClick={() => selectGrupoDias(GRUPO_DIAS_2)}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                        Mar-Jue-Sab
                    </button>
                </div>
            </div>

            {/* Grupo 1: Lun, Mie, Vie */}
            <div className="grid gap-2">
                <span className="text-xs text-muted-foreground font-medium">Grupo A:</span>
                <div className="flex flex-wrap gap-2.5">
                    {GRUPO_DIAS_1.map((dia) => {
                        const active = dias.includes(dia);
                        return (
                            <button
                                key={dia}
                                type="button"
                                disabled={processing}
                                onClick={() => toggleDia(dia)}
                                className={`h-9 px-4 rounded-full border text-xs font-bold transition-all flex items-center gap-1.5 ${
                                    active
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                        : 'border-sidebar-border hover:bg-muted text-muted-foreground'
                                }`}
                            >
                                {active && <Check className="h-3 w-3" />}
                                {dia}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Grupo 2: Mar, Jue, Sab */}
            <div className="grid gap-2 mt-1">
                <span className="text-xs text-muted-foreground font-medium">Grupo B:</span>
                <div className="flex flex-wrap gap-2.5">
                    {GRUPO_DIAS_2.map((dia) => {
                        const active = dias.includes(dia);
                        return (
                            <button
                                key={dia}
                                type="button"
                                disabled={processing}
                                onClick={() => toggleDia(dia)}
                                className={`h-9 px-4 rounded-full border text-xs font-bold transition-all flex items-center gap-1.5 ${
                                    active
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                        : 'border-sidebar-border hover:bg-muted text-muted-foreground'
                                }`}
                            >
                                {active && <Check className="h-3 w-3" />}
                                {dia}
                            </button>
                        );
                    })}
                </div>
            </div>
            <InputError message={error} />
        </div>
    );
}

interface CargaHorariaSectionProps {
    cargaHoraria: number;
    onChange: (val: number) => void;
    processing: boolean;
    error?: string;
}

function CargaHorariaSection({
    cargaHoraria,
    onChange,
    processing,
    error
}: CargaHorariaSectionProps) {
    return (
        <div className="grid gap-2 border-t border-sidebar-border/50 pt-6">
            <Label htmlFor="CARGA_HORARIA" className="text-sm font-semibold">Carga Horaria de cada Materia (minutos)</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-1">
                {PRESET_CARGAS.map((preset) => {
                    const active = cargaHoraria === preset.value;
                    return (
                        <button
                            key={preset.value}
                            type="button"
                            disabled={processing}
                            onClick={() => onChange(preset.value)}
                            className={`p-3 text-xs font-medium rounded-lg border text-center transition-all ${
                                active
                                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                                    : 'border-sidebar-border hover:bg-muted/50 text-muted-foreground'
                            }`}
                        >
                            {preset.label}
                        </button>
                    );
                })}
            </div>
            
            <div className="flex items-center gap-3 mt-2 max-w-xs">
                <Input
                    id="CARGA_HORARIA"
                    type="number"
                    required
                    disabled={processing}
                    min="1"
                    value={cargaHoraria}
                    onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                    className="h-9"
                    placeholder="Carga horaria personalizada"
                />
                <span className="text-xs text-muted-foreground">minutos</span>
            </div>
            <InputError message={error} />
        </div>
    );
}

export default function EditarHorario({ bloque }: EditarHorarioProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    
    const { data, setData, put, processing, errors } = useForm({
        TURNO: bloque.TURNO || 'MAÑANA',
        HORA_INICIO: bloque.HORA_INICIO || '',
        DIAS: bloque.DIAS || [],
        CARGA_HORARIA: bloque.CARGA_HORARIA || 90,
    });

    const handleTurnoChange = (newTurno: string) => {
        const limits = TURNO_LIMITS[newTurno];
        let newHora = data.HORA_INICIO;
        if (!newHora || newHora < limits.min || newHora > limits.max) {
            newHora = limits.min;
        }
        setData({
            ...data,
            TURNO: newTurno,
            HORA_INICIO: newHora,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Gestión Académica',
            href: '#',
        },
        {
            title: 'Horarios',
            href: '/horarios',
        },
        {
            title: 'Editar',
            href: `/horarios/${bloque.ID_BLOQUE_HORARIO}/editar`,
        },
    ];

    const toggleDia = (dia: string) => {
        const upperDia = dia.toUpperCase();
        if (data.DIAS.includes(upperDia)) {
            setData('DIAS', data.DIAS.filter((d) => d !== upperDia));
        } else {
            setData('DIAS', [...data.DIAS, upperDia]);
        }
    };

    const selectGrupoDias = (grupo: string[]) => {
        const allSelected = grupo.every((d) => data.DIAS.includes(d));
        if (allSelected) {
            setData('DIAS', data.DIAS.filter((d) => !grupo.includes(d)));
        } else {
            const extra = grupo.filter((d) => !data.DIAS.includes(d));
            setData('DIAS', [...data.DIAS, ...extra]);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/horarios/${bloque.ID_BLOQUE_HORARIO}`);
    };

    const limits = TURNO_LIMITS[data.TURNO] || { min: '07:00', max: '21:59' };

    const handleDelete = () => {
        router.delete(`/horarios/${bloque.ID_BLOQUE_HORARIO}`, {
            onSuccess: () => {
                setShowDeleteDialog(false);
            },
            onError: () => {
                setShowDeleteDialog(false);
                alert('Ocurrió un error al intentar eliminar el bloque de horario.');
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Bloque de Horarios: ${bloque.TURNO}`} />

            {/* Delete confirmation dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 shrink-0">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                            </div>
                            <DialogTitle>Eliminar bloque de horario</DialogTitle>
                        </div>
                        <DialogDescription className="pt-1">
                            ¿Estás seguro de que deseas eliminar este bloque de horario? Esta acción
                            eliminará permanentemente todos los horarios y clases asociados a este
                            bloque. <span className="font-medium text-foreground">Esta acción no se puede deshacer.</span>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Sí, eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="max-w-3xl w-full mx-auto mt-4">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="icon" asChild>
                                <Link href="/horarios">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight">Editar Bloque de Horario</h1>
                                <p className="text-sm text-muted-foreground">Modifica la hora de inicio, días y la carga horaria para el horario de la clase.</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-sidebar-border/70 dark:border-sidebar-border bg-card text-card-foreground rounded-xl border shadow-sm">
                        <div className="flex flex-col space-y-1.5 p-6 border-b border-sidebar-border/50">
                            <h3 className="font-semibold leading-none tracking-tight text-lg flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Parámetros del Bloque (ID: #{bloque.ID_BLOQUE_HORARIO})
                            </h3>
                            <p className="text-xs text-muted-foreground">Al guardar, se actualizarán los horarios correspondientes para todos los días indicados.</p>
                        </div>
                        
                        <div className="p-6">
                            <form className="flex flex-col gap-8" onSubmit={submit}>
                                
                                {/* ROL / TURNO SELECT */}
                                <div className="grid gap-2">
                                    <Label htmlFor="TURNO" className="text-sm font-semibold">Turno Escolar</Label>
                                    <div className="grid grid-cols-3 gap-3 mt-1">
                                        {TURNOS.map((turno) => {
                                            const active = data.TURNO === turno.value;
                                            return (
                                                <button
                                                    key={turno.value}
                                                    type="button"
                                                    disabled={processing}
                                                    onClick={() => handleTurnoChange(turno.value)}
                                                    className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all ${
                                                        active
                                                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                                                            : 'border-sidebar-border hover:bg-muted/50 text-muted-foreground'
                                                    }`}
                                                >
                                                    <span className="text-sm font-bold uppercase">{turno.value}</span>
                                                    <span className="text-[10px] opacity-80 mt-1">{turno.label.split(' ')[1]}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <InputError message={errors.TURNO} />
                                </div>

                                {/* HORA DE INICIO */}
                                <div className="grid gap-2">
                                    <Label htmlFor="HORA_INICIO" className="text-sm font-semibold flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-neutral-400" /> Hora de Inicio del Bloque
                                    </Label>
                                    <div className="relative max-w-xs mt-1">
                                        <Input
                                            id="HORA_INICIO"
                                            type="time"
                                            required
                                            disabled={processing}
                                            min={limits.min}
                                            max={limits.max}
                                            value={data.HORA_INICIO}
                                            onChange={(e) => setData('HORA_INICIO', e.target.value)}
                                            className="h-10 pl-3 pr-3 text-base"
                                        />
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">
                                        Debe corresponder al turno seleccionado: Mañana (07:00 - 12:00), Tarde (12:00 - 18:00) o Noche (18:00 - 22:00).
                                    </p>
                                    <InputError message={errors.HORA_INICIO} />
                                </div>

                                {/* DÍAS DE LA SEMANA */}
                                <DiasSemanaSection
                                    dias={data.DIAS}
                                    toggleDia={toggleDia}
                                    selectGrupoDias={selectGrupoDias}
                                    processing={processing}
                                    error={errors.DIAS}
                                />

                                {/* CARGA HORARIA */}
                                <CargaHorariaSection
                                    cargaHoraria={data.CARGA_HORARIA}
                                    onChange={(val) => setData('CARGA_HORARIA', val)}
                                    processing={processing}
                                    error={errors.CARGA_HORARIA}
                                />

                                <div className="flex flex-col sm:flex-row gap-3 mt-4 border-t border-sidebar-border/50 pt-6">
                                    <Button 
                                        type="submit" 
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 text-sm shadow-md" 
                                        disabled={processing}
                                    >
                                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                        Guardar Cambios
                                    </Button>
                                    <Button 
                                        type="button" 
                                        variant="destructive" 
                                        className="h-11 font-bold text-sm shadow-md px-6" 
                                        onClick={() => setShowDeleteDialog(true)}
                                        disabled={processing}
                                    >
                                        <Trash2 className="mr-2 h-4.5 w-4.5" />
                                        Eliminar Bloque
                                    </Button>
                                </div>

                             </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
