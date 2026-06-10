import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { AlertCircle, ChevronLeft, ChevronRight, FileSpreadsheet, Filter, Printer, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface MateriaItem {
    id: number;
    nombre: string;
}

interface StudentCriticalData {
    id: number;
    carnet: number;
    nombre_completo: string;
    nota_computacion: number;
    nota_matematica: number;
    nota_ingles: number;
    nota_fisica: number;
    nota_final_promedio: number;
}

interface MateriasStatsProps {
    cup: {
        ID_CUP: number;
        ANIO: string;
        SEMESTRE: number;
        ESTADO: string;
    } | null;
    postulantesCriticos?: StudentCriticalData[];
    materiasSeleccionadas?: number[];
    notaLimite?: number;
    materiasCatalogo?: MateriaItem[];
}

export default function MateriasStats({
    cup,
    postulantesCriticos = [],
    materiasSeleccionadas = [],
    notaLimite = 51,
    materiasCatalogo = [],
}: MateriasStatsProps) {
    // Local state for checkboxes and input
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [limitVal, setLimitVal] = useState<number>(notaLimite);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    // Sync selectedIds with props when page loads or props change
    useEffect(() => {
        setSelectedIds(materiasSeleccionadas);
    }, [materiasSeleccionadas]);

    // Sync limitVal with props
    useEffect(() => {
        setLimitVal(notaLimite);
    }, [notaLimite]);

    // Handle check/uncheck
    const handleToggleMateria = (id: number) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]));
    };

    // Trigger router request
    const handleApplyFilters = () => {
        if (selectedIds.length === 0) {
            alert('Por favor selecciona al menos una materia para filtrar.');
            return;
        }
        setCurrentPage(1);
        router.get(
            '/reportes-academicos',
            {
                cup_id: cup?.ID_CUP,
                materias: selectedIds.join(','),
                nota_limite: limitVal,
            },
            { preserveState: true },
        );
    };

    // Local filtering by search query
    const filteredEstudiantes = useMemo(() => {
        let list = [...postulantesCriticos];
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            list = list.filter((e) => String(e.carnet).includes(query) || e.nombre_completo.toLowerCase().includes(query));
        }
        return list;
    }, [postulantesCriticos, searchQuery]);

    // Paginate
    const totalPages = Math.ceil(filteredEstudiantes.length / itemsPerPage);
    const paginatedEstudiantes = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredEstudiantes.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredEstudiantes, currentPage]);

    // Export Excel (CSV)
    const exportToCSV = () => {
        if (postulantesCriticos.length === 0) return;

        let csvContent = '\uFEFF'; // UTF-8 BOM

        // Names of selected subjects
        const selectedNames = materiasCatalogo.flatMap((m) => (selectedIds.includes(m.id) ? [m.nombre] : [])).join(', ');

        // 1. Cabecera del Reporte de Filtros
        csvContent += `"REPORTE DE POSTULANTES CRÍTICOS (AND)"\r\n`;
        csvContent += `"Filtro Aplicado";"Alumnos reprobados en TODAS las materias seleccionadas simultáneamente"\r\n`;
        csvContent += `"Materias Evaluadas";"${selectedNames}"\r\n`;
        csvContent += `"Calificación Límite";"<= ${notaLimite}"\r\n`;
        csvContent += `"Total Críticos";"${postulantesCriticos.length}"\r\n`;
        csvContent += '\r\n'; // Fila en blanco

        // 2. Detalle de Postulantes
        const headers = ['Carnet (CI)', 'Postulante', 'Computación', 'Matemática', 'Inglés', 'Física', 'Promedio Final'];
        csvContent += headers.map((h) => `"${h}"`).join(';') + '\r\n';

        filteredEstudiantes.forEach((e) => {
            const row = [e.carnet, e.nombre_completo, e.nota_computacion, e.nota_matematica, e.nota_ingles, e.nota_fisica, e.nota_final_promedio];
            csvContent += row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(';') + '\r\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `reporte_criticos_cup_${cup?.ANIO ?? 'sin'}_${cup?.SEMESTRE ?? 'semestre'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Cabecera Principal */}
            <div className="no-print flex flex-col gap-4 border-b border-neutral-200 pb-5 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                    <div className="rounded-md bg-primary/10 p-2">
                        <AlertCircle className="text-primary h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Estadísticas de Materias Críticas</h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Encuentra y exporta listados de estudiantes en riesgo académico según las materias y calificación límite configurada.
                        </p>
                    </div>
                </div>
            </div>

            {/* Panel de Filtros Interactivos (Oculto en Impresión) */}
            <div className="no-print rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50 print:hidden">
                <div className="mb-4 flex items-center gap-2 border-b border-neutral-100 pb-3 dark:border-neutral-800">
                    <Filter className="text-neutral-550 h-4.5 w-4.5 dark:text-neutral-400" />
                    <h3 className="text-sm font-bold tracking-wider text-neutral-800 uppercase dark:text-neutral-200">
                        Configurar Filtros de Postulantes Críticos
                    </h3>
                </div>

                <div className="grid grid-cols-1 items-end gap-6 md:grid-cols-3">
                    {/* Materias Checkboxes */}
                    <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-xs font-bold tracking-tight text-neutral-500 uppercase dark:text-neutral-400">
                            1. Seleccionar Materias Críticas (El alumno debe tener calificación baja en TODAS las elegidas)
                        </label>
                        <div className="mt-1 flex flex-wrap gap-3">
                            {materiasCatalogo.map((m) => {
                                const isChecked = selectedIds.includes(m.id);
                                return (
                                    <button
                                        key={m.id}
                                        onClick={() => handleToggleMateria(m.id)}
                                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-all ${
                                            isChecked
                                                ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900'
                                                : 'dark:hover:bg-neutral-850 border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300'
                                        }`}
                                    >
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${
                                                isChecked ? 'bg-white dark:bg-neutral-900' : 'bg-neutral-350 dark:bg-neutral-600'
                                            }`}
                                        />
                                        {m.nombre}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Nota Limite Input */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="nota-maxima" className="text-xs font-bold tracking-tight text-neutral-500 uppercase dark:text-neutral-400">
                            2. Calificación Máxima
                        </label>
                        <div className="flex gap-2">
                            <input
                                id="nota-maxima"
                                type="number"
                                step="1"
                                min="0"
                                max="100"
                                value={limitVal}
                                onChange={(e) => setLimitVal(Number(e.target.value))}
                                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-xs transition focus:border-neutral-900 focus:outline-hidden dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                            />
                            <Button
                                onClick={handleApplyFilters}
                                className="bg-neutral-900 px-5 font-bold text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
                            >
                                Filtrar
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Si no se han seleccionado filtros */}
            {materiasSeleccionadas.length === 0 ? (
                <div className="dark:border-neutral-850 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-neutral-200 bg-white p-12 text-center dark:bg-neutral-900/20">
                    <AlertCircle className="h-8 w-8 text-neutral-400" />
                    <div>
                        <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">No se han seleccionado materias</h4>
                        <p className="mt-1 max-w-sm text-xs text-neutral-400">
                            Elige una o más materias arriba y define una calificación máxima límite para visualizar la lista de postulantes en riesgo.
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Control Panel de Resultados (Search & Exports) */}
                    <div className="no-print mb-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                aria-label="Buscar postulante por carnet o nombre"
                                placeholder="Buscar postulante por carnet o nombre..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-lg border border-neutral-200 bg-white py-2 pr-4 pl-9 text-sm text-neutral-900 shadow-xs transition focus:border-neutral-900 focus:outline-hidden dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                            />
                        </div>
                        <div className="flex shrink-0 flex-wrap items-center gap-2 self-end sm:self-auto">
                            <Button
                                variant="outline"
                                onClick={() => window.print()}
                                disabled={postulantesCriticos.length === 0}
                                className="gap-2 text-sm font-semibold bg-white dark:bg-neutral-950"
                            >
                                <Printer className="h-4 w-4" />
                                Imprimir / PDF
                            </Button>
                            <Button
                                variant="outline"
                                onClick={exportToCSV}
                                disabled={postulantesCriticos.length === 0}
                                className="gap-2 text-sm font-semibold bg-white dark:bg-neutral-950"
                            >
                                <FileSpreadsheet className="h-4 w-4" />
                                Exportar Excel
                            </Button>
                        </div>
                    </div>

                    {/* Resumen del Filtro Aplicado (Visible en Impresión) */}
                    <div className="mb-4 hidden rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-xs print:block">
                        <div className="grid grid-cols-2 gap-2 text-neutral-800">
                            <div>
                                <strong>Filtro Lógico:</strong> Alumnos reprobados simultáneamente
                            </div>
                            <div>
                                <strong>Calificación Máxima Evaluada:</strong> &lt;= {notaLimite}
                            </div>
                            <div className="col-span-2">
                                <strong>Materias Filtro:</strong>{' '}
                                {materiasCatalogo.flatMap((m) => (materiasSeleccionadas.includes(m.id) ? [m.nombre] : [])).join(', ')}
                            </div>
                            <div>
                                <strong>Total Estudiantes Encontrados:</strong> {postulantesCriticos.length}
                            </div>
                        </div>
                    </div>

                    {/* Tabla de Resultados (Solo Pantalla) */}
                    <div className="no-print overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-200 bg-neutral-50/50 text-left text-xs font-bold tracking-wider text-neutral-500 uppercase dark:border-neutral-800 dark:bg-neutral-950/20">
                                        <th className="w-[120px] p-4 font-bold">Carnet (CI)</th>
                                        <th className="p-4 font-bold">Postulante</th>
                                        {/* Columnas fijas de materias */}
                                        <th className="w-[130px] p-4 text-center font-bold">Computación</th>
                                        <th className="w-[130px] p-4 text-center font-bold">Matemática</th>
                                        <th className="w-[130px] p-4 text-center font-bold">Inglés</th>
                                        <th className="w-[130px] p-4 text-center font-bold">Física</th>
                                        <th className="w-[110px] p-4 text-center font-bold">Prom. Final</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                                    {paginatedEstudiantes.length > 0 ? (
                                        paginatedEstudiantes.map((student) => (
                                            <tr key={student.id} className="transition-colors hover:bg-neutral-50/40 dark:hover:bg-neutral-950/20">
                                                <td className="p-4 font-semibold text-neutral-900 dark:text-neutral-200">{student.carnet}</td>
                                                <td className="p-4 font-bold text-neutral-900 dark:text-neutral-100">{student.nombre_completo}</td>

                                                {/* Celda Computación */}
                                                <td className="p-4 text-center">
                                                    <span
                                                        className={`font-bold ${
                                                            materiasSeleccionadas.includes(1) && student.nota_computacion <= notaLimite
                                                                ? 'font-extrabold text-rose-600 dark:text-rose-400'
                                                                : 'font-medium text-neutral-600 dark:text-neutral-400'
                                                        }`}
                                                    >
                                                        {student.nota_computacion.toFixed(2)}
                                                    </span>
                                                </td>

                                                {/* Celda Matemática */}
                                                <td className="p-4 text-center">
                                                    <span
                                                        className={`font-bold ${
                                                            materiasSeleccionadas.includes(2) && student.nota_matematica <= notaLimite
                                                                ? 'font-extrabold text-rose-600 dark:text-rose-400'
                                                                : 'font-medium text-neutral-600 dark:text-neutral-400'
                                                        }`}
                                                    >
                                                        {student.nota_matematica.toFixed(2)}
                                                    </span>
                                                </td>

                                                {/* Celda Inglés */}
                                                <td className="p-4 text-center">
                                                    <span
                                                        className={`font-bold ${
                                                            materiasSeleccionadas.includes(3) && student.nota_ingles <= notaLimite
                                                                ? 'font-extrabold text-rose-600 dark:text-rose-400'
                                                                : 'font-medium text-neutral-600 dark:text-neutral-400'
                                                        }`}
                                                    >
                                                        {student.nota_ingles.toFixed(2)}
                                                    </span>
                                                </td>

                                                {/* Celda Física */}
                                                <td className="p-4 text-center">
                                                    <span
                                                        className={`font-bold ${
                                                            materiasSeleccionadas.includes(4) && student.nota_fisica <= notaLimite
                                                                ? 'font-extrabold text-rose-600 dark:text-rose-400'
                                                                : 'font-medium text-neutral-600 dark:text-neutral-400'
                                                        }`}
                                                    >
                                                        {student.nota_fisica.toFixed(2)}
                                                    </span>
                                                </td>

                                                {/* Promedio Final */}
                                                <td className="p-4 text-center font-bold text-neutral-800 dark:text-neutral-200">
                                                    {student.nota_final_promedio.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-neutral-500 dark:text-neutral-400">
                                                No se encontraron estudiantes críticos que cumplan las condiciones.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Tabla de Resultados (Solo Impresión) */}
                    <div className="hidden overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs print:block">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-200 bg-neutral-50/50 text-left text-xs font-bold tracking-wider text-neutral-500 uppercase">
                                        <th className="w-[120px] p-4 font-bold">Carnet (CI)</th>
                                        <th className="p-4 font-bold">Postulante</th>
                                        {/* Columnas de materias */}
                                        <th className="w-[130px] p-4 text-center font-bold">Computación</th>
                                        <th className="w-[130px] p-4 text-center font-bold">Matemática</th>
                                        <th className="w-[130px] p-4 text-center font-bold">Inglés</th>
                                        <th className="w-[130px] p-4 text-center font-bold">Física</th>
                                        <th className="w-[110px] p-4 text-center font-bold">Prom. Final</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {filteredEstudiantes.length > 0 ? (
                                        filteredEstudiantes.map((student) => (
                                            <tr key={student.id}>
                                                <td className="p-4 font-semibold text-neutral-900">{student.carnet}</td>
                                                <td className="p-4 font-bold text-neutral-900">{student.nombre_completo}</td>

                                                {/* Computación */}
                                                <td className="p-4 text-center">
                                                    <span
                                                        className={`font-bold ${
                                                            materiasSeleccionadas.includes(1) && student.nota_computacion <= notaLimite
                                                                ? 'font-extrabold text-rose-600'
                                                                : 'font-medium text-neutral-600'
                                                        }`}
                                                    >
                                                        {student.nota_computacion.toFixed(2)}
                                                    </span>
                                                </td>

                                                {/* Matemática */}
                                                <td className="p-4 text-center">
                                                    <span
                                                        className={`font-bold ${
                                                            materiasSeleccionadas.includes(2) && student.nota_matematica <= notaLimite
                                                                ? 'font-extrabold text-rose-600'
                                                                : 'font-medium text-neutral-600'
                                                        }`}
                                                    >
                                                        {student.nota_matematica.toFixed(2)}
                                                    </span>
                                                </td>

                                                {/* Inglés */}
                                                <td className="p-4 text-center">
                                                    <span
                                                        className={`font-bold ${
                                                            materiasSeleccionadas.includes(3) && student.nota_ingles <= notaLimite
                                                                ? 'font-extrabold text-rose-600'
                                                                : 'font-medium text-neutral-600'
                                                        }`}
                                                    >
                                                        {student.nota_ingles.toFixed(2)}
                                                    </span>
                                                </td>

                                                {/* Física */}
                                                <td className="p-4 text-center">
                                                    <span
                                                        className={`font-bold ${
                                                            materiasSeleccionadas.includes(4) && student.nota_fisica <= notaLimite
                                                                ? 'font-extrabold text-rose-600'
                                                                : 'font-medium text-neutral-600'
                                                        }`}
                                                    >
                                                        {student.nota_fisica.toFixed(2)}
                                                    </span>
                                                </td>

                                                {/* Promedio */}
                                                <td className="p-4 text-center font-bold text-neutral-800">
                                                    {student.nota_final_promedio.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-neutral-500">
                                                No se encontraron estudiantes críticos que cumplan las condiciones.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="no-print flex items-center justify-between border-t border-neutral-200 pt-4 dark:border-neutral-800 print:hidden">
                            <span className="text-xs text-neutral-500">
                                Mostrando estudiantes <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> al{' '}
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
                                                currentPage === p ? 'bg-neutral-850 text-white dark:bg-neutral-200 dark:text-neutral-900' : ''
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
                </>
            )}
        </div>
    );
}
