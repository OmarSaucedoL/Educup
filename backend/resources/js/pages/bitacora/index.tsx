import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Search, 
    X, 
    Activity, 
    Calendar, 
    User, 
    Terminal, 
    Monitor, 
    ArrowRight, 
    Database, 
    Info 
} from 'lucide-react';
import { useState } from 'react';
import { LogDetailsDrawer } from './components/log-details-drawer';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Módulo Administrativo',
        href: '#',
    },
    {
        title: 'Bitácora',
        href: '/bitacora',
    },
];

interface LogEntry {
    ID_BITACORA: number;
    USUARIO_ID: number | null;
    ACCION: 'LOGIN' | 'LOGOUT' | 'CREAR' | 'ACTUALIZAR' | 'ELIMINAR';
    TABLA: string | null;
    REGISTRO_ID: number | null;
    DESCRIPCION: string;
    SESSION_ID: string | null;
    IP_DIRECCION: string | null;
    FECHA_REGISTRO: string;
    usuario: {
        ID: number;
        USERNAME: string;
        NOMBRE: string;
        APELLIDO: string;
        rol?: {
            NOMBRE: string;
        };
    } | null;
}

interface BitacoraProps {
    bitacora: {
        data: LogEntry[];
        current_page: number;
        last_page: number;
        total: number;
        links: any[];
    };
    filters: {
        search?: string;
        accion?: string;
    };
}

// Parse diff changes for UPDATE logs
const parseChanges = (desc: string) => {
    const index = desc.indexOf("Cambios: ");
    if (index === -1) return null;
    const changesStr = desc.substring(index + 9);
    const parts = changesStr.split("; ");
    return parts.map(part => {
        const match = part.match(/\[(.*?)\]:\s*de\s*'(.*?)'\s*a\s*'(.*?)'/);
        if (match) {
            return {
                field: match[1],
                oldValue: match[2],
                newValue: match[3]
            };
        }
        return null;
    }).filter((item): item is { field: string; oldValue: string; newValue: string } => item !== null);
};

const getActionBadgeColor = (action: string) => {
    switch (action) {
        case 'CREAR':
        case 'LOGIN':
            return 'border-green-200 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/50';
        case 'ACTUALIZAR':
            return 'border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50';
        case 'ELIMINAR':
        case 'LOGOUT':
            return 'border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50';
        default:
            return 'border-neutral-200 bg-neutral-50 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-400';
    }
};

