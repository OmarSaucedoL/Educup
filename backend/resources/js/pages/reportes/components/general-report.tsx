import { useState, useMemo } from 'react';
import { FileSpreadsheet, Printer, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    fecha_inscripcion: string;
}

interface CareerStats {
    carrera_nombre: string;
    total_postulantes: number;
    opcion_1_postulantes: number;
    opcion_2_postulantes: number;
}

interface GeneralReportProps {
    estudiantes: StudentReportData[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    cup: {
        ID_CUP: number;
        ANIO: string;
        SEMESTRE: number;
        ESTADO: string;
    } | null;
    estadisticasCarreras?: CareerStats[];
}

export default function GeneralReport({ estudiantes, searchQuery, setSearchQuery, cup, estadisticasCarreras = [] }: GeneralReportProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    // Filter students by query
    const filteredEstudiantes = useMemo(() => {
        let list = [...estudiantes];
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            list = list.filter(e => 
                String(e.carnet).toLowerCase().includes(query) ||
                e.nombre_completo.toLowerCase().includes(query) ||
                (e.correo && e.correo.toLowerCase().includes(query)) ||
                (e.colegio && e.colegio.toLowerCase().includes(query)) ||
                (e.ciudad && e.ciudad.toLowerCase().includes(query))
            );
        }
        return list;
    }, [estudiantes, searchQuery]);

