<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Traits\LogsActivity;

class Cup extends Model
{
    use LogsActivity;
    protected $table = 'CUP';
    protected $primaryKey = 'ID_CUP';
    public $timestamps = false;

    protected $fillable = [
        'ANIO',
        'SEMESTRE',
        'NOTA_MINIMA',
        'CUPOS',
        'FECHA_INICIO',
        'FECHA_FIN',
        'USUARIO_ID',
        'ESTADO'
    ];

    protected $casts = [
        'FECHA_INICIO' => 'date',
        'FECHA_FIN' => 'date',
        'NOTA_MINIMA' => 'decimal:2',
        'SEMESTRE' => 'integer'
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'USUARIO_ID', 'ID');
    }

    public function docenteCups(): HasMany
    {
        return $this->hasMany(DocenteCup::class, 'ID_CUP', 'ID_CUP');
    }

    public function estudianteCups(): HasMany
    {
        return $this->hasMany(EstudianteCup::class, 'ID_CUP', 'ID_CUP');
    }

    public function carreraCups(): HasMany
    {
        return $this->hasMany(CarreraCup::class, 'ID_CUP', 'ID_CUP');
    }

    public function materiaCups(): HasMany
    {
        return $this->hasMany(MateriaCup::class, 'ID_CUP', 'ID_CUP');
    }

    public function materias(): BelongsToMany
    {
        return $this->belongsToMany(Materia::class, 'MATERIA_CUP', 'ID_CUP', 'ID_MATERIA');
    }

    public function clases(): HasMany
    {
        return $this->hasMany(Clase::class, 'ID_CUP', 'ID_CUP');
    }
}
