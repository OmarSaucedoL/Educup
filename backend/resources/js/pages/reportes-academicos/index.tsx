import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';
import { GraduationCap, Calendar, BookOpen } from 'lucide-react';
import MateriasStats from './components/materias-stats';

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

interface ReportsProps {
    cup: {
        ID_CUP: number;
        ANIO: string;
        SEMESTRE: number;
        ESTADO: string;
    } | null;
    cups: Array<{
        ID_CUP: number;
        ANIO: string;
        SEMESTRE: number;
        ESTADO: string;
    }>;
    postulantesCriticos?: StudentCriticalData[];
    materiasSeleccionadas?: number[];
    notaLimite?: number;
    materiasCatalogo?: MateriaItem[];
}

type TabType = 'materias';

export default function AcademicReportsIndex({ 
    cup, 
    cups, 
    postulantesCriticos = [], 
    materiasSeleccionadas = [], 
    notaLimite = 51, 
    materiasCatalogo = [] 
}: ReportsProps) {
    const [activeTab, setActiveTab] = useState<TabType>('materias');
    const [selectedCupId, setSelectedCupId] = useState<number | null>(cup?.ID_CUP ?? null);

    // Handle CUP selector change
    const handleCupChange = (id: number) => {
        setSelectedCupId(id);
        router.get('/reportes-academicos', { cup_id: id }, { preserveState: false });
    };

    const tabTitle = {
        materias: 'Estadísticas de Materia'
    }[activeTab];

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Módulo Académico', href: '#' },
        { title: 'Reportes Académicos', href: '/reportes-academicos' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Reportes Académicos — ${tabTitle}`} />

            {/* ── CSS Hack para Impresión Física y PDF Limpios ── */}
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    /* Forzar que el contenedor principal ocupe todo el ancho sin márgenes */
                    main, .mx-auto, .rounded-xl, .border, .group\\/sidebar-wrapper {
                        border: none !important;
                        background: transparent !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                        max-width: 100% !important;
                        width: 100% !important;
                        display: block !important;
                    }
                    /* Visualizar el contenedor de impresión e imprimir la tabla */
                    #print-report-container {
                        display: block !important;
                        visibility: visible !important;
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                    }
                    th, td {
                        border: 1px solid #d1d5db !important;
                        padding: 8px !important;
                        font-size: 11px !important;
                        color: #000000 !important;
                    }
                    th {
                        background-color: #f3f4f6 !important;
                        font-weight: 700 !important;
                    }
                    tr {
                        page-break-inside: avoid !important;
                    }
                    /* Remueve estilos oscuros del sistema al imprimir */
                    .dark {
                        color-scheme: light !important;
                    }

                    /* Ocultar elementos generales de navegación, barras laterales y paneles de filtros (al final para sobreescribir display: block) */
                    aside { display: none !important; }
                    header { display: none !important; }
                    nav { display: none !important; }
                    button { display: none !important; }
                    select { display: none !important; }
                    input { display: none !important; }
                    [data-sidebar="sidebar"] { display: none !important; }
                    [data-sidebar="trigger"] { display: none !important; }
                    .peer { display: none !important; }
                    .pagination-controls { display: none !important; }
                    [role="tablist"] { display: none !important; }
                    .no-print { display: none !important; }
                    .print-hidden { display: none !important; }
                    .print\\:hidden { display: none !important; }
                }
            `}} />

            <div id="print-report-container" className="mx-auto flex h-full w-full max-w-6xl flex-1 flex-col gap-6 rounded-xl p-4">
                
                {/* Membrete Oficial para Impresión / PDF (Invisible en la pantalla normal) */}
                <div className="hidden print:block border-b-2 border-neutral-800 pb-4 mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-sm font-bold tracking-wider uppercase text-neutral-800">Universidad Autónoma Gabriel René Moreno</h2>
                            <p className="text-[10px] text-neutral-500 uppercase tracking-tight">Comisión CUP - Dirección Académica</p>
                        </div>
                        <div className="text-right text-[10px] text-neutral-500">
                            <p>Fecha de Impresión: {new Date().toLocaleDateString('es-BO')} {new Date().toLocaleTimeString('es-BO')}</p>
                            <p>Generado por: Personal Autorizado</p>
                        </div>
                    </div>
                    <div className="text-center mt-6">
                        <h1 className="text-lg font-bold tracking-normal uppercase text-neutral-900">{tabTitle}</h1>
                        <p className="text-xs text-neutral-600 mt-1">
                            CUP #{cup?.ID_CUP} &mdash; Gestión {cup?.ANIO}/{cup?.SEMESTRE}
                        </p>
                    </div>
                </div>

                {/* Encabezado Interactivo en Pantalla */}
                <div className="no-print flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/60 shadow-xs">
                            <GraduationCap className="h-7 w-7 text-neutral-900 dark:text-neutral-100" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Reportes Académicos</h1>
                            <p className="text-muted-foreground mt-0.5 text-sm">
                                Visualiza y analiza estadísticas académicas de los CUPs y sus materias.
                            </p>
                        </div>
                    </div>

                    {/* Selector de CUP */}
                    {cups.length > 0 && (
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                            <span className="text-xs font-semibold text-neutral-500 flex items-center gap-1 uppercase tracking-tight">
                                <Calendar className="h-3.5 w-3.5" /> CUP de Gestión:
                            </span>
                            <select
                                value={selectedCupId ?? ''}
                                onChange={e => handleCupChange(Number(e.target.value))}
                                className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium shadow-xs transition focus:border-primary focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                            >
                                {cups.map(c => (
                                    <option key={c.ID_CUP} value={c.ID_CUP}>
                                        CUP #{c.ID_CUP} — {c.ANIO}/{c.SEMESTRE} ({c.ESTADO})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Si no hay CUP registrado */}
                {!cup && (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-12 text-center dark:border-neutral-800 dark:bg-neutral-900/40">
                        <BookOpen className="h-10 w-10 text-neutral-400" />
                        <p className="text-muted-foreground text-sm">No hay ningún CUP registrado en el sistema.</p>
                    </div>
                )}

                {cup && (
                    <>
                        {/* Pestañas de Reportes */}
                        <div className="no-print border-b border-neutral-200 dark:border-neutral-800">
                            <div className="flex flex-wrap gap-1">
                                {(['materias'] as TabType[]).map((tab) => {
                                    const labels = {
                                        materias: 'Estadísticas de Materia'
                                    };
                                    const isActive = activeTab === tab;
                                    return (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-4 py-2 text-sm font-bold relative transition-colors duration-200 -mb-[1px] border-b-2 ${
                                                isActive
                                                    ? 'border-neutral-850 text-neutral-900 dark:border-neutral-200 dark:text-neutral-100'
                                                    : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
                                            }`}
                                        >
                                            {labels[tab]}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Contenido de la Pestaña Activa */}
                        <div className="flex flex-col gap-4">
                            {activeTab === 'materias' && (
                                <MateriasStats 
                                    cup={cup} 
                                    postulantesCriticos={postulantesCriticos}
                                    materiasSeleccionadas={materiasSeleccionadas}
                                    notaLimite={notaLimite}
                                    materiasCatalogo={materiasCatalogo}
                                />
                            )}
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
