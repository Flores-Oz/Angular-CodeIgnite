<?php

namespace App\Controllers\Api;

use App\Models\UserModel;
use CodeIgniter\RESTful\ResourceController;
use CodeIgniter\HTTP\ResponseInterface;
use Config\Database;

class UserController extends ResourceController
{
    protected $format = 'json';

    public function index()
    {
        $m = new UserModel();
        $rows = $m->select('id_users,name_users,email,state')->findAll();
        return $this->respond($rows);
    }

    public function create()
    {
        $data = $this->request->getJSON(true) ?? [];

        if (empty($data['name_users']) || empty($data['email']) || empty($data['password'])) {
            return $this->failValidationErrors('name_users, email y password son requeridos');
        }

        $m = new UserModel();

        // Verificar duplicado de email
        if ($m->where('email', $data['email'])->countAllResults() > 0) {
            return $this->failResourceExists('El email ya está registrado'); // 409
        }

        $payload = [
            'name_users'    => trim($data['name_users']),
            'email'         => trim($data['email']),
            'password_hash' => password_hash($data['password'], PASSWORD_BCRYPT),
            'state'         => 1,
            'created_at'    => date('Y-m-d H:i:s'),
            'updated_at'    => date('Y-m-d H:i:s'),
        ];

        if (!$m->insert($payload, false)) {
            return $this->fail('No se pudo crear', ResponseInterface::HTTP_BAD_REQUEST);
        }

        $id = $m->getInsertID();
        $user = $m->select('id_users,name_users,email,state')->find($id);
        return $this->respondCreated($user);
    }

    public function update($id = null)
    {
        if ($id === null) return $this->failValidationErrors('ID requerido');

        $data = $this->request->getJSON(true) ?? [];
        $m = new UserModel();

        $save = array_intersect_key($data, array_flip(['name_users','email','state']));
        if (array_key_exists('state', $save)) {
            $save['state'] = (int) $save['state'];
        }

        if (empty($save)) {
            return $this->failValidationErrors('No hay campos válidos para actualizar');
        }

        // Si cambian email, verifica duplicado
        if (!empty($save['email'])) {
            $dup = $m->where('email', $save['email'])->where('id_users !=', $id)->countAllResults();
            if ($dup > 0) return $this->failResourceExists('El email ya está registrado');
        }

        $save['updated_at'] = date('Y-m-d H:i:s');

        if (!$m->update($id, $save)) {
            return $this->fail('No se pudo actualizar', ResponseInterface::HTTP_BAD_REQUEST);
        }

        $user = $m->select('id_users,name_users,email,state')->find($id);
        if (!$user) return $this->failNotFound('Usuario no encontrado');
        return $this->respond($user);
    }

    public function delete($id = null)
    {
        if ($id === null) return $this->failValidationErrors('ID requerido');

        $m = new UserModel();

        if (!$m->delete($id)) {
            return $this->fail('No se pudo eliminar', ResponseInterface::HTTP_BAD_REQUEST);
        }

        return $this->respond(['ok' => true]);
    }

    public function roles($id = null)
    {
        if ($id === null) return $this->failValidationErrors('ID requerido');

        $db = Database::connect();
        $rows = $db->table('user_role as ur')
            ->select('r.name_roles')
            ->join('roles as r', 'r.id_roles = ur.role_id')
            ->where('ur.user_id', $id)
            ->where('ur.state', 1)
            ->where('r.state', 1)
            ->get()->getResultArray();

        $roles = array_map(static fn($r) => $r['name_roles'], $rows);
        return $this->respond($roles);
    }

    public function setRoles($id = null)
    {
        if ($id === null) return $this->failValidationErrors('ID requerido');

        $data  = $this->request->getJSON(true) ?? [];
        $roles = is_array($data['roles'] ?? null) ? $data['roles'] : [];

        // Normaliza nombres (opcional)
        $roles = array_values(array_unique(array_map('strval', $roles)));

        $db = Database::connect();
        $db->transStart();

        // Desactivar actuales
        $db->table('user_role')
            ->where('user_id', $id)
            ->update(['state' => 0, 'updated_at' => date('Y-m-d H:i:s')]);

        if (!empty($roles)) {
            // Buscar IDs por nombre
            $roleIds = $db->table('roles')
                ->select('id_roles, name_roles')
                ->whereIn('name_roles', $roles)
                ->where('state', 1)
                ->get()->getResultArray();

            // Activar/insertar
            foreach ($roleIds as $r) {
                // Si tu PK es (user_id, role_id), usa upsert propio:
                // 1) intenta update a state=1; si no afectó, inserta
                $aff = $db->table('user_role')
                    ->where(['user_id' => $id, 'role_id' => $r['id_roles']])
                    ->update(['state' => 1, 'updated_at' => date('Y-m-d H:i:s')]);

                if ($db->affectedRows() === 0) {
                    $db->table('user_role')->insert([
                        'user_id'    => $id,
                        'role_id'    => $r['id_roles'],
                        'state'      => 1,
                        'created_at' => date('Y-m-d H:i:s'),
                        'updated_at' => date('Y-m-d H:i:s'),
                    ]);
                }
            }
        }

        $db->transComplete();
        if (!$db->transStatus()) {
            return $this->fail('Error guardando roles', ResponseInterface::HTTP_BAD_REQUEST);
        }

        return $this->respond(['ok' => true]);
    }
}
