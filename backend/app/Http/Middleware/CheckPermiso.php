<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class CheckPermiso
{
    /**
     * Handle an incoming request.
     * Usage: ->middleware('permiso:NOMBRE_PERMISO')
     */
    public function handle(Request $request, Closure $next, string $permiso): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect('/login');
        }

        // Check if the user has the permission active in PERMISOS_USUARIO
        $permisoId = DB::table('PERMISOS')
            ->where('NOMBRE', $permiso)
            ->value('ID');

        $tienePermiso = $permisoId && DB::table('PERMISOS_USUARIO')
            ->where('USUARIO_ID', $user->ID)
            ->where('PERMISOS_ID', $permisoId)
            ->where('ESTADO', 'ACTIVO')
            ->exists();

        if (!$tienePermiso) {
            if ($request->wantsJson() || $request->header('X-Inertia')) {
                return redirect()->intended('/dashboard')
                    ->with('forbidden', 'No tienes los permisos necesarios para acceder a esta sección.');
            }
            return redirect('/dashboard')
                ->with('forbidden', 'No tienes los permisos necesarios para acceder a esta sección.');
        }

        return $next($request);
    }
}
