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
        $data  = $this->request->getJSON(true) ?? [];
        $email = trim($data['email'] ?? '');
        $pass  = (string)($data['password'] ?? '');

        if ($email === '' || $pass === '') {
            return $this->response->setStatusCode(422)->setJSON(['message' => 'Email y password son requeridos.']);
        }

        // users(id_users, name_users, email, password_hash, state)
        $userM = new UserModel();
        $user  = $userM->where('email', $email)
                       ->where('state', 1)        // ← tu columna real
                       ->first();

        // Evitar revelar si el email existe o no
        if (!$user || !password_verify($pass, $user['password_hash'] ?? '')) {
            return $this->response->setStatusCode(401)->setJSON(['message' => 'Credenciales inválidas.']);
        }

        // roles asociados via user_role (user_id, role_id, state) → roles(id_roles, name_roles, state)
        $db = Database::connect();
        $rolesRows = $db->table('user_role AS ur')
            ->select('r.name_roles')
            ->join('roles AS r', 'r.id_roles = ur.role_id')
            ->where('ur.user_id', $user['id_users'])
            ->where('ur.state', 1)
            ->where('r.state', 1)
            ->get()
            ->getResultArray();

        $roles = array_map(static fn ($r) => $r['name_roles'], $rolesRows);
        if (!$roles) { $roles = ['user']; } // fallback si no hay relación (en tu dump sí hay 'admin')

        // Emitir JWT
        $ttl = (int)(getenv('JWT_TTL') ?: 3600);
        $jwt = new JwtService();
        $token = $jwt->create([
            'uid'   => (int)$user['id_users'],
            'email' => $user['email'],
            'roles' => $roles,
        ], $ttl);

        return $this->response->setJSON([
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

    public function me(): ResponseInterface
    {
        $payload = $this->request->user ?? null;
        if (!$payload) {
            return $this->response->setStatusCode(401)->setJSON(['message' => 'Unauthorized']);
        }
        return $this->response->setJSON(['user' => $payload]);
    }
}