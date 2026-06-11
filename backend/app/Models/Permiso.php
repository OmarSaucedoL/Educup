<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Traits\LogsActivity;

class Permiso extends Model
{
    use LogsActivity;
    protected $table = 'PERMISOS';
    protected $primaryKey = 'ID';
    public $timestamps = false;

    protected $fillable = [
        'NOMBRE',
        'MODULO_ID'
    ];

    public function usuarios(): BelongsToMany
    {
        return $this->belongsToMany(Usuario::class, 'PERMISOS_USUARIO', 'PERMISOS_ID', 'USUARIO_ID')
                    ->withPivot('ESTADO', 'FECHA_MOD');
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Rol::class, 'PERMISO_ROL', 'PERMISOS_ID', 'ROL_ID')
                    ->withPivot('ESTADO', 'FECHA_MOD');
    }

    public function modulo(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Modulo::class, 'MODULO_ID', 'ID');
    }
}
