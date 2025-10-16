<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use CodeIgniter\HTTP\ResponseInterface;
use App\Models\UserModel;   
use App\Libraries\JwtService;
use Config\Database;

class AuthController extends BaseController
{     
    /**
     * POST /api/auth/login
     * Body JSON: { "email": "...", "password": "..." }
     */
    public function login(): ResponseInterface
    {
        // 1) Entrada
        $data  = $this->request->getJSON(true) ?? [];
        $email = trim($data['email'] ?? '');
        $pass  = (string)($data['password'] ?? '');

        if ($email === '' || $pass === '') {
            return $this->response
                ->setStatusCode(422)
                ->setJSON(['message' => 'Email y password son requeridos.']);
        }

        // 2) Usuario (activo)
        $userM = new UserModel();
        $user  = $userM->where('email', $email)
                       ->where('estado', 1)
                       ->first();

        // Evitar revelar si el email existe o no
        if (!$user || !password_verify($pass, $user['password_hash'])) {
            return $this->response
                ->setStatusCode(401)
                ->setJSON(['message' => 'Credenciales inválidas.']);
        }

        // 3) Roles activos del usuario (via pivote)
        $db = Database::connect();
        $rolesRows = $db->table('user_role AS ur')
            ->select('r.name_roles')
            ->join('roles AS r', 'r.id_roles = ur.role_id')
            ->where('ur.user_id', $user['id_users'])
            ->where('ur.estado', 1)
            ->where('r.estado', 1)
            ->get()
            ->getResultArray();

        $roles = array_map(static fn ($r) => $r['name_roles'], $rolesRows);

        // 4) Emitir JWT
        $ttl = (int)(getenv('JWT_TTL') ?: 3600); // segs (1h por defecto)
        $jwt = new JwtService();
        $token = $jwt->create([
            'uid'   => (int)$user['id_users'],
            'email' => $user['email'],
            'roles' => $roles,
        ], $ttl);

        // 5) Respuesta estándar
        return $this->response->setStatusCode(200)->setJSON([
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'expires_in'   => $ttl,
            'user' => [
                'id'    => (int)$user['id_users'],
                'name'  => $user['name_users'],
                'email' => $user['email'],
                'roles' => $roles,
            ],
        ]);
    }

    /**
     * GET /api/auth/me
     * Protegida con JwtFilter (y opcional RoleFilter)
     */
    public function me(): ResponseInterface
    {
        $payload = $this->request->user ?? null;
        if (!$payload) {
            return $this->response->setStatusCode(401)->setJSON(['message' => 'Unauthorized']);
        }

        // Puedes mapear payload → user minimal
        return $this->response->setStatusCode(200)->setJSON([
            'user' => $payload,
        ]);
    }
}

