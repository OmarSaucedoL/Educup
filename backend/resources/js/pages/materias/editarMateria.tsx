import { useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { LoaderCircle, ArrowLeft, BookOpen, Trash2, AlertTriangle } from 'lucide-react';
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

interface Materia {
    ID_MATERIA: number;
    NOMBRE: string;
}

interface EditarMateriaProps {
    materia: Materia;
}

export default function EditarMateria({ materia }: EditarMateriaProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    
    const { data, setData, put, processing, errors } = useForm({
        NOMBRE: materia.NOMBRE || '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Gestión Académica',
            href: '#',
        },
        {
            title: 'Materias',
            href: '/materias',
        },
        {
            title: 'Editar',
            href: `/materias/${materia.ID_MATERIA}/editar`,
        },
    ];

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/materias/${materia.ID_MATERIA}`);
    };

    const handleDelete = () => {
        router.delete(`/materias/${materia.ID_MATERIA}`, {
            onSuccess: () => {
                setShowDeleteDialog(false);
            },
            onError: (errors: any) => {
                setShowDeleteDialog(false);
                alert(errors.id || 'Ocurrió un error al intentar eliminar la materia.');
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Materia: ${materia.NOMBRE}`} />

            {/* Delete confirmation dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 shrink-0">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                            </div>
                            <DialogTitle>Eliminar materia</DialogTitle>
                        </div>
                        <DialogDescription className="pt-1">
                            ¿Estás seguro de que deseas eliminar esta materia? Esta acción no se puede deshacer y{' '}
                            <span className="font-medium text-foreground">eliminará permanentemente la asignatura del sistema.</span>
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
                <div className="max-w-2xl w-full mx-auto mt-8">
                    <div className="mb-6 flex items-center gap-3">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/materias">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">Editar Materia</h1>
                            <p className="text-sm text-muted-foreground">Modifica la información de la asignatura académica.</p>
                        </div>
                    </div>

                    <div className="border-sidebar-border/70 dark:border-sidebar-border bg-card text-card-foreground rounded-xl border shadow-sm">
                        <div className="flex flex-col space-y-1.5 p-6 border-b border-sidebar-border/50">
                            <h3 className="font-semibold leading-none tracking-tight text-lg flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Detalles de la Materia (ID: #{materia.ID_MATERIA})
                            </h3>
                            <p className="text-xs text-muted-foreground">Todos los campos marcados con (*) son requeridos.</p>
                        </div>
                        
                        <div className="p-6">
                            <form className="flex flex-col gap-6" onSubmit={submit}>
                                
                                {/* NOMBRE DE LA MATERIA */}
                                <div className="grid gap-2">
                                    <Label htmlFor="NOMBRE" className="text-sm font-semibold">Nombre de la Materia *</Label>
                                    <Input
                                        id="NOMBRE"
                                        type="text"
                                        required
                                        autoFocus
                                        value={data.NOMBRE}
                                        onChange={(e) => setData('NOMBRE', e.target.value)}
                                        placeholder="Ej. Introducción a la Programación"
                                        className="h-10"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.NOMBRE} />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 mt-4 border-t border-sidebar-border/50 pt-6">
                                    <Button 
                                        type="submit" 
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 text-sm shadow-md" 
                                        disabled={processing || !data.NOMBRE}
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
                                        Eliminar Materia
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
