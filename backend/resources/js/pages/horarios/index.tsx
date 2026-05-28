import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Gestión Académica',
        href: '#',
    },
    {
        title: 'Horarios',
        href: '/horarios',
    },
];

export default function Index({ bloques }: { bloques: any[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Horarios" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Gestión de Bloques de Horario</h1>
                    <Button asChild>
                        <Link href="/horarios/crearHorario">
                            <Plus className="mr-2 h-4 w-4" /> Registrar Bloque
                        </Link>
                    </Button>
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border bg-card text-card-foreground relative flex-1 rounded-xl border shadow-sm">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium w-16">ID</th>
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium w-32">Turno</th>
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Horarios Asignados</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {bloques && bloques.length > 0 ? (
                                    bloques.map((bloque) => (
                                        <tr key={bloque.ID} className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                                            <td className="p-4 align-middle font-medium">{bloque.ID}</td>
                                            <td className="p-4 align-middle font-medium">
                                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                                    {bloque.TURNO}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle text-muted-foreground">
                                                {bloque.horarios_en_bloque && bloque.horarios_en_bloque.length > 0 ? (
                                                    <ul className="list-inside list-disc space-y-1">
                                                        {bloque.horarios_en_bloque.map((hb: any) => (
                                                            <li key={hb.ID} className="text-sm">
                                                                <span className="font-medium text-foreground">{hb.horario?.DIA}:</span> {hb.horario?.HORA_INI} - {hb.horario?.HORA_FIN}
                                                                <span className="ml-2 text-xs text-muted-foreground">(Carga: {hb.CARGA_HORARIA} hrs)</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <span className="italic">Sin horarios asignados</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="text-muted-foreground p-4 text-center align-middle">
                                            No hay bloques de horario registrados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
