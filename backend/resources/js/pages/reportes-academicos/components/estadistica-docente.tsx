import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Printer, UserCheck } from 'lucide-react';
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

interface DocenteCatalogoItem {
    id: number;
    nombre_completo: string;
}

interface HistoricoDocenteData {
    docente: string;
    grupo: string;
    materia: string;
    turno: string;
    numero_estudiantes: number;
    nota_promedio: number | null;
    cup: string;
}

interface EstadisticaDocenteProps {
    cup: {
        ID_CUP: number;
        ANIO: string;
        SEMESTRE: number;
        ESTADO: string;
    } | null;
    docentesCatalogo?: DocenteCatalogoItem[];
    docentesReporte?: DocenteReporteData[];
    historicoDocenteReporte?: HistoricoDocenteData[];
    onRunReport?: () => void;
    onRunHistoricoReport?: (id_docente: number) => void;
    reportExecuted?: boolean;
    historicoReportExecuted?: boolean;
}

export default function EstadisticaDocente({
    cup,
    docentesCatalogo = [],
    docentesReporte = [],
    historicoDocenteReporte = [],
    onRunReport,
    onRunHistoricoReport,
    reportExecuted = false,
    historicoReportExecuted = false,
}: EstadisticaDocenteProps) {
    const [isPrinting, setIsPrinting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const selectedDocente = docentesCatalogo.find(d => d.nombre_completo === searchTerm)?.id;

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

        let metaHeader = `"REPORTE GENERAL DOCENTES"\r\n`;
        metaHeader += `"CUP Evaluado";"${cup?.ID_CUP}"\r\n`;
        metaHeader += `"Total Docentes";"${docentesReporte.length}"\r\n\r\n`;

        const BOM = '\uFEFF';
        const headerRow = headers.map((h) => `"${h}"`).join(';');
        const csvContent = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';')).join('\r\n');
        const csv = BOM + metaHeader + headerRow + '\r\n' + csvContent;

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

    const exportToCSVHistorico = () => {
        if (historicoDocenteReporte.length === 0) return;

        const headers = ['Docente', 'CUP', 'Materia', 'Grupo', 'Turno', 'Total Estudiantes', 'Calificación Promedio'];
        const rows = historicoDocenteReporte.map((h) => [
            h.docente,
            h.cup,
            h.materia,
            h.grupo,
            h.turno,
            h.numero_estudiantes,
            h.nota_promedio !== null ? h.nota_promedio : 'S/N',
        ]);

        let metaHeader = `"REPORTE HISTÓRICO DOCENTE"\r\n`;
        metaHeader += `"Docente";"${historicoDocenteReporte[0]?.docente}"\r\n`;
        metaHeader += `"Total Clases Impartidas";"${historicoDocenteReporte.length}"\r\n\r\n`;

        const BOM = '\uFEFF';
        const headerRow = headers.map((h) => `"${h}"`).join(';');
        const csvContent = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';')).join('\r\n');
        const csv = BOM + metaHeader + headerRow + '\r\n' + csvContent;

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `reporte-historico-docente-${selectedDocente}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleRunHistorico = () => {
        if (selectedDocente && onRunHistoricoReport) {
            onRunHistoricoReport(Number(selectedDocente));
        }
    };

    return (
        <div className="flex flex-col gap-6" id="print-report-container">
            <div className="no-print flex flex-col gap-4 border-b border-neutral-200 pb-5 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                    <div className="rounded-md bg-primary/10 p-2">
                        <UserCheck className="text-primary h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Estadísticas Docente</h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Genera métricas generales del CUP actual o consulta el historial completo de un docente específico.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800/60 dark:bg-neutral-900/20 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                        <Button onClick={onRunReport} variant="default" className="gap-2 text-sm font-semibold shadow-sm">
                            Reporte general (CUP #{cup?.ID_CUP})
                        </Button>
                        
                        <div className="hidden h-8 w-px bg-neutral-300 dark:bg-neutral-700 sm:block"></div>
                        
                        <div className="relative">
                            <input
                                type="text"
                                list="docentes-list"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar docente..."
                                className="w-[240px] h-9 text-sm rounded-md border border-neutral-300 px-3 py-1 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50"
                            />
                            <datalist id="docentes-list">
                                {docentesCatalogo.map((d) => (
                                    <option key={d.id} value={d.nombre_completo} />
                                ))}
                            </datalist>
                        </div>
                        <Button onClick={handleRunHistorico} disabled={!selectedDocente} variant="outline" className="gap-2 text-sm font-semibold border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800">
                            Reporte histórico
                        </Button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-800 sm:border-0 sm:pt-0">
                        <Button onClick={handlePrint} disabled={isPrinting} variant="outline" className="gap-2 text-sm font-semibold bg-white dark:bg-neutral-950">
                            <Printer className="h-4 w-4" />
                            Imprimir / PDF
                        </Button>
                        {reportExecuted && !historicoReportExecuted && (
                            <Button onClick={exportToCSV} disabled={docentesReporte.length === 0} variant="outline" className="gap-2 text-sm font-semibold bg-white dark:bg-neutral-950">
                                <FileSpreadsheet className="h-4 w-4" />
                                Exportar Excel
                            </Button>
                        )}
                        {historicoReportExecuted && (
                            <Button onClick={exportToCSVHistorico} disabled={historicoDocenteReporte.length === 0} variant="outline" className="gap-2 text-sm font-semibold bg-white dark:bg-neutral-950">
                                <FileSpreadsheet className="h-4 w-4" />
                                Exportar Excel
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* TABLA HISTÓRICA */}
            {historicoReportExecuted ? (
                historicoDocenteReporte.length > 0 ? (
                    <div className="flex flex-col gap-4">
                        <div className="hidden print:block" style={{ paddingBottom: '25px', width: '100%' }}>
                            <h2 style={{ fontSize: '22px', fontWeight: 'bold', margin: '0 0 10px 0', lineHeight: '1' }}>Reporte Histórico Docente</h2>
                            <div style={{ fontSize: '14px', margin: '0 0 5px 0', lineHeight: '1.2' }}><strong>Docente:</strong> {historicoDocenteReporte[0].docente}</div>
                            <div style={{ fontSize: '14px', margin: '0', lineHeight: '1.2' }}><strong>Total Clases Impartidas:</strong> {historicoDocenteReporte.length}</div>
                        </div>
                        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white/70 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/40">
                            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 print:hidden">
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                                    Historial: {historicoDocenteReporte[0].docente}
                                </h3>
                            </div>
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900/60">
                                    <th className="px-4 py-3 text-left font-semibold text-neutral-900 dark:text-neutral-100">CUP</th>
                                    <th className="px-4 py-3 text-left font-semibold text-neutral-900 dark:text-neutral-100">Materia</th>
                                    <th className="px-4 py-3 text-center font-semibold text-neutral-900 dark:text-neutral-100">Grupo</th>
                                    <th className="px-4 py-3 text-center font-semibold text-neutral-900 dark:text-neutral-100">Turno</th>
                                    <th className="px-4 py-3 text-center font-semibold text-neutral-900 dark:text-neutral-100">Total Estudiantes</th>
                                    <th className="px-4 py-3 text-center font-semibold text-neutral-900 dark:text-neutral-100">Calificación Promedio</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historicoDocenteReporte.map((row, idx) => (
                                    <tr
                                        key={idx}
                                        className={`border-b border-neutral-200 dark:border-neutral-700 ${
                                            idx % 2 === 0 ? 'bg-neutral-50 dark:bg-neutral-900/20' : 'bg-white dark:bg-neutral-900/40'
                                        } transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800`}
                                    >
                                        <td className="px-4 py-3 font-semibold text-neutral-900 dark:text-neutral-100">{row.cup}</td>
                                        <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">{row.materia}</td>
                                        <td className="px-4 py-3 text-center text-neutral-700 dark:text-neutral-300">{row.grupo}</td>
                                        <td className="px-4 py-3 text-center text-neutral-700 dark:text-neutral-300">{row.turno}</td>
                                        <td className="px-4 py-3 text-center text-neutral-700 dark:text-neutral-300">{row.numero_estudiantes}</td>
                                        <td className="px-4 py-3 text-center font-semibold text-indigo-600 dark:text-indigo-400">
                                            {row.nota_promedio !== null ? row.nota_promedio : 'S/N'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900/40 dark:text-neutral-400">
                        <p className="font-semibold text-neutral-700 dark:text-neutral-200">El docente seleccionado no tiene historial de clases.</p>
                        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Prueba seleccionando otro docente.</p>
                    </div>
                )
            ) : (
                /* TABLA GENERAL DOCENTES */
                reportExecuted ? (
                    docentesReporte.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            <div className="hidden print:block" style={{ paddingBottom: '25px', width: '100%' }}>
                                <h2 style={{ fontSize: '22px', fontWeight: 'bold', margin: '0 0 10px 0', lineHeight: '1' }}>Reporte General Docentes</h2>
                                <div style={{ fontSize: '14px', margin: '0 0 5px 0', lineHeight: '1.2' }}><strong>CUP Evaluado:</strong> {cup?.ID_CUP}</div>
                                <div style={{ fontSize: '14px', margin: '0', lineHeight: '1.2' }}><strong>Total Docentes:</strong> {docentesReporte.length}</div>
                            </div>
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
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900/40 dark:text-neutral-400">
                            <p className="font-semibold text-neutral-700 dark:text-neutral-200">No hay docentes para mostrar.</p>
                            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Verifica que el CUP tenga docentes asignados.</p>
                        </div>
                    )
                ) : (
                    <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900/40 dark:text-neutral-400">
                        <p className="font-semibold text-neutral-700 dark:text-neutral-200">
                            Presiona "Reporte general" o selecciona un docente y elige "Reporte histórico" para generar un informe.
                        </p>
                        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                            El reporte se carga cuando se solicita explícitamente.
                        </p>
                    </div>
                )
            )}
        </div>
    );
}
