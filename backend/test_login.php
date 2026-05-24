<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
$user = App\Models\Usuario::where('CORREO', 'admin@cup.edu')->first();
$user->CONTRASENIA = Illuminate\Support\Facades\Hash::make('contraseña');
$user->save();
var_dump(Illuminate\Support\Facades\Auth::attempt(['CORREO' => 'admin@cup.edu', 'password' => 'contraseña']));
