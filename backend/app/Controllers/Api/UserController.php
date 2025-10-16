<?php

namespace App\Controllers\Api;

use App\Models\UserModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class UserController extends ResourceController
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
                             ->where('estado', 1)
                             ->findAll();
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
        if (!$user) {
            return $this->failNotFound('Usuario no encontrado');
        }
        return $this->respond($user);
    }

    /**
     * Return a new resource object, with default properties.
     *
     * @return ResponseInterface
     */
    public function new()
    {
       
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

        // Ejemplo simple de validación manual
        if (empty($data['name_users']) || empty($data['email']) || empty($data['password'])) {
            return $this->failValidationError('Nombre, email y password son requeridos');
        }

        $data['password_hash'] = password_hash($data['password'], PASSWORD_DEFAULT);
        unset($data['password']);
        $data['estado'] = 1;

        $this->model->insert($data);
        return $this->respondCreated(['message' => 'Usuario creado correctamente']);
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
        //
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

        if (isset($data['password']) && $data['password'] !== '') {
            $data['password_hash'] = password_hash($data['password'], PASSWORD_DEFAULT);
            unset($data['password']);
        }

        if (!$this->model->update($id, $data)) {
            return $this->fail('No se pudo actualizar el usuario');
        }

        return $this->respond(['message' => 'Usuario actualizado']);
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

        $this->model->update($id, ['estado' => 0]); // desactivar en lugar de borrar
        return $this->respondDeleted(['message' => 'Usuario eliminado (inactivado)']);
    }
}
