import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Search, Filter } from 'lucide-react';
import { useState, useMemo } from 'react';
import EditarDocenteModal from './EditarDocenteModal';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Gestión Académica',
        href: '#',
    },
    {
        title: 'Docentes',
        href: '/docentes',
    },
];

export default function Index({ docentes }: { docentes: any[] }) {
    const [selectedDocente, setSelectedDocente] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('TODOS');

    const filteredDocentes = useMemo(() => {
        return docentes.filter((docente) => {
            const isActivo = docente.usuario?.ESTADO === 'ACTIVO' || docente.usuario?.ESTADO === 1;
            const estadoActual = isActivo ? 'ACTIVO' : 'INACTIVO';
            
            // Filter by Estado
            if (filterEstado !== 'TODOS' && estadoActual !== filterEstado) {
                return false;
            }
            
            // Filter by Search Term
            if (searchTerm) {
                const search = searchTerm.toLowerCase();
                const nombreCompleto = `${docente.usuario?.NOMBRE || ''} ${docente.usuario?.APELLIDO || ''}`.toLowerCase();
                const carnet = (docente.usuario?.CARNET || '').toString().toLowerCase();
                const username = (docente.usuario?.USERNAME || '').toLowerCase();
                
                if (!nombreCompleto.includes(search) && !carnet.includes(search) && !username.includes(search)) {
                    return false;
                }
            }
            
            return true;
        });
    }, [docentes, searchTerm, filterEstado]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Docentes" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
                    <h1 className="text-2xl font-semibold tracking-tight">Gestión de Docentes</h1>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Buscar docente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-9"
                            />
                        </div>
                        
                        <div className="relative w-full sm:w-auto flex items-center">
                            <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <select
                                value={filterEstado}
                                onChange={(e) => setFilterEstado(e.target.value)}
                                className="flex h-9 w-full sm:w-36 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring pl-9"
                            >
                                <option value="TODOS" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">Todos</option>
                                <option value="ACTIVO" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">Activos</option>
                                <option value="INACTIVO" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">Inactivos</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border bg-card text-card-foreground relative flex-1 rounded-xl border shadow-sm">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Código</th>
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Nombre Completo</th>
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Username</th>
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Carnet</th>
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Correo Electrónico</th>
                                    <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">Estado</th>
                                    <th className="text-muted-foreground h-12 px-4 text-right align-middle font-medium">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {filteredDocentes && filteredDocentes.length > 0 ? (
                                    filteredDocentes.map((docente) => (
                                        <tr
                                            key={docente.CODIGO_DOCENTE}
                                            className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors"
                                        >
                                            <td className="p-4 align-middle font-medium">{docente.CODIGO_DOCENTE}</td>
                                            <td className="p-4 align-middle font-medium">
                                                {docente.usuario ? `${docente.usuario.NOMBRE} ${docente.usuario.APELLIDO}` : 'Desconocido'}
                                            </td>
                                            <td className="text-muted-foreground p-4 align-middle">{docente.usuario?.USERNAME}</td>
                                            <td className="p-4 align-middle">{docente.usuario?.CARNET}</td>
                                            <td className="p-4 align-middle">{docente.usuario?.CORREO}</td>
                                            <td className="p-4 align-middle">
                                                <button
                                                    type="button"
                                                    title="Haz clic para cambiar el estado"
                                                    onClick={() =>
                                                        router.patch(
                                                            `/docentes/${docente.CODIGO_DOCENTE}/toggle-estado`,
                                                            {},
                                                            { preserveScroll: true },
                                                        )
                                                    }
                                                    className={`inline-flex cursor-pointer items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all hover:opacity-80 active:scale-95 ${
                                                        docente.usuario?.ESTADO === 'ACTIVO' || docente.usuario?.ESTADO === 1
                                                            ? 'border-green-200 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'border-red-200 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}
                                                >
                                                    {docente.usuario?.ESTADO === 'ACTIVO' || docente.usuario?.ESTADO === 1 ? 'Activo' : 'Inactivo'}
                                                </button>
                                            </td>
                                            <td className="p-4 text-right align-middle">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedDocente(docente);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="h-8 gap-1.5 border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                                >
                                                    <Edit className="h-3.5 w-3.5 text-primary" />
                                                    Detalles
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="text-muted-foreground p-4 text-center align-middle">
                                            No se encontraron docentes con esos filtros.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal de Información de Docente - Componente Separado */}
            <EditarDocenteModal open={isModalOpen} onOpenChange={setIsModalOpen} selectedDocente={selectedDocente} />
        </AppLayout>
    );
}
