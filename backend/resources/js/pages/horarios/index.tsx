import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Gestión Académica',
        href: '#',
    },
    {
        title: 'Horarios',
        href: '/horarios',
    },
];

export default function Index({ bloques }: { bloques: any[] }) {
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const confirmDelete = () => {
        if (deleteId === null) return;
        router.delete(`/horarios/${deleteId}`, {
            onSuccess: () => setDeleteId(null),
            onError: () => setDeleteId(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Horarios" />

            {/* Delete confirmation dialog */}
            <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 shrink-0">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                            </div>
                            <DialogTitle>Eliminar bloque de horario</DialogTitle>
                        </div>
                        <DialogDescription className="pt-1">
                            ¿Estás seguro de que deseas eliminar este bloque de horario? Esta acción
                            eliminará permanentemente todos los horarios y clases asociados a este
                            bloque. <span className="font-medium text-foreground">Esta acción no se puede deshacer.</span>
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
                    <h1 className="text-2xl font-semibold tracking-tight">Gestión de Bloques de Horario</h1>
                    <Button asChild>
                        <Link href="/horarios/crearHorario">
                            <Plus className="mr-2 h-4 w-4" /> Registrar Bloque
                        </Link>
                    </Button>
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border bg-card text-card-foreground relative flex-1 rounded-xl border shadow-sm">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                                    <th className="text-muted-foreground h-12 w-16 px-4 text-left align-middle font-medium">ID</th>
                                    <th className="text-muted-foreground h-12 w-32 px-4 text-left align-middle font-medium">Turno</th>
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Horarios Asignados</th>
                                    <th className="text-muted-foreground h-12 w-28 px-4 text-right align-middle font-medium">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {bloques && bloques.length > 0 ? (
                                    bloques.map((bloque) => (
                                        <tr key={bloque.ID} className="hover:bg-muted/50 border-b transition-colors">
                                            <td className="p-4 align-middle font-medium">{bloque.ID}</td>
                                            <td className="p-4 align-middle font-medium">
                                                <span className="focus:ring-ring inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none">
                                                    {bloque.TURNO}
                                                </span>
                                            </td>
                                            <td className="text-muted-foreground p-4 align-middle">
                                                {bloque.horarios_en_bloque && bloque.horarios_en_bloque.length > 0 ? (
                                                    <ul className="list-inside list-disc space-y-1">
                                                        {bloque.horarios_en_bloque.map((hb: any) => (
                                                            <li key={hb.ID} className="text-sm">
                                                                <span className="text-foreground font-medium">{hb.horario?.DIA}:</span>{' '}
                                                                {hb.horario?.HORA_INI} - {hb.horario?.HORA_FIN}
                                                                <span className="text-muted-foreground ml-2 text-xs">
                                                                    (Carga: {hb.CARGA_HORARIA} hrs)
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <span className="italic">Sin horarios asignados</span>
                                                )}
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="h-8 gap-1 text-xs"
                                                    onClick={() => setDeleteId(bloque.ID)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" /> Eliminar
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-muted-foreground p-4 text-center align-middle">
                                            No hay bloques de horario registrados.
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
