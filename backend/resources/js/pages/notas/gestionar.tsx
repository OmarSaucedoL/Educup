import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, BookMarked, BookOpen, CheckCircle2, ChevronLeft, Plus, Save, Search, Sliders, Trash2, User, Users, FileSpreadsheet, Printer } from 'lucide-react';
import { useState } from 'react';

interface GestionarNotasProps {
    clase: any;
    estudiantesClase: any[];
}

export default function GestionarNotas({ clase, estudiantesClase }: GestionarNotasProps) {
    const isCupEnCurso = clase.cup?.ESTADO === 'En curso';
    const [searchQuery, setSearchQuery] = useState('');
    const [showConfig, setShowConfig] = useState(false);
    const [commaWarning, setCommaWarning] = useState(false);
    const [warningTimeout, setWarningTimeout] = useState<any>(null);

    // Configuración de evaluaciones (Nombre y Ponderación)
    const [components, setComponents] = useState<{ nombre: string; ponderacion: number }[]>(() => {
        const existingComponentsMap: Record<string, number> = {};
        estudiantesClase.forEach((ec) => {
            (ec.calificaciones || []).forEach((c: any) => {
                existingComponentsMap[c.NOMBRE] = Number(c.PONDERACION);
            });
        });
        const found = Object.entries(existingComponentsMap).map(([nombre, ponderacion]) => ({
            nombre,
            ponderacion,
        }));
        if (found.length > 0) {
            return found;
        }
        // Configuración predeterminada si no hay calificaciones registradas
        return [
            { nombre: 'Primer Parcial', ponderacion: 30 },
            { nombre: 'Segundo Parcial', ponderacion: 30 },
            { nombre: 'Examen Final', ponderacion: 40 },
        ];
    });

    // Calificaciones de los alumnos
    const [grades, setGrades] = useState<Record<number, Record<string, string>>>(() => {
        const initialGrades: Record<number, Record<string, string>> = {};
        estudiantesClase.forEach((ec) => {
            initialGrades[ec.ID] = {};
            (ec.calificaciones || []).forEach((c: any) => {
                initialGrades[ec.ID][c.NOMBRE] = String(c.CALIFICACION);
            });
        });
        return initialGrades;
    });

    const handleGradeChange = (studentId: number, componentNombre: string, val: string) => {
        // Detectar si el usuario presionó la coma
        if (val.includes(',')) {
            setCommaWarning(true);
            if (warningTimeout) {
                clearTimeout(warningTimeout);
            }
            const tId = window.setTimeout(() => {
                setCommaWarning(false);
            }, 3000);
            setWarningTimeout(tId);
            return;
        }

        // Permitir vacío para borrar la nota
        if (val === '') {
            setGrades((prev) => ({
                ...prev,
                [studentId]: {
                    ...prev[studentId],
                    [componentNombre]: '',
                },
            }));
            return;
        }

        // Permitir escribir un solo punto decimal intermedio (ej: "85.") sin romper la validación
        if (val === '.') {
            return;
        }

        // Expresión regular que solo permite dígitos y como máximo un punto decimal con hasta 2 decimales (ej: 85.55)
        // Bloquea comas, letras, espacios, múltiples puntos y más de dos decimales
        const isNumericFormat = /^\d*(\.\d{0,2})?$/.test(val);
        if (!isNumericFormat) {
            return;
        }

        const num = parseFloat(val);
        if (!isNaN(num) && num >= 0 && num <= 100) {
            setGrades((prev) => ({
                ...prev,
                [studentId]: {
                    ...prev[studentId],
                    [componentNombre]: val,
                },
            }));
        }
    };

    const updateComponent = (index: number, newName: string, newWeight: number) => {
        const oldName = components[index].nombre;
        const updatedComponents = [...components];
        updatedComponents[index] = { nombre: newName, ponderacion: newWeight };
        setComponents(updatedComponents);

        // Si cambió el nombre, actualizamos las claves en el estado de calificaciones para no perder las notas
        if (oldName !== newName) {
            setGrades((prev) => {
                const next = { ...prev };
                Object.keys(next).forEach((studentId) => {
                    const numId = Number(studentId);
                    const studentGrades = { ...next[numId] };
                    if (studentGrades[oldName] !== undefined) {
                        studentGrades[newName] = studentGrades[oldName];
                        delete studentGrades[oldName];
                    }
                    next[numId] = studentGrades;
                });
                return next;
            });
        }
    };

    const addComponent = () => {
        const totalCurrentWeight = components.reduce((sum, c) => sum + c.ponderacion, 0);
        const remaining = Math.max(0, 100 - totalCurrentWeight);
        const newName = `Evaluación ${components.length + 1}`;
        setComponents((prev) => [...prev, { nombre: newName, ponderacion: remaining }]);

        setGrades((prev) => {
            const next = { ...prev };
            Object.keys(next).forEach((studentId) => {
                const numId = Number(studentId);
                next[numId] = {
                    ...next[numId],
                    [newName]: '0',
                };
            });
            return next;
        });
    };

    const removeComponent = (index: number) => {
        const nameToRemove = components[index].nombre;
        setComponents((prev) => prev.filter((_, i) => i !== index));

        setGrades((prev) => {
            const next = { ...prev };
            Object.keys(next).forEach((studentId) => {
                const numId = Number(studentId);
                const studentGrades = { ...next[numId] };
                delete studentGrades[nameToRemove];
                next[numId] = studentGrades;
            });
            return next;
        });
    };

    const calculateFinalGrade = (studentId: number) => {
        let finalGrade = 0;
        const studentGrades = grades[studentId] || {};
        components.forEach((comp) => {
            const gradeValue = parseFloat(studentGrades[comp.nombre] || '0') || 0;
            finalGrade += (gradeValue * comp.ponderacion) / 100.0;
        });
        return Math.round(finalGrade * 100) / 100;
    };

    const totalWeight = components.reduce((sum, c) => sum + c.ponderacion, 0);
    const isWeightBalanced = totalWeight === 100;

    const filteredStudents = estudiantesClase
        .filter((ec) => {
            const student = ec.estudiante_cup?.estudiante || ec.estudianteCup?.estudiante;
            if (!student) return false;
            const fullName = `${student.APELLIDO} ${student.NOMBRE}`.toLowerCase();
            const carnet = String(student.CARNET);
            return fullName.includes(searchQuery.toLowerCase()) || carnet.includes(searchQuery);
        })
        .sort((a, b) => {
            const studentA = a.estudiante_cup?.estudiante || a.estudianteCup?.estudiante;
            const studentB = b.estudiante_cup?.estudiante || b.estudianteCup?.estudiante;
            
            if (!studentA || !studentB) return 0;
            
            // Ordenar por Apellido
            const apellidoComp = String(studentA.APELLIDO || '').localeCompare(String(studentB.APELLIDO || ''), undefined, { sensitivity: 'base' });
            if (apellidoComp !== 0) {
                return apellidoComp;
            }
            // Ordenar por Nombre si tienen el mismo apellido
            return String(studentA.NOMBRE || '').localeCompare(String(studentB.NOMBRE || ''), undefined, { sensitivity: 'base' });
        });

    const exportEstudiantes = () => {
        let csvContent = "\uFEFF"; // UTF-8 BOM
        const headers = ["Carnet (CI)", "Apellidos y Nombres"];
        csvContent += headers.join(";") + "\r\n";
        
        filteredStudents.forEach(ec => {
            const student = ec.estudiante_cup?.estudiante || ec.estudianteCup?.estudiante;
            if (student) {
                const row = [
                    student.CARNET,
                    `${student.APELLIDO} ${student.NOMBRE}`
                ];
                csvContent += row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(";") + "\r\n";
            }
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `estudiantes_materia_${clase.materia?.SIGLA ?? 'materia'}_grupo_${clase.grupo?.NOMBRE ?? 'grupo'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const exportNotasExcel = () => {
        let csvContent = "\uFEFF"; // UTF-8 BOM
        const compHeaders = components.map(c => `${c.nombre} (${c.ponderacion}%)`);
        const headers = ["Carnet (CI)", "Postulante", ...compHeaders, "Nota Final", "Estado"];
        csvContent += headers.join(";") + "\r\n";
        
        filteredStudents.forEach(ec => {
            const student = ec.estudiante_cup?.estudiante || ec.estudianteCup?.estudiante;
            if (student) {
                const finalGrade = calculateFinalGrade(ec.ID);
                const isApproved = finalGrade >= 51;
                const studentGrades = grades[ec.ID] || {};
                
                const row = [
                    student.CARNET,
                    `${student.APELLIDO} ${student.NOMBRE}`,
                    ...components.map(c => studentGrades[c.nombre] || '0'),
                    finalGrade.toFixed(1),
                    isApproved ? 'Aprobado' : 'Reprobado'
                ];
                csvContent += row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(";") + "\r\n";
            }
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `notas_materia_${clase.materia?.SIGLA ?? 'materia'}_grupo_${clase.grupo?.NOMBRE ?? 'grupo'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };



    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isWeightBalanced) {
            alert(`Las ponderaciones deben sumar exactamente 100%. Actualmente suman ${totalWeight}%.`);
            return;
        }

        const payload = estudiantesClase.map((ec) => {
            const studentGrades = grades[ec.ID] || {};
            const formattedGrades = components.map((comp) => ({
                nombre: comp.nombre,
                calificacion: parseFloat(studentGrades[comp.nombre] || '0') || 0,
                ponderacion: comp.ponderacion,
            }));

            return {
                estudiante_clase_id: ec.ID,
                grades: formattedGrades,
            };
        });

        router.post(`/notas/clases/${clase.ID_CLASE}`, {
            calificaciones: payload,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Módulo Notas', href: '/notas/clases' },
        { title: 'Gestionar Notas', href: '#' },
    ];

    const docenteNombre = clase.docente_cup?.docente?.usuario
        ? `${clase.docente_cup.docente.usuario.APELLIDO} ${clase.docente_cup.docente.usuario.NOMBRE}`
        : clase.docenteCup?.docente?.usuario
          ? `${clase.docenteCup.docente.usuario.APELLIDO} ${clase.docenteCup.docente.usuario.NOMBRE}`
          : 'Sin docente asignado';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Gestionar Notas — ${clase.materia?.NOMBRE}`} />

            <div className="mx-auto flex h-full w-full max-w-5xl flex-1 flex-col gap-6 rounded-xl p-4">

                {/* ── Header ── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/60">
                            <BookMarked className="h-7 w-7 text-neutral-900 dark:text-neutral-100" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Gestionar Notas</h1>
                            <p className="text-muted-foreground mt-0.5 text-sm">
                                {clase.materia?.NOMBRE} — Grupo: {clase.grupo?.NOMBRE} (
                                {clase.bloqueHorario?.TURNO ?? clase.bloque_horario?.TURNO ?? 'No definido'})
                            </p>
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <Button variant="outline" asChild className="h-9 gap-1.5 text-xs font-semibold">
                            <Link href={`/notas/clases?cup_id=${clase.ID_CUP}`}>
                                <ChevronLeft className="h-4 w-4" /> Volver a Clases
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* ── Tarjeta Informativa de Clase ── */}
                <div className="grid grid-cols-1 gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-xs md:grid-cols-3 dark:border-neutral-800 dark:bg-neutral-900/50">
                    <div>
                        <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">Docente</span>
                        <p className="mt-1 flex items-center gap-1.5 font-bold text-neutral-800 dark:text-neutral-200">
                            <User className="h-4 w-4 text-neutral-600 opacity-75 dark:text-neutral-400" />
                            {docenteNombre}
                        </p>
                    </div>
                    <div>
                        <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">CUP Convocatoria</span>
                        <p className="mt-1 flex items-center gap-1.5 font-bold text-neutral-800 dark:text-neutral-200">
                            <BookOpen className="h-4 w-4 text-neutral-600 opacity-75 dark:text-neutral-400" />
                            CUP #{clase.ID_CUP} — {clase.cup?.ANIO}/{clase.cup?.SEMESTRE}
                        </p>
                    </div>
                    <div>
                        <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">Estudiantes Inscritos</span>
                        <p className="mt-1 flex items-center gap-1.5 font-bold text-neutral-800 dark:text-neutral-200">
                            <Users className="h-4 w-4 text-neutral-600 opacity-75 dark:text-neutral-400" />
                            {estudiantesClase.length} postulantes
                        </p>
                    </div>
                </div>

                {!isCupEnCurso && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-250 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/20 p-4 text-amber-800 dark:text-amber-400 shadow-xs print:hidden">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                        <div>
                            <h4 className="text-sm font-semibold">Modo de Solo Lectura</h4>
                            <p className="text-xs mt-0.5 leading-relaxed">
                                Esta convocatoria del CUP se encuentra en estado <strong>"{clase.cup?.ESTADO ?? 'Finalizado'}"</strong>.
                                Solo se pueden asignar o modificar notas cuando el CUP se encuentra en estado <strong>"En curso"</strong>.
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Configuración de Ponderaciones ── */}
                <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50 print:hidden">
                    <div
                        onClick={() => setShowConfig(!showConfig)}
                        className="flex cursor-pointer items-center justify-between border-b border-neutral-100 p-4 transition-colors select-none hover:bg-neutral-50 dark:border-neutral-800/80 dark:hover:bg-neutral-900/30"
                    >
                        <div className="flex items-center gap-2">
                            <Sliders className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
                            <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">Estructura y Ponderación de Evaluaciones</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                    isWeightBalanced
                                        ? 'border border-green-200/40 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400'
                                        : 'border border-amber-200/40 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                                }`}
                            >
                                {isWeightBalanced ? (
                                    <>
                                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                        Ponderaciones Balanciadas (100%)
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                        Total: {totalWeight}% (Debe ser 100%)
                                    </>
                                )}
                            </span>
                            <span className="text-xs font-semibold text-neutral-500 underline">{showConfig ? 'Ocultar' : 'Configurar'}</span>
                        </div>
                    </div>

                    {showConfig && (
                        <div className="flex flex-col gap-4 bg-neutral-50/30 p-4 dark:bg-neutral-950/10">
                            <p className="text-xs text-neutral-500">
                                Define las columnas y el porcentaje asignado a cada evaluación. Al modificar los nombres o agregar/eliminar columnas,
                                los cambios se reflejarán instantáneamente en la planilla de calificaciones.
                            </p>

                            <div className="flex flex-col gap-3">
                                {components.map((comp, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            value={comp.nombre}
                                            disabled={!isCupEnCurso}
                                            onChange={(e) => updateComponent(idx, e.target.value, comp.ponderacion)}
                                            className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-900 shadow-xs focus:ring-1 focus:ring-neutral-900 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:ring-neutral-100 disabled:opacity-60 disabled:cursor-not-allowed"
                                            placeholder="Nombre de la evaluación"
                                        />
                                        <div className="flex w-32 shrink-0 items-center gap-1.5">
                                            <input
                                                type="number"
                                                value={comp.ponderacion === 0 ? '' : comp.ponderacion}
                                                disabled={!isCupEnCurso}
                                                onChange={(e) => updateComponent(idx, comp.nombre, Number(e.target.value))}
                                                className="w-20 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-center text-sm font-medium text-neutral-900 shadow-xs focus:ring-1 focus:ring-neutral-900 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:ring-neutral-100 disabled:opacity-60 disabled:cursor-not-allowed"
                                                placeholder="0"
                                            />
                                            <span className="text-sm font-semibold text-neutral-500">%</span>
                                        </div>
                                        {isCupEnCurso && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeComponent(idx)}
                                                className="border-red-200 text-red-500 hover:bg-red-50 dark:border-red-950 dark:text-red-400 dark:hover:bg-red-950/20"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {isCupEnCurso && (
                                <div className="flex justify-start">
                                    <Button variant="outline" size="sm" onClick={addComponent} className="h-8 gap-1.5 text-xs font-semibold">
                                        <Plus className="h-4.5 w-4.5" /> Agregar Evaluación
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Planilla de Calificaciones ── */}
                <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50">
                    {/* Filtros de Planilla y Exportación */}
                    <div className="flex flex-col gap-3 border-b border-neutral-100 p-4 md:flex-row md:items-center md:justify-between dark:border-neutral-800/80">
                        <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">Planilla de Notas</span>
                        
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Buscar */}
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute top-2.5 left-3 h-4 w-4 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar postulante..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-lg border border-neutral-200 bg-white py-1.5 pr-3 pl-9 text-sm text-neutral-900 shadow-xs focus:ring-1 focus:ring-neutral-900 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:ring-neutral-100"
                                />
                            </div>

                            {/* Exportar Lista de Estudiantes (Excel) */}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={exportEstudiantes}
                                className="flex items-center gap-1.5 h-8 font-semibold text-xs border-neutral-200 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
                            >
                                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                                Excel Lista
                            </Button>

                            {/* Exportar Planilla de Notas (Excel) */}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={exportNotasExcel}
                                className="flex items-center gap-1.5 h-8 font-semibold text-xs border-neutral-200 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
                            >
                                <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                                Excel Notas
                            </Button>


                        </div>
                    </div>

                    {/* Tabla */}
                    <form onSubmit={handleSubmit}>
                        <div className="relative w-full overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-neutral-250/50 border-b bg-neutral-50/50 text-left text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:border-neutral-800 dark:bg-neutral-900/30">
                                        <th className="w-24 p-4 text-left font-semibold">CI</th>
                                        <th className="p-4 text-left font-semibold">Postulante</th>
                                        {components.map((comp, idx) => (
                                            <th key={idx} className="w-36 p-4 text-center font-semibold">
                                                <div className="max-w-[120px] truncate" title={`${comp.nombre} (${comp.ponderacion}%)`}>
                                                    {comp.nombre}
                                                </div>
                                                <div className="mt-0.5 text-[10px] font-normal text-neutral-400 normal-case">
                                                    Pond: {comp.ponderacion}%
                                                </div>
                                            </th>
                                        ))}
                                        <th className="w-28 p-4 text-center font-semibold">Nota Final</th>
                                        <th className="w-28 p-4 text-center font-semibold">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map((ec: any) => {
                                            const student = ec.estudiante_cup?.estudiante || ec.estudianteCup?.estudiante;
                                            const finalGrade = calculateFinalGrade(ec.ID);
                                            const isApproved = finalGrade >= 51;
 
                                            return (
                                                <tr key={ec.ID} className="transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-800/10">
                                                    <td className="p-4 align-middle font-medium text-neutral-600 dark:text-neutral-400">
                                                        {student?.CARNET ?? '—'}
                                                    </td>
                                                    <td className="p-4 align-middle">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-neutral-800 dark:text-neutral-200">
                                                                {student ? `${student.APELLIDO} ${student.NOMBRE}` : 'Estudiante Desconocido'}
                                                            </span>
                                                        </div>
                                                    </td>
 
                                                    {/* Notas individuales de evaluación */}
                                                    {components.map((comp, idx) => {
                                                        const currentVal = grades[ec.ID]?.[comp.nombre] ?? '';
                                                        return (
                                                            <td key={idx} className="p-4 text-center align-middle">
                                                                <div className="inline-flex items-center justify-center">
                                                                    <input
                                                                        type="text"
                                                                        value={currentVal}
                                                                        disabled={!isCupEnCurso}
                                                                        onChange={(e) => handleGradeChange(ec.ID, comp.nombre, e.target.value)}
                                                                        className="w-20 rounded-md border border-neutral-200 bg-white px-1 py-1.5 text-center text-sm font-semibold text-neutral-900 shadow-2xs focus:ring-1 focus:ring-neutral-900 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:focus:ring-neutral-100 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-neutral-50 dark:disabled:bg-neutral-950"
                                                                        placeholder="0.0"
                                                                     />
                                                                 </div>
                                                            </td>
                                                        );
                                                    })}
 
                                                    {/* Nota Final */}
                                                    <td className="p-4 text-center align-middle text-base font-bold">
                                                        <span
                                                            className={
                                                                isApproved ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
                                                            }
                                                        >
                                                            {finalGrade.toFixed(1)}
                                                        </span>
                                                    </td>
 
                                                    {/* Estado */}
                                                    <td className="p-4 text-center align-middle">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                                                isApproved
                                                                    ? 'border border-green-200/30 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400'
                                                                    : 'border border-red-200/30 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                                                            }`}
                                                        >
                                                            {isApproved ? 'Aprobado' : 'Reprobado'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={4 + components.length} className="p-8 text-center text-neutral-500">
                                                No se encontraron estudiantes para los filtros ingresados.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Botón Guardar */}
                        {filteredStudents.length > 0 && isCupEnCurso && (
                            <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-900/30">
                                <span className="text-xs text-neutral-500">
                                    Asegúrate de que la ponderación total sea de 100% para poder procesar la planilla.
                                </span>
                                <Button
                                    type="submit"
                                    disabled={!isWeightBalanced}
                                    className="h-9 gap-1.5 bg-neutral-900 text-xs font-semibold text-neutral-50 shadow-xs hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200"
                                >
                                    <Save className="h-4 w-4" /> Guardar Calificaciones
                                </Button>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            {/* Advertencia de coma decimal */}
            {commaWarning && (
                <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg border border-amber-250 bg-amber-50 dark:border-amber-900 dark:bg-amber-950 px-4 py-3 text-sm font-semibold text-amber-800 dark:text-amber-300 shadow-lg animate-in fade-in slide-in-from-bottom-5 duration-350">
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                    <span>Utilice un punto para demostrar decimales</span>
                </div>
            )}
        </AppLayout>
    );
}
