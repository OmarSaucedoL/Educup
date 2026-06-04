import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, LoaderCircle, UserPlus, AlertTriangle } from 'lucide-react';
import { FormEventHandler, useState, useEffect } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Colegio { ID: number; NOMBRE: string; }
interface Ciudad  { ID: number; NOMBRE: string; DEPARTAMENTO: string; }
interface Carrera { ID_CARRERA: number; NOMBRE: string; }
interface CarreraCup { ID: number; ID_CARRERA: number; ID_CUP: number; CUPOS: number; carrera: Carrera; }
interface Cup { ID_CUP: number; ANIO: number; SEMESTRE: string; }

interface Props {
    colegios: Colegio[];
    ciudades: Ciudad[];
    carreras?: CarreraCup[];
    activeCup?: Cup | null;
}

interface CrearEstudianteForm {
    [key: string]: any;
    CARNET: string;
    NOMBRE: string;
    APELLIDO: string;
    FECHA_NAC: string;
    SEXO: string;
    CORREO: string;
    TELEFONO: string;
    DIRECCION: string;
    TITULO_BACHILLER: string;
    ESTADO: string;
    COLEGIO_ID: string;
    CIUDAD_ID: string;
    OPCION_1: string;
    OPCION_2: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Gestión Académica', href: '#' },
    { title: 'Estudiantes', href: '/estudiantes' },
    { title: 'Registrar', href: '/estudiantes/crearEstudiante' },
];

const EMPTY_CARRERAS: CarreraCup[] = [];

interface PostulacionesCarreraSectionProps {
    estado: string;
    activeCup: Cup | null;
    carreras: CarreraCup[];
    opcion1: string;
    onOpcion1Change: (val: string) => void;
    opcion2: string;
    onOpcion2Change: (val: string) => void;
    errors: {
        OPCION_1?: string;
        OPCION_2?: string;
    };
    processing: boolean;
}

