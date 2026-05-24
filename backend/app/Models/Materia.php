<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Materia extends Model
{
    protected $table = 'MATERIA';
    protected $primaryKey = 'ID';
    public $timestamps = false;

    protected $fillable = [
        'NOMBRE'
    ];

    public function clases(): HasMany
    {
        return $this->hasMany(Clase::class, 'MATERIA_ID', 'ID');
    }
}
