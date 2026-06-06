import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, GraduationCap, Clock, ClipboardList, CalendarDays, ChevronRight } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

const quickLinks = [
    {
        href: '/notas/clases',
        icon: ClipboardList,
        label: 'Mis Clases y Notas',
        description: 'Gestiona las calificaciones de tus estudiantes.',
        color: 'from-violet-500/10 to-purple-500/10 border-violet-200/50 dark:border-violet-800/50',
        iconColor: 'text-violet-500',
    },
    {
        href: '/materias',
        icon: BookOpen,
        label: 'Materias',
        description: 'Consulta las materias del sistema.',
        color: 'from-blue-500/10 to-sky-500/10 border-blue-200/50 dark:border-blue-800/50',
        iconColor: 'text-blue-500',
    },
    {
        href: '/aulas',
        icon: GraduationCap,
        label: 'Aulas',
        description: 'Revisa las aulas disponibles.',
        color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200/50 dark:border-emerald-800/50',
        iconColor: 'text-emerald-500',
    },
    {
        href: '/horarios',
        icon: CalendarDays,
        label: 'Horarios',
        description: 'Consulta los horarios asignados.',
        color: 'from-amber-500/10 to-orange-500/10 border-amber-200/50 dark:border-amber-800/50',
        iconColor: 'text-amber-500',
    },
];

export default function DashboardDocente() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Docente" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 md:p-6">

                {/* Welcome header */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Panel de Docente</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Bienvenido</h1>
                    <p className="text-muted-foreground">
                        Desde aquí puedes gestionar tus clases, registrar calificaciones y consultar información académica.
                    </p>
                </div>

                {/* Quick access cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {quickLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`group relative flex flex-col gap-3 rounded-xl border bg-gradient-to-br p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${link.color}`}
                            >
                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-background/70 shadow-sm ${link.iconColor}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-sm">{link.label}</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{link.description}</p>
                                </div>
                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                        );
                    })}
                </div>

                {/* Info banner */}
                <div className="rounded-xl border border-violet-200/50 dark:border-violet-800/30 bg-violet-50/50 dark:bg-violet-950/20 p-5">
                    <div className="flex items-start gap-3">
                        <GraduationCap className="h-5 w-5 text-violet-500 mt-0.5 shrink-0" />
                        <div>
                            <h4 className="text-sm font-semibold text-violet-900 dark:text-violet-200">Acceso como Docente</h4>
                            <p className="text-xs text-violet-700 dark:text-violet-400 mt-0.5">
                                Tu acceso está limitado a las secciones académicas correspondientes a tu rol. Si necesitas acceso adicional, contacta al administrador del sistema.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
