<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\LogsActivity;

class Pago extends Model
{
    use HasFactory, LogsActivity;

    protected $table = 'PAGO';
    protected $primaryKey = 'ID_PAGO';
    public $timestamps = false; // Using FECHA_PAGO instead

    protected $fillable = [
        'ESTUDIANTE_CUP_ID',
        'PAYPAL_ORDER_ID',
        'MONTO',
        'ESTADO',
        'FECHA_PAGO',
    ];
}
