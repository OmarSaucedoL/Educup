<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DocenteCup extends Model
{
    protected $table = 'DOCENTE_CUP';
    protected $primaryKey = 'ID';
    public $timestamps = false;

    protected $fillable = [
        'CODIGO_DOCENTE',
        'ID_CUP',
        'FECHA_CREACION'
    ];

    protected $casts = [
        'FECHA_CREACION' => 'date'
    ];

    public function docente(): BelongsTo
    {
        return $this->belongsTo(Docente::class, 'CODIGO_DOCENTE', 'CODIGO_DOCENTE');
    }

    public function cup(): BelongsTo
    {
        return $this->belongsTo(Cup::class, 'ID_CUP', 'ID_CUP');
    }

    public function clases(): HasMany
    {
        return $this->hasMany(Clase::class, 'DOCENTE_CUP_ID', 'ID');
    }

    public function materias(): BelongsToMany
    {
        return $this->belongsToMany(Materia::class, 'DOCENTE_CUP_MAT', 'DOCENTE_CUP_ID', 'MATERIA_ID');
    }

    public function docenteCupMats(): HasMany
    {
        return $this->hasMany(DocenteCupMat::class, 'DOCENTE_CUP_ID', 'ID');
    }
}
