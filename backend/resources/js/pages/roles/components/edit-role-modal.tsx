import { useEffect, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface Permiso {
    ID: number;
    NOMBRE: string;
}

interface Rol {
    ID: number;
    NOMBRE: string;
    permisos: Permiso[];
}

interface EditRoleModalProps {
    role: Rol | null;
    permisos: Permiso[];
    onClose: () => void;
}

export function EditRoleModal({ role, permisos, onClose }: EditRoleModalProps) {
    const submitTypeRef = useRef(false);

    const { data, setData, put, processing, errors, reset, clearErrors, transform } = useForm({
        nombre: '',
        permisos: [] as number[],
    });

    transform((data) => ({
        ...data,
        aplicarATodos: submitTypeRef.current,
    }));

    useEffect(() => {
        if (role) {
            setData({
                nombre: role.NOMBRE,
                permisos: role.permisos.map(p => p.ID),
            });
        }
    }, [role]);

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            onClose();
            clearErrors();
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const nativeEvent = e.nativeEvent as SubmitEvent;
        const submitter = nativeEvent.submitter as HTMLButtonElement;
        submitTypeRef.current = submitter?.value === 'aplicar';

        if (!role) return;
        put(`/roles/${role.ID}`, {
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

    return (
        <Dialog open={!!role} onOpenChange={handleOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-hidden flex flex-col sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Modificar Rol</DialogTitle>
                    <DialogDescription>
                        Actualiza el nombre o los permisos del rol.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-hidden mt-2">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="edit-nombre">Nombre del Rol</Label>
                        <Input
                            id="edit-nombre"
                            value={data.nombre}
                            onChange={e => setData('nombre', e.target.value)}
                            className="uppercase"
                            autoComplete="off"
                        />
                        {errors.nombre && <span className="text-xs text-destructive">{errors.nombre}</span>}
                    </div>
                    
                    <div className="flex flex-col gap-2 overflow-hidden">
                        <Label>Permisos del Rol</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-2 max-h-[40vh] p-2 border rounded-md bg-muted/20">
                            {permisos.map(p => (
                                <div key={p.ID} className="flex items-start space-x-3">
                                    <Checkbox 
                                        id={`edit-permiso-${p.ID}`}
                                        checked={data.permisos.includes(p.ID)}
                                        onCheckedChange={(checked) => handlePermisoToggle(p.ID, checked as boolean)}
                                    />
                                    <Label 
                                        htmlFor={`edit-permiso-${p.ID}`} 
                                        className="text-sm leading-none font-normal cursor-pointer select-none"
                                    >
                                        {p.NOMBRE.replace(/_/g, ' ')}
                                    </Label>
                                </div>
                            ))}
                            {permisos.length === 0 && (
                                <span className="text-sm text-muted-foreground col-span-full">No hay permisos disponibles.</span>
                            )}
                        </div>
                        {errors.permisos && <span className="text-xs text-destructive">{errors.permisos}</span>}
                    </div>

                    <DialogFooter className="mt-4 pt-4 border-t flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-between">
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancelar</Button>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button type="submit" name="action" value="guardar" variant="secondary" disabled={processing}>
                                {processing && !submitTypeRef.current && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Guardar Cambios
                            </Button>
                            <Button type="submit" name="action" value="aplicar" disabled={processing}>
                                {processing && submitTypeRef.current && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Aplicar a todos
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
