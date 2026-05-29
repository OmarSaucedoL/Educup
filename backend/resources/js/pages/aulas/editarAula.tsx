import { useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { LoaderCircle, ArrowLeft, Building2, Trash2, AlertTriangle } from 'lucide-react';
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

interface Aula {
    ID_AULA: number;
    NOMBRE: string;
    DESCRIPCION: string | null;
    ESTADO: string;
}

interface EditarAulaProps {
    aula: Aula;
}

export default function EditarAula({ aula }: EditarAulaProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const { data, setData, put, processing, errors } = useForm({
        NOMBRE: aula.NOMBRE || '',
        DESCRIPCION: aula.DESCRIPCION || '',
        ESTADO: aula.ESTADO || 'ACTIVO',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Gestión Académica',
            href: '#',
        },
        {
            title: 'Aulas',
            href: '/aulas',
        },
        {
            title: 'Editar',
            href: `/aulas/${aula.ID_AULA}/editar`,
        },
    ];

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/aulas/${aula.ID_AULA}`);
    };

    const handleDelete = () => {
        router.delete(`/aulas/${aula.ID_AULA}`, {
            onSuccess: () => {
                setShowDeleteDialog(false);
            },
            onError: (errors) => {
                setShowDeleteDialog(false);
                alert(errors.id || errors.ID_AULA || 'Ocurrió un error al intentar eliminar el aula.');
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Aula: ${aula.NOMBRE}`} />

            {/* Delete confirmation dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 shrink-0">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                            </div>
                            <DialogTitle>Eliminar aula</DialogTitle>
                        </div>
                        <DialogDescription className="pt-1">
                            ¿Estás seguro de que deseas eliminar esta aula? Esta acción no se puede deshacer y{' '}
                            <span className="font-medium text-foreground">eliminará permanentemente el registro.</span>
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
                <div className="max-w-2xl w-full mx-auto mt-6">
                    <div className="mb-6 flex items-center gap-3">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/aulas">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">Editar Aula</h1>
                            <p className="text-sm text-muted-foreground">Modifica la información del espacio o aula física del sistema académico.</p>
                        </div>
                    </div>

                    <div className="border-sidebar-border/70 dark:border-sidebar-border bg-card text-card-foreground rounded-xl border shadow-sm">
                        <div className="flex flex-col space-y-1.5 p-6 border-b border-sidebar-border/50">
                            <h3 className="font-semibold leading-none tracking-tight text-lg flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Detalles del Aula (ID: #{aula.ID_AULA})
                            </h3>
                            <p className="text-xs text-muted-foreground">Todos los campos marcados con (*) son requeridos.</p>
                        </div>
                        
                        <div className="p-6">
                            <form className="flex flex-col gap-6" onSubmit={submit}>
                                
                                {/* NOMBRE DEL AULA */}
                                <div className="grid gap-2">
                                    <Label htmlFor="NOMBRE" className="text-sm font-semibold">Nombre de la Aula *</Label>
                                    <Input
                                        id="NOMBRE"
                                        type="text"
                                        required
                                        autoFocus
                                        value={data.NOMBRE}
                                        onChange={(e) => setData('NOMBRE', e.target.value)}
                                        placeholder="Ej. Aula 101, Laboratorio B"
                                        className="h-10"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.NOMBRE} />
                                </div>

                                {/* DESCRIPCIÓN */}
                                <div className="grid gap-2">
                                    <Label htmlFor="DESCRIPCION" className="text-sm font-semibold">Descripción / Observación</Label>
                                    <textarea
                                        id="DESCRIPCION"
                                        value={data.DESCRIPCION}
                                        onChange={(e) => setData('DESCRIPCION', e.target.value)}
                                        placeholder="Ubicación, equipamiento disponible (proyector, aire acondicionado, etc.)"
                                        className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.DESCRIPCION} />
                                </div>

                                {/* ESTADO */}
                                <div className="grid gap-2">
                                    <Label htmlFor="ESTADO" className="text-sm font-semibold">Estado de Habilitación *</Label>
                                    <select
                                        id="ESTADO"
                                        required
                                        value={data.ESTADO}
                                        onChange={(e) => setData('ESTADO', e.target.value)}
                                        disabled={processing}
                                        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="ACTIVO">ACTIVO (Disponible para programar clases)</option>
                                        <option value="INACTIVO">INACTIVO (No disponible o en mantenimiento)</option>
                                    </select>
                                    <InputError message={errors.ESTADO} />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 mt-4">
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
                                        Eliminar Aula
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
