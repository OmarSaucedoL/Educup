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

        // Seed role's permissions as initial direct permissions
        if ($usuario->ROL_ID) {
            $rolPermisosIds = DB::table('PERMISO_ROL')
                ->where('ROL_ID', $usuario->ROL_ID)
                ->where('ESTADO', 'ACTIVO')
                ->pluck('PERMISOS_ID');
            
            foreach ($rolPermisosIds as $permId) {
                DB::table('PERMISOS_USUARIO')->insert([
                    'USUARIO_ID' => $usuario->ID,
                    'PERMISOS_ID' => $permId,
                    'ESTADO' => 'ACTIVO',
                    'FECHA_MOD' => now()
                ]);
            }

            // Logic to create a Docente record if the role is Docente
            $rol = \App\Models\Rol::find($usuario->ROL_ID);
            if ($rol && str_contains(strtoupper($rol->NOMBRE), 'DOCENTE')) {
                \App\Models\Docente::firstOrCreate([
                    'CODIGO_DOCENTE' => $usuario->ID
                ]);
            }
        }

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

        if ($request->has('USERNAME')) {
            $request->merge([
                'USERNAME' => strtoupper(trim($request->USERNAME)),
            ]);
        }

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

        if ($usuario->ROL_ID) {
            $rol = \App\Models\Rol::find($usuario->ROL_ID);
            if ($rol && str_contains(strtoupper($rol->NOMBRE), 'DOCENTE')) {
                \App\Models\Docente::firstOrCreate([
                    'CODIGO_DOCENTE' => $usuario->ID
                ]);
            }
        }

        return redirect('/usuarios')->with('success', 'Usuario actualizado correctamente.');
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
