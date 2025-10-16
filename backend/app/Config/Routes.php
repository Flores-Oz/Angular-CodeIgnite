<?php

use CodeIgniter\Router\RouteCollection;

$routes->group('api', ['namespace' => 'App\Controllers\Api'/*, 'filter'=>'cors'*/], static function($routes) {
  $routes->post('auth/login', 'AuthController::login');
  $routes->group('auth', ['filter'=>'jwt'], static function($routes){
    $routes->get('me', 'AuthController::me');
  });

  // CRUD usuarios (protegido)
  $routes->group('users', ['filter'=>'jwt'], static function($routes){
    $routes->get('/', 'UserController::index');
    $routes->post('/', 'UserController::create');
    $routes->put('(:num)', 'UserController::update/$1');
    $routes->delete('(:num)', 'UserController::delete/$1');

    // roles
    $routes->get('(:num)/roles', 'UserController::roles/$1');
    $routes->put('(:num)/roles', 'UserController::setRoles/$1'); // body: { roles: ["admin","user"] }
  });
});
