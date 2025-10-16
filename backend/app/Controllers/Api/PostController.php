<?php

namespace App\Controllers\Api;

use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use App\Models\PostModel;

class PostController extends ResourceController
{
    /**
     * Return an array of resource objects, themselves in array format.
     *
     * @return ResponseInterface
     */
    public function index()
    {
         $m = new PostModel();
        // Todos los posts activos; si quieres paginar, añade limit/offset
        $rows = $m->select('p.id_posts,p.title,p.content,p.state,p.created_at,u.name_users AS author,u.email AS author_email')
                  ->from('posts p')
                  ->join('users u','u.id_users=p.user_id', 'left')
                  ->where('p.state', 1)
                  ->orderBy('p.created_at','DESC')
                  ->findAll();
        return $this->response->setJSON($rows);
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
        //
    }

    /**
     * Return a new resource object, with default properties.
     *
     * @return ResponseInterface
     */
    public function new()
    {
        //
    }

    /**
     * Create a new resource object, from "posted" parameters.
     *
     * @return ResponseInterface
     */
    public function create()
    {
         $uid = $this->userId();
        if (!$uid) return $this->response->setStatusCode(401)->setJSON(['message'=>'Unauthorized']);

        $data = $this->request->getJSON(true) ?? [];
        $title = trim($data['title'] ?? '');
        $content = trim($data['content'] ?? '');

        if ($title === '' || $content === '') {
            return $this->response->setStatusCode(422)->setJSON(['message' => 'Título y contenido son requeridos.']);
        }

        $m = new PostModel();
        $now = date('Y-m-d H:i:s');
        $ok = $m->insert([
            'user_id'    => $uid,
            'title'      => $title,
            'content'    => $content,
            'state'      => 1,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        if (!$ok) {
            return $this->response->setStatusCode(400)->setJSON(['message'=>'No se pudo crear el post']);
        }

        $post = $m->find($m->getInsertID());
        return $this->response->setJSON($post);
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
        //
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
        //
    }


    private function userId(): ?int {
        $p = $this->request->user ?? null;
        return $p['uid'] ?? null;
    }

    public function mine()
    {
        $uid = $this->userId();
        if (!$uid) return $this->response->setStatusCode(401)->setJSON(['message'=>'Unauthorized']);

        $m = new PostModel();
        $rows = $m->where('user_id', $uid)->orderBy('created_at','DESC')->findAll();
        return $this->response->setJSON($rows);
    }
}