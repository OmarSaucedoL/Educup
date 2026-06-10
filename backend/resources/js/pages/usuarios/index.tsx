import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Users, Key, Search, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
import { EditUserPermisosModal } from './components/edit-user-permisos-modal';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

const getRelativeUrl = (url: string | null): string => {
    if (!url) return '';
    try {
        const parsed = new URL(url);
        return parsed.pathname + parsed.search;
    } catch (e) {
        return url;
    }
};

export default function Index({
    usuarios,
    permisos = [],
    roles = [],
    filters = { search: '', rol_id: '', estado: '' },
}: {
    usuarios: PaginatedUsuarios;
    permisos: any[];
    roles: any[];
    filters: { search: string; rol_id?: string; estado?: string };
}) {
    const [editingUser, setEditingUser] = useState<any | null>(null);
    const [searchValue, setSearchValue] = useState(filters.search ?? '');

    // Apply multiple filters at once, maintaining state
    const applyFilters = useCallback((newFilters: { search?: string; rol_id?: string; estado?: string }) => {
        const queryParams: any = {
            search: newFilters.search !== undefined ? newFilters.search : searchValue,
        };

        const finalRolId = newFilters.rol_id !== undefined ? newFilters.rol_id : (filters.rol_id ?? '');
        const finalEstado = newFilters.estado !== undefined ? newFilters.estado : (filters.estado ?? '');

        if (finalRolId !== '') {
            queryParams.rol_id = finalRolId;
        }

        if (finalEstado !== '') {
            queryParams.estado = finalEstado;
        }

        router.get('/usuarios', queryParams, {
            preserveState: true,
            replace: true,
        });
    }, [searchValue, filters.rol_id, filters.estado]);

    // Debounce search → Inertia GET
    const doSearch = useCallback((value: string) => {
        applyFilters({ search: value });
    }, [applyFilters]);

    let debounceTimer: ReturnType<typeof setTimeout>;
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchValue(value);
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => doSearch(value), 350);
    };

    const { data: listaUsuarios, current_page, last_page, total, from, to } = usuarios;
    const activeRolId = filters.rol_id;

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

                {/* Search and Filters bar */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <input
                            id="usuarios-search"
                            type="text"
                            aria-label="Buscar por nombre, usuario o correo"
                            value={searchValue}
                            onChange={handleSearch}
                            placeholder="Buscar por nombre, usuario o correo…"
                            className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-4 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>

                    {/* Filtro por Rol */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant={activeRolId ? "default" : "outline"}
                                className="h-9 text-xs gap-1.5"
                            >
                                <Filter className="h-3.5 w-3.5" />
                                {activeRolId 
                                    ? `Rol: ${roles.find(r => r.ID.toString() === activeRolId)?.NOMBRE || activeRolId}`
                                    : "Filtro por Rol"}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48 max-h-60 overflow-y-auto">
                            <DropdownMenuItem onClick={() => applyFilters({ rol_id: '' })}>
                                Todos los Roles
                            </DropdownMenuItem>
                            {roles.map(rol => (
                                <DropdownMenuItem 
                                    key={rol.ID} 
                                    onClick={() => applyFilters({ rol_id: rol.ID.toString() })}
                                >
                                    {rol.NOMBRE}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Filtro por Estado */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant={filters.estado ? "default" : "outline"}
                                className="h-9 text-xs gap-1.5"
                            >
                                <Filter className="h-3.5 w-3.5" />
                                {filters.estado 
                                    ? `Estado: ${filters.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}`
                                    : "Filtro por Estado"}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48">
                            <DropdownMenuItem onClick={() => applyFilters({ estado: '' })}>
                                Todos los Estados
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => applyFilters({ estado: 'ACTIVO' })}>
                                Activo
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => applyFilters({ estado: 'INACTIVO' })}>
                                Inactivo
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Limpiar Filtros */}
                    {(activeRolId || filters.estado || searchValue) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 text-xs text-muted-foreground hover:text-foreground gap-1"
                            onClick={() => {
                                setSearchValue('');
                                router.get('/usuarios', {}, {
                                    preserveState: false,
                                });
                            }}
                        >
                            <X className="h-3.5 w-3.5" />
                            Limpiar
                        </Button>
                    )}
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
                                {usuarios.links[0]?.url ? (
                                    <Link
                                        href={getRelativeUrl(usuarios.links[0].url)}
                                        preserveState
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-xs transition-colors hover:bg-muted"
                                        aria-label="Página anterior"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Link>
                                ) : (
                                    <span
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-xs opacity-40 cursor-not-allowed"
                                        aria-label="Página anterior"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </span>
                                )}

                                {/* Numbered pages — skip the first (prev) and last (next) links */}
                                {(() => {
                                    let ellipsisCount = 0;
                                    return usuarios.links.slice(1, -1).map((link) => {
                                        const key = link.label === '...' ? `ellipsis-${++ellipsisCount}` : link.label;
                                        const relativeUrl = getRelativeUrl(link.url);
                                        return link.url && !link.active ? (
                                            <Link
                                                key={key}
                                                href={relativeUrl}
                                                preserveState
                                                aria-label={link.label === '...' ? 'Páginas intermedias' : `Página ${link.label}`}
                                                className="inline-flex h-8 min-w-[2rem] items-center justify-center rounded-md border px-2 text-xs font-medium transition-colors hover:bg-muted"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ) : (
                                            <span
                                                key={key}
                                                className={`inline-flex h-8 min-w-[2rem] items-center justify-center rounded-md border px-2 text-xs font-medium ${
                                                    link.active
                                                        ? 'border-primary bg-primary text-primary-foreground select-none'
                                                        : 'opacity-40 cursor-not-allowed'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    });
                                })()}

                                {/* Next */}
                                {usuarios.links[usuarios.links.length - 1]?.url ? (
                                    <Link
                                        href={getRelativeUrl(usuarios.links[usuarios.links.length - 1].url)}
                                        preserveState
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-xs transition-colors hover:bg-muted"
                                        aria-label="Página siguiente"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                ) : (
                                    <span
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-xs opacity-40 cursor-not-allowed"
                                        aria-label="Página siguiente"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {editingUser && (
                    <EditUserPermisosModal
                        user={editingUser}
                        permisos={permisos}
                        onClose={() => setEditingUser(null)}
                    />
                )}
            </div>
        </AppLayout>
    );
}
