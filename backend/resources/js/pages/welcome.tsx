import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';


export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                <header className="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">
                    <nav className="flex items-center justify-end gap-4">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                >
                                    Iniciar Sesion
                                </Link>
                                <Link
                                    href="/inscripcion-cup"
                                    className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                >
                                    Inscribirse al CUP
                                </Link>
                            </>
                        )}
                    </nav>
                </header>
                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                    <main className="flex w-full max-w-[335px] flex-col-reverse lg:max-w-4xl lg:flex-row">
                        <div className="flex-1 rounded-br-lg rounded-bl-lg bg-white p-6 pb-12 text-[13px] leading-[20px] shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] lg:rounded-tl-lg lg:rounded-br-none lg:p-20 dark:bg-[#161615] dark:text-[#EDEDEC] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                            <h1 className="mb-2 text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                                Bienvenido al Sistema de Gestión Académica
                            </h1>
                            <p className="mb-4 text-[#706f6c] dark:text-[#A1A09A]">
                                Gestiona el Curso Universitario de Preparación (CUP) de forma centralizada. Desde aquí podrás administrar todo el
                                proceso académico y operativo de la institución.
                            </p>
                            <ul className="mt-6 mb-6 flex flex-col gap-5">
                                <li className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f53003]/10 text-[#f53003] dark:bg-[#FF4433]/15 dark:text-[#FF4433]">
                                        <svg
                                            className="h-4 w-4"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                            <circle cx="9" cy="7" r="4" />
                                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                        </svg>
                                    </div>
                                    <span className="text-[13.5px] leading-relaxed">
                                        <strong className="block font-semibold text-neutral-900 dark:text-white">Estudiantes y Docentes</strong>
                                        <span className="text-neutral-500 dark:text-neutral-400">
                                            Administra las inscripciones, asignación de docentes y seguimiento académico exhaustivo.
                                        </span>
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f53003]/10 text-[#f53003] dark:bg-[#FF4433]/15 dark:text-[#FF4433]">
                                        <svg
                                            className="h-4 w-4"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                                            <line x1="16" x2="16" y1="2" y2="6" />
                                            <line x1="8" x2="8" y1="2" y2="6" />
                                            <line x1="3" x2="21" y1="10" y2="10" />
                                            <path d="M8 14h.01" />
                                            <path d="M12 14h.01" />
                                            <path d="M16 14h.01" />
                                            <path d="M8 18h.01" />
                                            <path d="M12 18h.01" />
                                            <path d="M16 18h.01" />
                                        </svg>
                                    </div>
                                    <span className="text-[13.5px] leading-relaxed">
                                        <strong className="block font-semibold text-neutral-900 dark:text-white">Horarios y Aulas</strong>
                                        <span className="text-neutral-500 dark:text-neutral-400">
                                            Organiza la programación de clases, grupos y recursos físicos de la institución eficientemente.
                                        </span>
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f53003]/10 text-[#f53003] dark:bg-[#FF4433]/15 dark:text-[#FF4433]">
                                        <svg
                                            className="h-4 w-4"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                            <polyline points="22 4 12 14.01 9 11.01" />
                                        </svg>
                                    </div>
                                    <span className="text-[13.5px] leading-relaxed">
                                        <strong className="block font-semibold text-neutral-900 dark:text-white">Calificaciones</strong>
                                        <span className="text-neutral-500 dark:text-neutral-400">
                                            Registra y consolida las notas de los estudiantes para cada materia y convocatoria CUP.
                                        </span>
                                    </span>
                                </li>
                            </ul>
                            <ul className="flex gap-3 text-sm leading-normal">
                                <li>
                                    <Link
                                        href={route('login')}
                                        className="inline-flex items-center gap-2 rounded-md border border-transparent bg-[#f53003] px-6 py-2.5 text-sm leading-normal font-semibold text-white shadow-sm transition-all hover:bg-[#d62802] dark:bg-[#FF4433] dark:hover:bg-[#e03a2b]"
                                    >
                                        Comenzar Ahora
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div className="relative -mb-px flex aspect-[335/376] w-full shrink-0 items-center justify-center overflow-hidden rounded-t-lg bg-white lg:mb-0 lg:-ml-px lg:aspect-auto lg:w-[438px] lg:rounded-t-none lg:rounded-r-lg">
                            <img 
                                src="/Escudo_FICCT_monocromo.jpg" 
                                alt="Escudo FICCT" 
                                className="h-auto w-[85%] max-w-[380px] object-contain" 
                            />
                            <div className="absolute inset-0 rounded-t-lg shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] lg:rounded-t-none lg:rounded-r-lg dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]" />
                        </div>
                    </main>
                </div>
                <div className="hidden h-14.5 lg:block"></div>
            </div>
        </>
    );
}
