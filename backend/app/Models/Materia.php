<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

use App\Traits\LogsActivity;

class Materia extends Model
{
    use LogsActivity;
    protected $table = 'MATERIA';
    protected $primaryKey = 'ID_MATERIA';
    public $timestamps = false;

    protected $fillable = [
        'NOMBRE'
    ];

    public function clases(): HasMany
    {
        return $this->hasMany(Clase::class, 'ID_MATERIA', 'ID_MATERIA');
    }

    public function docenteCups(): BelongsToMany
    {
        return $this->belongsToMany(DocenteCup::class, 'DOCENTE_CUP_MAT', 'MATERIA_ID', 'DOCENTE_CUP_ID');
    }

    public function docenteCupMats(): HasMany
    {
        return $this->hasMany(DocenteCupMat::class, 'MATERIA_ID', 'ID_MATERIA');
    }
}
