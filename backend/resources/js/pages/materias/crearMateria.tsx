import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Gestión Académica',
        href: '#',
    },
    {
        title: 'Materias',
        href: '/materias',
    },
    {
        title: 'Registrar',
        href: '/materias/crearMateria',
    },
];

export default function CrearMateria() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Registrar Materia" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-2xl font-semibold tracking-tight">Registrar Nueva Materia</h1>
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex-1 rounded-xl border p-6 bg-card text-card-foreground shadow-sm">
                    {/* Placeholder for the form */}
                    <p className="text-muted-foreground">Formulario de registro de Materia en construcción...</p>
                </div>
            </div>
        </AppLayout>
    );
}
