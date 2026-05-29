<?php

namespace App\Http\Controllers;

use App\Models\Bitacora;
use Illuminate\Http\Request;

class BitacoraController extends Controller
{
    /**
     * Display a listing of the activity logs.
     */
    public function index(Request $request)
    {
        $query = Bitacora::with('usuario.rol')->orderBy('FECHA_REGISTRO', 'desc');

        // Text search filter (descripton, table, username, nombre, apellido)
        if ($request->filled('search')) {
            $search = '%' . $request->search . '%';
            $query->where(function ($q) use ($search) {
                $q->where('DESCRIPCION', 'ILIKE', $search)
                  ->orWhere('TABLA', 'ILIKE', $search)
                  ->orWhereHas('usuario', function ($uQ) use ($search) {
                      $uQ->where('USERNAME', 'ILIKE', $search)
                         ->orWhere('NOMBRE', 'ILIKE', $search)
                         ->orWhere('APELLIDO', 'ILIKE', $search);
                  });
            });
        }

        // Action category filter
        if ($request->filled('accion')) {
            $query->where('ACCION', $request->accion);
        }

        // Paginate logs with 15 records per page, keeping query string
        $logs = $query->paginate(15)->withQueryString();

        return inertia('bitacora/index', [
            'bitacora' => $logs,
            'filters' => $request->only(['search', 'accion'])
        ]);
    }
}
