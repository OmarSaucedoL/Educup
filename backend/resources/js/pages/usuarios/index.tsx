import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Plus, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Usuarios',
        href: '/usuarios',
    },
];

export default function Index({ usuarios }: { usuarios: any[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuarios" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Gestión de Usuarios</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-900/50 dark:text-indigo-400 dark:hover:bg-indigo-950/50" asChild>
                            <Link href="/usuarios/importar">
                                <Users className="mr-2 h-4 w-4" /> Importar Excel
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href="/usuarios/crearUsuario">
                                <Plus className="mr-2 h-4 w-4" /> Agregar Usuario
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border bg-card text-card-foreground relative flex-1 rounded-xl border shadow-sm">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Username</th>
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Nombre</th>
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Correo</th>
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Rol</th>
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {usuarios && usuarios.length > 0 ? (
                                    usuarios.map((usuario) => (
                                        <tr key={usuario.ID} className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                                            <td className="p-4 align-middle">{usuario.USERNAME}</td>
                                            <td className="p-4 align-middle">
                                                {usuario.NOMBRE} {usuario.APELLIDO}
                                            </td>
                                            <td className="p-4 align-middle">{usuario.CORREO}</td>
                                            <td className="p-4 align-middle">{usuario.rol ? usuario.rol.NOMBRE : 'Sin rol'}</td>
                                            <td className="p-4 align-middle">
                                                <div
                                                    className={`focus:ring-ring inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none ${usuario.ESTADO === 1 ? 'border-green-200 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'border-red-200 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}
                                                >
                                                    {usuario.ESTADO === 1 ? 'Activo' : 'Inactivo'}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="text-muted-foreground p-4 text-center align-middle">
                                            No hay usuarios registrados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
