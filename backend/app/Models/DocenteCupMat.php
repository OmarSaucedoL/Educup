<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocenteCupMat extends Model
{
    protected $table = 'DOCENTE_CUP_MAT';
    protected $primaryKey = 'ID';
    public $timestamps = false;

    protected $fillable = [
        'DOCENTE_CUP_ID',
        'MATERIA_ID'
    ];

    public function docenteCup(): BelongsTo
    {
        return $this->belongsTo(DocenteCup::class, 'DOCENTE_CUP_ID', 'ID');
    }

    public function materia(): BelongsTo
    {
        return $this->belongsTo(Materia::class, 'MATERIA_ID', 'ID_MATERIA');
    }
}
