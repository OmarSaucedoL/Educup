<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Imports\UsuariosImport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rules\Password;

class UsuarioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search', '');
        $rolId = $request->input('rol_id', '');
        $estado = $request->input('estado', '');

        $query = Usuario::with(['rol.permisos', 'permisos' => function ($q) {
            $q->where('PERMISOS_USUARIO.ESTADO', 'ACTIVO');
        }]);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereRaw('UPPER("USERNAME") LIKE ?', ['%' . strtoupper($search) . '%'])
                  ->orWhereRaw('UPPER("NOMBRE") LIKE ?', ['%' . strtoupper($search) . '%'])
                  ->orWhereRaw('UPPER("APELLIDO") LIKE ?', ['%' . strtoupper($search) . '%'])
                  ->orWhereRaw('LOWER("CORREO") LIKE ?', ['%' . strtolower($search) . '%']);
            });
        }

        if ($rolId !== '') {
            $query->where('ROL_ID', $rolId);
        }

        if ($estado !== '') {
            $query->where('ESTADO', $estado);
        }

        $usuarios = $query->orderBy('APELLIDO')->orderBy('NOMBRE')->paginate(15)->withQueryString();

        foreach ($usuarios as $usuario) {
            $usuario->has_custom_permissions = DB::table('PERMISOS_USUARIO')
                ->where('USUARIO_ID', $usuario->ID)
                ->exists();
        }

        $todosLosPermisos = \App\Models\Permiso::with('modulo')->get();
        $roles = \App\Models\Rol::orderBy('NOMBRE')->get();

        return inertia('usuarios/index', [
            'usuarios'  => $usuarios,
            'permisos'  => $todosLosPermisos,
            'roles'     => $roles,
            'filters'   => [
                'search' => $search,
                'rol_id' => $rolId,
                'estado' => $estado,
            ],
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
        if ($request->has('USERNAME')) {
            $request->merge([
                'USERNAME' => strtoupper(trim($request->USERNAME)),
            ]);
        }

        $validated = $request->validate([
            'USERNAME' => 'required|string|max:255',
            'CONTRASENIA' => ['required', 'string', Password::min(8)->mixedCase()->numbers()->symbols()],
            'CARNET' => 'nullable|numeric',
            'NOMBRE' => 'required|string|max:255',
            'APELLIDO' => 'required|string|max:255',
            'CORREO' => 'required|string|email|max:255',
            'TELEFONO' => 'nullable|numeric',
            'ESTADO' => 'nullable|string|in:ACTIVO,INACTIVO',
            'ROL_ID' => 'nullable|integer|exists:ROL,ID'
        ]);

        $validated['CONTRASENIA'] = Hash::make($validated['CONTRASENIA']);
        $validated['FECHA_CREACION'] = now();
        
        if (!isset($validated['ESTADO'])) {
            $validated['ESTADO'] = 'ACTIVO'; // Default to active
        }

        // Call the database function inside a try-catch to handle constraints and custom errors
        try {
            $nuevoId = DB::selectOne('
                SELECT public.f_insertar_usuario(?, ?, ?, ?, ?, ?, ?, ?, ?) as nuevo_id
            ', [
                $validated['USERNAME'],
                $validated['CONTRASENIA'],
                $validated['CARNET'] === '' ? null : ($validated['CARNET'] ?? null),
                $validated['NOMBRE'],
                $validated['APELLIDO'],
                $validated['CORREO'],
                $validated['TELEFONO'] === '' ? null : ($validated['TELEFONO'] ?? null),
                $validated['ESTADO'] ?? 'ACTIVO',
                $validated['ROL_ID'] === '' ? null : ($validated['ROL_ID'] ?? null)
            ])->nuevo_id;

            return redirect('/usuarios')->with('success', 'Usuario creado correctamente (ID: ' . $nuevoId . ').');
        } catch (\Exception $e) {
            $errorMsg = $e->getMessage();
            // Check if the error comes from our RAISE EXCEPTION blocks
            if (str_contains($errorMsg, 'ya está en uso') || str_contains($errorMsg, 'ya está registrado')) {
                // Try to extract the clean message from Postgres ERROR
                preg_match('/ERROR:\s+(.*?)\n/', $errorMsg, $matches);
                $cleanMsg = $matches[1] ?? 'Error de validación al crear el usuario. Datos duplicados.';
                
                throw ValidationException::withMessages([
                    'USERNAME' => $cleanMsg,
                ]);
            }
            throw $e;
        }
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

        if ($request->has('USERNAME')) {
            $request->merge([
                'USERNAME' => strtoupper(trim($request->USERNAME)),
            ]);
        }

        $validated = $request->validate([
            'USERNAME' => 'sometimes|required|string|max:255',
            'CONTRASENIA' => ['nullable', 'string', Password::min(8)->mixedCase()->numbers()->symbols()],
            'CARNET' => 'nullable|numeric',
            'NOMBRE' => 'sometimes|required|string|max:255',
            'APELLIDO' => 'sometimes|required|string|max:255',
            'CORREO' => 'sometimes|required|string|email|max:255',
            'TELEFONO' => 'nullable|numeric',
            'ESTADO' => 'nullable|string|in:ACTIVO,INACTIVO',
            'ROL_ID' => 'nullable|integer|exists:ROL,ID'
        ]);

        if (!empty($validated['CONTRASENIA'])) {
            $validated['CONTRASENIA'] = Hash::make($validated['CONTRASENIA']);
        } else {
            unset($validated['CONTRASENIA']);
        }

        try {
            DB::statement('
                SELECT public.f_actualizar_usuario(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ', [
                $id,
                $validated['USERNAME'],
                $validated['CONTRASENIA'] === '' ? null : ($validated['CONTRASENIA'] ?? null),
                $validated['CARNET'] === '' ? null : ($validated['CARNET'] ?? null),
                $validated['NOMBRE'],
                $validated['APELLIDO'],
                $validated['CORREO'],
                $validated['TELEFONO'] === '' ? null : ($validated['TELEFONO'] ?? null),
                $validated['ESTADO'] ?? null,
                $validated['ROL_ID'] === '' ? null : ($validated['ROL_ID'] ?? null)
            ]);

            return redirect('/usuarios')->with('success', 'Usuario actualizado correctamente.');
        } catch (\Exception $e) {
            $errorMsg = $e->getMessage();
            if (str_contains($errorMsg, 'ya está en uso') || str_contains($errorMsg, 'ya está registrado')) {
                preg_match('/ERROR:\s+(.*?)\n/', $errorMsg, $matches);
                $cleanMsg = $matches[1] ?? 'Error de validación al actualizar el usuario. Datos duplicados.';
                
                throw ValidationException::withMessages([
                    'USERNAME' => $cleanMsg,
                ]);
            }
            throw $e;
        }
    }

    /**
     * Update user specific permissions.
     */
    public function updatePermisos(Request $request, string $id)
    {
        $request->validate([
            'permisos' => 'array',
            'permisos.*' => 'exists:PERMISOS,ID'
        ]);

        $usuario = Usuario::findOrFail($id);
        $permisosSolicitados = $request->permisos ?? [];

        // Fetch historical permissions for this user to decide update vs insert
        $todosPermisosHistoricos = DB::table('PERMISOS_USUARIO')
            ->where('USUARIO_ID', $usuario->ID)
            ->pluck('PERMISOS_ID')
            ->toArray();

        // Deactivate permissions that are no longer requested
        DB::table('PERMISOS_USUARIO')
            ->where('USUARIO_ID', $usuario->ID)
            ->whereNotIn('PERMISOS_ID', $permisosSolicitados)
            ->update(['ESTADO' => 'INACTIVO', 'FECHA_MOD' => now()]);

        // Activate or insert requested permissions
        foreach ($permisosSolicitados as $permId) {
            if (in_array($permId, $todosPermisosHistoricos)) {
                DB::table('PERMISOS_USUARIO')
                    ->where('USUARIO_ID', $usuario->ID)
                    ->where('PERMISOS_ID', $permId)
                    ->update(['ESTADO' => 'ACTIVO', 'FECHA_MOD' => now()]);
            } else {
                DB::table('PERMISOS_USUARIO')->insert([
                    'USUARIO_ID' => $usuario->ID,
                    'PERMISOS_ID' => $permId,
                    'ESTADO' => 'ACTIVO',
                    'FECHA_MOD' => now()
                ]);
            }
        }

        return redirect('/usuarios')->with('success', 'Permisos del usuario actualizados correctamente.');
    }
}
