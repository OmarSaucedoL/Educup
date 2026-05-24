<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Permiso extends Model
{
    protected $table = 'PERMISOS';
    protected $primaryKey = 'ID';
    public $timestamps = false;

    protected $fillable = [
        'NOMBRE'
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
}
