<?php

namespace App\Http\Controllers;

use App\Models\Ciudad;
use App\Models\Colegio;
use App\Models\Estudiante;
use App\Models\Cup;
use App\Models\EstudianteCup;
use App\Models\CarreraCup;
use App\Models\OpcionCarrera;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Imports\EstudiantesImport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Validation\ValidationException;

class EstudianteController extends Controller
{
    /**
     * Display a listing of all students with search and pagination.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');

        $query = Estudiante::with(['colegio', 'ciudad']);

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                if (is_numeric($search)) {
                    $q->where('CARNET', $search);
                } else {
                    $q->where('NOMBRE', 'ILIKE', '%' . $search . '%')
                      ->orWhere('APELLIDO', 'ILIKE', '%' . $search . '%');
                }
            });
        }

        $estudiantes = $query->orderBy('APELLIDO')
            ->orderBy('NOMBRE')
            ->paginate(10)
            ->withQueryString();

        $activeCup = Cup::where('ESTADO', '!=', 'Concluido')->orderBy('ID_CUP', 'desc')->first();

        return Inertia::render('estudiantes/index', [
            'estudiantes' => $estudiantes,
            'filters'     => [
                'search' => $search
            ],
            'activeCup'   => $activeCup
        ]);
    }

    /**
     * Show the form for creating a new student.
     */
    public function create()
    {
        $colegios = Colegio::orderBy('NOMBRE')->get(['ID', 'NOMBRE']);
        $ciudades = Ciudad::orderBy('NOMBRE')->get(['ID', 'NOMBRE', 'DEPARTAMENTO']);
        
        $activeCup = Cup::where('ESTADO', '!=', 'Concluido')->orderBy('ID_CUP', 'desc')->first();
        $carreras = [];
        if ($activeCup) {
            $carreras = CarreraCup::where('ID_CUP', $activeCup->ID_CUP)
                ->with('carrera')
                ->get();
        }

        return Inertia::render('estudiantes/editarPostulante', [
            'postulante'    => null,
            'colegios'      => $colegios,
            'ciudades'      => $ciudades,
            'carreras'      => $carreras,
            'activeCup'     => $activeCup,
            'historialCups' => []
        ]);
    }

