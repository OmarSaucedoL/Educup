import { Button } from '@/components/ui/button';
import { Download, Printer, UserCheck } from 'lucide-react';
import { useState } from 'react';

interface DocenteReporteData {
    codigo_docente: number;
    nombre_docente: string;
    clases_dadas: number;
    grupos_asignados: number;
    materias_dadas: string;
    total_estudiantes: number;
    total_aprobados: number;
    total_reprobados: number;
    promedio_por_materia: string;
}

interface EstadisticaDocenteProps {
    cup: {
        ID_CUP: number;
        ANIO: string;
        SEMESTRE: number;
        ESTADO: string;
    } | null;
    docentesReporte?: DocenteReporteData[];
    onRunReport?: () => void;
    reportExecuted?: boolean;
}

export default function EstadisticaDocente({ cup, docentesReporte = [], onRunReport, reportExecuted = false }: EstadisticaDocenteProps) {
    const [isPrinting, setIsPrinting] = useState(false);

    const handlePrint = () => {
        setIsPrinting(true);
        window.print();
        setTimeout(() => setIsPrinting(false), 1000);
    };

    const exportToCSV = () => {
        if (docentesReporte.length === 0) return;

        const headers = ['Docente', 'Clases', 'Grupos', 'Materias', 'Total Estudiantes', 'Aprobados', 'Reprobados', 'Promedio por Materia'];
        const rows = docentesReporte.map((docente) => [
            docente.nombre_docente,
            docente.clases_dadas,
            docente.grupos_asignados,
            docente.materias_dadas,
            docente.total_estudiantes,
            docente.total_aprobados,
            docente.total_reprobados,
            docente.promedio_por_materia,
        ]);

        const BOM = '\uFEFF';
        const headerRow = headers.join(';');
        const csvContent = rows.map((row) => row.join(';')).join('\n');
        const csv = BOM + headerRow + '\n' + csvContent;

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `reporte-docentes-cup-${cup?.ID_CUP}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <UserCheck className="text-primary h-4 w-4" />
                    <div>
                        <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">Estadísticas Docente — CUP #{cup?.ID_CUP}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            Genera métricas generales del desempeño docente para el CUP seleccionado.
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button onClick={onRunReport} variant="default" className="gap-2 text-sm font-semibold">
                        Reporte general docente
                    </Button>
                    <Button onClick={handlePrint} disabled={isPrinting} variant="outline" className="gap-2 text-sm font-semibold">
                        <Printer className="h-4 w-4" />
                        Imprimir / PDF
                    </Button>
                    <Button onClick={exportToCSV} disabled={docentesReporte.length === 0} variant="outline" className="gap-2 text-sm font-semibold">
                        <Download className="h-4 w-4" />
                        Exportar CSV
                    </Button>
                </div>
            </div>

            {docentesReporte.length > 0 && reportExecuted ? (
                <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white/70 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/40">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900/60">
                                <th className="px-4 py-3 text-left font-semibold text-neutral-900 dark:text-neutral-100">Docente</th>
                                <th className="px-4 py-3 text-center font-semibold text-neutral-900 dark:text-neutral-100">Clases</th>
                                <th className="px-4 py-3 text-center font-semibold text-neutral-900 dark:text-neutral-100">Grupos</th>
                                <th className="px-4 py-3 text-left font-semibold text-neutral-900 dark:text-neutral-100">Materias</th>
                                <th className="px-4 py-3 text-center font-semibold text-neutral-900 dark:text-neutral-100">Total Est.</th>
                                <th className="px-4 py-3 text-center font-semibold text-neutral-900 dark:text-neutral-100">Aprobados</th>
                                <th className="px-4 py-3 text-center font-semibold text-neutral-900 dark:text-neutral-100">Reprobados</th>
                                <th className="px-4 py-3 text-left font-semibold text-neutral-900 dark:text-neutral-100">Promedio por Materia</th>
                            </tr>
                        </thead>
                        <tbody>
                            {docentesReporte.map((docente, idx) => (
                                <tr
                                    key={idx}
                                    className={`border-b border-neutral-200 dark:border-neutral-700 ${
                                        idx % 2 === 0 ? 'bg-neutral-50 dark:bg-neutral-900/20' : 'bg-white dark:bg-neutral-900/40'
                                    } transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800`}
                                >
                                    <td className="px-4 py-3 text-neutral-900 dark:text-neutral-100">{docente.nombre_docente}</td>
                                    <td className="px-4 py-3 text-center text-neutral-700 dark:text-neutral-300">{docente.clases_dadas}</td>
                                    <td className="px-4 py-3 text-center text-neutral-700 dark:text-neutral-300">{docente.grupos_asignados}</td>
                                    <td className="px-4 py-3 text-xs text-neutral-700 dark:text-neutral-300">{docente.materias_dadas}</td>
                                    <td className="px-4 py-3 text-center text-neutral-700 dark:text-neutral-300">{docente.total_estudiantes}</td>
                                    <td className="px-4 py-3 text-center font-semibold text-green-600 dark:text-green-400">
                                        {docente.total_aprobados}
                                    </td>
                                    <td className="px-4 py-3 text-center font-semibold text-red-600 dark:text-red-400">{docente.total_reprobados}</td>
                                    <td className="px-4 py-3 text-xs text-neutral-700 dark:text-neutral-300">{docente.promedio_por_materia}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="rounded-xl border border-neutral-200 bg-white/70 p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/40">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Reporte general docente</p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Presiona el botón para generar los datos de análisis docente.
                                </p>
                            </div>
                            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                                {reportExecuted && docentesReporte.length === 0 ? 'Sin resultados' : 'Esperando ejecución'}
                            </span>
                        </div>

                        {reportExecuted && docentesReporte.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900/40 dark:text-neutral-400">
                                <p className="font-semibold text-neutral-700 dark:text-neutral-200">No hay docentes para mostrar.</p>
                                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Verifica que el CUP tenga docentes asignados.</p>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900/40 dark:text-neutral-400">
                                <p className="font-semibold text-neutral-700 dark:text-neutral-200">
                                    Presiona "Reporte general docente" para generar el informe.
                                </p>
                                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                                    El reporte se carga cuando se solicita explícitamente.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
