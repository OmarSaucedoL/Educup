<?php

namespace App\Http\Controllers;

use App\Models\Ciudad;
use App\Models\Colegio;
use App\Models\Estudiante;
use Illuminate\Http\Request;
use Inertia\Inertia;

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
            'CARNET'           => 'required|string|max:20|unique:ESTUDIANTE,CARNET',
            'NOMBRE'           => 'required|string|max:100',
            'APELLIDO'         => 'required|string|max:100',
            'FECHA_NAC'        => 'required|date',
            'SEXO'             => 'required|in:M,F',
            'CORREO'           => 'required|email|max:150|unique:ESTUDIANTE,CORREO',
            'TELEFONO'         => 'required|string|max:20',
            'DIRECCION'        => 'required|string|max:255',
            'TITULO_BACHILLER' => 'nullable|string|max:255|unique:ESTUDIANTE,TITULO_BACHILLER',
            'ESTADO'           => 'required|in:ACTIVO,INACTIVO',
            'COLEGIO_ID'       => 'nullable|exists:COLEGIO,ID',
            'CIUDAD_ID'        => 'nullable|exists:CIUDAD,ID',
        ]);

        Estudiante::create($validated);

        return redirect('/estudiantes')->with('success', 'Estudiante registrado correctamente.');
    }
}
