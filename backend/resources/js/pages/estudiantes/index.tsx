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
import { AlertTriangle, Plus, Trash2, FileSpreadsheet, Search, X, Edit2, Calendar } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Gestión Académica', href: '#' },
    { title: 'Estudiantes', href: '/estudiantes' },
];

interface Estudiante {
    ID_ESTUDIANTE: number;
    CARNET: string;
    NOMBRE: string;
    APELLIDO: string;
    CORREO: string;
    TELEFONO: string | null;
    SEXO: string;
    ESTADO: string;
    colegio?: { NOMBRE: string } | null;
    ciudad?: { NOMBRE: string; DEPARTAMENTO: string } | null;
}

interface PaginatedEstudiantes {
    data: Estudiante[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    estudiantes: PaginatedEstudiantes;
    filters: {
        search?: string;
    };
    activeCup?: {
        ID_CUP: number;
        ANIO: number;
        SEMESTRE: string;
    } | null;
}

export default function Index({ estudiantes, filters, activeCup }: Props) {
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [search, setSearch] = useState(filters.search || '');

    const confirmDelete = () => {
        if (deleteId === null) return;
        router.delete(`/estudiantes/${deleteId}`, {
            onSuccess: () => setDeleteId(null),
            onError: (errors) => {
                setDeleteId(null);
                const firstError = Object.values(errors)[0] || 'Ocurrió un error al intentar eliminar el postulante.';
                alert(firstError);
            },
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/estudiantes', { search }, { preserveState: true, replace: true });
    };

    const clearSearch = () => {
        setSearch('');
        router.get('/estudiantes', { search: '' }, { preserveState: true, replace: true });
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
                            ¿Estás seguro de que deseas eliminar este estudiante y toda su preinscripción relacionada?{' '}
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

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 md:p-6">
                
                {/* Header */}
                <div className="mb-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Gestión de Estudiantes</h1>
                        <p className="text-sm text-muted-foreground mt-1">Registra, modifica, importa y gestiona la lista oficial de postulantes del sistema.</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        {activeCup ? (
                            <>
                                <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/5" asChild>
                                    <Link href="/estudiantes/importar">
                                        <FileSpreadsheet className="mr-2 h-4 w-4" /> Importar Excel
                                    </Link>
                                </Button>
                                <Button asChild className="font-semibold">
                                    <Link href="/estudiantes/crearEstudiante">
                                        <Plus className="mr-2 h-4 w-4" /> Agregar Estudiante
                                    </Link>
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="outline" disabled className="border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed">
                                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Importar Excel
                                </Button>
                                <Button disabled className="bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed">
                                    <Plus className="mr-2 h-4 w-4" /> Agregar Estudiante
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {!activeCup && (
                    <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50 rounded-xl p-4 flex items-start gap-3 shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
                        <AlertTriangle className="h-5 w-5 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-sm text-rose-800 dark:text-rose-300">Procesos de Admisión Finalizados</h4>
                            <p className="text-xs text-rose-700 dark:text-rose-400 mt-1 leading-relaxed">
                                No existe una convocatoria de admisión CUP activa en esta gestión (todas están concluidas). 
                                El registro manual de nuevos estudiantes y la importación masiva de datos mediante planillas Excel están deshabilitados.
                            </p>
                        </div>
                    </div>
                )}

                {/* Filters Section */}
                <div className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md border border-neutral-200/60 dark:border-neutral-800 rounded-xl p-4 shadow-sm">
                    <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Buscar por carnet, nombre o apellido..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-neutral-800 dark:text-neutral-200"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" variant="default" className="shadow-sm font-semibold">
                                Buscar
                            </Button>
                            {search && (
                                <Button type="button" variant="ghost" onClick={clearSearch} className="text-neutral-500 dark:text-neutral-400">
                                    <X className="h-4 w-4 mr-2" /> Limpiar
                                </Button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Table Container */}
                <div className="border border-neutral-200/60 dark:border-neutral-800 bg-card text-card-foreground relative flex-1 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-0">
                    <div className="relative w-full overflow-auto flex-1">
                        <table className="w-full caption-bottom text-sm border-collapse">
                            <thead>
                                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20 text-neutral-500 dark:text-neutral-400">
                                    <th className="h-12 px-4 text-left align-middle font-semibold w-20">ID</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold w-32">Carnet</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold">Nombre Completo</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold">Procedencia</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold">Correo</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold w-32">Teléfono</th>
                                    <th className="h-12 px-4 text-center align-middle font-semibold w-20">Sexo</th>
                                    <th className="h-12 px-4 text-center align-middle font-semibold w-28">Estado</th>
                                    <th className="h-12 px-4 text-right align-middle font-semibold w-[190px]">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                                {estudiantes.data && estudiantes.data.length > 0 ? (
                                    estudiantes.data.map((est) => (
                                        <tr key={est.ID_ESTUDIANTE} className="hover:bg-neutral-50/40 dark:hover:bg-neutral-900/40 transition-colors group">
                                            <td className="p-4 align-middle font-medium">#{est.ID_ESTUDIANTE}</td>
                                            <td className="p-4 align-middle font-mono text-xs">{est.CARNET}</td>
                                            <td className="p-4 align-middle font-medium">
                                                <div className="flex flex-col">
                                                    <span>{est.APELLIDO}, {est.NOMBRE}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <div className="flex flex-col text-xs">
                                                    <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                                        {est.colegio?.NOMBRE || <span className="italic text-neutral-400">Sin Colegio</span>}
                                                    </span>
                                                    <span className="text-neutral-400">
                                                        {est.ciudad ? `${est.ciudad.NOMBRE} (${est.ciudad.DEPARTAMENTO})` : <span className="italic">Sin Ciudad</span>}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle text-muted-foreground">{est.CORREO}</td>
                                            <td className="p-4 align-middle text-muted-foreground">{est.TELEFONO || <span className="italic text-muted-foreground/30">—</span>}</td>
                                            <td className="p-4 align-middle text-center text-muted-foreground">{est.SEXO}</td>
                                            <td className="p-4 align-middle text-center">
                                                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                                                    est.ESTADO === 'APROBADO'
                                                        ? 'bg-primary/10 text-primary border-primary/20'
                                                        : est.ESTADO === 'ACTIVO'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-800'
                                                        : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-300 dark:border-rose-800'
                                                }`}>
                                                    {est.ESTADO}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                <div className="flex justify-end gap-1.5">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 gap-1 text-xs border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-semibold"
                                                        asChild
                                                    >
                                                        <Link href={`/estudiantes/${est.ID_ESTUDIANTE}/editar`}>
                                                            <Edit2 className="h-3.5 w-3.5" /> Editar
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="h-8 gap-1 text-xs font-semibold"
                                                        onClick={() => setDeleteId(est.ID_ESTUDIANTE)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" /> Eliminar
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={9} className="text-muted-foreground p-8 text-center align-middle font-medium">
                                            No se encontraron estudiantes registrados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {estudiantes.links && estudiantes.links.length > 3 && (
                    <div className="flex justify-center mt-2">
                        <div className="flex flex-wrap gap-1 bg-white/40 dark:bg-neutral-900/40 p-1.5 rounded-xl border border-neutral-200/60 dark:border-neutral-800">
                            {estudiantes.links.map((link, idx) => {
                                if (link.url === null) {
                                    return (
                                        <div
                                            key={idx}
                                            className="px-3 py-1.5 text-xs text-neutral-400 dark:text-neutral-600 rounded-lg cursor-not-allowed select-none"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                }
                                return (
                                    <Link
                                        key={idx}
                                        href={link.url}
                                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                            link.active
                                                ? 'bg-primary text-primary-foreground shadow-sm'
                                                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        preserveState
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
