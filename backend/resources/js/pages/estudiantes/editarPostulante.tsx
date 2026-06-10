import { useState, useEffect } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { ArrowLeft, LoaderCircle, UserPlus, Save, Trash2, AlertTriangle, GraduationCap, Building2, Landmark, Calendar, ClipboardList, CheckCircle2, XCircle, BookOpen, User, Mail, MapPin, Award } from 'lucide-react';
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

import DetalleHistorialModal, { type HistorialCup } from './components/DetalleHistorialModal';

interface Colegio { ID: number; NOMBRE: string; }
interface Ciudad { ID: number; NOMBRE: string; DEPARTAMENTO: string; }
interface Carrera { ID_CARRERA: number; NOMBRE: string; }
interface CarreraCup { ID: number; ID_CARRERA: number; ID_CUP: number; CUPOS: number; carrera: Carrera; }
interface Cup { ID_CUP: number; ANIO: number; SEMESTRE: string; }

interface OpcionCarrera {
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


interface Postulante {
    ID_ESTUDIANTE: number;
    CARNET: string;
    NOMBRE: string;
    APELLIDO: string;
    FECHA_NAC: string;
    SEXO: string;
    DIRECCION: string | null;
    TELEFONO: string | null;
    CORREO: string;
    TITULO_BACHILLER: string;
    ESTADO: string;
    COLEGIO_ID: number | null;
    CIUDAD_ID: number | null;
    OPCION_1: number | null; // ID of CarreraCup
    OPCION_2: number | null; // ID of CarreraCup
}

interface Props {
    postulante: Postulante | null;
    colegios: Colegio[];
    ciudades: Ciudad[];
    carreras: CarreraCup[];
    activeCup: Cup | null;
    historialCups?: HistorialCup[];
}

const EMPTY_HISTORIAL_CUPS: HistorialCup[] = [];

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
    clientErrors: {
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
    clientErrors,
    processing
}: PostulacionesCarreraSectionProps) {
    if (estado !== 'ACTIVO') return null;

    return (
        <div className="border-t border-neutral-100 dark:border-neutral-800 pt-6">
            <span className="block text-xs font-bold text-primary uppercase tracking-wider mb-4">
                Postulaciones a Carrera
            </span>
            
            {!activeCup ? (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 flex items-start gap-3 shadow-xs">
                    <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-sm text-amber-800 dark:text-amber-300">Convocatoria Cerrada / Concluida</h4>
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
                            No existe una convocatoria de admisión CUP activa en este momento para recibir postulaciones en la carrera seleccionada.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* OPCION_1 */}
                    <div className="grid gap-2">
                        <Label htmlFor="OPCION_1" className="text-sm font-semibold">Opción 1 de Carrera (Preferencia 1)</Label>
                        <select
                            id="OPCION_1"
                            value={opcion1}
                            onChange={e => onOpcion1Change(e.target.value)}
                            disabled={processing}
                            className="flex h-10 w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-neutral-800 dark:text-neutral-200"
                        >
                            <option value="">— Ninguna carrera seleccionada —</option>
                            {carreras.map(cc => (
                                <option key={cc.ID} value={cc.ID}>
                                    {cc.carrera?.NOMBRE} (Cupos: {cc.CUPOS})
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.OPCION_1} />
                    </div>

                    {/* OPCION_2 */}
                    <div className="grid gap-2">
                        <Label htmlFor="OPCION_2" className="text-sm font-semibold">Opción 2 de Carrera (Preferencia 2)</Label>
                        <select
                            id="OPCION_2"
                            value={opcion2}
                            onChange={e => onOpcion2Change(e.target.value)}
                            disabled={processing}
                            className="flex h-10 w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-neutral-800 dark:text-neutral-200"
                        >
                            <option value="">— Ninguna carrera seleccionada —</option>
                            {carreras.map(cc => (
                                <option key={cc.ID} value={cc.ID}>
                                    {cc.carrera?.NOMBRE} (Cupos: {cc.CUPOS})
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.OPCION_2} />
                    </div>
                </div>
            )}

            {clientErrors.OPCION_2 && (
                <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50 rounded-lg p-3 text-xs font-semibold text-rose-500 dark:text-rose-400 mt-4 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-500 dark:text-rose-400 shrink-0" />
                    <span>{clientErrors.OPCION_2}</span>
                </div>
            )}
        </div>
    );
}

interface PersonalInfoSectionProps {
    data: any;
    setData: (key: string, value: any) => void;
    clientErrors: Record<string, string>;
    errors: any;
    processing: boolean;
}

function PersonalInfoSection({
    data,
    setData,
    clientErrors,
    errors,
    processing,
}: PersonalInfoSectionProps) {
    return (
        <>
            {/* CARNET */}
            <div className="grid gap-2">
                <Label htmlFor="CARNET" className="text-sm font-semibold">Carnet de Identidad (CI) *</Label>
                <Input
                    id="CARNET"
                    type="number"
                    required
                    value={data.CARNET}
                    onChange={e => setData('CARNET', e.target.value)}
                    placeholder="Ej. 7654321"
                    className="max-w-xs"
                    disabled={processing}
                />
                {clientErrors.CARNET && <span className="text-xs font-semibold text-rose-500 dark:text-rose-400">{clientErrors.CARNET}</span>}
                <InputError message={errors.CARNET} />
            </div>

            {/* NOMBRE + APELLIDO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="NOMBRE" className="text-sm font-semibold">Nombres *</Label>
                    <Input
                        id="NOMBRE"
                        type="text"
                        required
                        value={data.NOMBRE}
                        onChange={e => setData('NOMBRE', e.target.value)}
                        placeholder="Nombres del postulante"
                        disabled={processing}
                    />
                    {clientErrors.NOMBRE && <span className="text-xs font-semibold text-rose-500 dark:text-rose-400">{clientErrors.NOMBRE}</span>}
                    <InputError message={errors.NOMBRE} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="APELLIDO" className="text-sm font-semibold">Apellidos *</Label>
                    <Input
                        id="APELLIDO"
                        type="text"
                        required
                        value={data.APELLIDO}
                        onChange={e => setData('APELLIDO', e.target.value)}
                        placeholder="Apellidos del postulante"
                        disabled={processing}
                    />
                    {clientErrors.APELLIDO && <span className="text-xs font-semibold text-rose-500 dark:text-rose-400">{clientErrors.APELLIDO}</span>}
                    <InputError message={errors.APELLIDO} />
                </div>
            </div>

            {/* FECHA_NAC + SEXO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="FECHA_NAC" className="text-sm font-semibold">Fecha de Nacimiento *</Label>
                    <Input
                        id="FECHA_NAC"
                        type="date"
                        required
                        value={data.FECHA_NAC}
                        onChange={e => setData('FECHA_NAC', e.target.value)}
                        className="max-w-xs"
                        disabled={processing}
                    />
                    {clientErrors.FECHA_NAC && <span className="text-xs font-semibold text-rose-500 dark:text-rose-400">{clientErrors.FECHA_NAC}</span>}
                    <InputError message={errors.FECHA_NAC} />
                </div>
                <div className="grid gap-2">
                    <Label className="text-sm font-semibold">Sexo *</Label>
                    <div className="flex gap-2 mt-0.5">
                        {(['M', 'F'] as const).map(s => (
                            <button
                                key={s}
                                type="button"
                                disabled={processing}
                                onClick={() => setData('SEXO', s)}
                                className={`flex-1 h-10 rounded-lg border text-xs font-bold transition-all ${
                                    data.SEXO === s
                                        ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20 shadow-sm'
                                        : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-600 dark:text-neutral-400'
                                }`}
                            >
                                {s === 'M' ? 'Masculino' : 'Femenino'}
                            </button>
                        ))}
                    </div>
                    {clientErrors.SEXO && <span className="text-xs font-semibold text-rose-500 dark:text-rose-400">{clientErrors.SEXO}</span>}
                    <InputError message={errors.SEXO} />
                </div>
            </div>

            {/* CORREO */}
            <div className="grid gap-2">
                <Label htmlFor="CORREO" className="text-sm font-semibold">Correo Electrónico *</Label>
                <Input
                    id="CORREO"
                    type="email"
                    required
                    value={data.CORREO}
                    onChange={e => setData('CORREO', e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="max-w-sm"
                    disabled={processing}
                />
                {clientErrors.CORREO && <span className="text-xs font-semibold text-rose-500 dark:text-rose-400">{clientErrors.CORREO}</span>}
                <InputError message={errors.CORREO} />
            </div>

            {/* TELEFONO + DIRECCION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="TELEFONO" className="text-sm font-semibold">Teléfono / Celular</Label>
                    <Input
                        id="TELEFONO"
                        type="text"
                        value={data.TELEFONO}
                        onChange={e => setData('TELEFONO', e.target.value)}
                        placeholder="Ej. 70012345"
                        disabled={processing}
                    />
                    <InputError message={errors.TELEFONO} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="DIRECCION" className="text-sm font-semibold">Dirección de Domicilio</Label>
                    <Input
                        id="DIRECCION"
                        type="text"
                        value={data.DIRECCION}
                        onChange={e => setData('DIRECCION', e.target.value)}
                        placeholder="Calle, Barrio, Nro..."
                        disabled={processing}
                    />
                    <InputError message={errors.DIRECCION} />
                </div>
            </div>
        </>
    );
}

interface ProcedenciaSectionProps {
    data: any;
    setData: (key: string, value: any) => void;
    clientErrors: Record<string, string>;
    errors: any;
    processing: boolean;
    ciudades: Ciudad[];
    colegios: Colegio[];
}

function ProcedenciaSection({
    data,
    setData,
    clientErrors,
    errors,
    processing,
    ciudades,
    colegios,
}: ProcedenciaSectionProps) {
    return (
        <>
            {/* CIUDAD_ID (Selección o Creación en caliente) */}
            <div className="grid gap-4 border-t border-neutral-100 dark:border-neutral-800 pt-6">
                <div className="grid gap-2">
                    <Label htmlFor="CIUDAD_ID" className="text-sm font-semibold">Ciudad de Procedencia *</Label>
                    <select
                        id="CIUDAD_ID"
                        required
                        value={data.CIUDAD_ID}
                        onChange={e => setData('CIUDAD_ID', e.target.value)}
                        disabled={processing}
                        className="flex h-10 w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-neutral-800 dark:text-neutral-200"
                    >
                        <option value="">— Seleccionar ciudad —</option>
                        <option value="NEW" className="text-primary font-bold bg-primary/5">
                            🌟 (+ Registrar Nueva Ciudad)
                        </option>
                        {ciudades.map(c => (
                            <option key={c.ID} value={c.ID}>{c.NOMBRE} ({c.DEPARTAMENTO})</option>
                        ))}
                    </select>
                    {clientErrors.CIUDAD_ID && <span className="text-xs font-semibold text-rose-500 dark:text-rose-400">{clientErrors.CIUDAD_ID}</span>}
                    <InputError message={errors.CIUDAD_ID} />
                </div>

                {/* Campos condicionales para NUEVA CIUDAD */}
                {data.CIUDAD_ID === 'NEW' && (
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="grid gap-2">
                            <Label htmlFor="NUEVA_CIUDAD_NOMBRE" className="text-sm font-semibold flex items-center gap-1.5">
                                <Landmark className="h-4 w-4 text-primary" /> Nombre de la Nueva Ciudad *
                            </Label>
                            <Input
                                id="NUEVA_CIUDAD_NOMBRE"
                                value={data.NUEVA_CIUDAD_NOMBRE}
                                onChange={e => setData('NUEVA_CIUDAD_NOMBRE', e.target.value)}
                                placeholder="Ej. MONTERO, WARNES"
                                disabled={processing}
                            />
                            {clientErrors.NUEVA_CIUDAD_NOMBRE && <span className="text-xs font-semibold text-rose-500 dark:text-rose-400">{clientErrors.NUEVA_CIUDAD_NOMBRE}</span>}
                            <InputError message={errors.NUEVA_CIUDAD_NOMBRE} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="NUEVA_CIUDAD_DEPARTAMENTO" className="text-sm font-semibold">Departamento / Provincia *</Label>
                            <Input
                                id="NUEVA_CIUDAD_DEPARTAMENTO"
                                value={data.NUEVA_CIUDAD_DEPARTAMENTO}
                                onChange={e => setData('NUEVA_CIUDAD_DEPARTAMENTO', e.target.value)}
                                placeholder="SANTA CRUZ"
                                disabled={processing}
                            />
                            {clientErrors.NUEVA_CIUDAD_DEPARTAMENTO && <span className="text-xs font-semibold text-rose-500 dark:text-rose-400">{clientErrors.NUEVA_CIUDAD_DEPARTAMENTO}</span>}
                            <InputError message={errors.NUEVA_CIUDAD_DEPARTAMENTO} />
                        </div>
                    </div>
                )}
            </div>

            {/* COLEGIO_ID (Selección o Creación en caliente) */}
            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="COLEGIO_ID" className="text-sm font-semibold">Colegio de Procedencia *</Label>
                    <select
                        id="COLEGIO_ID"
                        required
                        value={data.COLEGIO_ID}
                        onChange={e => setData('COLEGIO_ID', e.target.value)}
                        disabled={processing}
                        className="flex h-10 w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-neutral-800 dark:text-neutral-200"
                    >
                        <option value="">— Seleccionar colegio —</option>
                        <option value="NEW" className="text-primary font-bold bg-primary/5">
                            🌟 (+ Registrar Nuevo Colegio)
                        </option>
                        {colegios.map(c => (
                            <option key={c.ID} value={c.ID}>{c.NOMBRE}</option>
                        ))}
                    </select>
                    {clientErrors.COLEGIO_ID && <span className="text-xs font-semibold text-rose-500 dark:text-rose-400">{clientErrors.COLEGIO_ID}</span>}
                    <InputError message={errors.COLEGIO_ID} />
                </div>

                {/* Campo condicional para NUEVO COLEGIO */}
                {data.COLEGIO_ID === 'NEW' && (
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 grid gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        <Label htmlFor="NUEVO_COLEGIO_NOMBRE" className="text-sm font-semibold flex items-center gap-1.5">
                            <Building2 className="h-4 w-4 text-primary" /> Nombre del Nuevo Colegio *
                        </Label>
                        <Input
                            id="NUEVO_COLEGIO_NOMBRE"
                            value={data.NUEVO_COLEGIO_NOMBRE}
                            onChange={e => setData('NUEVO_COLEGIO_NOMBRE', e.target.value)}
                            placeholder="Ej. COLEGIO NACIONAL FLORIDA"
                            className="max-w-md"
                            disabled={processing}
                        />
                        {clientErrors.NUEVO_COLEGIO_NOMBRE && <span className="text-xs font-semibold text-rose-500 dark:text-rose-400">{clientErrors.NUEVO_COLEGIO_NOMBRE}</span>}
                        <InputError message={errors.NUEVO_COLEGIO_NOMBRE} />
                    </div>
                )}
            </div>
        </>
    );
}

interface HistorySectionProps {
    historialCups: HistorialCup[];
    onDetailClick: (hc: HistorialCup) => void;
}

function HistorySection({
    historialCups,
    onDetailClick,
}: HistorySectionProps) {
    return (
        <div className="flex flex-col gap-6 lg:col-span-1">
            <div className="border border-neutral-200/60 dark:border-neutral-800 bg-card text-card-foreground rounded-xl shadow-sm p-6 overflow-hidden">
                <h3 className="font-bold text-lg flex items-center gap-2 mb-2">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    Historial CUP
                </h3>
                <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
                    Historial relacional de convocatorias y resultados académicos de admisión.
                </p>
                
                <div className="space-y-4">
                    {historialCups.map((hc) => (
                        <div key={hc.ID} className="border border-neutral-100 dark:border-neutral-800 rounded-xl p-4 bg-neutral-50/50 dark:bg-neutral-900/20 shadow-2xs">
                            
                            {/* Header Period & Status */}
                            <div className="flex justify-between items-start mb-2 gap-2">
                                <div>
                                    <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider leading-none mb-1">
                                        Convocatoria
                                    </span>
                                    <span className="font-extrabold text-sm text-neutral-800 dark:text-neutral-200">
                                        CUP {hc.cup.ANIO} - {hc.cup.SEMESTRE}
                                    </span>
                                </div>
                                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide ${
                                    hc.ESTADO === 'APROBADO'
                                        ? 'bg-primary/10 text-primary border-primary/20'
                                        : hc.ESTADO === 'REPROBADO'
                                        ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-300 dark:border-rose-800'
                                        : 'bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800'
                                }`}>
                                    {hc.ESTADO}
                                </span>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                                <div>
                                    <span className="block text-neutral-400 font-semibold mb-0.5">Nota Final:</span>
                                    <span className="font-extrabold text-neutral-800 dark:text-neutral-200 text-sm">
                                        {hc.NOTA_FINAL != null 
                                            ? `${parseFloat(hc.NOTA_FINAL.toString()).toFixed(2)} pts` 
                                            : 'Sin calificar'}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-neutral-400 font-semibold mb-0.5">Fecha Registro:</span>
                                    <span className="font-bold text-neutral-600 dark:text-neutral-400 block pt-0.5">
                                        {new Date(hc.FECHA).toLocaleDateString('es-ES', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>

                            {/* Opciones Seleccionadas */}
                            {(() => {
                                const options = hc.opciones_carrera || hc.opcionesCarrera;
                                if (!options || options.length === 0) return null;
                                return (
                                    <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                                        <span className="block text-neutral-400 font-semibold mb-1.5">Opciones Postuladas:</span>
                                        <div className="flex flex-col gap-1.5">
                                            {options.toSorted((a, b) => a.OPCION - b.OPCION).map((op) => (
                                                <div key={op.ID} className="flex justify-between items-center bg-neutral-100/50 dark:bg-neutral-800/40 p-1.5 rounded text-[11px] font-medium border border-neutral-200/40 dark:border-neutral-800/55">
                                                    <span className="text-neutral-500 font-bold shrink-0">Opción {op.OPCION}:</span>
                                                    <span className="text-neutral-700 dark:text-neutral-300 font-semibold text-right truncate pl-2">
                                                        {op.carrera_cup?.carrera?.NOMBRE || 'Desconocido'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Carrera de Ingreso */}
                            <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                                <span className="block text-neutral-400 font-semibold mb-1">Carrera de Ingreso:</span>
                                <span className={`font-bold block rounded p-2 ${
                                    hc.CARRERA 
                                        ? 'bg-primary/5 text-primary border-primary/20 text-xs font-extrabold'
                                        : 'text-neutral-400 italic font-medium'
                                }`}>
                                    {hc.CARRERA ? hc.CARRERA : 'Ninguna asignada / No calificado'}
                                </span>
                            </div>

                            {/* Detalles Button */}
                            <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs font-semibold px-4 border-primary/20 hover:border-primary/30 text-primary hover:bg-primary/5 shadow-none gap-1"
                                    onClick={() => onDetailClick(hc)}
                                >
                                    <ClipboardList className="h-3.5 w-3.5" />
                                    Detalles
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function validatePostulante(data: any) {
    const errs: Record<string, string> = {};
    if (!data.CARNET) errs.CARNET = 'El número de carnet es obligatorio y debe ser numérico.';
    if (!data.NOMBRE.trim()) errs.NOMBRE = 'El nombre es obligatorio.';
    if (!data.APELLIDO.trim()) errs.APELLIDO = 'El apellido es obligatorio.';
    if (!data.FECHA_NAC) errs.FECHA_NAC = 'La fecha de nacimiento es obligatoria.';
    if (!data.SEXO) errs.SEXO = 'El sexo es obligatorio.';
    
    if (!data.CORREO.trim()) {
        errs.CORREO = 'El correo electrónico es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.CORREO)) {
        errs.CORREO = 'Debe introducir un correo electrónico válido.';
    }
    
    if (!data.TITULO_BACHILLER.trim()) {
        errs.TITULO_BACHILLER = 'El título de bachiller es obligatorio.';
    }

    // Validación condicional de Ciudad
    if (data.CIUDAD_ID === 'NEW') {
        if (!data.NUEVA_CIUDAD_NOMBRE.trim()) {
            errs.NUEVA_CIUDAD_NOMBRE = 'El nombre de la nueva ciudad es obligatorio.';
        }
        if (!data.NUEVA_CIUDAD_DEPARTAMENTO.trim()) {
            errs.NUEVA_CIUDAD_DEPARTAMENTO = 'El departamento es obligatorio.';
        }
    } else if (!data.CIUDAD_ID) {
        errs.CIUDAD_ID = 'La ciudad de procedencia es obligatoria o seleccione registrar una nueva.';
    }

    // Validación condicional de Colegio
    if (data.COLEGIO_ID === 'NEW') {
        if (!data.NUEVO_COLEGIO_NOMBRE.trim()) {
            errs.NUEVO_COLEGIO_NOMBRE = 'El nombre del nuevo colegio es obligatorio.';
        }
    } else if (!data.COLEGIO_ID) {
        errs.COLEGIO_ID = 'El colegio es obligatorio o seleccione registrar uno nuevo.';
    }

    if (data.OPCION_1 && data.OPCION_2 && data.OPCION_1 === data.OPCION_2) {
        errs.OPCION_2 = 'opcion de carrera deben ser diferentes';
    }

    return errs;
}

interface DeleteConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

function DeleteConfirmDialog({ open, onOpenChange, onConfirm }: DeleteConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 shrink-0">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                        </div>
                        <DialogTitle>Eliminar postulante</DialogTitle>
                    </div>
                    <DialogDescription className="pt-1">
                        ¿Estás seguro de que deseas eliminar permanentemente este postulante? Esta acción no se puede deshacer y{' '}
                        <span className="font-semibold text-foreground">borrará todas sus opciones y preinscripciones del periodo.</span>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button variant="destructive" onClick={onConfirm}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Sí, eliminar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface ActiveCupBadgeProps {
    activeCup: Cup | null;
}

function ActiveCupBadge({ activeCup }: ActiveCupBadgeProps) {
    if (!activeCup) return null;
    return (
        <div className="mb-6 bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
                <GraduationCap className="h-6 w-6 text-primary" />
                <div>
                    <span className="block text-xs font-semibold text-primary uppercase tracking-wider">Gestión Activa Asignada</span>
                    <span className="font-bold text-sm text-neutral-800 dark:text-neutral-200">
                        CUP Admisión: Año {activeCup.ANIO} — Semestre {activeCup.SEMESTRE}
                    </span>
                </div>
            </div>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                Transacción en Cascada
            </span>
        </div>
    );
}

export default function EditarPostulante({ postulante, colegios, ciudades, carreras, activeCup, historialCups = EMPTY_HISTORIAL_CUPS }: Props) {
    const isEdit = !!postulante;
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
    const [activeHistoryDetail, setActiveHistoryDetail] = useState<HistorialCup | null>(null);

    const hasHistory = isEdit && historialCups && historialCups.length > 0;

    const initialEstado = (() => {
        const base = postulante?.ESTADO || 'ACTIVO';
        if (!activeCup && base === 'ACTIVO') {
            return 'INACTIVO';
        }
        return base;
    })();

    const initialOpcion1 = initialEstado === 'ACTIVO' ? (postulante?.OPCION_1?.toString() || '') : '';
    const initialOpcion2 = initialEstado === 'ACTIVO' ? (postulante?.OPCION_2?.toString() || '') : '';

    const { data, setData, post, put, processing, errors } = useForm({
        CARNET: postulante?.CARNET || '',
        NOMBRE: postulante?.NOMBRE || '',
        APELLIDO: postulante?.APELLIDO || '',
        FECHA_NAC: postulante?.FECHA_NAC || '',
        SEXO: postulante?.SEXO || 'M',
        CORREO: postulante?.CORREO || '',
        TELEFONO: postulante?.TELEFONO || '',
        DIRECCION: postulante?.DIRECCION || '',
        TITULO_BACHILLER: postulante?.TITULO_BACHILLER || '',
        ESTADO: initialEstado,
        COLEGIO_ID: postulante?.COLEGIO_ID?.toString() || '',
        CIUDAD_ID: postulante?.CIUDAD_ID?.toString() || '',
        NUEVA_CIUDAD_NOMBRE: '',
        NUEVA_CIUDAD_DEPARTAMENTO: 'SANTA CRUZ',
        NUEVO_COLEGIO_NOMBRE: '',
        OPCION_1: initialOpcion1,
        OPCION_2: initialOpcion2,
    });

    const handleEstadoChange = (newEstado: 'ACTIVO' | 'INACTIVO' | 'APROBADO') => {
        if (newEstado !== 'ACTIVO') {
            setData(prev => ({
                ...prev,
                ESTADO: newEstado,
                OPCION_1: '',
                OPCION_2: '',
            }));
        } else {
            setData('ESTADO', newEstado);
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Gestión Académica', href: '#' },
        { title: 'Estudiantes', href: '/estudiantes' },
        { title: isEdit ? 'Editar Postulante' : 'Registrar Postulante', href: '#' },
    ];

    const validate = () => {
        const errs = validatePostulante(data);
        setClientErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!validate()) return;

        if (isEdit) {
            put(`/estudiantes/${postulante.ID_ESTUDIANTE}`);
        } else {
            post('/estudiantes');
        }
    };

    const handleDelete = () => {
        if (!isEdit) return;
        router.delete(`/estudiantes/${postulante.ID_ESTUDIANTE}`, {
            onSuccess: () => {
                setShowDeleteDialog(false);
            },
            onError: (errors) => {
                setShowDeleteDialog(false);
                const firstError = Object.values(errors)[0] || 'Ocurrió un error al intentar eliminar el postulante.';
                alert(firstError);
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? `Editar Postulante: ${postulante.NOMBRE}` : 'Registrar Postulante Manual'} />

            <DeleteConfirmDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={handleDelete}
            />
            
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 md:p-6">
                <div className={`w-full mx-auto mt-4 ${hasHistory ? 'max-w-6xl' : 'max-w-3xl'}`}>
                    
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="icon" asChild>
                                <Link href="/estudiantes">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">
                                    {isEdit ? 'Editar Postulante' : 'Registrar Postulante Manual'}
                                </h1>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    {isEdit ? 'Modifica los datos del expediente del postulante y sus postulaciones.' : 'Crea un postulante e inscríbelo directamente en la gestión académica activa.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <ActiveCupBadge activeCup={activeCup} />

                    {/* 2-Column Responsive Layout if hasHistory is true */}
                    <div className={`grid grid-cols-1 ${hasHistory ? 'lg:grid-cols-3 gap-6' : ''}`}>
                        
                        {/* Form Card (occupies 2 cols if history exists, else full width) */}
                        <div className={`${hasHistory ? 'lg:col-span-2' : ''}`}>
                            
                            <div className="border border-neutral-200/60 dark:border-neutral-800 bg-card text-card-foreground rounded-xl shadow-sm overflow-hidden">
                                <div className="flex flex-col space-y-1.5 p-6 border-b border-neutral-100 dark:border-neutral-800">
                                    <h3 className="font-bold leading-none tracking-tight text-lg flex items-center gap-2">
                                        <UserPlus className="h-5 w-5 text-primary" /> 
                                        {isEdit ? `Expediente ID: #${postulante.ID_ESTUDIANTE}` : 'Datos del Nuevo Postulante'}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">Los campos marcados con (*) son obligatorios del dominio.</p>
                                </div>
                                
                                <div className="p-6">
                                    <form className="flex flex-col gap-6" onSubmit={submit}>
                                        
                                        <PersonalInfoSection
                                            data={data}
                                            setData={setData}
                                            clientErrors={clientErrors}
                                            errors={errors}
                                            processing={processing}
                                        />

                                        <ProcedenciaSection
                                            data={data}
                                            setData={setData}
                                            clientErrors={clientErrors}
                                            errors={errors}
                                            processing={processing}
                                            ciudades={ciudades}
                                            colegios={colegios}
                                        />

                                        {/* TITULO_BACHILLER (VARCHAR - Único - Mandatorio) */}
                                        <div className="grid gap-2 border-t border-neutral-100 dark:border-neutral-800 pt-6">
                                            <Label htmlFor="TITULO_BACHILLER" className="text-sm font-semibold">Código / Nro. de Serie de Título de Bachiller *</Label>
                                            <Input
                                                id="TITULO_BACHILLER"
                                                type="text"
                                                required
                                                value={data.TITULO_BACHILLER}
                                                onChange={e => setData('TITULO_BACHILLER', e.target.value)}
                                                placeholder="Ej. T-HUM-9876543, BACHILLERATO_2026"
                                                className="max-w-md text-neutral-800 dark:text-neutral-200"
                                                disabled={processing}
                                            />
                                            {clientErrors.TITULO_BACHILLER && <span className="text-xs font-semibold text-rose-500 dark:text-rose-400">{clientErrors.TITULO_BACHILLER}</span>}
                                            <InputError message={errors.TITULO_BACHILLER} />
                                        </div>

                                        {/* ESTADO DE EXPEDIENTE */}
                                        <div className="grid gap-2 border-t border-neutral-100 dark:border-neutral-800 pt-6">
                                            <Label className="text-sm font-semibold">Estado de Habilitación Académica *</Label>
                                            <div className="flex gap-3 max-w-xs mt-1">
                                                {(['ACTIVO', 'INACTIVO', 'APROBADO'] as const).map(s => {
                                                    const isCurrentAprobado = postulante?.ESTADO === 'APROBADO';
                                                    const isDisabled = (s === 'ACTIVO' && !activeCup) || s === 'APROBADO' || isCurrentAprobado;
                                                    return (
                                                        <button
                                                            key={s}
                                                            type="button"
                                                            disabled={processing || isDisabled}
                                                            onClick={() => handleEstadoChange(s)}
                                                            className={`flex-1 h-9 rounded-lg border text-xs font-bold transition-all ${
                                                                data.ESTADO === s
                                                                    ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20 shadow-sm'
                                                                    : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-600 dark:text-neutral-400'
                                                            } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        >
                                                            {s}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <InputError message={errors.ESTADO} />
                                        </div>

                                        {/* OPCIONES DE CARRERA (POSTULACIÓN) */}
                                        <PostulacionesCarreraSection
                                            estado={data.ESTADO}
                                            activeCup={activeCup}
                                            carreras={carreras}
                                            opcion1={data.OPCION_1}
                                            onOpcion1Change={val => setData('OPCION_1', val)}
                                            opcion2={data.OPCION_2}
                                            onOpcion2Change={val => setData('OPCION_2', val)}
                                            errors={errors}
                                            clientErrors={clientErrors}
                                            processing={processing}
                                        />

                                        {/* Action Buttons */}
                                        <div className="flex flex-col sm:flex-row gap-3 mt-6 border-t border-neutral-100 dark:border-neutral-800 pt-6">
                                            <Button
                                                type="submit"
                                                disabled={processing || (!isEdit && !activeCup)}
                                                className="flex-1 font-bold h-11 text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {processing ? (
                                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Save className="mr-2 h-4 w-4" />
                                                )}
                                                {isEdit ? 'Guardar Cambios' : 'Registrar e Inscribir'}
                                            </Button>

                                            {isEdit && (
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    disabled={processing}
                                                    className="h-11 font-bold text-sm shadow-md px-6"
                                                    onClick={() => setShowDeleteDialog(true)}
                                                >
                                                    <Trash2 className="mr-2 h-4.5 w-4.5" />
                                                    Eliminar Postulante
                                                </Button>
                                            )}
                                        </div>

                                    </form>
                                </div>
                            </div>

                        </div>

                        {/* History Card (occupies 1 col if hasHistory is true) */}
                        {hasHistory && (
                            <HistorySection
                                historialCups={historialCups}
                                onDetailClick={setActiveHistoryDetail}
                            />
                        )}
                    </div>

                </div>
            </div>

            {/* History Details Modal */}
            <DetalleHistorialModal
                open={activeHistoryDetail !== null}
                onOpenChange={(open) => !open && setActiveHistoryDetail(null)}
                activeHistoryDetail={activeHistoryDetail}
            />
        </AppLayout>
    );
}
