import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, LoaderCircle, BookOpen } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

type CrearMateriaForm = {
    NOMBRE: string;
};

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
        title: 'Registrar',
        href: '/materias/crearMateria',
    },
];

export default function CrearMateria() {
    const { data, setData, post, processing, errors } = useForm<CrearMateriaForm>({
        NOMBRE: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/materias');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Registrar Materia" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="max-w-2xl w-full mx-auto mt-8">
                    
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="icon" asChild>
                                <Link href="/materias">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight">Registrar Materia</h1>
                                <p className="text-sm text-muted-foreground">Agrega una nueva asignatura académica al sistema del CUP.</p>
                            </div>
                        </div>
                    </div>

                    {/* Card */}
                    <div className="border-sidebar-border/70 dark:border-sidebar-border bg-card text-card-foreground rounded-xl border shadow-sm">
                        <div className="flex flex-col space-y-1.5 p-6 border-b border-sidebar-border/50">
                            <h3 className="font-semibold leading-none tracking-tight text-lg flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Detalles de la Materia
                            </h3>
                            <p className="text-xs text-muted-foreground">Completa el nombre para crear la asignatura.</p>
                        </div>
                        <div className="p-6">
                            <form className="flex flex-col gap-6" onSubmit={submit}>
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="NOMBRE" className="text-sm font-semibold">Nombre de la Materia <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="NOMBRE"
                                            type="text"
                                            required
                                            autoFocus
                                            value={data.NOMBRE}
                                            onChange={(e) => setData('NOMBRE', e.target.value)}
                                            disabled={processing}
                                            placeholder="Ej. Introducción a la Programación"
                                        />
                                        <InputError message={errors.NOMBRE} />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 text-sm shadow-md transition-all"
                                        disabled={processing || !data.NOMBRE}
                                    >
                                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                        Registrar Materia
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
