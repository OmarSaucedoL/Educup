<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\LogsActivity;

class Grupo extends Model
{
    use LogsActivity;
    protected $table = 'GRUPO';
    protected $primaryKey = 'ID_GRUPO';
    public $timestamps = false;

    protected $fillable = [
        'NOMBRE',
        'EST_MIN',
        'EST_MAX'
    ];

    public function clases(): HasMany
    {
        return $this->hasMany(Clase::class, 'ID_GRUPO', 'ID_GRUPO');
    }
}
