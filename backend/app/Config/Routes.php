<?php

use CodeIgniter\Router\RouteCollection;

/** @var RouteCollection $routes */

// Recomendado:
$routes->setAutoRoute(false);
// $routes->setDefaultNamespace('App\Controllers'); // opcional

$routes->group('api', ['namespace' => 'App\Controllers\Api'/*, 'filter' => 'cors'*/], static function ($routes) {

    // ---------- AUTH ----------
    $routes->post('auth/login', 'AuthController::login');
    $routes->group('auth', ['filter' => 'jwt'], static function ($routes) {
        $routes->get('me', 'AuthController::me');
    });

    // (Opcional) Preflight CORS para /api/auth/*
    $routes->options('auth/(:any)', 'Cors::preflight'); // si usas un controlador/filtro CORS

    // ---------- USERS (CRUD + roles) ----------
    $routes->group('users', ['filter' => 'jwt'], static function ($routes) {
        // OJO: '' y no '/'
        $routes->get('',  'UserController::index');   // GET /api/users
        $routes->post('', 'UserController::create');  // POST /api/users

        $routes->put('(:num)',    'UserController::update/$1'); // PUT /api/users/123
        $routes->delete('(:num)', 'UserController::delete/$1'); // DELETE /api/users/123

        // Roles
        $routes->get('(:num)/roles', 'UserController::roles/$1');     // GET /api/users/123/roles
        $routes->put('(:num)/roles', 'UserController::setRoles/$1');  // PUT /api/users/123/roles

        // (Opcional) Preflight CORS para /api/users/*
        $routes->options('(:any)', 'Cors::preflight');
    });

    // ---------- POSTS ----------
    $routes->group('posts', ['filter' => 'jwt'], static function ($routes) {
        $routes->get('',      'PostController::index');  // GET /api/posts
        $routes->get('mine',  'PostController::mine');   // GET /api/posts/mine
        $routes->post('',     'PostController::create'); // POST /api/posts

        // (si luego agregas update/delete)
        $routes->put('(:num)', 'PostController::update/$1');
        $routes->delete('(:num)', 'PostController::delete/$1');

        $routes->options('(:any)', 'Cors::preflight'); // preflight
    });

        // ---------- ROLES ----------
    $routes->group('roles', ['filter' => 'jwt'], static function ($routes) {
        $routes->get('',      'RoleController::index');   // GET /api/roles
        $routes->post('',     'RoleController::create');  // POST /api/roles
        $routes->put('(:num)','RoleController::update/$1'); // PUT /api/roles/10
        $routes->delete('(:num)','RoleController::delete/$1'); // DELETE /api/roles/10
    });
});