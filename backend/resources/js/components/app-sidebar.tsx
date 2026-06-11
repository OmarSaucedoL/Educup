
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, BookMarked, Folder, GraduationCap, LayoutGrid, Shield } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Módulo Academico',
        url: '#',
        icon: GraduationCap,
        items: [
            {
                title: 'CUP',
                url: '/cup',
            },
            {
                title: 'Docentes',
                url: '/docentes',
            },
            {
                title: 'Estudiantes',
                url: '/estudiantes',
            },
            {
                title: 'Grupos',
                url: '/clases',
            },
            {
                title: 'Reportes Académicos',
                url: '/reportes-academicos',
            },
        ],
    },
    {
        title: 'Módulo Calificaciones',
        url: '#',
        icon: BookMarked,
        items: [
            {
                title: 'Registrar Calificaciones',
                url: '/notas/clases',
            },
            {
                title: 'Reportes',
                url: '/reportes',
            },
        ],
    },
    {
        title: 'Módulo Infraestructura',
        url: '#',
        icon: Folder,
        items: [
            {
                title: 'Materias',
                url: '/materias',
            },
            {
                title: 'Horarios',
                url: '/horarios',
            },
            {
                title: 'Aulas',
                url: '/aulas',
            },
        ],
    },
    {
        title: 'Modulo Administrativo',
        url: '#',
        icon: Shield,
        items: [
            {
                title: 'Roles y Permisos',
                url: '/roles',
            },
            {
                title: 'Usuarios',
                url: '/usuarios',
            },
            {
                title: 'Bitácora',
                url: '/bitacora',
            },
        ],
    },
];



export function AppSidebar() {
    const { auth } = usePage<any>().props;
    const rolNombre = auth.user?.rol?.NOMBRE?.toUpperCase() || '';

    let itemsToRender = mainNavItems;

    if (rolNombre === 'ESTUDIANTE') {
        itemsToRender = [
            {
                title: 'Mis clases',
                url: '#', // TODO: Update with real URL later
                icon: BookOpen,
            }
        ];
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={itemsToRender} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
