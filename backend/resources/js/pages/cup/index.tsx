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
        title: 'CUP',
        href: '/cup',
    },
];

export default function Index({ cups }: { cups: any[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de CUP" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Gestión de CUP (Curso Universitario Pre-Facultativo)</h1>
                    <Button asChild>
                        <Link href="/cup/crearCUP">
                            <Plus className="mr-2 h-4 w-4" /> Nuevo CUP
                        </Link>
                    </Button>
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border bg-card text-card-foreground relative flex-1 rounded-xl border shadow-sm">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Gestión / Semestre</th>
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Cupos</th>
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Nota Mínima</th>
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Fecha de Inicio</th>
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Fecha de Fin</th>
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Administrador</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {cups && cups.length > 0 ? (
                                    cups.map((cup) => (
                                        <tr key={cup.ID} className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                                            <td className="p-4 align-middle font-medium">
                                                {cup.ANIO} - {cup.SEMESTRE}
                                            </td>
                                            <td className="p-4 align-middle">
                                                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400">
                                                    {cup.CUPOS}
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">{cup.NOTA_MINIMA}</td>
                                            <td className="p-4 align-middle">{cup.FECHA_INICIO}</td>
                                            <td className="p-4 align-middle">{cup.FECHA_FIN}</td>
                                            <td className="p-4 align-middle text-muted-foreground">
                                                {cup.usuario ? `${cup.usuario.NOMBRE} ${cup.usuario.APELLIDO}` : 'N/A'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="text-muted-foreground p-4 text-center align-middle">
                                            No hay registros de CUP creados.
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
