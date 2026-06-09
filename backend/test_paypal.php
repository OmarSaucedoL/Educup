<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Http;

echo "Probando conexión con PayPal..." . PHP_EOL;

$res = Http::withBasicAuth(env('PAYPAL_CLIENT_ID'), env('PAYPAL_SECRET'))
    ->asForm()
    ->post('https://api-m.sandbox.paypal.com/v1/oauth2/token', [
        'grant_type' => 'client_credentials'
    ]);

echo 'Status: ' . $res->status() . PHP_EOL;

if ($res->successful()) {
    echo "¡Autenticación EXITOSA! Token obtenido." . PHP_EOL;
    $token = $res->json('access_token');
    
    // Test creating an order
    echo "Intentando crear una orden de prueba..." . PHP_EOL;
    $orderRes = Http::withToken($token)->post('https://api-m.sandbox.paypal.com/v2/checkout/orders', [
        'intent' => 'CAPTURE',
        'purchase_units' => [
            [
                'amount' => [
                    'currency_code' => 'USD',
                    'value' => '10.00'
                ]
            ]
        ]
    ]);
    
    echo "Order Status: " . $orderRes->status() . PHP_EOL;
    if ($orderRes->successful()) {
        echo "¡Orden creada EXITOSAMENTE! ID: " . $orderRes->json('id') . PHP_EOL;
        echo "Todo el Backend de PayPal funciona correctamente." . PHP_EOL;
    } else {
        echo "Error al crear orden: " . $orderRes->body() . PHP_EOL;
    }
} else {
    echo "¡FALLO al autenticar! Revisa las credenciales." . PHP_EOL;
    echo "Respuesta de PayPal: " . $res->body() . PHP_EOL;
}
