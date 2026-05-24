<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
$provider = new Illuminate\Auth\EloquentUserProvider($app['hash'], 'App\Models\Usuario');
var_dump($provider->retrieveByCredentials(['CORREO' => 'admin@cup.edu', 'token' => 'abc']));
