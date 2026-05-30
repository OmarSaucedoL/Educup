<?php

namespace App\Http\Controllers;

use App\Models\Rol;
use Inertia\Inertia;

class RolController extends Controller
{
    public function index()
    {
        $roles = Rol::with('permisos')->get();
        $todosLosPermisos = \App\Models\Permiso::all();

        return Inertia::render('roles/index', [
            'roles' => $roles,
            'permisos' => $todosLosPermisos
        ]);
    }

    public function store(\Illuminate\Http\Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255|unique:ROL,NOMBRE',
            'permisos' => 'array',
            'permisos.*' => 'exists:PERMISOS,ID'
        ]);

        $rol = Rol::create([
            'NOMBRE' => strtoupper($request->nombre)
        ]);

        if ($request->has('permisos') && count($request->permisos) > 0) {
            foreach ($request->permisos as $permisoId) {
                \Illuminate\Support\Facades\DB::table('PERMISO_ROL')->insert([
                    'ROL_ID' => $rol->ID,
                    'PERMISOS_ID' => $permisoId,
                    'ESTADO' => 'ACTIVO',
                    'FECHA_MOD' => \Carbon\Carbon::now()
                ]);
            }
        }

        return redirect()->route('roles.index')->with('success', 'Rol creado exitosamente.');
    }

    public function update(\Illuminate\Http\Request $request, $id)
    {
        $request->validate([
            'nombre' => 'required|string|max:255|unique:ROL,NOMBRE,' . $id . ',ID',
            'permisos' => 'array',
            'permisos.*' => 'exists:PERMISOS,ID'
        ]);

        $rol = Rol::findOrFail($id);
        $rol->update([
            'NOMBRE' => strtoupper($request->nombre)
        ]);

        $permisosSolicitados = $request->permisos ?? [];
        // Obtener SOLO los activos para saber qué se agregó y quitó desde la interfaz
        $permisosActualesActivos = \Illuminate\Support\Facades\DB::table('PERMISO_ROL')
            ->where('ROL_ID', $rol->ID)
            ->where('ESTADO', 'ACTIVO')
            ->pluck('PERMISOS_ID')->toArray();
            
        // Obtener TODOS para actualizar registros existentes en PERMISO_ROL
        $todosPermisosHistoricos = \Illuminate\Support\Facades\DB::table('PERMISO_ROL')
            ->where('ROL_ID', $rol->ID)
            ->pluck('PERMISOS_ID')->toArray();

        $aplicarATodos = $request->boolean('aplicarATodos', false);

        // Desactivamos los que estaban activos y ya no están en la solicitud
        $toDeactivate = array_diff($permisosActualesActivos, $permisosSolicitados);
        $toActivate = $permisosSolicitados;
        
        // Los recién agregados son los solicitados que no estaban activos antes
        $newlyAdded = array_diff($permisosSolicitados, $permisosActualesActivos);

        if (count($toDeactivate) > 0) {
            \Illuminate\Support\Facades\DB::table('PERMISO_ROL')
                ->where('ROL_ID', $rol->ID)
                ->whereIn('PERMISOS_ID', $toDeactivate)
                ->update(['ESTADO' => 'INACTIVO', 'FECHA_MOD' => \Carbon\Carbon::now()]);
        }

        foreach ($toActivate as $permId) {
            if (in_array($permId, $todosPermisosHistoricos)) {
                \Illuminate\Support\Facades\DB::table('PERMISO_ROL')
                    ->where('ROL_ID', $rol->ID)
                    ->where('PERMISOS_ID', $permId)
                    ->update(['ESTADO' => 'ACTIVO', 'FECHA_MOD' => \Carbon\Carbon::now()]);
            } else {
                \Illuminate\Support\Facades\DB::table('PERMISO_ROL')->insert([
                    'ROL_ID' => $rol->ID,
                    'PERMISOS_ID' => $permId,
                    'ESTADO' => 'ACTIVO',
                    'FECHA_MOD' => \Carbon\Carbon::now()
                ]);
            }
        }

        if ($aplicarATodos) {
            $usuariosDelRol = \App\Models\Usuario::where('ROL_ID', $rol->ID)->pluck('ID')->toArray();
            
            if (count($usuariosDelRol) > 0) {
                // Desactivar a los usuarios los permisos que se le quitaron al rol
                if (count($toDeactivate) > 0) {
                    \Illuminate\Support\Facades\DB::table('PERMISOS_USUARIO')
                        ->whereIn('USUARIO_ID', $usuariosDelRol)
                        ->whereIn('PERMISOS_ID', $toDeactivate)
                        ->update(['ESTADO' => 'INACTIVO', 'FECHA_MOD' => \Carbon\Carbon::now()]);
                }

                // Agregar a los usuarios los permisos que se le agregaron al rol
                if (count($newlyAdded) > 0) {
                    foreach ($usuariosDelRol as $userId) {
                        foreach ($newlyAdded as $permId) {
                            $existe = \Illuminate\Support\Facades\DB::table('PERMISOS_USUARIO')
                                ->where('USUARIO_ID', $userId)
                                ->where('PERMISOS_ID', $permId)
                                ->first();
                                
                            if ($existe) {
                                \Illuminate\Support\Facades\DB::table('PERMISOS_USUARIO')
                                    ->where('USUARIO_ID', $userId)
                                    ->where('PERMISOS_ID', $permId)
                                    ->update(['ESTADO' => 'ACTIVO', 'FECHA_MOD' => \Carbon\Carbon::now()]);
                            } else {
                                \Illuminate\Support\Facades\DB::table('PERMISOS_USUARIO')->insert([
                                    'USUARIO_ID' => $userId,
                                    'PERMISOS_ID' => $permId,
                                    'ESTADO' => 'ACTIVO',
                                    'FECHA_MOD' => \Carbon\Carbon::now()
                                ]);
                            }
                        }
                    }
                }
            }
        }

        return redirect()->route('roles.index')->with('success', 'Rol actualizado exitosamente.');
    }
}
