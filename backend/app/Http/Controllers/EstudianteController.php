<?php

namespace App\Http\Controllers;

use App\Models\Ciudad;
use App\Models\Colegio;
use App\Models\Estudiante;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Imports\EstudiantesImport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Validation\ValidationException;

class EstudianteController extends Controller
{
    /**
     * Show the form for creating a new student.
     */
    public function create()
    {
        $colegios = Colegio::orderBy('NOMBRE')->get(['ID', 'NOMBRE']);
        $ciudades = Ciudad::orderBy('NOMBRE')->get(['ID', 'NOMBRE', 'DEPARTAMENTO']);

        return Inertia::render('estudiantes/crearEstudiante', [
            'colegios' => $colegios,
            'ciudades' => $ciudades,
        ]);
    }

    /**
     * Handle the Excel import.
     */
    public function importExcel(Request $request)
    {
        $request->validate([
            'archivo_excel' => 'required|file|mimes:xlsx,xls|max:10240', // 10MB max
            'CUP_ID'        => 'required|exists:CUP,ID_CUP',
        ]);

        try {
            DB::beginTransaction();

            Excel::import(new EstudiantesImport($request->CUP_ID), $request->file('archivo_excel'));

            DB::commit();

            return redirect()->back()->with('success', 'Importación de estudiantes completada con éxito.');
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            DB::rollBack();
            $failures = $e->failures();
            throw ValidationException::withMessages([
                'archivo_excel' => 'Error en los datos del Excel. Revisa el formato e inténtalo de nuevo.'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            throw ValidationException::withMessages([
                'archivo_excel' => $e->getMessage()
            ]);
        }
    }

    /**
     * Display a listing of all students.
     */
    public function index()
    {
        $estudiantes = Estudiante::with(['colegio', 'ciudad'])
            ->orderBy('APELLIDO')
            ->orderBy('NOMBRE')
            ->get();

        $colegios = Colegio::orderBy('NOMBRE')->get(['ID', 'NOMBRE']);
        $ciudades = Ciudad::orderBy('NOMBRE')->get(['ID', 'NOMBRE', 'DEPARTAMENTO']);

        return Inertia::render('estudiantes/index', [
            'estudiantes' => $estudiantes,
            'colegios'    => $colegios,
            'ciudades'    => $ciudades,
        ]);
    }

    /**
     * Store a newly created student.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'CARNET'           => 'required|integer|unique:ESTUDIANTE,CARNET',
            'NOMBRE'           => 'required|string|max:100',
            'APELLIDO'         => 'required|string|max:100',
            'FECHA_NAC'        => 'required|date',
            'SEXO'             => 'required|in:M,F',
            'CORREO'           => 'required|email|max:150|unique:ESTUDIANTE,CORREO',
            'TELEFONO'         => 'required|string|max:20',
            'DIRECCION'        => 'required|string|max:255',
            'TITULO_BACHILLER' => 'required|string|max:255|unique:ESTUDIANTE,TITULO_BACHILLER',
            'ESTADO'           => 'required|in:ACTIVO,INACTIVO',
            'COLEGIO_ID'       => 'nullable|exists:COLEGIO,ID',
            'CIUDAD_ID'        => 'nullable|exists:CIUDAD,ID',
        ]);

        Estudiante::create($validated);

        return redirect('/estudiantes')->with('success', 'Estudiante registrado correctamente.');
    }
}
