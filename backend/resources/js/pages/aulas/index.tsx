import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Gestión Académica',
        href: '#',
    },
    {
        title: 'Aulas',
        href: '/aulas',
    },
];

export default function Index({ aulas }: { aulas: any[] }) {
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const confirmDelete = () => {
        if (deleteId === null) return;
        router.delete(`/aulas/${deleteId}`, {
            onSuccess: () => setDeleteId(null),
            onError: (errors) => {
                setDeleteId(null);
                alert(errors.id || errors.ID_AULA || 'Ocurrió un error al intentar eliminar el aula.');
            },
        });
    };

    const confirmDeleteHandler = () => {
        // Just a helper to handle click
    };

    const handleToggleStatus = (id: number) => {
        router.patch(`/aulas/${id}/toggle-status`, {}, {
            preserveScroll: true,
            preserveState: true,
            onError: () => {
                alert('No se pudo actualizar el estado de la aula.');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Aulas" />

            {/* Delete confirmation dialog */}
            <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
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
                        <Button variant="outline" onClick={() => setDeleteId(null)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Sí, eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Gestión de Aulas</h1>
                    <Button asChild>
                        <Link href="/aulas/crearAula">
                            <Plus className="mr-2 h-4 w-4" /> Registrar Aula
                        </Link>
                    </Button>
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border bg-card text-card-foreground relative flex-1 rounded-xl border shadow-sm">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium w-24">ID</th>
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium w-48">Nombre del Aula</th>
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Descripción</th>
                                    <th className="text-muted-foreground h-12 px-4 text-center align-middle font-medium w-32">Estado</th>
                                    <th className="text-muted-foreground h-12 px-4 text-right align-middle font-medium w-28">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {aulas && aulas.length > 0 ? (
                                    aulas.map((aula) => (
                                        <tr key={aula.ID_AULA} className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                                            <td className="p-4 align-middle font-medium">{aula.ID_AULA}</td>
                                            <td className="p-4 align-middle font-medium">{aula.NOMBRE}</td>
                                            <td className="p-4 align-middle text-muted-foreground">{aula.DESCRIPCION || <span className="italic text-muted-foreground/50">Sin descripción</span>}</td>
                                            <td className="p-4 align-middle text-center">
                                                <button
                                                    onClick={() => handleToggleStatus(aula.ID_AULA)}
                                                    title="Haga clic para alternar el estado"
                                                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold cursor-pointer transition-all hover:scale-105 select-none ${
                                                        aula.ESTADO === 'ACTIVO'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-800'
                                                            : 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20'
                                                    }`}
                                                >
                                                    {aula.ESTADO}
                                                </button>
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="h-8 gap-1 text-xs"
                                                    onClick={() => setDeleteId(aula.ID_AULA)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" /> Eliminar
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="text-muted-foreground p-4 text-center align-middle">
                                            No hay aulas registradas.
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
