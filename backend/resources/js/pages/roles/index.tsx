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

interface Permiso {
    ID: number;
    NOMBRE: string;
}

interface Rol {
    ID: number;
    NOMBRE: string;
    permisos: Permiso[];
}

export default function RolesIndex({ roles, permisos = [] }: { roles: Rol[], permisos: Permiso[] }) {
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

    return (
        <AppLayout breadcrumbs={[{ title: 'Roles y Permisos', href: '/roles' }]}>
            <Head title="Roles y Permisos" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Roles y Permisos</h1>
                        <p className="text-muted-foreground">
                            Visualiza los roles del sistema y los permisos predeterminados asignados a cada uno.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    <List className="h-4 w-4" />
                                    Mostrar todos los permisos
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Permisos del Sistema</DialogTitle>
                                    <DialogDescription>
                                        Lista de todos los permisos disponibles en la base de datos.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="mt-4 flex flex-col gap-3">
                                    {permisos.length > 0 ? (
                                        permisos.map((p) => (
                                            <div key={p.ID} className="flex items-center justify-between rounded-md border p-3">
                                                <span className="font-medium text-sm">{p.NOMBRE.replace(/_/g, ' ')}</span>
                                                <Badge variant="secondary" className="text-xs">ID: {p.ID}</Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-4">No hay permisos registrados.</p>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={openCreate} onOpenChange={handleOpenChange}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
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
                                <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4 overflow-hidden mt-2">
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
                                    
                                    <div className="flex flex-col gap-2 overflow-hidden">
                                        <Label>Permisos del Rol</Label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-2 max-h-[40vh] p-2 border rounded-md bg-muted/20">
                                            {permisos.map(p => (
                                                <div key={p.ID} className="flex items-start space-x-3">
                                                    <Checkbox 
                                                        id={`permiso-${p.ID}`}
                                                        checked={data.permisos.includes(p.ID)}
                                                        onCheckedChange={(checked) => handlePermisoToggle(p.ID, checked as boolean)}
                                                    />
                                                    <Label 
                                                        htmlFor={`permiso-${p.ID}`} 
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

                                    <DialogFooter className="mt-4 pt-4 border-t">
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

                <div className="grid gap-6 md:grid-cols-2">
                    {roles.map((rol) => (
                        <Card key={rol.ID} className="overflow-hidden transition-all duration-200 hover:shadow-md">
                            <CardHeader className="bg-muted/50 pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                            <Shield className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl">{rol.NOMBRE}</CardTitle>
                                            <CardDescription>
                                                {rol.permisos.length} permisos asignados
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(rol)} title="Modificar rol">
                                        <Edit className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="flex flex-col gap-3">
                                    <h4 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                        <Key className="h-4 w-4" />
                                        Permisos Predeterminados
                                    </h4>
                                    
                                    {rol.permisos.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {rol.permisos.map((permiso) => (
                                                <Badge 
                                                    key={permiso.ID} 
                                                    variant="secondary"
                                                    className="bg-secondary/50 text-secondary-foreground hover:bg-secondary/80 font-medium px-3 py-1"
                                                >
                                                    {permiso.NOMBRE.replace(/_/g, ' ')}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                                            Este rol no tiene permisos asignados por defecto.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {roles.length === 0 && (
                        <div className="col-span-full rounded-lg border border-dashed p-12 text-center">
                            <h3 className="mb-1 text-lg font-semibold">No hay roles registrados</h3>
                            <p className="text-muted-foreground">
                                Asegúrate de correr los seeders de la base de datos.
                            </p>
                        </div>
                    )}
                </div>

                <EditRoleModal 
                    role={editingRole} 
                    permisos={permisos} 
                    onClose={() => setEditingRole(null)} 
                />
            </div>
        </AppLayout>
    );
}
