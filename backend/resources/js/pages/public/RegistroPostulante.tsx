import { Head, Link, useForm } from '@inertiajs/react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { AlertTriangle, ArrowLeft, ChevronRight, CreditCard, GraduationCap, Landmark, UserPlus } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Colegio {
    ID: number;
    NOMBRE: string;
}
interface Ciudad {
    ID: number;
    NOMBRE: string;
    DEPARTAMENTO: string;
}
interface Carrera {
    ID_CARRERA: number;
    NOMBRE: string;
}
interface CarreraCup {
    ID: number;
    ID_CARRERA: number;
    ID_CUP: number;
    CUPOS: number;
    carrera: Carrera;
}
interface Cup {
    ID_CUP: number;
    ANIO: number;
    SEMESTRE: string;
}

interface Props {
    colegios: Colegio[];
    ciudades: Ciudad[];
    carreras: CarreraCup[];
    activeCup: Cup | null;
    paypalClientId: string;
}

function validatePostulante(data: any) {
    const errs: Record<string, string> = {};
    if (!data.CARNET) errs.CARNET = 'El número de carnet es obligatorio y debe ser numérico.';
    if (!data.NOMBRE.trim()) errs.NOMBRE = 'El nombre es obligatorio.';
    if (!data.APELLIDO.trim()) errs.APELLIDO = 'El apellido es obligatorio.';
    if (!data.FECHA_NAC) errs.FECHA_NAC = 'La fecha de nacimiento es obligatoria.';
    if (!data.SEXO) errs.SEXO = 'El sexo es obligatorio.';

    if (!data.CORREO.trim()) {
        errs.CORREO = 'El correo electrónico es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.CORREO)) {
        errs.CORREO = 'Debe introducir un correo electrónico válido.';
    }

    if (!data.TITULO_BACHILLER.trim()) {
        errs.TITULO_BACHILLER = 'El título de bachiller es obligatorio.';
    }

    if (data.TELEFONO && !/^\d+$/.test(data.TELEFONO)) {
        errs.TELEFONO = 'El teléfono debe contener solo números.';
    }

    if (data.CIUDAD_ID === 'NEW') {
        if (!data.NUEVA_CIUDAD_NOMBRE.trim()) {
            errs.NUEVA_CIUDAD_NOMBRE = 'El nombre de la nueva ciudad es obligatorio.';
        }
        if (!data.NUEVA_CIUDAD_DEPARTAMENTO.trim()) {
            errs.NUEVA_CIUDAD_DEPARTAMENTO = 'El departamento es obligatorio.';
        }
    } else if (!data.CIUDAD_ID) {
        errs.CIUDAD_ID = 'La ciudad de procedencia es obligatoria o seleccione registrar una nueva.';
    }

    if (data.COLEGIO_ID === 'NEW') {
        if (!data.NUEVO_COLEGIO_NOMBRE.trim()) {
            errs.NUEVO_COLEGIO_NOMBRE = 'El nombre del nuevo colegio es obligatorio.';
        }
    } else if (!data.COLEGIO_ID) {
        errs.COLEGIO_ID = 'El colegio es obligatorio o seleccione registrar uno nuevo.';
    }

    if (!data.OPCION_1) errs.OPCION_1 = 'Debe seleccionar una primera opción de carrera.';
    if (!data.OPCION_2) errs.OPCION_2 = 'Debe seleccionar una segunda opción de carrera.';

    if (data.OPCION_1 && data.OPCION_2 && data.OPCION_1 === data.OPCION_2) {
        errs.OPCION_2 = 'La segunda opción debe ser diferente a la primera.';
    }

    return errs;
}

