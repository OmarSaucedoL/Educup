import { Head, useForm, Link } from '@inertiajs/react';
import { LoaderCircle, ArrowLeft, GraduationCap, Save, Calendar, UserCheck, BookOpen, CheckSquare, Square, Info } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Usuario {
    ID: number;
    NOMBRE: string;
    APELLIDO: string;
}

interface CatalogCarrera {
    ID_CARRERA: number;
    NOMBRE: string;
}

interface CatalogMateria {
    ID_MATERIA: number;
    NOMBRE: string;
}

interface Cup {
    ID_CUP: number;
    ANIO: number;
    SEMESTRE: string;
    NOTA_MINIMA: number | string;
    CUPOS: number;
    FECHA_INICIO: string | null;
    FECHA_FIN: string | null;
    USUARIO_ID: number;
    ESTADO: string;
    carreras: { ID_CARRERA: number; CUPOS: number }[];
    materias: number[];
}

interface EditarCUPProps {
    cup: Cup;
    usuarios: Usuario[];
    carreras: CatalogCarrera[];
    materias: CatalogMateria[];
}

export default function EditarCUP({ cup, usuarios = [], carreras = [], materias = [] }: EditarCUPProps) {
    const { data, setData, put, processing, errors } = useForm({
        ANIO: cup.ANIO || new Date().getFullYear(),
        SEMESTRE: cup.SEMESTRE || 'I',
        NOTA_MINIMA: cup.NOTA_MINIMA || 51,
        CUPOS: cup.CUPOS || 0,
        FECHA_INICIO: cup.FECHA_INICIO || '',
        FECHA_FIN: cup.FECHA_FIN || '',
        USUARIO_ID: cup.USUARIO_ID?.toString() || '',
        ESTADO: cup.ESTADO || 'Inscripciones',
        carreras: cup.carreras || [],
        materias: cup.materias || [],
    });

    const [selectedCarreras, setSelectedCarreras] = useState<{ ID_CARRERA: number; CUPOS: number }[]>(cup.carreras || []);
    const [selectedMateriaIds, setSelectedMateriaIds] = useState<number[]>(cup.materias || []);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Gestión Académica',
            href: '#',
        },
        {
            title: 'CUP',
            href: '/cup',
        },
        {
            title: `Editar: ${cup.ANIO} - ${cup.SEMESTRE}`,
            href: `/cup/${cup.ID_CUP}/editar`,
        },
    ];

    // Compute total cupos when selected careers or quotas change
    useEffect(() => {
        const sum = selectedCarreras.reduce((acc, curr) => acc + (curr.CUPOS || 0), 0);
        setData(currData => ({
            ...currData,
            carreras: selectedCarreras,
            CUPOS: sum
        }));
    }, [selectedCarreras]);

    useEffect(() => {
        setData('materias', selectedMateriaIds);
    }, [selectedMateriaIds]);

    const handleCareerToggle = (carreraId: number) => {
        setSelectedCarreras(prev => {
            const exists = prev.find(c => c.ID_CARRERA === carreraId);
            if (exists) {
                return prev.filter(c => c.ID_CARRERA !== carreraId);
            } else {
                return [...prev, { ID_CARRERA: carreraId, CUPOS: 50 }]; // Default 50 cupos
            }
        });
    };

    const handleCareerQuotaChange = (carreraId: number, quota: number) => {
        setSelectedCarreras(prev =>
            prev.map(c => (c.ID_CARRERA === carreraId ? { ...c, CUPOS: quota } : c))
        );
    };

    const handleMateriaToggle = (materiaId: number) => {
        setSelectedMateriaIds(prev => {
            if (prev.includes(materiaId)) {
                return prev.filter(id => id !== materiaId);
            } else {
                if (prev.length >= 4) return prev; // Limit to max 4 subjects
                return [...prev, materiaId];
            }
        });
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/cup/${cup.ID_CUP}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar CUP: ${cup.ANIO} - ${cup.SEMESTRE}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 md:p-6">
                <div className="max-w-4xl w-full mx-auto mt-4">
                    
                    {/* Header */}
                    <div className="mb-6 flex items-center gap-3">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/cup">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Editar Periodo CUP</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Modifica los parámetros de configuración del Curso Universitario Pre-Facultativo.
                            </p>
                        </div>
                    </div>

                    <div className="border border-neutral-200/60 dark:border-neutral-800 bg-card text-card-foreground rounded-xl shadow-sm overflow-hidden">
                        <div className="flex flex-col space-y-1.5 p-6 border-b border-neutral-100 dark:border-neutral-800">
                            <h3 className="font-bold leading-none tracking-tight text-lg flex items-center gap-2">
                                <GraduationCap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                Detalles de la Gestión (ID: #{cup.ID_CUP})
                            </h3>
                            <p className="text-xs text-muted-foreground">Todos los campos marcados con (*) son obligatorios.</p>
                        </div>
                        
                        <div className="p-6">
                            <form className="flex flex-col gap-6" onSubmit={submit}>
                                
                                {/* AÑO & SEMESTRE */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="ANIO" className="text-sm font-semibold">Año / Gestión *</Label>
                                        <Input
                                            id="ANIO"
                                            type="number"
                                            required
                                            value={data.ANIO}
                                            onChange={e => setData('ANIO', parseInt(e.target.value) || 0)}
                                            placeholder="Ej. 2026"
                                            disabled={processing}
                                        />
                                        <InputError message={errors.ANIO} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="SEMESTRE" className="text-sm font-semibold">Semestre *</Label>
                                        <select
                                            id="SEMESTRE"
                                            required
                                            value={data.SEMESTRE}
                                            onChange={e => setData('SEMESTRE', e.target.value)}
                                            disabled={processing}
                                            className="flex h-10 w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-neutral-800 dark:text-neutral-200"
                                        >
                                            <option value="I">I (Primer Semestre)</option>
                                            <option value="II">II (Segundo Semestre)</option>
                                            <option value="ANUAL">ANUAL</option>
                                        </select>
                                        <InputError message={errors.SEMESTRE} />
                                    </div>
                                </div>

                                {/* NOTA MÍNIMA & TOTAL CUPOS */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="NOTA_MINIMA" className="text-sm font-semibold">Nota Mínima de Aprobación *</Label>
                                        <Input
                                            id="NOTA_MINIMA"
                                            type="number"
                                            step="0.01"
                                            required
                                            value={data.NOTA_MINIMA}
                                            onChange={e => setData('NOTA_MINIMA', parseFloat(e.target.value) || 0)}
                                            placeholder="Ej. 51"
                                            disabled={processing}
                                        />
                                        <InputError message={errors.NOTA_MINIMA} />
                                    </div>

                                    <div className="grid gap-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="CUPOS" className="text-sm font-semibold">Total Cupos del CUP *</Label>
                                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900/40">
                                                Autocalculado (Suma Carreras)
                                            </span>
                                        </div>
                                        <Input
                                            id="CUPOS"
                                            type="number"
                                            disabled
                                            value={data.CUPOS}
                                            className="bg-neutral-50 dark:bg-neutral-900 text-neutral-500 font-bold border-neutral-200"
                                        />
                                        <InputError message={errors.CUPOS} />
                                    </div>
                                </div>

                                {/* FECHAS */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="FECHA_INICIO" className="text-sm font-semibold flex items-center gap-1.5">
                                            <Calendar className="h-4 w-4 text-neutral-500" /> Fecha de Inicio *
                                        </Label>
                                        <Input
                                            id="FECHA_INICIO"
                                            type="date"
                                            required
                                            value={data.FECHA_INICIO}
                                            onChange={e => setData('FECHA_INICIO', e.target.value)}
                                            disabled={processing}
                                        />
                                        <InputError message={errors.FECHA_INICIO} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="FECHA_FIN" className="text-sm font-semibold flex items-center gap-1.5">
                                            <Calendar className="h-4 w-4 text-neutral-500" /> Fecha de Finalización *
                                        </Label>
                                        <Input
                                            id="FECHA_FIN"
                                            type="date"
                                            required
                                            value={data.FECHA_FIN}
                                            onChange={e => setData('FECHA_FIN', e.target.value)}
                                            disabled={processing}
                                        />
                                        <InputError message={errors.FECHA_FIN} />
                                    </div>
                                </div>

                                {/* SELECCIÓN DE CARRERAS CON SUS CUPOS */}
                                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-6">
                                    <span className="block text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
                                        Carreras Ofertadas en el Periodo
                                    </span>
                                    <p className="text-xs text-muted-foreground mb-4">
                                        Selecciona qué carreras participarán en este CUP y define su cupo/vacante de estudiantes.
                                    </p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {carreras.map(c => {
                                            const isSelected = !!selectedCarreras.find(sc => sc.ID_CARRERA === c.ID_CARRERA);
                                            const scValue = selectedCarreras.find(sc => sc.ID_CARRERA === c.ID_CARRERA);
                                            
                                            return (
                                                <div 
                                                    key={c.ID_CARRERA} 
                                                    className={`flex flex-col p-4 rounded-xl border transition-all ${
                                                        isSelected
                                                            ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/10 shadow-sm'
                                                            : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCareerToggle(c.ID_CARRERA)}
                                                            className="flex items-center gap-2.5 text-left focus:outline-none"
                                                            disabled={processing}
                                                        >
                                                            {isSelected ? (
                                                                <CheckSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                                            ) : (
                                                                <Square className="h-5 w-5 text-neutral-400 dark:text-neutral-600 shrink-0" />
                                                            )}
                                                            <span className="font-semibold text-sm text-neutral-800 dark:text-neutral-200">
                                                                {c.NOMBRE}
                                                            </span>
                                                        </button>
                                                    </div>

                                                    {isSelected && (
                                                        <div className="mt-2 pl-7 flex items-center gap-3 animate-in fade-in duration-200">
                                                            <Label htmlFor={`quota-${c.ID_CARRERA}`} className="text-xs font-semibold text-neutral-500 shrink-0">
                                                                Cupo Específico:
                                                            </Label>
                                                            <Input
                                                                id={`quota-${c.ID_CARRERA}`}
                                                                type="number"
                                                                min="1"
                                                                required
                                                                value={scValue?.CUPOS || ''}
                                                                onChange={e => handleCareerQuotaChange(c.ID_CARRERA, parseInt(e.target.value) || 0)}
                                                                className="h-8 max-w-[120px] font-bold text-xs"
                                                                disabled={processing}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <InputError message={errors.carreras} />
                                </div>

                                {/* SELECCIÓN DE MATERIAS (MAX 4) */}
                                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="block text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                            Materias Asignadas al CUP (Máx. 4)
                                        </span>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                            selectedMateriaIds.length === 4
                                                ? 'bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400'
                                                : 'bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400'
                                        }`}>
                                            Seleccionadas: {selectedMateriaIds.length} / 4
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
                                        <Info className="h-4 w-4 text-indigo-500" />
                                        Selecciona un máximo de 4 materias académicas que formarán parte de la malla de evaluaciones de este periodo pre-facultativo.
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                        {materias.map(m => {
                                            const isSelected = selectedMateriaIds.includes(m.ID_MATERIA);
                                            const isLimitReached = selectedMateriaIds.length >= 4;
                                            const isDisabled = isLimitReached && !isSelected;

                                            return (
                                                <button
                                                    key={m.ID_MATERIA}
                                                    type="button"
                                                    disabled={isDisabled || processing}
                                                    onClick={() => handleMateriaToggle(m.ID_MATERIA)}
                                                    className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                                                        isSelected
                                                            ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/10 shadow-xs'
                                                            : isDisabled
                                                            ? 'opacity-40 cursor-not-allowed border-neutral-200 dark:border-neutral-800'
                                                            : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
                                                    }`}
                                                >
                                                    <div className="shrink-0">
                                                        {isSelected ? (
                                                            <CheckSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                                        ) : (
                                                            <Square className="h-5 w-5 text-neutral-400 dark:text-neutral-600" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-sm text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                                                            <BookOpen className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
                                                            {m.NOMBRE}
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <InputError message={errors.materias} />
                                </div>

                                {/* ADMINISTRADOR ENCARGADO & ESTADO DE GESTIÓN */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-neutral-100 dark:border-neutral-800 pt-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="USUARIO_ID" className="text-sm font-semibold flex items-center gap-1.5">
                                            <UserCheck className="h-4 w-4 text-neutral-500" /> Administrador Encargado *
                                        </Label>
                                        <select
                                            id="USUARIO_ID"
                                            required
                                            value={data.USUARIO_ID}
                                            onChange={e => setData('USUARIO_ID', e.target.value)}
                                            disabled={processing}
                                            className="flex h-10 w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-neutral-800 dark:text-neutral-200"
                                        >
                                            <option value="">— Seleccionar Administrador —</option>
                                            {usuarios.map(u => (
                                                <option key={u.ID} value={u.ID}>
                                                    {u.NOMBRE} {u.APELLIDO}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.USUARIO_ID} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="ESTADO" className="text-sm font-semibold flex items-center gap-1.5">
                                            <Info className="h-4 w-4 text-neutral-500" /> Estado del CUP *
                                        </Label>
                                        <select
                                            id="ESTADO"
                                            required
                                            value={data.ESTADO}
                                            onChange={e => setData('ESTADO', e.target.value)}
                                            disabled={processing}
                                            className="flex h-10 w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-neutral-800 dark:text-neutral-200"
                                        >
                                            <option value="Inscripciones">Inscripciones</option>
                                            <option value="En curso">En curso</option>
                                            <option value="Concluido">Concluido</option>
                                        </select>
                                        <InputError message={errors.ESTADO} />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 mt-4 border-t border-neutral-100 dark:border-neutral-800 pt-6">
                                    <Button
                                        type="submit"
                                        disabled={processing || selectedCarreras.length === 0 || selectedMateriaIds.length === 0}
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 text-sm shadow-md"
                                    >
                                        {processing ? (
                                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="mr-2 h-4 w-4" />
                                        )}
                                        Guardar Cambios
                                    </Button>
                                    <Button variant="outline" type="button" className="h-11 font-bold text-sm" asChild>
                                        <Link href="/cup">
                                            Cancelar
                                        </Link>
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
