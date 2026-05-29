import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Gestión Académica',
        href: '#',
    },
    {
        title: 'Docentes',
        href: '/docentes',
    },
];

export default function Index({ docentes }: { docentes: any[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Docentes" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Gestión de Docentes</h1>
                    <Button asChild>
                        <Link href="/docentes/crearDocente">
                            <Plus className="mr-2 h-4 w-4" /> Registrar Docente
                        </Link>
                    </Button>
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border bg-card text-card-foreground relative flex-1 rounded-xl border shadow-sm">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Código</th>
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Nombre Completo</th>
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Username</th>
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Carnet</th>
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Correo Electrónico</th>
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {docentes && docentes.length > 0 ? (
                                    docentes.map((docente) => (
                                        <tr key={docente.CODIGO_DOCENTE} className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                                            <td className="p-4 align-middle font-medium">{docente.CODIGO_DOCENTE}</td>
                                            <td className="p-4 align-middle font-medium">
                                                {docente.usuario ? `${docente.usuario.NOMBRE} ${docente.usuario.APELLIDO}` : 'Desconocido'}
                                            </td>
                                            <td className="p-4 align-middle text-muted-foreground">
                                                {docente.usuario?.USERNAME}
                                            </td>
                                            <td className="p-4 align-middle">{docente.usuario?.CARNET}</td>
                                            <td className="p-4 align-middle">{docente.usuario?.CORREO}</td>
                                            <td className="p-4 align-middle">
                                                <div
                                                    className={`focus:ring-ring inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none ${
                                                        docente.usuario?.ESTADO === 'ACTIVO' || docente.usuario?.ESTADO === 1
                                                            ? 'border-green-200 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'border-red-200 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}
                                                >
                                                    {docente.usuario?.ESTADO === 'ACTIVO' || docente.usuario?.ESTADO === 1 ? 'Activo' : 'Inactivo'}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="text-muted-foreground p-4 text-center align-middle">
                                            No hay docentes registrados.
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
