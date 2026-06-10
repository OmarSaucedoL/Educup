import { Button } from '@/components/ui/button';
import { X, Terminal, Database, User, Monitor, Calendar } from 'lucide-react';

export interface LogEntry {
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

interface LogDetailsDrawerProps {
    selectedLog: LogEntry;
    onClose: () => void;
    getActionBadgeColor: (action: string) => string;
    parseChanges: (desc: string) => { field: string; oldValue: string; newValue: string }[] | null;
}

export function LogDetailsDrawer({
    selectedLog,
    onClose,
    getActionBadgeColor,
    parseChanges,
}: LogDetailsDrawerProps) {
    return (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
            <div className="absolute inset-0 overflow-hidden">
                {/* Overlay backdrop */}
                <div 
                    className="absolute inset-0 bg-neutral-950/40 dark:bg-neutral-950/60 backdrop-blur-sm transition-opacity" 
                    onClick={onClose}
                ></div>

                <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                    <div className="pointer-events-auto w-screen max-w-md transform border-l border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-2xl transition-all duration-300 ease-in-out">
                        <div className="flex flex-col h-full justify-between">
                            
                            {/* Drawer Content */}
                            <div className="overflow-y-auto pr-1">
                                
                                {/* Drawer Header */}
                                <div className="flex items-start justify-between pb-5 border-b border-neutral-100 dark:border-neutral-800">
                                    <div>
                                        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                                            <Terminal className="h-5 w-5 text-primary" />
                                            Detalles del Log
                                        </h2>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                            ID Registro Bitácora: #{selectedLog.ID_BITACORA}
                                        </p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Info Block */}
                                <div className="mt-6 space-y-5">
                                    
                                    {/* Accion Badge */}
                                    <div>
                                        <span className="block text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1.5">Tipo Acción</span>
                                        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-bold tracking-wide ${getActionBadgeColor(selectedLog.ACCION)}`}>
                                            {selectedLog.ACCION}
                                        </span>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 gap-4 bg-neutral-50 dark:bg-neutral-900/40 rounded-xl p-4 border border-neutral-100 dark:border-neutral-800/80">
                                        <div>
                                            <span className="block text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase">Tabla Afectada</span>
                                            <span className="font-semibold text-sm text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 mt-0.5">
                                                <Database className="h-4 w-4 text-neutral-400" />
                                                {selectedLog.TABLA || 'N/A'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase">ID Registro</span>
                                            <span className="font-mono text-sm font-bold text-neutral-800 dark:text-neutral-200 mt-0.5 block">
                                                {selectedLog.REGISTRO_ID ? `#${selectedLog.REGISTRO_ID}` : 'N/A'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Description text */}
                                    <div>
                                        <span className="block text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1.5">Descripción General</span>
                                        <div className="bg-neutral-50 dark:bg-neutral-900/40 rounded-xl p-4 border border-neutral-100 dark:border-neutral-800/80 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 font-medium">
                                            {selectedLog.DESCRIPCION}
                                        </div>
                                    </div>

                                    {/* Changes Table (For updates only) */}
                                    {selectedLog.ACCION === 'ACTUALIZAR' && parseChanges(selectedLog.DESCRIPCION) && (
                                        <div>
                                            <span className="block text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">Detalle de Cambios</span>
                                            <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
                                                <table className="w-full text-xs text-left">
                                                    <thead className="bg-neutral-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 font-semibold border-b border-neutral-200 dark:border-neutral-800">
                                                        <tr>
                                                            <th className="p-2.5">Campo</th>
                                                            <th className="p-2.5">Original</th>
                                                            <th className="p-2.5 text-primary">Nuevo</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 bg-white dark:bg-neutral-950/20">
                                                        {parseChanges(selectedLog.DESCRIPCION)!.map((change) => (
                                                            <tr key={change.field} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30">
                                                                <td className="p-2.5 font-bold text-neutral-700 dark:text-neutral-300">{change.field}</td>
                                                                <td className="p-2.5 text-rose-600 dark:text-rose-400 font-medium bg-rose-50/20 dark:bg-rose-950/10 truncate max-w-[120px]" title={change.oldValue}>
                                                                    {change.oldValue || <span className="italic opacity-60">nulo</span>}
                                                                </td>
                                                                <td className="p-2.5 text-green-600 dark:text-green-400 font-bold bg-green-50/20 dark:bg-green-950/10 truncate max-w-[120px]" title={change.newValue}>
                                                                    {change.newValue || <span className="italic opacity-60">nulo</span>}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Metadata */}
                                    <div className="space-y-3.5 border-t border-neutral-100 dark:border-neutral-800 pt-5">
                                        
                                        {/* Actor */}
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 bg-neutral-100 dark:bg-neutral-900 rounded-full flex items-center justify-center text-neutral-400">
                                                <User className="h-4.5 w-4.5" />
                                            </div>
                                            <div>
                                                <span className="block text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase leading-none mb-0.5">Operado Por</span>
                                                {selectedLog.usuario ? (
                                                    <span className="font-semibold text-sm text-neutral-800 dark:text-neutral-200">
                                                        {selectedLog.usuario.NOMBRE} {selectedLog.usuario.APELLIDO} <span className="text-neutral-400 font-normal text-xs">(@{selectedLog.usuario.USERNAME})</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-sm font-semibold text-neutral-500 italic">Invitado / Sistema</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Device IP */}
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 bg-neutral-100 dark:bg-neutral-900 rounded-full flex items-center justify-center text-neutral-400 font-mono text-xs">
                                                <Monitor className="h-4.5 w-4.5" />
                                            </div>
                                            <div>
                                                <span className="block text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase leading-none mb-0.5">Dirección IP</span>
                                                <span className="font-mono text-sm text-neutral-800 dark:text-neutral-200 font-bold">
                                                    {selectedLog.IP_DIRECCION || 'Desconocida'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Session ID */}
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 bg-neutral-100 dark:bg-neutral-900 rounded-full flex items-center justify-center text-neutral-400">
                                                <Database className="h-4.5 w-4.5" />
                                            </div>
                                            <div>
                                                <span className="block text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase leading-none mb-0.5">ID de Sesión</span>
                                                <span 
                                                    className="font-mono text-xs text-neutral-800 dark:text-neutral-200 block truncate max-w-[200px] sm:max-w-[250px]" 
                                                    title={selectedLog.SESSION_ID || 'N/A'}
                                                >
                                                    {selectedLog.SESSION_ID || 'N/A'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Timestamp */}
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 bg-neutral-100 dark:bg-neutral-900 rounded-full flex items-center justify-center text-neutral-400">
                                                <Calendar className="h-4.5 w-4.5" />
                                            </div>
                                            <div>
                                                <span className="block text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase leading-none mb-0.5">Fecha y Hora</span>
                                                <span className="text-sm text-neutral-800 dark:text-neutral-200 font-semibold">
                                                    {new Date(selectedLog.FECHA_REGISTRO).toLocaleString('es-ES', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        second: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Close Button */}
                            <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 mt-6">
                                <Button 
                                    variant="outline" 
                                    className="w-full font-bold" 
                                    onClick={onClose}
                                >
                                    Cerrar Panel
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
