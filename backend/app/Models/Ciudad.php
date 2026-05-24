<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ciudad extends Model
{
    protected $table = 'CIUDAD';
    protected $primaryKey = 'ID';
    public $timestamps = false;

    protected $fillable = [
        'NOMBRE',
        'DEPARTAMENTO'
    ];

    public function estudiantes(): HasMany
    {
        return $this->hasMany(Estudiante::class, 'CIUDAD_ID', 'ID');
    }
}
