import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Printer, Users } from 'lucide-react';
import { useState } from 'react';

interface GrupoReporteData {
    id_grupo: number;
    nombre_grupo: string;
    turno: string;
    total_aprobados: number;
    total_reprobados: number;
    promedio_grupo: number | null;
}

interface EstadisticaGrupoProps {
    cup: {
        ID_CUP: number;
        ANIO: string;
        SEMESTRE: number;
        ESTADO: string;
    } | null;
    gruposReporte?: GrupoReporteData[];
    onRunReport?: () => void;
    reportExecuted?: boolean;
}

export default function EstadisticaGrupo({ cup, gruposReporte = [], onRunReport, reportExecuted = false }: EstadisticaGrupoProps) {
    const [isPrinting, setIsPrinting] = useState(false);

    const handlePrint = () => {
        setIsPrinting(true);
        window.print();
        setTimeout(() => setIsPrinting(false), 1000);
    };

    const exportToCSV = () => {
        if (gruposReporte.length === 0) {
            return;
        }

        let csvContent = '\uFEFF';
        csvContent += 'Grupo;Turno;Aprobados;Reprobados;Promedio\r\n';

        gruposReporte.forEach((grupo) => {
            const row = [
                grupo.nombre_grupo,
                grupo.turno || '',
                grupo.total_aprobados,
                grupo.total_reprobados,
                grupo.promedio_grupo !== null ? grupo.promedio_grupo.toFixed(2) : '',
            ];
            csvContent += row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(';') + '\r\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `reporte_general_grupos_cup_${cup?.ID_CUP ?? 'sin_id'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Controles Superiores */}
            <div className="no-print flex flex-col gap-4 border-b border-neutral-200 pb-5 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                    <div className="rounded-md bg-primary/10 p-2">
                        <Users className="text-primary h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Reportes de Grupos</h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Resumen por grupo del CUP actual.</p>
                    </div>
                </div>

                <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800/60 dark:bg-neutral-900/20 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                        {onRunReport && (
                            <Button onClick={onRunReport} variant="default" className="gap-2 text-sm font-semibold shadow-sm">
                                Reporte general de grupos (CUP #{cup?.ID_CUP})
                            </Button>
                        )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-800 sm:border-0 sm:pt-0">
                        <Button onClick={handlePrint} disabled={isPrinting} variant="outline" className="gap-2 text-sm font-semibold bg-white dark:bg-neutral-950">
                            <Printer className="h-4 w-4" />
                            Imprimir / PDF
                        </Button>
                        <Button variant="outline" onClick={exportToCSV} disabled={gruposReporte.length === 0} className="gap-2 text-sm font-semibold bg-white dark:bg-neutral-950">
                            <FileSpreadsheet className="h-4 w-4" />
                            Exportar Excel
                        </Button>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white/70 p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/40">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Reporte general de grupos</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                Incluye cantidad de aprobados, reprobados y promedio por grupo.
                            </p>
                        </div>
                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                            {gruposReporte.length} grupos
                        </span>
                    </div>

                    {gruposReporte.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950/20 dark:text-neutral-300">
                                        <th className="px-4 py-3 text-left font-semibold">Grupo</th>
                                        <th className="px-4 py-3 text-left font-semibold">Turno</th>
                                        <th className="px-4 py-3 text-right font-semibold">Aprobados</th>
                                        <th className="px-4 py-3 text-right font-semibold">Reprobados</th>
                                        <th className="px-4 py-3 text-right font-semibold">Promedio</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                    {gruposReporte.map((grupo) => (
                                        <tr key={grupo.id_grupo} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                                            <td className="px-4 py-3 font-semibold text-neutral-900 dark:text-neutral-100">{grupo.nombre_grupo}</td>
                                            <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{grupo.turno || '—'}</td>
                                            <td className="px-4 py-3 text-right font-semibold text-emerald-700 dark:text-emerald-300">
                                                {grupo.total_aprobados}
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-rose-700 dark:text-rose-300">
                                                {grupo.total_reprobados}
                                            </td>
                                            <td className="px-4 py-3 text-right text-neutral-700 dark:text-neutral-300">
                                                {grupo.promedio_grupo !== null ? grupo.promedio_grupo.toFixed(2) : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900/40 dark:text-neutral-400">
                            {reportExecuted ? (
                                <>
                                    <p className="font-semibold text-neutral-700 dark:text-neutral-200">No se encontraron datos para el reporte.</p>
                                    <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                                        Verifica que el CUP tenga grupos y calificaciones asociadas.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="font-semibold text-neutral-700 dark:text-neutral-200">
                                        Presiona el botón para generar el reporte general de grupos.
                                    </p>
                                    <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                                        El reporte se carga solo cuando se hace clic en el botón.
                                    </p>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
