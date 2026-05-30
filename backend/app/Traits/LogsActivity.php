<?php

namespace App\Traits;

use App\Models\Bitacora;
use Illuminate\Support\Facades\Auth;

trait LogsActivity
{
    /**
     * Boot the trait and register Eloquent event listeners.
     */
    protected static function bootLogsActivity()
    {
        static::created(function ($model) {
            static::logActivity($model, 'CREAR', "Se creó un registro en la tabla '{$model->getTable()}' con ID {$model->getKey()}.");
        });

        static::updated(function ($model) {
            $changed = [];
            foreach ($model->getChanges() as $key => $value) {
                // Ignore internal and sensitive fields
                if (in_array(strtoupper($key), ['CONTRASENIA', 'PASSWORD', 'REMEMBER_TOKEN', 'FECHA_CREACION', 'FECHA_MOD'])) {
                    continue;
                }
                $original = $model->getOriginal($key);
                
                $origStr = is_bool($original) ? ($original ? 'true' : 'false') : (string)$original;
                $valStr = is_bool($value) ? ($value ? 'true' : 'false') : (string)$value;
                $changed[] = "[{$key}]: de '{$origStr}' a '{$valStr}'";
            }

            $description = "Se actualizó el registro con ID {$model->getKey()} en la tabla '{$model->getTable()}'.";
            if (!empty($changed)) {
                $description .= " Cambios: " . implode('; ', $changed);
            } else {
                $description .= " No se detectaron cambios en campos rastreables.";
            }

            static::logActivity($model, 'ACTUALIZAR', $description);
        });

        static::deleted(function ($model) {
            static::logActivity($model, 'ELIMINAR', "Se eliminó el registro con ID {$model->getKey()} de la tabla '{$model->getTable()}'.");
        });
    }

    /**
     * Create a log entry in the BITACORA table.
     */
    protected static function logActivity($model, string $action, string $description)
    {
        try {
            Bitacora::create([
                'USUARIO_ID' => Auth::id(),
                'SESSION_ID' => request()->session()->getId(),
                'ACCION' => $action,
                'TABLA' => $model->getTable(),
                'REGISTRO_ID' => $model->getKey(),
                'DESCRIPCION' => $description,
                'IP_DIRECCION' => request()->ip(),
                'FECHA_REGISTRO' => now(),
            ]);
        } catch (\Exception $e) {
            \Log::error("Error guardando bitácora para el modelo {$model->getTable()}: " . $e->getMessage());
        }
    }
}
