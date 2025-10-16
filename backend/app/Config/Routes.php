<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');
$routes->group('api', ['filter' => 'cors,jwt'], static function($routes) {
    $routes->resource('users', ['controller' => 'Api\UserController']);
});

$routes->group('api', ['filter' => 'cors,jwt'], static function($routes) {
    $routes->presenter('users', [
        'controller' => 'Api\UserPresenter',
        // Aplica rol admin a todo el recurso (opcional)
        'filter'     => 'role:admin'
    ]);
});
