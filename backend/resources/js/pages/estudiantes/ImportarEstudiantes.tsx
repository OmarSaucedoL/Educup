import { FormEventHandler, useRef } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, UploadCloud, LoaderCircle, FileSpreadsheet } from 'lucide-react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Periodo {
    ID: number;
    ANIO: number;
    SEMESTRE: number;
}

interface Props {
    periodos: Periodo[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Gestión Académica', href: '#' },
    { title: 'Estudiantes', href: '/estudiantes' },
    { title: 'Importar', href: '/estudiantes/importar' },
];

export default function ImportarEstudiantes({ periodos }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, progress, reset } = useForm({
        CUP_ID: periodos.length > 0 ? periodos[0].ID.toString() : '',
        archivo_excel: null as File | null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/estudiantes/importar', {
            forceFormData: true,
            onSuccess: () => {
                reset('archivo_excel');
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Importar Estudiantes" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="max-w-2xl w-full mx-auto mt-8">
                    
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="icon" asChild>
                                <Link href="/estudiantes">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight">Importación Masiva de Estudiantes</h1>
                                <p className="text-sm text-muted-foreground">Sube un archivo Excel para registrar estudiantes y asignarlos a un periodo.</p>
                            </div>
                        </div>
                    </div>

                    {/* Card */}
                    <div className="border-sidebar-border/70 dark:border-sidebar-border bg-card text-card-foreground rounded-xl border shadow-sm overflow-hidden">
                        
                        <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-6 border-b border-sidebar-border/50">
                            <div className="flex gap-4">
                                <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                                    <FileSpreadsheet className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-foreground">Instrucciones del Archivo</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Asegúrate de que la primera fila contenga exactamente estos encabezados en minúscula:
                                        <br />
                                        <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-400 mt-2 inline-block">
                                            carnet, nombre, apellido, fecha_nac, sexo, direccion, telefono, correo, ciudad, colegio, opcion_1, opcion_2
                                        </code>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <form onSubmit={submit} className="flex flex-col gap-6">

                                {/* Periodo Select */}
                                <div className="grid gap-2">
                                    <Label htmlFor="CUP_ID" className="text-sm font-semibold">Periodo de Preinscripción (Gestión) <span className="text-destructive">*</span></Label>
                                    <select
                                        id="CUP_ID"
                                        value={data.CUP_ID}
                                        onChange={e => setData('CUP_ID', e.target.value)}
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
                                        required
                                    >
                                        <option value="" disabled>Selecciona un periodo</option>
                                        {periodos.map(p => (
                                            <option key={p.ID} value={p.ID}>
                                                Año {p.ANIO} - Semestre {p.SEMESTRE}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.CUP_ID} />
                                </div>

                                {/* File Input Dropzone */}
                                <div className="grid gap-2">
                                    <Label className="text-sm font-semibold">Archivo Excel (.xlsx, .xls) <span className="text-destructive">*</span></Label>
                                    
                                    <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                                        data.archivo_excel ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/10' : 'border-sidebar-border hover:border-sidebar-border/80 hover:bg-muted/30'
                                    }`}>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".xlsx, .xls"
                                            onChange={e => setData('archivo_excel', e.target.files ? e.target.files[0] : null)}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            required
                                        />
                                        
                                        <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                                            {data.archivo_excel ? (
                                                <>
                                                    <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-2">
                                                        <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                                    </div>
                                                    <p className="font-medium text-sm text-foreground">{data.archivo_excel.name}</p>
                                                    <p className="text-xs text-muted-foreground">{(data.archivo_excel.size / 1024).toFixed(1)} KB</p>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="h-10 w-10 rounded-full bg-sidebar-accent flex items-center justify-center mb-2">
                                                        <UploadCloud className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                    <p className="font-medium text-sm text-foreground">Haz clic para buscar un archivo Excel</p>
                                                    <p className="text-xs text-muted-foreground">o arrástralo y suéltalo aquí</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <InputError message={errors.archivo_excel} />
                                </div>

                                {/* Submit Button & Progress */}
                                <div className="pt-4 border-t border-sidebar-border/50">
                                    <Button
                                        type="submit"
                                        disabled={processing || !data.archivo_excel || !data.CUP_ID}
                                        className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition-all"
                                    >
                                        {processing ? (
                                            <>
                                                <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                                                Procesando filas y validando datos...
                                            </>
                                        ) : (
                                            'Iniciar Importación Masiva'
                                        )}
                                    </Button>

                                    {progress && (
                                        <div className="w-full bg-muted rounded-full h-1.5 mt-4 overflow-hidden">
                                            <div className="bg-indigo-600 h-1.5 rounded-full transition-all" style={{ width: `${progress.percentage}%` }}></div>
                                        </div>
                                    )}
                                </div>

                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
