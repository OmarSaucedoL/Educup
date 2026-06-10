import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface Modulo {
    ID: number;
    NOMBRE: string;
}

interface Permiso {
    ID: number;
    NOMBRE: string;
    modulo?: Modulo;
    MODULO_ID?: number;
}

interface Usuario {
    ID: number;
    USERNAME: string;
    NOMBRE: string;
    APELLIDO: string;
    permisos: Permiso[];
    rol?: {
        ID: number;
        NOMBRE: string;
        permisos?: Permiso[];
    };
    has_custom_permissions?: boolean;
}

interface EditUserPermisosModalProps {
    user: Usuario | null;
    permisos: Permiso[];
    onClose: () => void;
}

export function EditUserPermisosModal({ user, permisos, onClose }: EditUserPermisosModalProps) {
    const { data, setData, put, processing, errors, reset, clearErrors } = useForm({
        permisos: user
            ? (user.has_custom_permissions
                ? user.permisos.map(p => p.ID)
                : (user.rol?.permisos?.map(p => p.ID) || []))
            : [] as number[],
    });

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            onClose();
            clearErrors();
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) return;
        put(`/usuarios/${user.ID}/permisos`, {
            onSuccess: () => {
                onClose();
                reset();
            }
        });
    };

    const handlePermisoToggle = (permisoId: number, checked: boolean) => {
        if (checked) {
            setData('permisos', [...data.permisos, permisoId]);
        } else {
            setData('permisos', data.permisos.filter(id => id !== permisoId));
        }
    };

    // Group permissions by module
    const groupedPermisos = permisos.reduce((acc, p) => {
        const modName = p.modulo?.NOMBRE || 'Otros';
        if (!acc[modName]) acc[modName] = [];
        acc[modName].push(p);
        return acc;
    }, {} as Record<string, Permiso[]>);

    return (
        <Dialog open={!!user} onOpenChange={handleOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-hidden flex flex-col sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Gestionar Permisos Especiales</DialogTitle>
                    <DialogDescription>
                        Asigna o remueve permisos directamente para el usuario: <span className="font-bold text-foreground">{user?.NOMBRE} {user?.APELLIDO} ({user?.USERNAME})</span>.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-hidden mt-2 flex-1">
                    <div className="flex flex-col gap-2 overflow-hidden flex-1">
                        <div className="flex-1 overflow-y-auto pr-2 max-h-[55vh] p-3 border rounded-lg bg-muted/10 space-y-4">
                            {Object.entries(groupedPermisos).map(([modName, modPermisos]) => (
                                <div key={modName} className="space-y-2">
                                    <h4 className="text-xs font-bold text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-1.5 uppercase tracking-wider">
                                        {modName.replace(/_/g, ' ')}
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-1 pb-2">
                                        {modPermisos.map(p => (
                                            <div key={p.ID} className="flex items-start space-x-2.5">
                                                <Checkbox 
                                                    id={`user-permiso-${p.ID}`}
                                                    checked={data.permisos.includes(p.ID)}
                                                    onCheckedChange={(checked) => handlePermisoToggle(p.ID, checked as boolean)}
                                                    className="mt-0.5"
                                                />
                                                <Label 
                                                    htmlFor={`user-permiso-${p.ID}`} 
                                                    className="text-xs leading-normal font-normal cursor-pointer select-none text-neutral-700 dark:text-neutral-300"
                                                >
                                                    {p.NOMBRE.replace(/_/g, ' ')}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {permisos.length === 0 && (
                                <span className="text-sm text-neutral-500 col-span-full">No hay permisos disponibles.</span>
                            )}
                        </div>
                        {errors.permisos && <span className="text-xs text-destructive">{errors.permisos}</span>}
                    </div>

                    <DialogFooter className="mt-4 pt-4 border-t shrink-0">
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancelar</Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Permisos
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
