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
        title: 'Materias',
        href: '/materias',
    },
];

export default function Index({ materias }: { materias: any[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Materias" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Gestión de Materias</h1>
                    <Button asChild>
                        <Link href="/materias/crearMateria">
                            <Plus className="mr-2 h-4 w-4" /> Registrar Materia
                        </Link>
                    </Button>
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border bg-card text-card-foreground relative flex-1 rounded-xl border shadow-sm">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium w-24">ID</th>
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Nombre de la Materia</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {materias && materias.length > 0 ? (
                                    materias.map((materia) => (
                                        <tr key={materia.ID} className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                                            <td className="p-4 align-middle font-medium">{materia.ID}</td>
                                            <td className="p-4 align-middle font-medium">{materia.NOMBRE}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={2} className="text-muted-foreground p-4 text-center align-middle">
                                            No hay materias registradas.
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
