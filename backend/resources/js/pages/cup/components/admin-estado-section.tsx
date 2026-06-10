import { UserCheck, Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';

export interface Usuario {
    ID: number;
    NOMBRE: string;
    APELLIDO: string;
}

interface AdminEstadoSectionProps {
    usuarios: Usuario[];
    usuarioId: string;
    onUsuarioChange: (val: string) => void;
    estado: string;
    onEstadoChange: (val: string) => void;
    processing: boolean;
    isLocked: boolean;
    usuarioError?: string;
    estadoError?: string;
}

export function AdminEstadoSection({
    usuarios,
    usuarioId,
    onUsuarioChange,
    estado,
    onEstadoChange,
    processing,
    isLocked,
    usuarioError,
    estadoError,
}: AdminEstadoSectionProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start border-t border-neutral-100 dark:border-neutral-800 pt-6">
            <div className="grid gap-2">
                <Label htmlFor="USUARIO_ID" className="text-sm font-semibold flex items-center gap-1.5">
                    <UserCheck className="h-4 w-4 text-neutral-500" /> Administrador Encargado *
                </Label>
                <select
                    id="USUARIO_ID"
                    required
                    value={usuarioId}
                    onChange={e => onUsuarioChange(e.target.value)}
                    disabled={processing || isLocked}
                    className="flex h-10 w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-neutral-800 dark:text-neutral-200"
                >
                    <option value="">— Seleccionar Administrador —</option>
                    {usuarios.map(u => (
                        <option key={u.ID} value={u.ID}>
                            {u.NOMBRE} {u.APELLIDO}
                        </option>
                    ))}
                </select>
                <InputError message={usuarioError} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="ESTADO" className="text-sm font-semibold flex items-center gap-1.5">
                    <Info className="h-4 w-4 text-neutral-500" /> Estado del CUP *
                </Label>
                <select
                    id="ESTADO"
                    required
                    value={estado}
                    onChange={e => onEstadoChange(e.target.value)}
                    disabled={processing}
                    className="flex h-10 w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-neutral-800 dark:text-neutral-200"
                >
                    <option value="Inscripciones">Inscripciones</option>
                    <option value="En curso">En curso</option>
                    <option value="Concluido">Concluido</option>
                </select>
                <InputError message={estadoError} />
            </div>
        </div>
    );
}
