<?php

use CodeIgniter\Router\RouteCollection;

$routes->group('api', ['namespace' => 'App\Controllers\Api' /*, 'filter' => 'cors'*/], static function($routes) {

    // público
    $routes->post('auth/login', 'AuthController::login');

    // protegidas con JWT
    $routes->group('auth', ['filter' => 'jwt'], static function($routes) {
        $routes->get('me', 'AuthController::me'); // /api/auth/me
    });

    // ejemplo protegido (REST users)
    // $routes->group('', ['filter' => 'jwt'], static function($routes) {
    //     $routes->resource('users', ['controller' => 'UserController']);
    // });
});
