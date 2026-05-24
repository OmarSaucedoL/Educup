<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Colegio extends Model
{
    protected $table = 'COLEGIO';
    protected $primaryKey = 'ID';
    public $timestamps = false;

    protected $fillable = [
        'NOMBRE'
    ];

    public function estudiantes(): HasMany
    {
        return $this->hasMany(Estudiante::class, 'COLEGIO_ID', 'ID');
    }
}