function PostulacionesCarreraSection({
    estado,
    activeCup,
    carreras,
    opcion1,
    onOpcion1Change,
    opcion2,
    onOpcion2Change,
    errors,
    processing
}: PostulacionesCarreraSectionProps) {
    if (estado !== 'ACTIVO') return null;

    return (
        <div className="border-t border-sidebar-border/50 pt-6 grid gap-4">
            <span className="block text-xs font-bold text-primary uppercase tracking-wider">
                Postulaciones a Carrera
            </span>
            
            {!activeCup ? (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 flex items-start gap-3 shadow-xs">
                    <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-sm text-amber-800 dark:text-amber-300">Convocatoria Cerrada / Concluida</h4>
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
                            No existe una convocatoria de admisión CUP activa en este momento para recibir postulaciones.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* OPCION_1 */}
                    <div className="grid gap-2">
                        <Label htmlFor="OPCION_1" className="text-sm font-semibold">Opción 1 de Carrera</Label>
                        <select
                            id="OPCION_1"
                            value={opcion1}
                            onChange={e => onOpcion1Change(e.target.value)}
                            className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-neutral-800 dark:text-neutral-200"
                        >
                            <option value="">— Ninguna carrera seleccionada —</option>
                            {(carreras || []).map(cc => (
                                <option key={cc.ID} value={cc.ID}>
                                    {cc.carrera?.NOMBRE} (Cupos: {cc.CUPOS})
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.OPCION_1} />
                    </div>

                    {/* OPCION_2 */}
                    <div className="grid gap-2">
                        <Label htmlFor="OPCION_2" className="text-sm font-semibold">Opción 2 de Carrera</Label>
                        <select
                            id="OPCION_2"
                            value={opcion2}
                            onChange={e => onOpcion2Change(e.target.value)}
                            className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-neutral-800 dark:text-neutral-200"
                        >
                            <option value="">— Ninguna carrera seleccionada —</option>
                            {(carreras || []).map(cc => (
                                <option key={cc.ID} value={cc.ID}>
                                    {cc.carrera?.NOMBRE} (Cupos: {cc.CUPOS})
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.OPCION_2} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CrearEstudiante({ colegios, ciudades, carreras = EMPTY_CARRERAS, activeCup = null }: Props) {
    const { data, setData, post, processing, errors } = useForm<CrearEstudianteForm>({
        CARNET: '',
        NOMBRE: '',
        APELLIDO: '',
        FECHA_NAC: '',
        SEXO: 'M',
        CORREO: '',
        TELEFONO: '',
        DIRECCION: '',
        TITULO_BACHILLER: '',
        ESTADO: 'ACTIVO',
        COLEGIO_ID: '',
        CIUDAD_ID: '',
        OPCION_1: '',
        OPCION_2: '',
    });

    useEffect(() => {
        if (!activeCup && data.ESTADO === 'ACTIVO') {
            setData('ESTADO', 'INACTIVO');
        }
    }, [activeCup, data.ESTADO, setData]);

    useEffect(() => {
        if (data.ESTADO !== 'ACTIVO') {
            setData('OPCION_1', '');
            setData('OPCION_2', '');
        }
    }, [data.ESTADO, setData]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/estudiantes');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Registrar Estudiante" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="max-w-3xl w-full mx-auto mt-4">

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="icon" asChild>
                                <Link href="/estudiantes">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight">Registrar Estudiante</h1>
                                <p className="text-sm text-muted-foreground">Completa los datos personales y académicos del nuevo estudiante.</p>
                            </div>
                        </div>
                    </div>

                    {/* Card */}
                    <div className="border-sidebar-border/70 dark:border-sidebar-border bg-card text-card-foreground rounded-xl border shadow-sm">
                        <div className="flex flex-col space-y-1.5 p-6 border-b border-sidebar-border/50">
                            <h3 className="font-semibold leading-none tracking-tight text-lg flex items-center gap-2">
                                <UserPlus className="h-5 w-5 text-primary" /> Datos del Estudiante
                            </h3>
                            <p className="text-xs text-muted-foreground">Los campos marcados con <span className="text-destructive">*</span> son obligatorios.</p>
                        </div>

                        <div className="p-6">
                            <form className="flex flex-col gap-6" onSubmit={submit}>

                                {/* Carnet */}
                                <div className="grid gap-2">
                                    <Label htmlFor="CARNET" className="text-sm font-semibold">Carnet <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="CARNET"
                                        type="number"
                                        min="1"
                                        value={data.CARNET}
                                        onChange={e => setData('CARNET', e.target.value)}
                                        placeholder="Ej. 12345"
                                        className="max-w-xs"
                                    />
                                    <InputError message={errors.CARNET} />
                                </div>

                                {/* Nombre + Apellido */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="NOMBRE" className="text-sm font-semibold">Nombre <span className="text-destructive">*</span></Label>
                                        <Input id="NOMBRE" value={data.NOMBRE} onChange={e => setData('NOMBRE', e.target.value)} placeholder="Juan" />
                                        <InputError message={errors.NOMBRE} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="APELLIDO" className="text-sm font-semibold">Apellido <span className="text-destructive">*</span></Label>
                                        <Input id="APELLIDO" value={data.APELLIDO} onChange={e => setData('APELLIDO', e.target.value)} placeholder="Pérez" />
                                        <InputError message={errors.APELLIDO} />
                                    </div>
                                </div>

                                {/* Fecha de nacimiento + Sexo */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="FECHA_NAC" className="text-sm font-semibold">Fecha de Nacimiento <span className="text-destructive">*</span></Label>
                                        <Input id="FECHA_NAC" type="date" value={data.FECHA_NAC} onChange={e => setData('FECHA_NAC', e.target.value)} className="max-w-xs" />
                                        <InputError message={errors.FECHA_NAC} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-sm font-semibold">Sexo <span className="text-destructive">*</span></Label>
                                        <div className="flex gap-2 mt-1">
                                            {(['M', 'F'] as const).map(s => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setData('SEXO', s)}
                                                    className={`flex-1 h-9 rounded-lg border text-xs font-bold transition-all ${
                                                        data.SEXO === s
                                                            ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20'
                                                            : 'border-sidebar-border hover:bg-muted/50 text-muted-foreground'
                                                    }`}
                                                >
                                                    {s === 'M' ? 'Masculino' : 'Femenino'}
                                                </button>
                                            ))}
                                        </div>
                                        <InputError message={errors.SEXO} />
                                    </div>
                                </div>

                                {/* Correo */}
                                <div className="grid gap-2">
                                    <Label htmlFor="CORREO" className="text-sm font-semibold">Correo electrónico <span className="text-destructive">*</span></Label>
                                    <Input id="CORREO" type="email" value={data.CORREO} onChange={e => setData('CORREO', e.target.value)} placeholder="juan@ejemplo.com" className="max-w-sm" />
                                    <InputError message={errors.CORREO} />
                                </div>

                                {/* Teléfono + Dirección */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="TELEFONO" className="text-sm font-semibold">Teléfono <span className="text-destructive">*</span></Label>
                                        <Input id="TELEFONO" value={data.TELEFONO} onChange={e => setData('TELEFONO', e.target.value)} placeholder="Ej. 75551234" />
                                        <InputError message={errors.TELEFONO} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="DIRECCION" className="text-sm font-semibold">Dirección <span className="text-destructive">*</span></Label>
                                        <Input id="DIRECCION" value={data.DIRECCION} onChange={e => setData('DIRECCION', e.target.value)} placeholder="Calle, Colonia..." />
                                        <InputError message={errors.DIRECCION} />
                                    </div>
                                </div>

                                {/* Ciudad + Colegio */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="CIUDAD_ID" className="text-sm font-semibold">Ciudad</Label>
                                        <select
                                            id="CIUDAD_ID"
                                            value={data.CIUDAD_ID}
                                            onChange={e => setData('CIUDAD_ID', e.target.value)}
                                            className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        >
                                            <option value="">— Seleccionar ciudad —</option>
                                            {ciudades.map(c => (
                                                <option key={c.ID} value={c.ID}>{c.NOMBRE} ({c.DEPARTAMENTO})</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.CIUDAD_ID} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="COLEGIO_ID" className="text-sm font-semibold">Colegio de procedencia</Label>
                                        <select
                                            id="COLEGIO_ID"
                                            value={data.COLEGIO_ID}
                                            onChange={e => setData('COLEGIO_ID', e.target.value)}
                                            className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        >
                                            <option value="">— Seleccionar colegio —</option>
                                            {colegios.map(c => (
                                                <option key={c.ID} value={c.ID}>{c.NOMBRE}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.COLEGIO_ID} />
                                    </div>
                                </div>

                                {/* Título de bachiller */}
                                <div className="grid gap-2">
                                    <Label htmlFor="TITULO_BACHILLER" className="text-sm font-semibold">Título de Bachiller <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="TITULO_BACHILLER"
                                        value={data.TITULO_BACHILLER}
                                        onChange={e => setData('TITULO_BACHILLER', e.target.value)}
                                        placeholder="Ej. No. de serie o nombre del título"
                                        className="max-w-sm"
                                    />
                                    <InputError message={errors.TITULO_BACHILLER} />
                                </div>

                                {/* Estado */}
                                <div className="grid gap-2 border-t border-sidebar-border/50 pt-6">
                                    <Label className="text-sm font-semibold">Estado <span className="text-destructive">*</span></Label>
                                    <div className="flex gap-3 max-w-xs mt-1">
                                        {(['ACTIVO', 'INACTIVO', 'APROBADO'] as const).map(s => {
                                            const isDisabled = (s === 'ACTIVO' && !activeCup) || s === 'APROBADO';
                                            return (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    disabled={processing || isDisabled}
                                                    onClick={() => setData('ESTADO', s)}
                                                    className={`flex-1 h-9 rounded-lg border text-xs font-bold transition-all ${
                                                        data.ESTADO === s
                                                            ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20'
                                                            : 'border-sidebar-border hover:bg-muted/50 text-muted-foreground'
                                                    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    {s}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <InputError message={errors.ESTADO} />
                                </div>

                                {/* Postulaciones a Carrera (Condicional) */}
                                <PostulacionesCarreraSection
                                    estado={data.ESTADO}
                                    activeCup={activeCup}
                                    carreras={carreras}
                                    opcion1={data.OPCION_1}
                                    onOpcion1Change={val => setData('OPCION_1', val)}
                                    opcion2={data.OPCION_2}
                                    onOpcion2Change={val => setData('OPCION_2', val)}
                                    errors={errors}
                                    processing={processing}
                                />

                                <Button
                                    type="submit"
                                    className="mt-4 w-full font-bold h-11 text-sm shadow-md"
                                    disabled={processing}
                                >
                                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    Registrar Estudiante
                                </Button>

                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
