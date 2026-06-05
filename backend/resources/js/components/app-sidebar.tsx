
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
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
            {
                title: 'Clases',
                url: '/clases',
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
    {
        title: 'Módulo Notas',
        url: '#',
        icon: BookMarked,
        items: [
            {
                title: 'Clases',
                url: '/notas/clases',
            },
        ],
    },
];



export function AppSidebar() {
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
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