export default function Index({ bitacora, filters }: BitacoraProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/bitacora', { search, accion: filters.accion || '' }, { preserveState: true, replace: true });
    };

    const handleFilterAccion = (accion: string) => {
        router.get('/bitacora', { search, accion }, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        setSearch('');
        router.get('/bitacora', { search: '', accion: '' }, { preserveState: true, replace: true });
    };

    const categories = [
        { label: 'Todos', value: '' },
        { label: 'Creaciones', value: 'CREAR' },
        { label: 'Modificaciones', value: 'ACTUALIZAR' },
        { label: 'Eliminaciones', value: 'ELIMINAR' },
        { label: 'Inicios de Sesión', value: 'LOGIN' },
        { label: 'Cierres de Sesión', value: 'LOGOUT' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bitácora de Actividades" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 md:p-6">
                
                {/* Header */}
                <div className="mb-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <Activity className="h-6 w-6 text-primary animate-pulse" />
                            Bitácora del Sistema
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                            Historial automatizado de auditoría y logs de actividades de los usuarios.
                        </p>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="grid gap-4 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md border border-neutral-200/60 dark:border-neutral-800 rounded-xl p-4 shadow-sm">
                    
                    {/* Search & Actions */}
                    <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 md:flex-row md:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                            <input
                                type="text"
                                aria-label="Buscar por descripción, tabla o usuario"
                                placeholder="Buscar por descripción, tabla o usuario..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-neutral-800 dark:text-neutral-200"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" variant="default" className="shadow-sm">
                                Buscar
                            </Button>
                            {(search || filters.accion) && (
                                <Button type="button" variant="ghost" onClick={clearFilters} className="text-neutral-500 dark:text-neutral-400">
                                    <X className="h-4 w-4 mr-2" /> Limpiar
                                </Button>
                            )}
                        </div>
                    </form>

                    {/* Category Pills */}
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                        {categories.map((cat) => (
                            <button
                                key={cat.value}
                                onClick={() => handleFilterAccion(cat.value)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                    (filters.accion || '') === cat.value
                                        ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                                        : 'bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-neutral-800'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table Container */}
                <div className="border border-neutral-200/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md relative flex-1 rounded-xl shadow-sm overflow-hidden">
                    <div className="w-full overflow-x-auto">
                        <table className="w-full caption-bottom text-sm border-collapse">
                            <thead>
                                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20 text-neutral-500 dark:text-neutral-400">
                                    <th className="h-12 px-4 text-left align-middle font-semibold w-[150px]">Acción</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold">Descripción</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold w-[180px]">Usuario</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold w-[140px]">IP Dirección</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold w-[180px]">Fecha</th>
                                    <th className="h-12 px-4 text-center align-middle font-semibold w-[80px]">Info</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                                {bitacora.data && bitacora.data.length > 0 ? (
                                    bitacora.data.map((log) => (
                                        <tr 
                                            key={log.ID_BITACORA} 
                                            className="hover:bg-neutral-50/40 dark:hover:bg-neutral-900/40 transition-colors group cursor-pointer"
                                            onClick={() => setSelectedLog(log)}
                                        >
                                            {/* Action badge */}
                                            <td className="p-4 align-middle font-medium">
                                                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide ${getActionBadgeColor(log.ACCION)}`}>
                                                    {log.ACCION}
                                                </span>
                                            </td>

                                            {/* Description short version */}
                                            <td className="p-4 align-middle max-w-[400px] truncate text-neutral-700 dark:text-neutral-300 font-medium">
                                                {log.DESCRIPCION}
                                            </td>

                                            {/* User detail */}
                                            <td className="p-4 align-middle">
                                                {log.usuario ? (
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                                                            {log.usuario.NOMBRE} {log.usuario.APELLIDO}
                                                        </span>
                                                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                                            @{log.usuario.USERNAME} • {log.usuario.rol?.NOMBRE || 'Sin Rol'}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-neutral-400 dark:text-neutral-600 italic">Sistema / Invitado</span>
                                                )}
                                            </td>

                                            {/* IP */}
                                            <td className="p-4 align-middle text-neutral-600 dark:text-neutral-400 font-mono text-xs">
                                                {log.IP_DIRECCION || 'N/A'}
                                            </td>

                                            {/* Date */}
                                            <td className="p-4 align-middle text-neutral-600 dark:text-neutral-400 text-xs">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                                                    {new Date(log.FECHA_REGISTRO).toLocaleString('es-ES', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        second: '2-digit'
                                                    })}
                                                </div>
                                            </td>

                                            {/* Info Button */}
                                            <td className="p-4 align-middle text-center" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => setSelectedLog(log)}
                                                    className="p-1.5 rounded-lg text-neutral-400 group-hover:text-primary hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                                                    title="Ver Detalles"
                                                >
                                                    <Info className="h-4.5 w-4.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="text-neutral-400 dark:text-neutral-500 p-8 text-center align-middle font-medium">
                                            No se encontraron registros en la bitácora.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {bitacora.links && bitacora.links.length > 3 && (
                    <div className="flex justify-center mt-2">
                        <div className="flex flex-wrap gap-1 bg-white/40 dark:bg-neutral-900/40 p-1.5 rounded-xl border border-neutral-200/60 dark:border-neutral-800">
                            {(() => {
                                let ellipsisCount = 0;
                                return bitacora.links.map((link) => {
                                    const key = link.label === '...' ? `ellipsis-${++ellipsisCount}` : link.label;
                                    if (link.url === null) {
                                        return (
                                            <div
                                                key={key}
                                                className="px-3 py-1.5 text-xs text-neutral-400 dark:text-neutral-600 rounded-lg cursor-not-allowed select-none"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    }
                                    return (
                                        <Link
                                            key={key}
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
                                });
                            })()}
                        </div>
                    </div>
                )}
            </div>

            {/* Sidebar Details Drawer */}
            {selectedLog && (
                <LogDetailsDrawer
                    selectedLog={selectedLog}
                    onClose={() => setSelectedLog(null)}
                    getActionBadgeColor={getActionBadgeColor}
                    parseChanges={parseChanges}
                />
            )}
        </AppLayout>
    );
}
