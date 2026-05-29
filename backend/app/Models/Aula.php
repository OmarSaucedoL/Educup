<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Aula extends Model
{
    protected $table = 'AULA';
    protected $primaryKey = 'ID_AULA';
    public $timestamps = false;

    protected $fillable = [
        'NOMBRE',
        'DESCRIPCION',
        'ESTADO'
    ];

    public function clases(): HasMany
    {
        return $this->hasMany(Clase::class, 'ID_AULA', 'ID_AULA');
    }
}