    /**
     * Show the form for editing an existing student.
     */
    public function edit($id)
    {
        $estudiante = Estudiante::findOrFail($id);
        $activeCup = Cup::where('ESTADO', '!=', 'Concluido')->orderBy('ID_CUP', 'desc')->first();
        
        $estudianteCup = null;
        $opciones = [];
        if ($activeCup) {
            $estudianteCup = EstudianteCup::where('ID_ESTUDIANTE', $id)
                ->where('ID_CUP', $activeCup->ID_CUP)
                ->first();
                
            if ($estudianteCup) {
                $opciones = OpcionCarrera::where('ESTUDIANTE_CUP_ID', $estudianteCup->ID)
                    ->orderBy('OPCION')
                    ->get();
            }
        }
        
        $colegios = Colegio::orderBy('NOMBRE')->get(['ID', 'NOMBRE']);
        $ciudades = Ciudad::orderBy('NOMBRE')->get(['ID', 'NOMBRE', 'DEPARTAMENTO']);
        
        $carreras = [];
        if ($activeCup) {
            $carreras = CarreraCup::where('ID_CUP', $activeCup->ID_CUP)
                ->with('carrera')
                ->get();
        }
        
        $opcion1 = null;
        $opcion2 = null;
        foreach ($opciones as $op) {
            if ($op->OPCION == 1) {
                $opcion1 = $op->CARRERA_CUP_ID;
            } elseif ($op->OPCION == 2) {
                $opcion2 = $op->CARRERA_CUP_ID;
            }
        }

        $historialCups = EstudianteCup::where('ID_ESTUDIANTE', $id)
            ->with([
                'cup', 
                'opcionesCarrera.carreraCup.carrera',
                'estudiantesClases.clase.materia',
                'estudiantesClases.clase.aula',
                'estudiantesClases.clase.grupo',
                'estudiantesClases.clase.bloqueHorario.horariosEnBloque.horario',
                'estudiantesClases.clase.docenteCup.docente.usuario',
                'estudiantesClases.calificaciones'
            ])
            ->orderBy('FECHA', 'desc')
            ->get();

        foreach ($historialCups as $hCup) {
            $todasLasCalificaciones = collect();
            foreach ($hCup->estudiantesClases as $estClase) {
                if ($estClase->clase) {
                    $notaTotal = \Illuminate\Support\Facades\DB::selectOne(
                        'SELECT f_calcular_nota_materia(?, ?) AS nota',
                        [$hCup->ID, $estClase->ID_CLASE]
                    )->nota;
                    $estClase->clase->NOTA_TOTAL = $notaTotal;
                }
                
                foreach ($estClase->calificaciones as $calif) {
                    $calif->clase = $estClase->clase;
                    $todasLasCalificaciones->push($calif);
                }
            }
            // Bind the flattened list so the frontend receives it exactly as before
            $hCup->setRelation('calificaciones', $todasLasCalificaciones);
            unset($hCup->estudiantesClases);
        }

        return Inertia::render('estudiantes/editarPostulante', [
            'postulante' => [
                'ID_ESTUDIANTE'    => $estudiante->ID_ESTUDIANTE,
                'CARNET'           => $estudiante->CARNET,
                'NOMBRE'           => $estudiante->NOMBRE,
                'APELLIDO'         => $estudiante->APELLIDO,
                'FECHA_NAC'        => $estudiante->FECHA_NAC ? $estudiante->FECHA_NAC->format('Y-m-d') : null,
                'SEXO'             => $estudiante->SEXO,
                'DIRECCION'        => $estudiante->DIRECCION,
                'TELEFONO'         => $estudiante->TELEFONO,
                'CORREO'           => $estudiante->CORREO,
                'TITULO_BACHILLER' => $estudiante->TITULO_BACHILLER,
                'ESTADO'           => $estudiante->ESTADO,
                'COLEGIO_ID'       => $estudiante->COLEGIO_ID,
                'CIUDAD_ID'        => $estudiante->CIUDAD_ID,
                'OPCION_1'         => $opcion1,
                'OPCION_2'         => $opcion2,
            ],
            'colegios'      => $colegios,
            'ciudades'      => $ciudades,
            'carreras'      => $carreras,
            'activeCup'     => $activeCup,
            'historialCups' => $historialCups,
        ]);
    }

