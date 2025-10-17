<?php

namespace App\Controllers\Api;

use App\Models\RoleModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class RoleController extends ResourceController
{
    protected $format = 'json';

    private function user(): array { return $this->request->user ?? []; }
    private function isAdmin(): bool {
        $roles = $this->user()['roles'] ?? [];
        $upper = array_map('strtoupper', is_array($roles) ? $roles : []);
        return in_array('ADMIN', $upper, true);
    }

    public function index()
    {
        $m = new RoleModel();
        $rows = $m->orderBy('name_roles','ASC')->findAll();
        return $this->respond($rows);
    }

    public function create()
    {
        if (!$this->isAdmin()) return $this->fail('Forbidden', 403);

        $b = $this->request->getJSON(true) ?? [];
        $name = trim($b['name_roles'] ?? '');
        if ($name === '') return $this->failValidationErrors('name_roles requerido');

        $now = date('Y-m-d H:i:s');
        $m = new RoleModel();
        $ok = $m->insert([
            'name_roles' => $name,
            'state'      => 1,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
        if (!$ok) return $this->fail('No se pudo crear', 400);

        return $this->respondCreated($m->find($m->getInsertID()));
    }

    public function update($id = null)
    {
        if (!$this->isAdmin()) return $this->fail('Forbidden', 403);
        if ($id === null) return $this->failValidationErrors('ID requerido');

        $b = $this->request->getJSON(true) ?? [];
        $data = array_intersect_key($b, array_flip(['name_roles','state']));
        if (isset($data['state'])) $data['state'] = (int) $data['state'];
        if (empty($data)) return $this->failValidationErrors('No hay campos válidos');

        $data['updated_at'] = date('Y-m-d H:i:s');

        $m = new RoleModel();
        if (!$m->update($id, $data)) return $this->fail('No se pudo actualizar', 400);

        return $this->respond($m->find($id));
    }

    public function delete($id = null)
    {
        if (!$this->isAdmin()) return $this->fail('Forbidden', 403);
        if ($id === null) return $this->failValidationErrors('ID requerido');

        $m = new RoleModel();
        if (!$m->delete($id)) return $this->fail('No se pudo eliminar', 400);

        return $this->respond(['ok' => true]);
    }
}