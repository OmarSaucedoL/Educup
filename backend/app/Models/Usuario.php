<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Usuario extends Model
{
    protected $table = 'USUARIO';
    protected $primaryKey = 'ID';
    public $timestamps = false;

    protected $fillable = [
        'USERNAME',
        'CONTRASENIA',
        'CARNET',
        'NOMBRE',
        'APELLIDO',
        'ESTADO',
        'FECHA_CREACION',
        'ROL_ID'
    ];

    protected $casts = [
        'FECHA_CREACION' => 'datetime'
    ];

    public function rol(): BelongsTo
    {
        return $this->belongsTo(Rol::class, 'ROL_ID', 'ID');
    }

    public function permisos(): BelongsToMany
    {
        return $this->belongsToMany(Permiso::class, 'PERMISOS_USUARIO', 'USUARIO_ID', 'PERMISOS_ID')
                    ->withPivot('ESTADO', 'FECHA_MOD');
    }

    public function cups(): HasMany
    {
        return $this->hasMany(Cup::class, 'USUARIO_ID', 'ID');
    }

    public function docente(): HasOne
    {
        return $this->hasOne(Docente::class, 'CODIGO', 'ID');
    }
}