    // Paginate students
    const totalPages = Math.ceil(filteredEstudiantes.length / itemsPerPage);
    const paginatedEstudiantes = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredEstudiantes.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredEstudiantes, currentPage]);

    // CSV local export
    const exportToCSV = () => {
        let csvContent = "\uFEFF"; // UTF-8 BOM

        // 1. Resumen de Postulaciones por Carrera
        csvContent += `"RESUMEN DE POSTULACIONES POR CARRERA"\r\n`;
        csvContent += `"Carrera";"Postulaciones (Cualquier Opción)";"Preferencia 1ª Opción";"Preferencia 2ª Opción"\r\n`;
        
        estadisticasCarreras.forEach((stat) => {
            csvContent += `"${stat.carrera_nombre}";"${stat.total_postulantes}";"${stat.opcion_1_postulantes}";"${stat.opcion_2_postulantes}"\r\n`;
        });
        
        csvContent += "\r\n"; // Línea en blanco

        // 2. Detalle General de Postulantes
        csvContent += `"DETALLE DE POSTULANTES"\r\n`;
        const headers = [
            "Carnet (CI)", 
            "Postulante", 
            "Correo Electrónico", 
            "Teléfono", 
            "Colegio de Origen", 
            "Ciudad de Procedencia", 
            "Carrera Opción 1", 
            "Carrera Opción 2", 
            "Fecha Inscripción"
        ];
        
        csvContent += headers.map(h => `"${h}"`).join(";") + "\r\n";

        filteredEstudiantes.forEach((e) => {
            const row = [
                e.carnet,
                e.nombre_completo,
                e.correo || 'No especificado',
                e.telefono || 'No especificado',
                e.colegio,
                e.ciudad,
                e.opcion_1,
                e.opcion_2,
                e.fecha_inscripcion
            ];
            csvContent += row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(";") + "\r\n";
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `reporte_lista_general_cup_${cup?.ANIO ?? 'sin'}_${cup?.SEMESTRE ?? 'semestre'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col gap-4">
            
            {/* Control Panel (Search and Exports) */}
            <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
                <div className="relative max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Buscar por carnet, nombre, correo, colegio..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-4 py-2 text-sm text-neutral-900 shadow-xs transition focus:border-neutral-900 focus:outline-hidden dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                    />
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={exportToCSV}
                        className="flex items-center gap-1.5 h-9 font-semibold text-xs border-neutral-200 hover:bg-neutral-50 text-neutral-700 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
                    >
                        <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                        Exportar Excel (CSV)
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.print()}
                        className="flex items-center gap-1.5 h-9 font-semibold text-xs border-neutral-200 hover:bg-neutral-50 text-neutral-700 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
                    >
                        <Printer className="h-4 w-4 text-slate-600" />
                        Imprimir / PDF
                    </Button>
                </div>
            </div>

            {/* Tabla de Estadísticas de Postulantes por Carrera */}
            {estadisticasCarreras.length > 0 && (
                <div className="mb-6 flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                            Resumen de Postulaciones por Carrera
                        </h4>
                        <div className="text-sm font-semibold text-neutral-550 dark:text-neutral-400">
                            Postulantes Totales en CUP: <span className="font-extrabold text-neutral-900 dark:text-neutral-100">{estudiantes.length}</span>
                        </div>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-200 bg-neutral-50/50 text-left text-xs font-bold tracking-wider text-neutral-500 uppercase dark:border-neutral-800 dark:bg-neutral-950/20">
                                        <th className="p-4 font-bold">Carrera</th>
                                        <th className="p-4 text-center font-bold w-[220px]">Postulaciones (Cualquier Opción)</th>
                                        <th className="p-4 text-center font-bold w-[200px]">Preferencia 1ª Opción</th>
                                        <th className="p-4 text-center font-bold w-[200px]">Preferencia 2ª Opción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                                    {estadisticasCarreras.map((stat) => (
                                        <tr key={stat.carrera_nombre} className="hover:bg-neutral-50/40 dark:hover:bg-neutral-950/20 transition-colors">
                                            <td className="p-4 font-bold text-neutral-900 dark:text-neutral-100">
                                                {stat.carrera_nombre}
                                            </td>
                                            <td className="p-4 text-center font-semibold text-neutral-700 dark:text-neutral-300">
                                                {stat.total_postulantes}
                                            </td>
                                            <td className="p-4 text-center font-semibold text-neutral-700 dark:text-neutral-300">
                                                {stat.opcion_1_postulantes}
                                            </td>
                                            <td className="p-4 text-center font-semibold text-neutral-700 dark:text-neutral-300">
                                                {stat.opcion_2_postulantes}
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
            <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20 text-neutral-500 font-bold text-xs uppercase tracking-wider text-left">
                                <th className="p-4 w-[120px] font-bold">Carnet (CI)</th>
                                <th className="p-4 font-bold">Postulante</th>
                                <th className="p-4 font-bold">Contacto</th>
                                <th className="p-4 font-bold">Procedencia</th>
                                <th className="p-4 font-bold">Carrera Opción 1</th>
                                <th className="p-4 font-bold">Carrera Opción 2</th>
                                <th className="p-4 w-[140px] text-center font-bold">Fecha Insc.</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                            {paginatedEstudiantes.length > 0 ? (
                                paginatedEstudiantes.map((student) => (
                                    <tr key={student.id} className="hover:bg-neutral-50/40 dark:hover:bg-neutral-950/20 transition-colors">
                                        <td className="p-4 font-semibold text-neutral-900 dark:text-neutral-200">
                                            {student.carnet}
                                        </td>
                                        <td className="p-4 font-bold text-neutral-900 dark:text-neutral-100">
                                            {student.nombre_completo}
                                        </td>
                                        <td className="p-4">
                                            <div className="text-xs text-neutral-800 dark:text-neutral-200 font-medium">{student.correo || 'Sin correo'}</div>
                                            <div className="text-[10px] text-neutral-450 dark:text-neutral-500">Telf: {student.telefono || 'S/N'}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">{student.colegio}</div>
                                            <div className="text-[10px] text-neutral-450 dark:text-neutral-500">{student.ciudad}</div>
                                        </td>
                                        <td className="p-4 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                                            {student.opcion_1}
                                        </td>
                                        <td className="p-4 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                                            {student.opcion_2}
                                        </td>
                                        <td className="p-4 text-center text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                            {student.fecha_inscripcion}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-neutral-500 dark:text-neutral-400">
                                        No se encontraron postulantes registrados.
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
                        Mostrando postulantes <strong>{((currentPage - 1) * itemsPerPage) + 1}</strong> al{' '}
                        <strong>{Math.min(currentPage * itemsPerPage, filteredEstudiantes.length)}</strong> de{' '}
                        <strong>{filteredEstudiantes.length}</strong>
                    </span>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                            if (totalPages > 5 && Math.abs(p - currentPage) > 1 && p !== 1 && p !== totalPages) {
                                if (p === 2 || p === totalPages - 1) {
                                    return <span key={p} className="text-neutral-450 px-1">...</span>;
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
                                        currentPage === p 
                                            ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900' 
                                            : ''
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
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
