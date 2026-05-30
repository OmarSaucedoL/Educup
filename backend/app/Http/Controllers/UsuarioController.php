<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Imports\UsuariosImport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Validation\ValidationException;

class UsuarioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $usuarios = Usuario::with('rol')->get();
        return inertia('usuarios/index', [
            'usuarios' => $usuarios
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $roles = \App\Models\Rol::all();
        return inertia('usuarios/crearUsuario', [
            'roles' => $roles
        ]);
    }

    /**
     * Handle the Excel import for users.
     */
    public function importExcel(Request $request)
    {
        $request->validate([
            'archivo_excel' => 'required|file|mimes:xlsx,xls|max:10240', // 10MB max
        ]);

        try {
            DB::beginTransaction();

            Excel::import(new UsuariosImport(), $request->file('archivo_excel'));

            DB::commit();

            return redirect()->back()->with('success', 'Importación masiva de usuarios completada con éxito.');
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            DB::rollBack();
            $failures = $e->failures();
            throw ValidationException::withMessages([
                'archivo_excel' => 'Error de formato en los datos del Excel. Revisa el archivo e inténtalo de nuevo.'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            throw ValidationException::withMessages([
                'archivo_excel' => $e->getMessage()
            ]);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'USERNAME' => 'required|string|max:255|unique:USUARIO',
            'CONTRASENIA' => 'required|string|min:6',
            'CARNET' => 'nullable',
            'NOMBRE' => 'required|string|max:255',
            'APELLIDO' => 'required|string|max:255',
            'CORREO' => 'required|string|email|max:255|unique:USUARIO',
            'ESTADO' => 'nullable|string|in:ACTIVO,INACTIVO',
            'ROL_ID' => 'nullable|integer|exists:ROL,ID'
        ]);

        $validated['CONTRASENIA'] = Hash::make($validated['CONTRASENIA']);
        $validated['FECHA_CREACION'] = now();
        
        if (!isset($validated['ESTADO'])) {
            $validated['ESTADO'] = 'ACTIVO'; // Default to active
        }

        // Ensure CARNET is cast to string if provided
        if (isset($validated['CARNET'])) {
            $validated['CARNET'] = (string) $validated['CARNET'];
        }

        $usuario = Usuario::create($validated);

        return redirect('/usuarios')->with('success', 'Usuario creado correctamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $usuario = Usuario::with(['rol', 'permisos'])->findOrFail($id);
        return response()->json($usuario);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $usuario = Usuario::findOrFail($id);
        $roles = \App\Models\Rol::all();
        
        return inertia('usuarios/editarUsuario', [
            'usuario' => $usuario,
            'roles' => $roles
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $usuario = Usuario::findOrFail($id);

        $validated = $request->validate([
            'USERNAME' => 'sometimes|required|string|max:255|unique:USUARIO,USERNAME,' . $id . ',ID',
            'CONTRASENIA' => 'nullable|string|min:6',
            'CARNET' => 'nullable',
            'NOMBRE' => 'sometimes|required|string|max:255',
            'APELLIDO' => 'sometimes|required|string|max:255',
            'CORREO' => 'sometimes|required|string|email|max:255|unique:USUARIO,CORREO,' . $id . ',ID',
            'ESTADO' => 'nullable|string|in:ACTIVO,INACTIVO',
            'ROL_ID' => 'nullable|integer|exists:ROL,ID'
        ]);

        if (!empty($validated['CONTRASENIA'])) {
            $validated['CONTRASENIA'] = Hash::make($validated['CONTRASENIA']);
        } else {
            unset($validated['CONTRASENIA']);
        }

        // Ensure CARNET is cast to string if provided
        if (isset($validated['CARNET'])) {
            $validated['CARNET'] = (string) $validated['CARNET'];
        }

        $usuario->update($validated);

        return redirect('/usuarios')->with('success', 'Usuario actualizado correctamente.');
    }
}
