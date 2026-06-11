import { Head, useForm, Link } from '@inertiajs/react';
import { LoaderCircle, ArrowLeft, GraduationCap, Save, Calendar } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

import { CarrerasSection, type CatalogCarrera } from './carreras-section';
import { MateriasSection, type CatalogMateria } from './materias-section';
import { AdminEstadoSection, type Usuario } from './admin-estado-section';

export type { Usuario, CatalogCarrera, CatalogMateria };

export interface Cup {
    ID_CUP: number;
    ANIO: number;
    SEMESTRE: number;
    NOTA_MINIMA: number | string;
    CUPOS: number;
    FECHA_INICIO: string | null;
    FECHA_FIN: string | null;
    USUARIO_ID: number;
    ESTADO: string;
    carreras: { ID_CARRERA: number; CUPOS: number }[];
    materias: number[];
}

export interface CupFormProps {
    mode: 'create' | 'edit';
    cup?: Cup;
    usuarios: Usuario[];
    carreras: CatalogCarrera[];
    materias: CatalogMateria[];
}

const EMPTY_USUARIOS: Usuario[] = [];
const EMPTY_CARRERAS: CatalogCarrera[] = [];
const EMPTY_MATERIAS: CatalogMateria[] = [];

export function CupForm({
    mode,
    cup,
    usuarios = EMPTY_USUARIOS,
    carreras = EMPTY_CARRERAS,
    materias = EMPTY_MATERIAS
}: CupFormProps) {
    const isEdit = mode === 'edit' && cup;

    const { data, setData, post, put, processing, errors } = useForm({
        ANIO: isEdit ? (cup.ANIO || new Date().getFullYear()) : new Date().getFullYear(),
        SEMESTRE: isEdit ? (cup.SEMESTRE || 1) : 1,
        NOTA_MINIMA: isEdit ? (cup.NOTA_MINIMA || 51) : 51,
        CUPOS: isEdit ? (cup.CUPOS || 0) : 0,
        FECHA_INICIO: isEdit ? (cup.FECHA_INICIO || '') : '',
        FECHA_FIN: isEdit ? (cup.FECHA_FIN || '') : '',
        USUARIO_ID: isEdit ? (cup.USUARIO_ID?.toString() || '') : '',
        ESTADO: isEdit ? (cup.ESTADO || 'Inscripciones') : 'Inscripciones',
        carreras: isEdit ? (cup.carreras || []) : [],
        materias: isEdit ? (cup.materias || []) : [],
    });

    const isLocked = isEdit ? (cup.ESTADO === 'Concluido' && data.ESTADO === 'Concluido') : false;

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
            title: isEdit ? `Editar: ${cup.ANIO} - ${cup.SEMESTRE}` : 'Crear',
            href: isEdit ? `/cup/${cup.ID_CUP}/editar` : '/cup/crearCUP',
        },
    ];

    const handleCareerToggle = (carreraId: number) => {
        setData(currData => {
            const exists = currData.carreras.find(c => c.ID_CARRERA === carreraId);
            let nextCarreras;
            if (exists) {
                nextCarreras = currData.carreras.filter(c => c.ID_CARRERA !== carreraId);
            } else {
                nextCarreras = [...currData.carreras, { ID_CARRERA: carreraId, CUPOS: 50 }]; // Default 50 cupos
            }
            const sum = nextCarreras.reduce((acc, curr) => acc + (curr.CUPOS || 0), 0);
            return {
                ...currData,
                carreras: nextCarreras,
                CUPOS: sum
            };
        });
    };

    const handleCareerQuotaChange = (carreraId: number, quota: number) => {
        setData(currData => {
            const nextCarreras = currData.carreras.map(c =>
                c.ID_CARRERA === carreraId ? { ...c, CUPOS: quota } : c
            );
            const sum = nextCarreras.reduce((acc, curr) => acc + (curr.CUPOS || 0), 0);
            return {
                ...currData,
                carreras: nextCarreras,
                CUPOS: sum
            };
        });
    };

    const handleMateriaToggle = (materiaId: number) => {
        setData(currData => {
            let nextMaterias;
            if (currData.materias.includes(materiaId)) {
                nextMaterias = currData.materias.filter(id => id !== materiaId);
            } else {
                if (currData.materias.length >= 4) return currData; // Limit to max 4 subjects
                nextMaterias = [...currData.materias, materiaId];
            }
            return {
                ...currData,
                materias: nextMaterias
            };
        });
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(`/cup/${cup.ID_CUP}`);
        } else {
            post('/cup');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? `Editar CUP: ${cup.ANIO} - ${cup.SEMESTRE}` : 'Crear CUP'} />
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
                            <h1 className="text-2xl font-bold tracking-tight">
                                {isEdit ? 'Editar Periodo CUP' : 'Nuevo Periodo CUP'}
                            </h1>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {isEdit 
                                    ? 'Modifica los parámetros de configuración del Curso Universitario Pre-Facultativo.' 
                                    : 'Registra y configura una nueva gestión académica para el Curso Universitario Pre-Facultativo.'}
                            </p>
                        </div>
                    </div>

                    <div className="border border-neutral-200/60 dark:border-neutral-800 bg-card text-card-foreground rounded-xl shadow-sm overflow-hidden">
                        <div className="flex flex-col space-y-1.5 p-6 border-b border-neutral-100 dark:border-neutral-800">
                            <h3 className="font-bold leading-none tracking-tight text-lg flex items-center gap-2">
                                <GraduationCap className="h-5 w-5 text-primary" />
                                {isEdit ? `Detalles de la Gestión (ID: #${cup.ID_CUP})` : 'Configuración de Admisión'}
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
                                            disabled={processing || isLocked}
                                        />
                                        <InputError message={errors.ANIO} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="SEMESTRE" className="text-sm font-semibold">Semestre *</Label>
                                        <select
                                            id="SEMESTRE"
                                            required
                                            value={data.SEMESTRE}
                                            onChange={e => setData('SEMESTRE', parseInt(e.target.value) || 1)}
                                            disabled={processing || isLocked}
                                            className="flex h-10 w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-neutral-800 dark:text-neutral-200"
                                        >
                                            <option value={1}>Primer Semestre (1)</option>
                                            <option value={2}>Segundo Semestre (2)</option>
                                        </select>
                                        <InputError message={errors.SEMESTRE} />
                                    </div>
                                </div>

                                {/* NOTA MÍNIMA & TOTAL CUPOS */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="NOTA_MINIMA" className="text-sm font-semibold">Calificación Mínima de Aprobación *</Label>
                                        <Input
                                            id="NOTA_MINIMA"
                                            type="number"
                                            step="0.01"
                                            required
                                            value={data.NOTA_MINIMA}
                                            onChange={e => setData('NOTA_MINIMA', parseFloat(e.target.value) || 0)}
                                            placeholder="Ej. 51"
                                            disabled={processing || isLocked}
                                        />
                                        <InputError message={errors.NOTA_MINIMA} />
                                    </div>

                                    <div className="grid gap-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="CUPOS" className="text-sm font-semibold">Total Cupos del CUP *</Label>
                                            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
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
                                            disabled={processing || isLocked}
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
                                            disabled={processing || isLocked}
                                        />
                                        <InputError message={errors.FECHA_FIN} />
                                    </div>
                                </div>

                                {/* SELECCIÓN DE CARRERAS CON SUS CUPOS */}
                                <CarrerasSection
                                    carreras={carreras}
                                    selectedCarreras={data.carreras}
                                    handleCareerToggle={handleCareerToggle}
                                    handleCareerQuotaChange={handleCareerQuotaChange}
                                    processing={processing}
                                    isLocked={isLocked}
                                    error={errors.carreras}
                                />

                                {/* SELECCIÓN DE MATERIAS (MAX 4) */}
                                <MateriasSection
                                    materias={materias}
                                    selectedMateriaIds={data.materias}
                                    handleMateriaToggle={handleMateriaToggle}
                                    processing={processing}
                                    isLocked={isLocked}
                                    error={errors.materias}
                                />

                                {/* ADMINISTRADOR ENCARGADO & ESTADO DE GESTIÓN */}
                                <AdminEstadoSection
                                    usuarios={usuarios}
                                    usuarioId={data.USUARIO_ID}
                                    onUsuarioChange={val => setData('USUARIO_ID', val)}
                                    estado={data.ESTADO}
                                    onEstadoChange={val => setData('ESTADO', val)}
                                    processing={processing}
                                    isLocked={isLocked}
                                    usuarioError={errors.USUARIO_ID}
                                    estadoError={errors.ESTADO}
                                />

                                {/* Actions */}
                                <div className="flex gap-3 mt-4 border-t border-neutral-100 dark:border-neutral-800 pt-6">
                                    <Button
                                        type="submit"
                                        disabled={processing || data.carreras.length === 0 || data.materias.length === 0}
                                        className="flex-1 h-11 text-sm shadow-md"
                                    >
                                        {processing ? (
                                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="mr-2 h-4 w-4" />
                                        )}
                                        {isEdit ? 'Guardar Cambios' : 'Guardar Configuración'}
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
