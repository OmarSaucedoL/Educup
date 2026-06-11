import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Info, AlertCircle } from 'lucide-react';

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

export default function Index({ cups, hayActivo }: { cups: any[]; hayActivo: boolean }) {
    const { props } = usePage<any>();
    const flashError = props.flash?.error as string | undefined;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de CUP" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Gestión de CUP (Curso Universitario Pre-Facultativo)</h1>
                    <div className="relative group">
                        <Button asChild={!hayActivo} disabled={hayActivo}>
                            {hayActivo ? (
                                <span className="inline-flex items-center gap-1.5 cursor-not-allowed opacity-50">
                                    <Plus className="mr-2 h-4 w-4" /> Nuevo CUP
                                </span>
                            ) : (
                                <Link href="/cup/crearCUP">
                                    <Plus className="mr-2 h-4 w-4" /> Nuevo CUP
                                </Link>
                            )}
                        </Button>
                        {hayActivo && (
                            <div className="absolute right-0 top-full mt-1.5 z-10 hidden group-hover:block w-64 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-700 shadow-md dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                                Ya existe un CUP activo. Debe concluirlo antes de crear uno nuevo.
                            </div>
                        )}
                    </div>
                </div>

                {flashError && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {flashError}
                    </div>
                )}

                <div className="border-sidebar-border/70 dark:border-sidebar-border bg-card text-card-foreground relative flex-1 rounded-xl border shadow-sm">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Gestión / Semestre</th>
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Cupos</th>
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Calificación Mínima</th>
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Fecha de Inicio</th>
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Fecha de Fin</th>
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Estado</th>
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Administrador</th>
                                    <th className="text-muted-foreground h-12 px-4 text-right align-middle font-medium w-[160px]">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {cups && cups.length > 0 ? (
                                    cups.map((cup) => (
                                        <tr key={cup.ID_CUP} className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                                            <td className="p-4 align-middle font-medium">
                                                {cup.ANIO} - {cup.SEMESTRE}
                                            </td>
                                            <td className="p-4 align-middle">
                                                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400">
                                                    {cup.CUPOS}
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">{cup.NOTA_MINIMA}</td>
                                            <td className="p-4 align-middle text-muted-foreground">
                                                {cup.FECHA_INICIO ? new Date(cup.FECHA_INICIO).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                                            </td>
                                            <td className="p-4 align-middle text-muted-foreground">
                                                {cup.FECHA_FIN ? new Date(cup.FECHA_FIN).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                                            </td>
                                            <td className="p-4 align-middle">
                                                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                                                    cup.ESTADO === 'Inscripciones'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-800'
                                                        : cup.ESTADO === 'En curso'
                                                        ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/20 dark:text-sky-300 dark:border-sky-800'
                                                        : 'bg-neutral-100 text-neutral-800 border-neutral-200 dark:bg-neutral-900/60 dark:text-neutral-300 dark:border-neutral-800'
                                                }`}>
                                                    {cup.ESTADO || 'Inscripciones'}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle text-muted-foreground">
                                                {cup.usuario ? `${cup.usuario.NOMBRE} ${cup.usuario.APELLIDO}` : 'N/A'}
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                <div className="inline-flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        asChild
                                                        className="h-8 gap-1.5 text-xs font-semibold"
                                                    >
                                                        <Link href={`/cup/${cup.ID_CUP}`} className="inline-flex items-center gap-1.5">
                                                            <Info className="h-3.5 w-3.5" /> Información
                                                        </Link>
                                                    </Button>
                                                    <Button variant="outline" size="sm" asChild className="h-8 gap-1.5 text-xs font-semibold">
                                                        <Link href={`/cup/${cup.ID_CUP}/editar`} className="inline-flex items-center gap-1.5">
                                                            <Edit className="h-3.5 w-3.5" /> Editar
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="text-muted-foreground p-4 text-center align-middle">
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

