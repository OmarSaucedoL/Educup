import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { GraduationCap } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard Estudiante',
        href: '/dashboard',
    },
];

export default function DashboardEstudiante() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard - Estudiante" />
            
            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-3">
                            <GraduationCap className="h-8 w-8 text-primary" />
                            Panel del Estudiante
                        </h1>
                        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                            Bienvenido a tu panel principal. Desde aquí podrás acceder a tus clases y ver tu progreso en el Curso Universitario de Preparación.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
                    {/* Tarjeta de estado (vacia por el momento) */}
                    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm">
                        <h3 className="font-semibold text-lg mb-2">Resumen Académico</h3>
                        <p className="text-sm text-neutral-500">
                            Aún no hay información disponible. Una vez que se te asignen grupos y comiencen las clases, verás tu progreso aquí.
                        </p>
                    </div>

                    {/* Más tarjetas vacías para mantener el diseño responsivo */}
                    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm opacity-50">
                        <h3 className="font-semibold text-lg mb-2">Próximas Evaluaciones</h3>
                        <p className="text-sm text-neutral-500">
                            No tienes evaluaciones programadas próximamente.
                        </p>
                    </div>

                    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm opacity-50 md:col-span-2 lg:col-span-1">
                        <h3 className="font-semibold text-lg mb-2">Avisos Recientes</h3>
                        <p className="text-sm text-neutral-500">
                            No tienes notificaciones nuevas.
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
