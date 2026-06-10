import { Head, useForm, Link } from '@inertiajs/react';
import { LoaderCircle, ArrowLeft, Building2 } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

type CrearAulaForm = {
    NOMBRE: string;
    DESCRIPCION: string;
    ESTADO: string;
};

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
        title: 'Registrar',
        href: '/aulas/crearAula',
    },
];

export default function CrearAula() {
    const { data, setData, post, processing, errors } = useForm<CrearAulaForm>({
        NOMBRE: '',
        DESCRIPCION: '',
        ESTADO: 'ACTIVO',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/aulas');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Registrar Aula" />
            
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="max-w-2xl w-full mx-auto mt-6">
                    <div className="mb-6 flex items-center gap-3">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/aulas">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">Registrar Nueva Aula</h1>
                            <p className="text-sm text-muted-foreground">Crea un nuevo registro de espacio o aula física en el sistema académico.</p>
                        </div>
                    </div>

                    <div className="border-sidebar-border/70 dark:border-sidebar-border bg-card text-card-foreground rounded-xl border shadow-sm">
                        <div className="flex flex-col space-y-1.5 p-6 border-b border-sidebar-border/50">
                            <h3 className="font-semibold leading-none tracking-tight text-lg flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Detalles del Aula
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
                                        aria-label="Descripción / Observación"
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

                                <Button type="submit" className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 text-sm shadow-md" disabled={processing}>
                                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    Registrar Aula
                                </Button>

                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
