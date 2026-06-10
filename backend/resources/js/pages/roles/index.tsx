import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Key, Plus, List, Loader2, Edit } from 'lucide-react';
import { EditRoleModal } from './components/edit-role-modal';

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

interface Rol {
    ID: number;
    NOMBRE: string;
    permisos: Permiso[];
}

const EMPTY_PERMISOS: Permiso[] = [];

export default function RolesIndex({ roles, permisos = EMPTY_PERMISOS }: { roles: Rol[], permisos: Permiso[] }) {
    const [openCreate, setOpenCreate] = useState(false);
    const [editingRole, setEditingRole] = useState<Rol | null>(null);
    
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        nombre: '',
        permisos: [] as number[],
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/roles', {
            onSuccess: () => {
                setOpenCreate(false);
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

    const handleOpenChange = (open: boolean) => {
        setOpenCreate(open);
        if (!open) {
            reset();
            clearErrors();
        }
    };

    const handleEditClick = (rol: Rol) => {
        setEditingRole(rol);
    };

    // Group permissions by module
    const groupedPermisos = permisos.reduce((acc, p) => {
        const modName = p.modulo?.NOMBRE || 'Otros';
        if (!acc[modName]) acc[modName] = [];
        acc[modName].push(p);
        return acc;
    }, {} as Record<string, Permiso[]>);

    return (
        <AppLayout breadcrumbs={[{ title: 'Roles y Permisos', href: '/roles' }]}>
            <Head title="Roles y Permisos" />

            <div className="flex flex-col gap-6 p-6 mx-auto w-full max-w-4xl">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1.5">
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Roles y Permisos</h1>
                        <p className="text-xs text-neutral-500">
                            Visualiza los roles del sistema y gestiona los accesos correspondientes agrupados por módulos.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="gap-2 text-xs font-semibold">
                                    <List className="h-4 w-4" />
                                    Mostrar todos los permisos
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Permisos del Sistema</DialogTitle>
                                    <DialogDescription>
                                        Lista de todos los permisos disponibles agrupados por módulo.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="mt-4 flex flex-col gap-4">
                                    {Object.entries(groupedPermisos).map(([modName, modPermisos]) => (
                                        <div key={modName} className="space-y-2">
                                            <h4 className="text-xs font-bold text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-1.5 uppercase tracking-wider">
                                                {modName.replace(/_/g, ' ')}
                                            </h4>
                                            <div className="flex flex-col gap-2 pl-1">
                                                {modPermisos.map(p => (
                                                    <div key={p.ID} className="flex items-center justify-between rounded-lg border p-2.5 bg-card text-card-foreground">
                                                        <span className="font-medium text-xs">{p.NOMBRE.replace(/_/g, ' ')}</span>
                                                        <Badge variant="secondary" className="text-[10px] font-mono">ID: {p.ID}</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {permisos.length === 0 && (
                                        <p className="text-sm text-muted-foreground text-center py-4">No hay permisos registrados.</p>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={openCreate} onOpenChange={handleOpenChange}>
                            <DialogTrigger asChild>
                                <Button className="gap-2 text-xs font-semibold">
                                    <Plus className="h-4 w-4" />
                                    Crear Rol
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[90vh] overflow-hidden flex flex-col sm:max-w-xl">
                                <DialogHeader>
                                    <DialogTitle>Crear Nuevo Rol</DialogTitle>
                                    <DialogDescription>
                                        Ingresa un nombre para el nuevo rol y selecciona los permisos iniciales.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4 overflow-hidden mt-2 flex-1">
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="nombre">Nombre del Rol</Label>
                                        <Input
                                            id="nombre"
                                            value={data.nombre}
                                            onChange={e => setData('nombre', e.target.value)}
                                            placeholder="Ej: SECRETARIA"
                                            className="uppercase"
                                            autoComplete="off"
                                        />
                                        {errors.nombre && <span className="text-xs text-destructive">{errors.nombre}</span>}
                                    </div>
                                    
                                    <div className="flex flex-col gap-2 overflow-hidden flex-1">
                                        <Label>Permisos del Rol</Label>
                                        <div className="flex-1 overflow-y-auto pr-2 max-h-[40vh] p-3 border rounded-lg bg-muted/10 space-y-4">
                                            {Object.entries(groupedPermisos).map(([modName, modPermisos]) => (
                                                <div key={modName} className="space-y-2">
                                                    <h4 className="text-xs font-bold text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-1.5 uppercase tracking-wider">
                                                        {modName.replace(/_/g, ' ')}
                                                    </h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-1 pb-2">
                                                        {modPermisos.map(p => (
                                                            <div key={p.ID} className="flex items-start space-x-2.5">
                                                                 <Checkbox 
                                                                     id={`permiso-${p.ID}`}
                                                                     checked={data.permisos.includes(p.ID)}
                                                                     onCheckedChange={(checked) => handlePermisoToggle(p.ID, checked as boolean)}
                                                                     className="mt-0.5"
                                                                 />
                                                                 <Label 
                                                                     htmlFor={`permiso-${p.ID}`} 
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
                                            Guardar Rol
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="border border-neutral-200/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md rounded-xl shadow-xs overflow-hidden">
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                        {roles.map((rol) => (
                            <div key={rol.ID} className="flex items-center justify-between p-4 hover:bg-neutral-50/40 dark:hover:bg-neutral-900/40 transition-colors">
                                <div className="flex items-center gap-3.5">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
                                        <Shield className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm text-neutral-850 dark:text-neutral-200">{rol.NOMBRE}</h3>
                                        <p className="text-xs text-neutral-500">
                                            {rol.permisos.length} permisos asignados
                                        </p>
                                    </div>
                                </div>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleEditClick(rol)}
                                    className="gap-1.5 text-xs font-semibold"
                                >
                                    <Edit className="h-3.5 w-3.5" />
                                    Editar
                                </Button>
                            </div>
                        ))}

                        {roles.length === 0 && (
                            <div className="p-12 text-center text-sm text-neutral-500 italic">
                                No hay roles registrados.
                            </div>
                        )}
                    </div>
                </div>

                {editingRole && (
                    <EditRoleModal 
                        role={editingRole} 
                        permisos={permisos} 
                        onClose={() => setEditingRole(null)} 
                    />
                )}
            </div>
        </AppLayout>
    );
}