export default function RegistroPostulante({ colegios, ciudades, carreras, activeCup, paypalClientId }: Props) {
    const [step, setStep] = useState<1 | 2>(1);
    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

    const { data, setData, post, processing, errors, transform } = useForm({
        CARNET: '',
        NOMBRE: '',
        APELLIDO: '',
        FECHA_NAC: '',
        SEXO: 'M',
        CORREO: '',
        TELEFONO: '',
        DIRECCION: '',
        TITULO_BACHILLER: '',
        COLEGIO_ID: '',
        CIUDAD_ID: '',
        NUEVA_CIUDAD_NOMBRE: '',
        NUEVA_CIUDAD_DEPARTAMENTO: 'SANTA CRUZ',
        NUEVO_COLEGIO_NOMBRE: '',
        OPCION_1: '',
        OPCION_2: '',
        paypal_order_id: '',
    });

    const validate = () => {
        const errs = validatePostulante(data);
        setClientErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const proceedToPayment = () => {
        if (validate()) {
            setStep(2);
        }
    };

    const handlePayPalApprove = (orderData: any) => {
        transform((data) => ({
            ...data,
            paypal_order_id: orderData.orderID,
        }));
        post('/inscripcion-cup');
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        // Si hay un enter en el formulario estando en el paso 1, vamos al paso 2
        if (step === 1) {
            proceedToPayment();
            return;
        }
    };

    return (
        <>
            <Head title="Registro de Postulante al CUP" />

            <div className="min-h-screen bg-[#FDFDFC] px-4 py-8 sm:px-6 lg:px-8 dark:bg-[#0a0a0a]">
                <div className="mx-auto max-w-3xl">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href="/"
                            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-neutral-300"
                        >
                            <ArrowLeft className="h-4 w-4" /> Volver al Inicio
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Registro de Postulante al CUP</h1>
                        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                            Completa el siguiente formulario para crear tu cuenta e inscribirte en el Curso Universitario de Preparación.
                        </p>
                    </div>

                    {!activeCup && (
                        <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
                            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                            <div>
                                <h4 className="text-sm font-bold text-rose-800">Convocatoria Cerrada</h4>
                                <p className="mt-1 text-sm text-rose-700">
                                    No hay inscripciones abiertas en este momento. Por favor, inténtelo más tarde.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeCup && (
                        <div className="bg-primary/5 border-primary/20 mb-6 flex items-center gap-3 rounded-xl border p-4">
                            <GraduationCap className="text-primary h-6 w-6" />
                            <div>
                                <span className="text-primary block text-xs font-semibold tracking-wider uppercase">Inscripción Abierta</span>
                                <span className="text-sm font-bold text-neutral-900 dark:text-white">
                                    CUP Admisión: Año {activeCup.ANIO} — Semestre {activeCup.SEMESTRE}
                                </span>
                            </div>
                        </div>
                    )}

                    {activeCup && (
                        <PayPalScriptProvider options={{ clientId: paypalClientId || "test", currency: 'USD' }}>
                            <form
                                onSubmit={submit}
                                className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]"
                            >
                                <div className="space-y-8 p-6 md:p-8">
                                {/* Datos Personales */}
                                <div>
                                    <h3 className="mb-4 flex items-center gap-2 border-b pb-2 text-lg font-semibold dark:border-neutral-800">
                                        <UserPlus className="text-primary h-5 w-5" />
                                        1. Datos Personales
                                    </h3>

                                    {(errors as any).general && (
                                        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                                            {(errors as any).general}
                                        </div>
                                    )}

                                    <div className="grid gap-6">
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="CARNET" className="text-sm font-semibold">
                                                    Carnet de Identidad (CI) *
                                                </Label>
                                                <Input
                                                    id="CARNET"
                                                    type="number"
                                                    value={data.CARNET}
                                                    onChange={(e) => setData('CARNET', e.target.value)}
                                                    placeholder="Ej. 7654321"
                                                    disabled={processing}
                                                    className="w-full"
                                                />
                                                {clientErrors.CARNET && (
                                                    <span className="text-xs font-semibold text-rose-500">{clientErrors.CARNET}</span>
                                                )}
                                                <InputError message={errors.CARNET} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="TITULO_BACHILLER" className="text-sm font-semibold">
                                                    Título de Bachiller (Nro) *
                                                </Label>
                                                <Input
                                                    id="TITULO_BACHILLER"
                                                    type="text"
                                                    value={data.TITULO_BACHILLER}
                                                    onChange={(e) => setData('TITULO_BACHILLER', e.target.value)}
                                                    placeholder="Ej. TB-123456"
                                                    disabled={processing}
                                                    className="w-full"
                                                />
                                                {clientErrors.TITULO_BACHILLER && (
                                                    <span className="text-xs font-semibold text-rose-500">{clientErrors.TITULO_BACHILLER}</span>
                                                )}
                                                <InputError message={errors.TITULO_BACHILLER} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="NOMBRE" className="text-sm font-semibold">
                                                    Nombres *
                                                </Label>
                                                <Input
                                                    id="NOMBRE"
                                                    type="text"
                                                    value={data.NOMBRE}
                                                    onChange={(e) => setData('NOMBRE', e.target.value)}
                                                    placeholder="Tus nombres"
                                                    disabled={processing}
                                                />
                                                {clientErrors.NOMBRE && (
                                                    <span className="text-xs font-semibold text-rose-500">{clientErrors.NOMBRE}</span>
                                                )}
                                                <InputError message={errors.NOMBRE} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="APELLIDO" className="text-sm font-semibold">
                                                    Apellidos *
                                                </Label>
                                                <Input
                                                    id="APELLIDO"
                                                    type="text"
                                                    value={data.APELLIDO}
                                                    onChange={(e) => setData('APELLIDO', e.target.value)}
                                                    placeholder="Tus apellidos"
                                                    disabled={processing}
                                                />
                                                {clientErrors.APELLIDO && (
                                                    <span className="text-xs font-semibold text-rose-500">{clientErrors.APELLIDO}</span>
                                                )}
                                                <InputError message={errors.APELLIDO} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="FECHA_NAC" className="text-sm font-semibold">
                                                    Fecha de Nacimiento *
                                                </Label>
                                                <Input
                                                    id="FECHA_NAC"
                                                    type="date"
                                                    value={data.FECHA_NAC}
                                                    onChange={(e) => setData('FECHA_NAC', e.target.value)}
                                                    disabled={processing}
                                                />
                                                {clientErrors.FECHA_NAC && (
                                                    <span className="text-xs font-semibold text-rose-500">{clientErrors.FECHA_NAC}</span>
                                                )}
                                                <InputError message={errors.FECHA_NAC} />
                                            </div>
                                            <div className="grid gap-2">
                                                <span className="text-sm font-semibold block mb-2">Sexo *</span>
                                                <div className="mt-0.5 flex gap-2">
                                                    {(['M', 'F'] as const).map((s) => (
                                                        <button
                                                            key={s}
                                                            type="button"
                                                            disabled={processing}
                                                            onClick={() => setData('SEXO', s)}
                                                            className={`h-10 flex-1 rounded-lg border text-xs font-bold transition-all ${
                                                                data.SEXO === s
                                                                    ? 'border-primary bg-primary/5 text-primary ring-primary/20 shadow-sm ring-2'
                                                                    : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900'
                                                            }`}
                                                        >
                                                            {s === 'M' ? 'Masculino' : 'Femenino'}
                                                        </button>
                                                    ))}
                                                </div>
                                                {clientErrors.SEXO && (
                                                    <span className="text-xs font-semibold text-rose-500">{clientErrors.SEXO}</span>
                                                )}
                                                <InputError message={errors.SEXO} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="grid gap-2 md:col-span-2">
                                                <Label htmlFor="CORREO" className="text-sm font-semibold">
                                                    Correo Electrónico *
                                                </Label>
                                                <Input
                                                    id="CORREO"
                                                    type="email"
                                                    value={data.CORREO}
                                                    onChange={(e) => setData('CORREO', e.target.value)}
                                                    placeholder="correo@ejemplo.com"
                                                    disabled={processing}
                                                />
                                                {clientErrors.CORREO && (
                                                    <span className="text-xs font-semibold text-rose-500">{clientErrors.CORREO}</span>
                                                )}
                                                <InputError message={errors.CORREO} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="TELEFONO" className="text-sm font-semibold">
                                                    Celular
                                                </Label>
                                                <Input
                                                    id="TELEFONO"
                                                    type="tel"
                                                    value={data.TELEFONO}
                                                    onChange={(e) => setData('TELEFONO', e.target.value)}
                                                    placeholder="Ej. 70012345"
                                                    disabled={processing}
                                                />
                                                {clientErrors.TELEFONO && (
                                                    <span className="text-xs font-semibold text-rose-500">{clientErrors.TELEFONO}</span>
                                                )}
                                                <InputError message={errors.TELEFONO} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="DIRECCION" className="text-sm font-semibold">
                                                    Dirección
                                                </Label>
                                                <Input
                                                    id="DIRECCION"
                                                    type="text"
                                                    value={data.DIRECCION}
                                                    onChange={(e) => setData('DIRECCION', e.target.value)}
                                                    placeholder="Calle, Nro..."
                                                    disabled={processing}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Procedencia */}
                                <div>
                                    <h3 className="mb-4 flex items-center gap-2 border-b pb-2 text-lg font-semibold dark:border-neutral-800">
                                        <Landmark className="text-primary h-5 w-5" />
                                        2. Procedencia
                                    </h3>
                                    <div className="grid gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="CIUDAD_ID" className="text-sm font-semibold">
                                                Ciudad de Procedencia *
                                            </Label>
                                            <select
                                                id="CIUDAD_ID"
                                                value={data.CIUDAD_ID}
                                                onChange={(e) => setData('CIUDAD_ID', e.target.value)}
                                                disabled={processing}
                                                className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors dark:border-neutral-800 dark:bg-neutral-950"
                                            >
                                                <option value="">— Seleccionar ciudad —</option>
                                                <option value="NEW" className="text-primary font-bold">
                                                    🌟 (+ Registrar Nueva Ciudad)
                                                </option>
                                                {ciudades.map((c) => (
                                                    <option key={c.ID} value={c.ID}>
                                                        {c.NOMBRE} ({c.DEPARTAMENTO})
                                                    </option>
                                                ))}
                                            </select>
                                            {clientErrors.CIUDAD_ID && (
                                                <span className="text-xs font-semibold text-rose-500">{clientErrors.CIUDAD_ID}</span>
                                            )}
                                            <InputError message={errors.CIUDAD_ID} />
                                        </div>

                                        {data.CIUDAD_ID === 'NEW' && (
                                            <div className="bg-primary/5 border-primary/20 grid grid-cols-1 gap-4 rounded-xl border p-4 md:grid-cols-2">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="NUEVA_CIUDAD_NOMBRE" className="text-sm font-semibold">
                                                        Nombre de la Ciudad *
                                                    </Label>
                                                    <Input
                                                        id="NUEVA_CIUDAD_NOMBRE"
                                                        value={data.NUEVA_CIUDAD_NOMBRE}
                                                        onChange={(e) => setData('NUEVA_CIUDAD_NOMBRE', e.target.value)}
                                                        disabled={processing}
                                                    />
                                                    {clientErrors.NUEVA_CIUDAD_NOMBRE && (
                                                        <span className="text-xs font-semibold text-rose-500">
                                                            {clientErrors.NUEVA_CIUDAD_NOMBRE}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="NUEVA_CIUDAD_DEPARTAMENTO" className="text-sm font-semibold">
                                                        Departamento *
                                                    </Label>
                                                    <Input
                                                        id="NUEVA_CIUDAD_DEPARTAMENTO"
                                                        value={data.NUEVA_CIUDAD_DEPARTAMENTO}
                                                        onChange={(e) => setData('NUEVA_CIUDAD_DEPARTAMENTO', e.target.value)}
                                                        disabled={processing}
                                                    />
                                                    {clientErrors.NUEVA_CIUDAD_DEPARTAMENTO && (
                                                        <span className="text-xs font-semibold text-rose-500">
                                                            {clientErrors.NUEVA_CIUDAD_DEPARTAMENTO}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid gap-2">
                                            <Label htmlFor="COLEGIO_ID" className="text-sm font-semibold">
                                                Colegio de Procedencia *
                                            </Label>
                                            <select
                                                id="COLEGIO_ID"
                                                value={data.COLEGIO_ID}
                                                onChange={(e) => setData('COLEGIO_ID', e.target.value)}
                                                disabled={processing}
                                                className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors dark:border-neutral-800 dark:bg-neutral-950"
                                            >
                                                <option value="">— Seleccionar colegio —</option>
                                                <option value="NEW" className="text-primary font-bold">
                                                    🌟 (+ Registrar Nuevo Colegio)
                                                </option>
                                                {colegios.map((c) => (
                                                    <option key={c.ID} value={c.ID}>
                                                        {c.NOMBRE}
                                                    </option>
                                                ))}
                                            </select>
                                            {clientErrors.COLEGIO_ID && (
                                                <span className="text-xs font-semibold text-rose-500">{clientErrors.COLEGIO_ID}</span>
                                            )}
                                            <InputError message={errors.COLEGIO_ID} />
                                        </div>

                                        {data.COLEGIO_ID === 'NEW' && (
                                            <div className="bg-primary/5 border-primary/20 grid gap-2 rounded-xl border p-4">
                                                <Label htmlFor="NUEVO_COLEGIO_NOMBRE" className="text-sm font-semibold">
                                                    Nombre del Colegio *
                                                </Label>
                                                <Input
                                                    id="NUEVO_COLEGIO_NOMBRE"
                                                    value={data.NUEVO_COLEGIO_NOMBRE}
                                                    onChange={(e) => setData('NUEVO_COLEGIO_NOMBRE', e.target.value)}
                                                    disabled={processing}
                                                />
                                                {clientErrors.NUEVO_COLEGIO_NOMBRE && (
                                                    <span className="text-xs font-semibold text-rose-500">{clientErrors.NUEVO_COLEGIO_NOMBRE}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Carreras */}
                                <div>
                                    <h3 className="mb-4 flex items-center gap-2 border-b pb-2 text-lg font-semibold dark:border-neutral-800">
                                        <GraduationCap className="text-primary h-5 w-5" />
                                        3. Opciones de Carrera
                                    </h3>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="OPCION_1" className="text-sm font-semibold">
                                                Opción 1 de Carrera *
                                            </Label>
                                            <select
                                                id="OPCION_1"
                                                value={data.OPCION_1}
                                                onChange={(e) => setData('OPCION_1', e.target.value)}
                                                disabled={processing}
                                                className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors dark:border-neutral-800 dark:bg-neutral-950"
                                            >
                                                <option value="">— Seleccionar carrera —</option>
                                                {carreras.map((cc) => (
                                                    <option key={cc.ID} value={cc.ID}>
                                                        {cc.carrera?.NOMBRE}
                                                    </option>
                                                ))}
                                            </select>
                                            {clientErrors.OPCION_1 && (
                                                <span className="text-xs font-semibold text-rose-500">{clientErrors.OPCION_1}</span>
                                            )}
                                            <InputError message={errors.OPCION_1} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="OPCION_2" className="text-sm font-semibold">
                                                Opción 2 de Carrera *
                                            </Label>
                                            <select
                                                id="OPCION_2"
                                                value={data.OPCION_2}
                                                onChange={(e) => setData('OPCION_2', e.target.value)}
                                                disabled={processing}
                                                className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors dark:border-neutral-800 dark:bg-neutral-950"
                                            >
                                                <option value="">— Seleccionar carrera —</option>
                                                {carreras.map((cc) => (
                                                    <option key={cc.ID} value={cc.ID}>
                                                        {cc.carrera?.NOMBRE}
                                                    </option>
                                                ))}
                                            </select>
                                            {clientErrors.OPCION_2 && (
                                                <span className="text-xs font-semibold text-rose-500">{clientErrors.OPCION_2}</span>
                                            )}
                                            <InputError message={errors.OPCION_2} />
                                        </div>
                                    </div>
                                </div>

                                {/* Acciones */}
                                <div className="border-t pt-4 dark:border-neutral-800">
                                    {step === 1 ? (
                                        <div className="flex justify-end">
                                            <Button type="button" onClick={proceedToPayment} size="lg" className="w-full px-8 font-bold sm:w-auto">
                                                Proceder al Pago <ChevronRight className="ml-2 h-5 w-5" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="bg-primary/5 border-primary/20 rounded-xl border p-6 text-center">
                                                <CreditCard className="text-primary mx-auto mb-2 h-8 w-8" />
                                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                                                    Pago de Inscripción: $10.00 USD
                                                </h3>
                                                <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-300">
                                                    El pago es seguro a través de PayPal. Al completar tu pago serás inscrito automáticamente.
                                                </p>

                                                {paypalClientId ? (
                                                    <div className="mx-auto max-w-sm">
                                                        <PayPalButtons
                                                            style={{ layout: 'vertical', color: 'gold', shape: 'rect' }}
                                                            createOrder={(data, actions) => {
                                                                console.log("Creando orden de PayPal...");
                                                                return actions.order.create({
                                                                    intent: 'CAPTURE',
                                                                    purchase_units: [
                                                                        {
                                                                            description: 'Inscripción al CUP',
                                                                            amount: {
                                                                                currency_code: 'USD',
                                                                                value: '10.00',
                                                                            },
                                                                        },
                                                                    ],
                                                                }).then((orderId) => {
                                                                    console.log("Orden creada exitosamente con ID:", orderId);
                                                                    return orderId;
                                                                });
                                                            }}
                                                            onApprove={async (data, actions) => {
                                                                console.log("Pago aprobado por el usuario, capturando...", data);
                                                                if (actions.order) {
                                                                    await actions.order.capture();
                                                                }
                                                                handlePayPalApprove(data);
                                                            }}
                                                            onCancel={() => {
                                                                console.log("El usuario cerró la ventana emergente.");
                                                            }}
                                                            onError={(err) => {
                                                                console.error('PayPal Error Completo:', err);
                                                                alert('Ocurrió un error al cargar la ventana de PayPal. Revisa la consola para más detalles.');
                                                            }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-white">
                                                        Error: Client ID de PayPal no configurado en el servidor.
                                                    </div>
                                                )}

                                                <div className="mt-4 flex justify-center">
                                                    <Button type="button" variant="ghost" onClick={() => setStep(1)} disabled={processing}>
                                                        Volver para editar datos
                                                    </Button>
                                                </div>
                                            </div>

                                            {processing && (
                                                <div className="text-primary mt-4 animate-pulse text-center font-bold">
                                                    Procesando inscripción, por favor espera...
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </form>
                        </PayPalScriptProvider>
                    )}
                </div>
            </div>
        </>
    );
}
