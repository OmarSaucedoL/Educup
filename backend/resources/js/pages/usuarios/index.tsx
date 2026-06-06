import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Users, Key, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { EditUserPermisosModal } from './components/edit-user-permisos-modal';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Usuarios', href: '/usuarios' },
];

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedUsuarios {
    data: any[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: PaginationLink[];
}

export default function Index({
    usuarios,
    permisos = [],
    filters = { search: '' },
}: {
    usuarios: PaginatedUsuarios;
    permisos: any[];
    filters: { search: string };
}) {
    const [editingUser, setEditingUser] = useState<any | null>(null);
    const [searchValue, setSearchValue] = useState(filters.search ?? '');

    // Debounce search → Inertia GET
    const doSearch = useCallback((value: string) => {
        router.get('/usuarios', { search: value }, {
            preserveState: true,
            replace: true,
        });
    }, []);

    let debounceTimer: ReturnType<typeof setTimeout>;
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchValue(value);
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => doSearch(value), 350);
    };

    const goToPage = (url: string | null) => {
        if (!url) return;
        router.visit(url, { preserveState: true });
    };

    const { data: listaUsuarios, current_page, last_page, total, from, to } = usuarios;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuarios" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Gestión de Usuarios</h1>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="border-neutral-200 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
                            asChild
                        >
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

                {/* Search bar */}
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <input
                        id="usuarios-search"
                        type="text"
                        value={searchValue}
                        onChange={handleSearch}
                        placeholder="Buscar por nombre, usuario o correo…"
                        className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-4 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>

                {/* Table */}
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
                                    <th className="text-muted-foreground h-12 px-4 text-right align-middle font-medium">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {listaUsuarios && listaUsuarios.length > 0 ? (
                                    listaUsuarios.map((usuario) => (
                                        <tr key={usuario.ID} className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                                            <td className="p-4 align-middle font-mono text-xs">{usuario.USERNAME}</td>
                                            <td className="p-4 align-middle">{usuario.NOMBRE} {usuario.APELLIDO}</td>
                                            <td className="p-4 align-middle text-muted-foreground">{usuario.CORREO}</td>
                                            <td className="p-4 align-middle">
                                                {usuario.rol
                                                    ? <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium">{usuario.rol.NOMBRE}</span>
                                                    : <span className="text-muted-foreground text-xs">Sin rol</span>
                                                }
                                            </td>
                                            <td className="p-4 align-middle">
                                                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                                                    usuario.ESTADO === 'ACTIVO'
                                                        ? 'border-green-200 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'border-red-200 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                    {usuario.ESTADO === 'ACTIVO' ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setEditingUser(usuario)}
                                                        className="h-8 text-xs font-semibold gap-1.5"
                                                    >
                                                        <Key className="h-3.5 w-3.5 text-neutral-500" />
                                                        Permisos
                                                    </Button>
                                                    <Button variant="outline" size="sm" asChild className="h-8 text-xs font-semibold">
                                                        <Link href={`/usuarios/${usuario.ID}/editar`}>Modificar</Link>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="text-muted-foreground p-8 text-center align-middle">
                                            {searchValue
                                                ? `No se encontraron usuarios que coincidan con "${searchValue}".`
                                                : 'No hay usuarios registrados.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination footer */}
                    {last_page > 1 && (
                        <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
                            <span>
                                Mostrando <span className="font-medium text-foreground">{from}–{to}</span> de <span className="font-medium text-foreground">{total}</span> usuarios
                            </span>
                            <div className="flex items-center gap-1">
                                {/* Prev */}
                                <button
                                    onClick={() => goToPage(usuarios.links[0]?.url ?? null)}
                                    disabled={current_page === 1}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-xs transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                                    aria-label="Página anterior"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>

                                {/* Numbered pages — skip the first (prev) and last (next) links */}
                                {usuarios.links.slice(1, -1).map((link, i) => (
                                    <button
                                        key={i}
                                        onClick={() => goToPage(link.url)}
                                        disabled={!link.url || link.active}
                                        className={`inline-flex h-8 min-w-[2rem] items-center justify-center rounded-md border px-2 text-xs font-medium transition-colors ${
                                            link.active
                                                ? 'border-primary bg-primary text-primary-foreground pointer-events-none'
                                                : 'hover:bg-muted disabled:opacity-40'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}

                                {/* Next */}
                                <button
                                    onClick={() => goToPage(usuarios.links[usuarios.links.length - 1]?.url ?? null)}
                                    disabled={current_page === last_page}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-xs transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                                    aria-label="Página siguiente"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <EditUserPermisosModal
                    user={editingUser}
                    permisos={permisos}
                    onClose={() => setEditingUser(null)}
                />
            </div>
        </AppLayout>
    );
}
