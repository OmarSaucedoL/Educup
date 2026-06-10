<?php

namespace App\Traits;

use App\Models\Bitacora;
use Illuminate\Support\Facades\Auth;

trait LogsActivity
{
    /**
     * Get the fields that should be tracked for this model.
     * Override this method in your model to specify which fields to track.
     * If not overridden, all fields except system/sensitive ones are tracked.
     *
     * @return array|null Array of field names to track, or null to track all (except system fields)
     */
    protected static function getTrackedFields()
    {
        return null; // Track all by default
    }

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
            $trackedFields = $model::getTrackedFields();
            
            foreach ($model->getChanges() as $key => $value) {
                // Skip if we have a tracked fields list and this field is not in it
                if ($trackedFields !== null && !in_array($key, $trackedFields)) {
                    continue;
                }

                // Ignore internal and sensitive fields
                if (in_array(strtoupper($key), ['CONTRASENIA', 'PASSWORD', 'REMEMBER_TOKEN', 'FECHA_CREACION', 'FECHA_MOD'])) {
                    continue;
                }
                
                $original = $model->getOriginal($key);
                
                $origStr = is_bool($original) ? ($original ? 'true' : 'false') : (string)$original;
                $valStr = is_bool($value) ? ($value ? 'true' : 'false') : (string)$value;
                $changed[] = "[{$key}]: de '{$origStr}' a '{$valStr}'";
            }

            // Only log if there are actual changes to track
            if (!empty($changed)) {
                $description = "Se actualizó el registro con ID {$model->getKey()} en la tabla '{$model->getTable()}'. Cambios: " . implode('; ', $changed);
                static::logActivity($model, 'ACTUALIZAR', $description);
            }
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
