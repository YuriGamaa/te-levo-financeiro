<?php

return [
    // Adicionamos 'login' e 'api/*' para cobrir todas as frentes
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login'],

    'allowed_methods' => ['*'],

    // AJUSTE: Usando o IP para evitar conflitos de DNS do Windows
    'allowed_origins' => [
        'http://127.0.0.1:5173',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // OBRIGATÓRIO: Deve ser true para o Axios enviar os cookies do Sanctum
    'supports_credentials' => true,
];