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

interface ApprovedStats {
    carrera_nombre: string;
    ingresados_opcion_1: number;
    ingresados_opcion_2: number;
    aprobado_sin_cupo: number;
    cupos_sobrantes: number;
}

interface AprobadosReportProps {
    postulantesAprobados: StudentReportData[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    cup: {
        ID_CUP: number;
        ANIO: string;
        SEMESTRE: number;
        ESTADO: string;
    } | null;
    distribucionAprobados?: ApprovedStats[];
}

export default function AprobadosReport({
    postulantesAprobados = [],
    searchQuery,
    setSearchQuery,
    cup,
    distribucionAprobados = [],
}: AprobadosReportProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    // Filter students: search query
    const filteredEstudiantes = useMemo(() => {
        let list = [...postulantesAprobados];
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
    }, [postulantesAprobados, searchQuery]);

    // Paginate
    const totalPages = Math.ceil(filteredEstudiantes.length / itemsPerPage);
    const paginatedEstudiantes = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredEstudiantes.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredEstudiantes, currentPage]);

    // CSV local export
    const exportToCSV = () => {
        let csvContent = '\uFEFF'; // UTF-8 BOM

        // 1. Resumen de Distribución de Cupos
        csvContent += `"RESUMEN DE DISTRIBUCIÓN DE CUPOS (POSTULANTES APROBADOS)"\r\n`;
        csvContent += `"Carrera";"Ingresados (1ª Opción)";"Ingresados (2ª Opción)";"Aprobados sin Cupo";"Cupos Libres"\r\n`;

        distribucionAprobados.forEach((item) => {
            csvContent += `"${item.carrera_nombre}";"${item.ingresados_opcion_1}";"${item.ingresados_opcion_2}";"${item.aprobado_sin_cupo}";"${item.cupos_sobrantes}"\r\n`;
        });

        csvContent += '\r\n'; // Línea en blanco

        // 2. Detalle de Postulantes Aprobados
        csvContent += `"DETALLE DE POSTULANTES APROBADOS"\r\n`;
        const headers = [
            'Carnet (CI)',
            'Postulante',
            'Colegio de Origen',
            'Ciudad de Procedencia',
            'Carrera Opción 1',
            'Carrera Opción 2',
            'Promedio Final',
            'Carrera Asignada',
            'Preferencia Asignada',
        ];

        csvContent += headers.map((h) => `"${h}"`).join(';') + '\r\n';

        filteredEstudiantes.forEach((e) => {
            const row = [
                e.carnet,
                e.nombre_completo,
                e.colegio,
                e.ciudad,
                e.opcion_1,
                e.opcion_2,
                e.nota_final !== null ? e.nota_final : 'S/N',
                e.carrera_asignada || 'No Asignada',
                e.preferencia_asignada ? `Opción ${e.preferencia_asignada}` : 'Ninguna',
            ];
            csvContent += row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(';') + '\r\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `reporte_aprobados_cup_${cup?.ANIO ?? 'sin'}_${cup?.SEMESTRE ?? 'semestre'}.csv`);
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
                        aria-label="Buscar por carnet, nombre, colegio, carrera"
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

            {/* Tabla de Distribución de Cupos y Aprobados */}
            {distribucionAprobados.length > 0 && (
                <div className="mb-6">
                    <h4 className="mb-2 text-xs font-bold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                        Resumen de Distribución de Cupos (Postulantes Aprobados)
                    </h4>
                    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-200 bg-neutral-50/50 text-left text-xs font-bold tracking-wider text-neutral-500 uppercase dark:border-neutral-800 dark:bg-neutral-950/20">
                                        <th className="p-4 font-bold">Carrera</th>
                                        <th className="w-[180px] p-4 text-center font-bold">
                                            Ingresados <br></br> (1ª Opción)
                                        </th>
                                        <th className="w-[180px] p-4 text-center font-bold">
                                            Ingresados <br></br> (2ª Opción)
                                        </th>
                                        <th className="w-[180px] p-4 text-center font-bold">Aprobados sin Cupo</th>
                                        <th className="w-[150px] p-4 text-center font-bold">Cupos Libres</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                                    {distribucionAprobados.map((item) => (
                                        <tr
                                            key={item.carrera_nombre}
                                            className="transition-colors hover:bg-neutral-50/40 dark:hover:bg-neutral-950/20"
                                        >
                                            <td className="p-4 font-bold text-neutral-900 dark:text-neutral-100">{item.carrera_nombre}</td>
                                            <td className="p-4 text-center font-semibold text-neutral-700 dark:text-neutral-300">
                                                {item.ingresados_opcion_1}
                                            </td>
                                            <td className="p-4 text-center font-semibold text-neutral-700 dark:text-neutral-300">
                                                {item.ingresados_opcion_2}
                                            </td>
                                            <td className="p-4 text-center font-bold">
                                                <span
                                                    className={
                                                        item.aprobado_sin_cupo > 0
                                                            ? 'text-amber-600 dark:text-amber-400'
                                                            : 'text-neutral-500 dark:text-neutral-400'
                                                    }
                                                >
                                                    {item.aprobado_sin_cupo}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                                        item.cupos_sobrantes > 0
                                                            ? 'dark:text-emerald-450 bg-emerald-100/70 text-emerald-700 dark:bg-emerald-900/30'
                                                            : 'dark:text-rose-450 bg-rose-100/70 text-rose-700 dark:bg-rose-900/30'
                                                    }`}
                                                >
                                                    {item.cupos_sobrantes}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-200 bg-neutral-50/50 text-left text-xs font-bold tracking-wider text-neutral-500 uppercase dark:border-neutral-800 dark:bg-neutral-950/20">
                                <th className="w-[120px] p-4 font-bold">Carnet (CI)</th>
                                <th className="p-4 font-bold">Postulante</th>
                                <th className="p-4 font-bold">Opción 1</th>
                                <th className="p-4 font-bold">Opción 2</th>
                                <th className="w-[110px] p-4 text-center font-bold">Prom. Final</th>
                                <th className="p-4 font-bold">Carrera Asignada</th>
                                <th className="p-4 font-bold">Preferencia Asignada</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                            {paginatedEstudiantes.length > 0 ? (
                                paginatedEstudiantes.map((student) => (
                                    <tr key={student.id} className="transition-colors hover:bg-neutral-50/40 dark:hover:bg-neutral-950/20">
                                        <td className="p-4 font-semibold text-neutral-900 dark:text-neutral-200">{student.carnet}</td>
                                        <td className="p-4">
                                            <div className="font-bold text-neutral-900 dark:text-neutral-100">{student.nombre_completo}</div>
                                            <div className="text-neutral-450 text-[10px] dark:text-neutral-500">
                                                {student.colegio} | {student.ciudad}
                                            </div>
                                        </td>
                                        <td className="p-4 text-xs font-semibold text-neutral-600 dark:text-neutral-400">{student.opcion_1}</td>
                                        <td className="p-4 text-xs font-semibold text-neutral-600 dark:text-neutral-400">{student.opcion_2}</td>
                                        <td className="p-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                                            {student.nota_final !== null ? student.nota_final.toFixed(2) : 'S/N'}
                                        </td>
                                        <td className="p-4 font-bold text-neutral-800 uppercase dark:text-neutral-200">
                                            {student.carrera_asignada || 'CUPOS LLENOS'}
                                        </td>
                                        <td className="p-4">
                                            {student.preferencia_asignada ? (
                                                <span className="inline-flex items-center rounded-full bg-blue-100/70 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                    {typeof student.preferencia_asignada === 'number'
                                                        ? `Opción ${student.preferencia_asignada}`
                                                        : student.preferencia_asignada}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-neutral-400 italic">Ninguna</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-neutral-500 dark:text-neutral-400">
                                        No se encontraron postulantes aprobados.
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
                        <strong>{Math.min(currentPage * itemsPerPage, filteredEstudiantes.length)}</strong> de{' '}
                        <strong>{filteredEstudiantes.length}</strong>
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
