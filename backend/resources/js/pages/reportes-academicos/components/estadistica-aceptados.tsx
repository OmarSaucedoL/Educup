import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Printer, Users } from 'lucide-react';
import { useState } from 'react';

interface AceptadoReporteData {
    carnet: string;
    nombre_completo: string;
    carrera_asignada: string;
}

interface EstadisticaAceptadosProps {
    cup: {
        ID_CUP: number;
        ANIO: string;
        SEMESTRE: number;
        ESTADO: string;
    } | null;
    aceptadosReporte?: AceptadoReporteData[];
    onRunReport?: () => void;
    reportExecuted?: boolean;
}

export default function EstadisticaAceptados({ cup, aceptadosReporte = [], onRunReport, reportExecuted = false }: EstadisticaAceptadosProps) {
    const [isPrinting, setIsPrinting] = useState(false);

    const handlePrint = () => {
        setIsPrinting(true);
        window.print();
        setTimeout(() => setIsPrinting(false), 1000);
    };

    const exportToCSV = () => {
        if (aceptadosReporte.length === 0) {
            return;
        }

        let csvContent = '\uFEFF';
        csvContent += 'Carnet;Nombre Completo;Carrera Asignada\r\n';

        aceptadosReporte.forEach((aceptado) => {
            const row = [
                aceptado.carnet,
                aceptado.nombre_completo,
                aceptado.carrera_asignada || '',
            ];
            csvContent += row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(';') + '\r\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `reporte_general_aceptados_cup_${cup?.ID_CUP ?? 'sin_id'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Controles Superiores */}
            <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <Users className="text-primary h-4 w-4" />
                    <div>
                        <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">Reporte de Aceptados — CUP #{cup?.ID_CUP}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Listado de postulantes que ingresaron a una carrera.</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {onRunReport && (
                        <Button onClick={onRunReport} variant="default" className="gap-2 text-sm font-semibold">
                            Generar Reporte de Aceptados
                        </Button>
                    )}
                    <Button onClick={handlePrint} disabled={isPrinting} variant="outline" className="gap-2 text-sm font-semibold">
                        <Printer className="h-4 w-4" />
                        Imprimir / PDF
                    </Button>
                    <Button variant="outline" onClick={exportToCSV} disabled={aceptadosReporte.length === 0} className="gap-2 text-sm font-semibold">
                        <FileSpreadsheet className="h-4 w-4" />
                        Exportar Excel
                    </Button>
                </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white/70 p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/40">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Reporte de Aceptados</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                Incluye información del postulante y la carrera asignada.
                            </p>
                        </div>
                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                            {aceptadosReporte.length} aceptados
                        </span>
                    </div>

                    {aceptadosReporte.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950/20 dark:text-neutral-300">
                                        <th className="px-4 py-3 text-left font-semibold">Carnet</th>
                                        <th className="px-4 py-3 text-left font-semibold">Nombre Completo</th>
                                        <th className="px-4 py-3 text-left font-semibold">Carrera Asignada</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                    {aceptadosReporte.map((aceptado, i) => (
                                        <tr key={i} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                                            <td className="px-4 py-3 font-semibold text-neutral-900 dark:text-neutral-100">{aceptado.carnet}</td>
                                            <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{aceptado.nombre_completo}</td>
                                            <td className="px-4 py-3 font-semibold text-emerald-700 dark:text-emerald-300">
                                                {aceptado.carrera_asignada || '—'}
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
                                    <p className="font-semibold text-neutral-700 dark:text-neutral-200">No se encontraron aceptados para este CUP.</p>
                                    <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                                        Verifica que el CUP tenga estudiantes aprobados en alguna carrera.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="font-semibold text-neutral-700 dark:text-neutral-200">
                                        Presiona el botón para generar el reporte de estudiantes aceptados.
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
