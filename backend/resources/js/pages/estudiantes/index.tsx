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
import { AlertTriangle, Plus, Trash2, FileSpreadsheet } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Gestión Académica', href: '#' },
    { title: 'Estudiantes', href: '/estudiantes' },
];

interface Estudiante {
    ID: number;
    CARNET: string;
    NOMBRE: string;
    APELLIDO: string;
    CORREO: string;
    TELEFONO: string;
    SEXO: string;
    ESTADO: string;
}

export default function Index({ estudiantes }: { estudiantes: Estudiante[] }) {
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const confirmDelete = () => {
        if (deleteId === null) return;
        router.delete(`/estudiantes/${deleteId}`, {
            onSuccess: () => setDeleteId(null),
            onError:   () => setDeleteId(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Estudiantes" />

            {/* Delete confirmation dialog */}
            <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 shrink-0">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                            </div>
                            <DialogTitle>Eliminar estudiante</DialogTitle>
                        </div>
                        <DialogDescription className="pt-1">
                            ¿Estás seguro de que deseas eliminar este estudiante?{' '}
                            <span className="font-medium text-foreground">Esta acción no se puede deshacer.</span>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            <Trash2 className="mr-2 h-4 w-4" /> Sí, eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Gestión de Estudiantes</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-900/50 dark:text-indigo-400 dark:hover:bg-indigo-950/50" asChild>
                            <Link href="/estudiantes/importar">
                                <FileSpreadsheet className="mr-2 h-4 w-4" /> Importar Excel
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href="/estudiantes/crearEstudiante">
                                <Plus className="mr-2 h-4 w-4" /> Agregar Estudiante
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border bg-card text-card-foreground relative flex-1 rounded-xl border shadow-sm">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium w-20">ID</th>
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium w-32">Carnet</th>
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Nombre Completo</th>
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Correo</th>
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium w-32">Teléfono</th>
                                    <th className="text-muted-foreground h-12 px-4 text-center align-middle font-medium w-20">Sexo</th>
                                    <th className="text-muted-foreground h-12 px-4 text-center align-middle font-medium w-28">Estado</th>
                                    <th className="text-muted-foreground h-12 px-4 text-right align-middle font-medium w-28">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {estudiantes && estudiantes.length > 0 ? (
                                    estudiantes.map((est) => (
                                        <tr key={est.ID_ESTUDIANTE} className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                                            <td className="p-4 align-middle font-medium">{est.ID_ESTUDIANTE}</td>
                                            <td className="p-4 align-middle font-mono text-xs">{est.CARNET}</td>
                                            <td className="p-4 align-middle font-medium">{est.APELLIDO}, {est.NOMBRE}</td>
                                            <td className="p-4 align-middle text-muted-foreground">{est.CORREO}</td>
                                            <td className="p-4 align-middle text-muted-foreground">{est.TELEFONO || <span className="italic text-muted-foreground/50">—</span>}</td>
                                            <td className="p-4 align-middle text-center text-muted-foreground">{est.SEXO}</td>
                                            <td className="p-4 align-middle text-center">
                                                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                                                    est.ESTADO === 'ACTIVO'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-800'
                                                        : 'bg-destructive/10 text-destructive border-destructive/20'
                                                }`}>
                                                    {est.ESTADO}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="h-8 gap-1 text-xs"
                                                    onClick={() => setDeleteId(est.ID_ESTUDIANTE)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" /> Eliminar
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="text-muted-foreground p-4 text-center align-middle">
                                            No hay estudiantes registrados.
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
