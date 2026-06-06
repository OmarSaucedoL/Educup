import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, FileSpreadsheet, Printer, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

interface StudentClassGrade {
    materia: string;
    materia_sigla: string;
    nota_final: number | null;
    estado: string;
}

interface StudentReportData {
    id: number;
    carnet: number | string;
    nombre: string;
    apellido: string;
    nombre_completo: string;
    correo: string | null;
    telefono: string | null;
    colegio: string;
    ciudad: string;
    estado: string;
    nota_final: number | null;
    carrera_asignada: string | null;
    preferencia_asignada: number | string | null;
    opcion_1: string;
    opcion_2: string;
    notas_materias: StudentClassGrade[];
}

interface PromediosReportProps {
    estudiantes: StudentReportData[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    cup: {
        ID_CUP: number;
        ANIO: string;
        SEMESTRE: number;
        ESTADO: string;
        NOTA_MINIMA: string;
    } | null;
}

export default function PromediosReport({ estudiantes, searchQuery, setSearchQuery, cup }: PromediosReportProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    // Filter, sort by grade descending, and search query
    const sortedAndFilteredEstudiantes = useMemo(() => {
        let list = [...estudiantes];

        // Sort by final grade descending
        list.sort((a, b) => (b.nota_final ?? 0) - (a.nota_final ?? 0));

        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            list = list.filter(
                (e) =>
                    String(e.carnet).toLowerCase().includes(query) ||
                    e.nombre_completo.toLowerCase().includes(query) ||
                    (e.colegio && e.colegio.toLowerCase().includes(query)) ||
                    (e.carrera_asignada && e.carrera_asignada.toLowerCase().includes(query)),
            );
        }
        return list;
    }, [estudiantes, searchQuery]);

    // Paginate
    const totalPages = Math.ceil(sortedAndFilteredEstudiantes.length / itemsPerPage);
    const paginatedEstudiantes = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedAndFilteredEstudiantes.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedAndFilteredEstudiantes, currentPage]);

    // CSV local export
    const exportToCSV = () => {
        let csvContent = '\uFEFF'; // UTF-8 BOM
        const headers = ['Puesto', 'Carnet (CI)', 'Postulante', 'Colegio de Origen', 'Promedio Final', 'Estado', 'Carrera Asignada'];

        csvContent += headers.map((h) => `"${h}"`).join(';') + '\r\n';

        sortedAndFilteredEstudiantes.forEach((e, index) => {
            const row = [
                index + 1,
                e.carnet,
                e.nombre_completo,
                e.colegio,
                e.nota_final !== null ? e.nota_final : 'S/N',
                e.estado,
                e.carrera_asignada || 'No Asignada',
            ];
            csvContent += row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(';') + '\r\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `reporte_ranking_promedios_cup_${cup?.ANIO ?? 'sin'}_${cup?.SEMESTRE ?? 'semestre'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Control Panel (Search and Exports) */}
            <div className="no-print mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full max-w-md">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Buscar por carnet, nombre, colegio, carrera..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-neutral-200 bg-white py-2 pr-4 pl-9 text-sm text-neutral-900 shadow-xs transition focus:border-neutral-900 focus:outline-hidden dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                    />
                </div>
                <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={exportToCSV}
                        className="flex h-9 items-center gap-1.5 border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
                    >
                        <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                        Exportar Excel (CSV)
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.print()}
                        className="flex h-9 items-center gap-1.5 border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
                    >
                        <Printer className="h-4 w-4 text-slate-600" />
                        Imprimir / PDF
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-200 bg-neutral-50/50 text-left text-xs font-bold tracking-wider text-neutral-500 uppercase dark:border-neutral-800 dark:bg-neutral-950/20">
                                <th className="w-[80px] p-4 text-center font-bold">Puesto</th>
                                <th className="w-[120px] p-4 font-bold">Carnet (CI)</th>
                                <th className="p-4 font-bold">Postulante</th>
                                <th className="p-4 font-bold">Notas por Materia</th>
                                <th className="w-[110px] p-4 text-center font-bold">Prom. Final</th>
                                <th className="w-[110px] p-4 text-center font-bold">Estado</th>
                                <th className="p-4 font-bold">Asignación</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                            {paginatedEstudiantes.length > 0 ? (
                                paginatedEstudiantes.map((student, idx) => {
                                    const globalIndex = (currentPage - 1) * itemsPerPage + idx;
                                    const isApproved = student.estado === 'APROBADO';
                                    return (
                                        <tr key={student.id} className="transition-colors hover:bg-neutral-50/40 dark:hover:bg-neutral-950/20">
                                            <td className="p-4 text-center font-bold text-neutral-700 dark:text-neutral-300">{globalIndex + 1}</td>
                                            <td className="p-4 font-semibold text-neutral-900 dark:text-neutral-200">{student.carnet}</td>
                                            <td className="p-4">
                                                <div className="font-bold text-neutral-900 dark:text-neutral-100">{student.nombre_completo}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {student.notas_materias.map((nm, nIdx) => (
                                                        <span
                                                            key={nIdx}
                                                            className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-bold ${
                                                                nm.estado === 'APROBADO'
                                                                    ? 'border-emerald-250 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/10 dark:text-emerald-400'
                                                                    : 'border-rose-250 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/10 dark:text-rose-400'
                                                            }`}
                                                            title={nm.materia}
                                                        >
                                                            {nm.materia_sigla || nm.materia}: {nm.nota_final !== null ? nm.nota_final : 'S/N'}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center font-bold">
                                                {student.nota_final !== null ? (
                                                    <span
                                                        className={
                                                            isApproved ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                                                        }
                                                    >
                                                        {student.nota_final.toFixed(2)}
                                                    </span>
                                                ) : (
                                                    <span className="text-neutral-450 dark:text-neutral-500">-</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                {isApproved ? (
                                                    <span className="inline-flex items-center rounded-full bg-emerald-100/70 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                        APROBADO
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-rose-100/70 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                                                        REPROBADO
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {student.carrera_asignada ? (
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-xs font-bold text-neutral-800 uppercase dark:text-neutral-200">
                                                            {student.carrera_asignada}
                                                        </span>
                                                        {student.preferencia_asignada && (
                                                            <span className="text-[10px] font-semibold text-neutral-500">
                                                                Opcion: {student.preferencia_asignada}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-neutral-450 text-xs italic dark:text-neutral-500">No asignada</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-neutral-500 dark:text-neutral-400">
                                        No se encontraron postulantes.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="no-print flex items-center justify-between border-t border-neutral-200 pt-4 dark:border-neutral-800">
                    <span className="text-xs text-neutral-500">
                        Mostrando postulantes <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> al{' '}
                        <strong>{Math.min(currentPage * itemsPerPage, sortedAndFilteredEstudiantes.length)}</strong> de{' '}
                        <strong>{sortedAndFilteredEstudiantes.length}</strong>
                    </span>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                            if (totalPages > 5 && Math.abs(p - currentPage) > 1 && p !== 1 && p !== totalPages) {
                                if (p === 2 || p === totalPages - 1) {
                                    return (
                                        <span key={p} className="text-neutral-450 px-1">
                                            ...
                                        </span>
                                    );
                                }
                                return null;
                            }
                            return (
                                <Button
                                    key={p}
                                    variant={currentPage === p ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setCurrentPage(p)}
                                    className={`h-8 w-8 p-0 text-xs font-bold ${
                                        currentPage === p ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900' : ''
                                    }`}
                                >
                                    {p}
                                </Button>
                            );
                        })}
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