    /**
     * Store a newly created student with cascaded pre-registration and career options.
     */
    public function store(Request $request)
    {
        $rules = [
            'CARNET'                    => 'required|integer|unique:ESTUDIANTE,CARNET',
            'NOMBRE'                    => 'required|string|max:100',
            'APELLIDO'                  => 'required|string|max:100',
            'FECHA_NAC'                 => 'required|date',
            'SEXO'                      => 'required|in:M,F',
            'CORREO'                    => 'required|email|max:150|unique:ESTUDIANTE,CORREO',
            'TELEFONO'                  => 'nullable|string|max:20',
            'DIRECCION'                 => 'nullable|string|max:255',
            'TITULO_BACHILLER'          => 'required|string|max:255|unique:ESTUDIANTE,TITULO_BACHILLER',
            'ESTADO'                    => 'required|in:ACTIVO,INACTIVO,APROBADO',
            'NUEVA_CIUDAD_NOMBRE'       => 'required_if:CIUDAD_ID,NEW|nullable|string|max:100',
            'NUEVA_CIUDAD_DEPARTAMENTO' => 'required_if:CIUDAD_ID,NEW|nullable|string|max:100',
            'NUEVO_COLEGIO_NOMBRE'      => 'required_if:COLEGIO_ID,NEW|nullable|string|max:100',
            'OPCION_1'                  => 'required_if:ESTADO,ACTIVO|nullable|exists:CARRERA_CUP,ID',
            'OPCION_2'                  => 'required_if:ESTADO,ACTIVO|nullable|exists:CARRERA_CUP,ID',
        ];

        if ($request->input('CIUDAD_ID') === 'NEW') {
            $rules['CIUDAD_ID'] = 'required';
        } else {
            $rules['CIUDAD_ID'] = 'required|integer|exists:CIUDAD,ID';
        }

        if ($request->input('COLEGIO_ID') === 'NEW') {
            $rules['COLEGIO_ID'] = 'required';
        } else {
            $rules['COLEGIO_ID'] = 'required|integer|exists:COLEGIO,ID';
        }

        $validated = $request->validate($rules);

        $activeCup = Cup::where('ESTADO', '!=', 'Concluido')->orderBy('ID_CUP', 'desc')->first();

        // Si no hay convocatoria activa, forzar estado a INACTIVO
        if (!$activeCup) {
            $validated['ESTADO'] = 'INACTIVO';
        }

        if ($validated['ESTADO'] === 'ACTIVO') {
            if (empty($validated['OPCION_1']) || empty($validated['OPCION_2'])) {
                throw ValidationException::withMessages([
                    'OPCION_1' => 'Para registrar un estudiante ACTIVO debe seleccionar ambas opciones de carrera.'
                ]);
            }
            if ($validated['OPCION_1'] == $validated['OPCION_2']) {
                throw ValidationException::withMessages([
                    'OPCION_2' => 'La primera y segunda opción de carrera deben ser estrictamente diferentes.'
                ]);
            }
        }

        try {
            DB::beginTransaction();

            // Procesar nueva Ciudad si se especificó
            $ciudadId = $validated['CIUDAD_ID'] ?? null;
            if (!empty($validated['NUEVA_CIUDAD_NOMBRE'])) {
                $ciudad = Ciudad::firstOrCreate(
                    ['NOMBRE' => strtoupper(trim($validated['NUEVA_CIUDAD_NOMBRE']))],
                    ['DEPARTAMENTO' => strtoupper(trim($validated['NUEVA_CIUDAD_DEPARTAMENTO'] ?? 'SANTA CRUZ'))]
                );
                $ciudadId = $ciudad->ID;
            }

            // Procesar nuevo Colegio si se especificó
            $colegioId = $validated['COLEGIO_ID'] ?? null;
            if (!empty($validated['NUEVO_COLEGIO_NOMBRE'])) {
                $colegio = Colegio::firstOrCreate(
                    ['NOMBRE' => strtoupper(trim($validated['NUEVO_COLEGIO_NOMBRE']))]
                );
                $colegioId = $colegio->ID;
            }

            // 1. Crear registro de Estudiante
            $estudiante = Estudiante::create([
                'CARNET'           => $validated['CARNET'],
                'NOMBRE'           => strtoupper(trim($validated['NOMBRE'])),
                'APELLIDO'         => strtoupper(trim($validated['APELLIDO'])),
                'FECHA_NAC'        => $validated['FECHA_NAC'],
                'SEXO'             => strtoupper(trim($validated['SEXO'])),
                'DIRECCION'        => isset($validated['DIRECCION']) ? strtoupper(trim($validated['DIRECCION'])) : null,
                'TELEFONO'         => $validated['TELEFONO'] ?? null,
                'CORREO'           => strtolower(trim($validated['CORREO'])),
                'TITULO_BACHILLER' => strtoupper(trim($validated['TITULO_BACHILLER'])),
                'ESTADO'           => $validated['ESTADO'],
                'COLEGIO_ID'       => $colegioId,
                'CIUDAD_ID'        => $ciudadId,
            ]);

            // 2. Si el estado es ACTIVO, ejecutar el procedimiento almacenado
            if ($validated['ESTADO'] === 'ACTIVO') {
                try {
                    DB::statement('CALL p_inscribir_estudiante_cup(?, ?, ?, ?)', [
                        $estudiante->ID_ESTUDIANTE,
                        $activeCup->ID_CUP,
                        $validated['OPCION_1'],
                        $validated['OPCION_2']
                    ]);
                } catch (\Illuminate\Database\QueryException $qe) {
                    $errorMsg = $qe->getMessage();
                    $mensajeLimpio = 'Error al inscribir al estudiante.';
                    if (preg_match('/ERROR:\s*(.+?)(?:\n|Contexto|$)/i', $errorMsg, $matches)) {
                        $mensajeLimpio = trim($matches[1]);
                    } else {
                        $mensajeLimpio = $errorMsg;
                    }
                    throw new \Exception($mensajeLimpio);
                }
            }

            DB::commit();

            return redirect('/estudiantes')->with('success', 'Estudiante registrado correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            throw ValidationException::withMessages([
                'CARNET' => $e->getMessage()
            ]);
        }
    }

    /**
     * Update an existing student and regenerate pre-registration and career options.
     */
    public function update(Request $request, $id)
    {
        $estudiante = Estudiante::findOrFail($id);

        $rules = [
            'CARNET'                    => 'required|integer|unique:ESTUDIANTE,CARNET,' . $id . ',ID_ESTUDIANTE',
            'NOMBRE'                    => 'required|string|max:100',
            'APELLIDO'                  => 'required|string|max:100',
            'FECHA_NAC'                 => 'required|date',
            'SEXO'                      => 'required|in:M,F',
            'CORREO'                    => 'required|email|max:150|unique:ESTUDIANTE,CORREO,' . $id . ',ID_ESTUDIANTE',
            'TELEFONO'                  => 'nullable|string|max:20',
            'DIRECCION'                 => 'nullable|string|max:255',
            'TITULO_BACHILLER'          => 'required|string|max:255|unique:ESTUDIANTE,TITULO_BACHILLER,' . $id . ',ID_ESTUDIANTE',
            'ESTADO'                    => 'required|in:ACTIVO,INACTIVO,APROBADO',
            'NUEVA_CIUDAD_NOMBRE'       => 'required_if:CIUDAD_ID,NEW|nullable|string|max:100',
            'NUEVA_CIUDAD_DEPARTAMENTO' => 'required_if:CIUDAD_ID,NEW|nullable|string|max:100',
            'NUEVO_COLEGIO_NOMBRE'      => 'required_if:COLEGIO_ID,NEW|nullable|string|max:100',
            'OPCION_1'                  => 'required_if:ESTADO,ACTIVO|nullable|exists:CARRERA_CUP,ID',
            'OPCION_2'                  => 'required_if:ESTADO,ACTIVO|nullable|exists:CARRERA_CUP,ID',
        ];

        if ($request->input('CIUDAD_ID') === 'NEW') {
            $rules['CIUDAD_ID'] = 'required';
        } else {
            $rules['CIUDAD_ID'] = 'required|integer|exists:CIUDAD,ID';
        }

        if ($request->input('COLEGIO_ID') === 'NEW') {
            $rules['COLEGIO_ID'] = 'required';
        } else {
            $rules['COLEGIO_ID'] = 'required|integer|exists:COLEGIO,ID';
        }

        $validated = $request->validate($rules);

        $activeCup = Cup::where('ESTADO', '!=', 'Concluido')->orderBy('ID_CUP', 'desc')->first();

        // Si no hay convocatoria activa, forzar estado a INACTIVO
        if (!$activeCup) {
            $validated['ESTADO'] = 'INACTIVO';
        }

        if ($validated['ESTADO'] === 'ACTIVO') {
            if (empty($validated['OPCION_1']) || empty($validated['OPCION_2'])) {
                throw ValidationException::withMessages([
                    'OPCION_1' => 'Para registrar un estudiante ACTIVO debe seleccionar ambas opciones de carrera.'
                ]);
            }
            if ($validated['OPCION_1'] == $validated['OPCION_2']) {
                throw ValidationException::withMessages([
                    'OPCION_2' => 'La primera y segunda opción de carrera deben ser estrictamente diferentes.'
                ]);
            }
        }

        try {
            DB::beginTransaction();

            // Procesar nueva Ciudad si se especificó
            $ciudadId = $validated['CIUDAD_ID'] ?? null;
            if (!empty($validated['NUEVA_CIUDAD_NOMBRE'])) {
                $ciudad = Ciudad::firstOrCreate(
                    ['NOMBRE' => strtoupper(trim($validated['NUEVA_CIUDAD_NOMBRE']))],
                    ['DEPARTAMENTO' => strtoupper(trim($validated['NUEVA_CIUDAD_DEPARTAMENTO'] ?? 'SANTA CRUZ'))]
                );
                $ciudadId = $ciudad->ID;
            }

            // Procesar nuevo Colegio si se especificó
            $colegioId = $validated['COLEGIO_ID'] ?? null;
            if (!empty($validated['NUEVO_COLEGIO_NOMBRE'])) {
                $colegio = Colegio::firstOrCreate(
                    ['NOMBRE' => strtoupper(trim($validated['NUEVO_COLEGIO_NOMBRE']))]
                );
                $colegioId = $colegio->ID;
            }

            // Actualizar estudiante
            $estudiante->update([
                'CARNET'           => $validated['CARNET'],
                'NOMBRE'           => strtoupper(trim($validated['NOMBRE'])),
                'APELLIDO'         => strtoupper(trim($validated['APELLIDO'])),
                'FECHA_NAC'        => $validated['FECHA_NAC'],
                'SEXO'             => strtoupper(trim($validated['SEXO'])),
                'DIRECCION'        => isset($validated['DIRECCION']) ? strtoupper(trim($validated['DIRECCION'])) : null,
                'TELEFONO'         => $validated['TELEFONO'] ?? null,
                'CORREO'           => strtolower(trim($validated['CORREO'])),
                'TITULO_BACHILLER' => strtoupper(trim($validated['TITULO_BACHILLER'])),
                'ESTADO'           => $validated['ESTADO'],
                'COLEGIO_ID'       => $colegioId,
                'CIUDAD_ID'        => $ciudadId,
            ]);

            if ($validated['ESTADO'] === 'ACTIVO') {
                try {
                    DB::statement('CALL p_inscribir_estudiante_cup(?, ?, ?, ?)', [
                        $estudiante->ID_ESTUDIANTE,
                        $activeCup->ID_CUP,
                        $validated['OPCION_1'],
                        $validated['OPCION_2']
                    ]);
                } catch (\Illuminate\Database\QueryException $qe) {
                    $errorMsg = $qe->getMessage();
                    $mensajeLimpio = 'Error al inscribir al estudiante.';
                    if (preg_match('/ERROR:\s*(.+?)(?:\n|Contexto|$)/i', $errorMsg, $matches)) {
                        $mensajeLimpio = trim($matches[1]);
                    } else {
                        $mensajeLimpio = $errorMsg;
                    }
                    throw new \Exception($mensajeLimpio);
                }
            } else {
                // Si el estado es INACTIVO o APROBADO, y tiene preinscripción activa, la eliminamos de forma segura
                if ($activeCup) {
                    $activeCups = EstudianteCup::where('ID_ESTUDIANTE', $estudiante->ID_ESTUDIANTE)
                        ->where('ID_CUP', $activeCup->ID_CUP)
                        ->get();
                    foreach ($activeCups as $ec) {
                        OpcionCarrera::where('ESTUDIANTE_CUP_ID', $ec->ID)->delete();
                        \App\Models\Calificacion::where('ESTUDIANTE_CUP_ID', $ec->ID)->delete();
                        $ec->delete();
                    }
                }
            }

            DB::commit();

            return redirect('/estudiantes')->with('success', 'Estudiante actualizado correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            throw ValidationException::withMessages([
                'CARNET' => $e->getMessage()
            ]);
        }
    }

    /**
     * Delete an existing student using transactional cascade deletion.
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $estudiante = Estudiante::findOrFail($id);

            // Recuperar y eliminar todas las preinscripciones y opciones asociadas
            $estudianteCups = EstudianteCup::where('ID_ESTUDIANTE', $id)->get();
            foreach ($estudianteCups as $ec) {
                OpcionCarrera::where('ESTUDIANTE_CUP_ID', $ec->ID)->delete();
                \App\Models\Calificacion::where('ESTUDIANTE_CUP_ID', $ec->ID)->delete();
                $ec->delete();
            }

            $estudiante->delete();

            DB::commit();

            return redirect('/estudiantes')->with('success', 'Estudiante eliminado correctamente.');
        } catch (\Illuminate\Database\QueryException $e) {
            DB::rollBack();
            throw ValidationException::withMessages([
                'id' => 'No se puede eliminar el estudiante debido a restricciones relacionales en la base de datos.'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            throw ValidationException::withMessages([
                'id' => 'Error al eliminar el estudiante: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Handle the Excel import.
     */
    public function importExcel(Request $request)
    {
        $request->validate([
            'archivo_excel' => 'required|file|mimes:xlsx,xls|max:10240',
            'CUP_ID'        => 'required|exists:CUP,ID_CUP',
        ]);

        $targetCup = Cup::findOrFail($request->CUP_ID);
        if ($targetCup->ESTADO === 'Concluido') {
            throw ValidationException::withMessages([
                'archivo_excel' => 'Operación denegada. No se pueden importar estudiantes a un proceso de admisión concluido.'
            ]);
        }

        try {
            DB::beginTransaction();

            Excel::import(new EstudiantesImport($request->CUP_ID), $request->file('archivo_excel'));

            DB::commit();

            return redirect()->back()->with('success', 'Importación de estudiantes completada con éxito.');
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            DB::rollBack();
            throw ValidationException::withMessages([
                'archivo_excel' => 'Error en los datos del Excel. Revisa el formato e inténtalo de nuevo.'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            $message = $e->getMessage();
            
            // Si es una violación de valor no nulo (campo obligatorio vacío)
            if (strpos($message, '23502') !== false) {
                if (preg_match('/columna «(.+?)»/u', $message, $matches)) {
                    $columna = $matches[1];
                    // Traducir columnas conocidas para máxima experiencia de usuario
                    $traducciones = [
                        'FECHA_NAC' => 'Fecha de Nacimiento',
                        'CARNET' => 'Carnet de Identidad',
                        'NOMBRE' => 'Nombres',
                        'APELLIDO' => 'Apellidos',
                        'SEXO' => 'Sexo',
                        'CORREO' => 'Correo Electrónico',
                        'TITULO_BACHILLER' => 'Título de Bachiller'
                    ];
                    $nombreLimpio = $traducciones[$columna] ?? $columna;
                    $message = "Error en el archivo Excel: El campo '{$nombreLimpio}' no puede estar vacío (viola la restricción obligatorio de base de datos).";
                } else {
                    $message = "Error en el archivo Excel: El archivo contiene celdas vacías en campos obligatorios.";
                }
            } elseif (strpos($message, '23505') !== false) {
                // Si es una violación de unicidad (duplicados)
                if (preg_match('/\((.+?)\)=\((.+?)\)/u', $message, $detMatches)) {
                    $columna = strtoupper($detMatches[1]);
                    $valor = $detMatches[2];
                    
                    $traducciones = [
                        'CARNET' => 'Carnet de Identidad',
                        'CORREO' => 'Correo Electrónico',
                        'TITULO_BACHILLER' => 'Título de Bachiller'
                    ];
                    $nombreLimpio = $traducciones[$columna] ?? $columna;
                    
                    $message = "Error en el archivo Excel: El dato '{$valor}' para '{$nombreLimpio}' ya se encuentra registrado en el sistema. Asegúrate de no incluir estudiantes duplicados.";
                } elseif (preg_match('/llave duplicada viola restricción de unicidad «(.+?)»/u', $message, $matches)) {
                    $message = "Error en el archivo Excel: Se detectó un dato duplicado que ya existe en el sistema ({$matches[1]}).";
                } else {
                    $message = "Error en el archivo Excel: Hay datos duplicados que violan la unicidad en el sistema.";
                }
            } else {
                // Mostrar un mensaje resumido
                $message = "Error durante la importación: " . $message;
            }

            throw ValidationException::withMessages([
                'archivo_excel' => $message
            ]);
        }
    }
}
