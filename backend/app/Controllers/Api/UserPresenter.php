<?php

namespace App\Controllers\Api;

use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use App\Models\UserModel;

class UserPresenter extends ResourceController
{
    protected $modelName = UserModel::class;
    protected $format    = 'json';

    /**
     * Return an array of resource objects, themselves in array format.
     *
     * @return ResponseInterface
     */
    public function index()
    {
        $users = $this->model->select('id_users, name_users, email, estado, created_at')
                             ->where('estado', 1)->findAll();
        return $this->respond($users);
    }

    /**
     * Return the properties of a resource object.
     *
     * @param int|string|null $id
     *
     * @return ResponseInterface
     */
    public function show($id = null)
    {
        $user = $this->model->find($id);
        if (!$user) return $this->failNotFound('Usuario no encontrado');
        return $this->respond($user);
    }

    /**
     * Return a new resource object, with default properties.
     *
     * @return ResponseInterface
     */
    public function new()
    {
        return $this->fail('No implementado', 405);
    }

    /**
     * Create a new resource object, from "posted" parameters.
     *
     * @return ResponseInterface
     */
    public function create()
    {
        $data = $this->request->getJSON(true);
        if (!$data) return $this->failValidationError('Datos inválidos');

        if (empty($data['name_users']) || empty($data['email']) || empty($data['password'])) {
            return $this->failValidationError('name_users, email y password son requeridos');
        }

        $insert = [
            'name_users'    => $data['name_users'],
            'email'         => $data['email'],
            'password_hash' => password_hash($data['password'], PASSWORD_DEFAULT),
            'estado'        => 1,
        ];
        if (!$this->model->insert($insert)) {
            return $this->failValidationErrors($this->model->errors());
        }
        return $this->respondCreated(['message' => 'Usuario creado']);
    }

    /**
     * Return the editable properties of a resource object.
     *
     * @param int|string|null $id
     *
     * @return ResponseInterface
     */
    public function edit($id = null)
    {
        return $this->fail('No implementado', 405);
    }

    /**
     * Add or update a model resource, from "posted" properties.
     *
     * @param int|string|null $id
     *
     * @return ResponseInterface
     */
    public function update($id = null)
    {
        $data = $this->request->getJSON(true);
        if (!$id || !$data) return $this->failValidationError('Datos inválidos');

        if (!empty($data['password'])) {
            $data['password_hash'] = password_hash($data['password'], PASSWORD_DEFAULT);
        }
        unset($data['password']);

        if (!$this->model->update($id, $data)) {
            return $this->failValidationErrors($this->model->errors());
        }
        return $this->respond(['message' => 'Usuario actualizado']);
    }

    public function remove($id = null)
    {
        return $this->fail('No implementado', 405);
    }

    /**
     * Delete the designated resource object from the model.
     *
     * @param int|string|null $id
     *
     * @return ResponseInterface
     */
    public function delete($id = null)
    {
        if (!$id) return $this->failValidationError('ID requerido');
        if (!$this->model->find($id)) return $this->failNotFound('Usuario no encontrado');

        // Borrado lógico
        $this->model->update($id, ['estado' => 0]);
        return $this->respondDeleted(['message' => 'Usuario inactivado']);
    }
}
