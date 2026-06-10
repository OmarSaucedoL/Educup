<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $mod = DB::table('MODULO')->where('NOMBRE', 'INFRAESTRUCTURA')->first();
        if ($mod) {
            $permId = DB::table('PERMISOS')->insertGetId([
                'NOMBRE' => 'ASIGNAR_AULAS_CUP',
                'MODULO_ID' => $mod->ID
            ], 'ID');

            $rolAdmin = DB::table('ROL')->where('NOMBRE', 'ADMINISTRADOR')->first();
            if ($rolAdmin) {
                DB::table('PERMISO_ROL')->insert([
                    'ROL_ID' => $rolAdmin->ID,
                    'PERMISOS_ID' => $permId,
                    'ESTADO' => 'ACTIVO',
                    'FECHA_MOD' => Carbon::now()
                ]);

                $usuarios = DB::table('USUARIO')->where('ROL_ID', $rolAdmin->ID)->get();
                foreach ($usuarios as $u) {
                    DB::table('PERMISOS_USUARIO')->insert([
                        'USUARIO_ID' => $u->ID,
                        'PERMISOS_ID' => $permId,
                        'ESTADO' => 'ACTIVO',
                        'FECHA_MOD' => Carbon::now()
                    ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $perm = DB::table('PERMISOS')->where('NOMBRE', 'ASIGNAR_AULAS_CUP')->first();
        if ($perm) {
            DB::table('PERMISOS_USUARIO')->where('PERMISOS_ID', $perm->ID)->delete();
            DB::table('PERMISO_ROL')->where('PERMISOS_ID', $perm->ID)->delete();
            DB::table('PERMISOS')->where('ID', $perm->ID)->delete();
        }
    }
};
