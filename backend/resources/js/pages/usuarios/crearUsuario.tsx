import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Role {
    ID: number;
    NOMBRE: string;
}

type CrearUsuarioForm = {
    USERNAME: string;
    NOMBRE: string;
    APELLIDO: string;
    CORREO: string;
    CARNET: string;
    CONTRASENIA: string;
    TELEFONO: string;
    ROL_ID: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Usuarios',
        href: '/usuarios',
    },
    {
        title: 'Crear',
        href: '/usuarios/crearUsuario',
    },
];

export default function CrearUsuario({ roles }: { roles: Role[] }) {
    const { data, setData, post, processing, errors, reset } = useForm<CrearUsuarioForm>({
        USERNAME: '',
        NOMBRE: '',
        APELLIDO: '',
        CORREO: '',
        CARNET: '',
        TELEFONO: '',
        CONTRASENIA: '',
        ROL_ID: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/usuarios', {
            onFinish: () => reset('CONTRASENIA'),
            onSuccess: () => {
                // You could add a toast notification here
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Usuario" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="max-w-2xl w-full mx-auto mt-8">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border bg-card text-card-foreground rounded-xl border shadow-sm">
                        <div className="flex flex-col space-y-1.5 p-6">
                            <h3 className="font-semibold leading-none tracking-tight text-2xl">Crear Cuenta de Usuario</h3>
                            <p className="text-sm text-muted-foreground">Ingresa los detalles a continuación para registrar un nuevo usuario en el sistema.</p>
                        </div>
                        <div className="p-6 pt-0">
                            <form className="flex flex-col gap-6" onSubmit={submit}>
                                <div className="grid gap-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="NOMBRE">Nombre</Label>
                                            <Input
                                                id="NOMBRE"
                                                type="text"
                                                required
                                                autoFocus
                                                value={data.NOMBRE}
                                                onChange={(e) => setData('NOMBRE', e.target.value)}
                                                disabled={processing}
                                                placeholder="Ej. Juan"
                                            />
                                            <InputError message={errors.NOMBRE} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="APELLIDO">Apellido</Label>
                                            <Input
                                                id="APELLIDO"
                                                type="text"
                                                required
                                                value={data.APELLIDO}
                                                onChange={(e) => setData('APELLIDO', e.target.value)}
                                                disabled={processing}
                                                placeholder="Ej. Pérez"
                                            />
                                            <InputError message={errors.APELLIDO} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="USERNAME">Username</Label>
                                            <Input
                                                id="USERNAME"
                                                type="text"
                                                required
                                                value={data.USERNAME}
                                                onChange={(e) => setData('USERNAME', e.target.value)}
                                                disabled={processing}
                                                placeholder="juan.perez"
                                            />
                                            <InputError message={errors.USERNAME} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="CARNET">Carnet de Identidad</Label>
                                            <Input
                                                id="CARNET"
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                required
                                                value={data.CARNET}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, '');
                                                    setData('CARNET', value);
                                                }}
                                                disabled={processing}
                                                placeholder="Ej. 1234567"
                                            />
                                            <InputError message={errors.CARNET} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="CORREO">Correo Electrónico</Label>
                                            <Input
                                                id="CORREO"
                                                type="email"
                                                required
                                                value={data.CORREO}
                                                onChange={(e) => setData('CORREO', e.target.value)}
                                                disabled={processing}
                                                placeholder="correo@ejemplo.com"
                                            />
                                            <InputError message={errors.CORREO} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="TELEFONO">Teléfono</Label>
                                            <Input
                                                id="TELEFONO"
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                value={data.TELEFONO}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, '');
                                                    setData('TELEFONO', value);
                                                }}
                                                disabled={processing}
                                                placeholder="Solo números"
                                            />
                                            <InputError message={errors.TELEFONO} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="CONTRASENIA">Contraseña</Label>
                                            <Input
                                                id="CONTRASENIA"
                                                type="password"
                                                required
                                                value={data.CONTRASENIA}
                                                onChange={(e) => setData('CONTRASENIA', e.target.value)}
                                                disabled={processing}
                                                placeholder="Mín. 8 caracteres, 1 mayús, 1 núm, 1 símb."
                                            />
                                            <InputError message={errors.CONTRASENIA} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="ROL_ID">Rol de Usuario</Label>
                                            <select
                                                id="ROL_ID"
                                                required
                                                value={data.ROL_ID}
                                                onChange={(e) => setData('ROL_ID', e.target.value)}
                                                disabled={processing}
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                            >
                                                <option value="" disabled>Selecciona un rol...</option>
                                                {roles && roles.map((rol) => (
                                                    <option key={rol.ID} value={rol.ID}>
                                                        {rol.NOMBRE}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={errors.ROL_ID} />
                                        </div>
                                    </div>

                                    <Button type="submit" className="mt-4 w-full" disabled={processing}>
                                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                        Crear Usuario
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
