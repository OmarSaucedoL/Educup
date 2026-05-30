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

interface Usuario {
    ID: number;
    USERNAME: string;
    NOMBRE: string;
    APELLIDO: string;
    CORREO: string;
    CARNET: string | null;
    ESTADO: number;
    ROL_ID: number | null;
}

interface EditarUsuarioForm {
    USERNAME: string;
    NOMBRE: string;
    APELLIDO: string;
    CORREO: string;
    CARNET: string;
    CONTRASENIA: string;
    ESTADO: string;
    ROL_ID: string;
}

export default function EditarUsuario({ usuario, roles }: { usuario: Usuario; roles: Role[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Usuarios',
            href: '/usuarios',
        },
        {
            title: 'Editar',
            href: `/usuarios/${usuario.ID}/editar`,
        },
    ];

    const { data, setData, put, processing, errors, reset } = useForm<EditarUsuarioForm>({
        USERNAME: usuario.USERNAME || '',
        NOMBRE: usuario.NOMBRE || '',
        APELLIDO: usuario.APELLIDO || '',
        CORREO: usuario.CORREO || '',
        CARNET: usuario.CARNET || '',
        CONTRASENIA: '',
        ESTADO: usuario.ESTADO.toString(),
        ROL_ID: usuario.ROL_ID ? usuario.ROL_ID.toString() : '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/usuarios/${usuario.ID}`, {
            onFinish: () => reset('CONTRASENIA'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Modificar Usuario" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="max-w-2xl w-full mx-auto mt-8">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border bg-card text-card-foreground rounded-xl border shadow-sm">
                        <div className="flex flex-col space-y-1.5 p-6">
                            <h3 className="font-semibold leading-none tracking-tight text-2xl">Modificar Cuenta de Usuario</h3>
                            <p className="text-sm text-muted-foreground">Actualiza los detalles del usuario en el sistema. Deja la contraseña en blanco si no deseas cambiarla.</p>
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
                                            />
                                            <InputError message={errors.USERNAME} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="CARNET">Carnet de Identidad</Label>
                                            <Input
                                                id="CARNET"
                                                type="text"
                                                value={data.CARNET}
                                                onChange={(e) => setData('CARNET', e.target.value)}
                                                disabled={processing}
                                            />
                                            <InputError message={errors.CARNET} />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="CORREO">Correo Electrónico</Label>
                                        <Input
                                            id="CORREO"
                                            type="email"
                                            required
                                            value={data.CORREO}
                                            onChange={(e) => setData('CORREO', e.target.value)}
                                            disabled={processing}
                                        />
                                        <InputError message={errors.CORREO} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="CONTRASENIA">Nueva Contraseña</Label>
                                            <Input
                                                id="CONTRASENIA"
                                                type="password"
                                                value={data.CONTRASENIA}
                                                onChange={(e) => setData('CONTRASENIA', e.target.value)}
                                                disabled={processing}
                                                placeholder="Dejar en blanco para no cambiar"
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
                                                    <option key={rol.ID} value={rol.ID.toString()}>
                                                        {rol.NOMBRE}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={errors.ROL_ID} />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="ESTADO">Estado</Label>
                                        <select
                                            id="ESTADO"
                                            required
                                            value={data.ESTADO}
                                            onChange={(e) => setData('ESTADO', e.target.value)}
                                            disabled={processing}
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                        >
                                            <option value="ACTIVO">Activo</option>
                                            <option value="INACTIVO">Inactivo</option>
                                        </select>
                                        <InputError message={errors.ESTADO} />
                                    </div>

                                    <Button type="submit" className="mt-4 w-full" disabled={processing}>
                                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                        Guardar Cambios
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
