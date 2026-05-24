<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Rol extends Model
{
    protected $table = 'ROL';
    protected $primaryKey = 'ID';
    public $timestamps = false;

    protected $fillable = [
        'NOMBRE'
    ];

    public function usuarios(): HasMany
    {
        return $this->hasMany(Usuario::class, 'ROL_ID', 'ID');
    }

    public function permisos(): BelongsToMany
    {
        return $this->belongsToMany(Permiso::class, 'PERMISO_ROL', 'ROL_ID', 'PERMISOS_ID')
                    ->withPivot('ESTADO', 'FECHA_MOD');
    }
}
