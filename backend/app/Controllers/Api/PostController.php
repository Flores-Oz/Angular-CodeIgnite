<?php

namespace App\Controllers\Api;

use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use App\Models\PostModel;

class PostController extends ResourceController
{
   protected $format = 'json';

    /* ------------ helpers de auth/roles ------------ */

    private function user(): array {
        return $this->request->user ?? [];
    }

    private function userId(): ?int {
        $u = $this->user();
        return $u['uid'] ?? ($u['id'] ?? null);
    }

    private function isAdmin(): bool {
        $roles = $this->user()['roles'] ?? [];
        // normaliza y busca 'admin'
        $upper = array_map('strtoupper', is_array($roles) ? $roles : []);
        return in_array('ADMIN', $upper, true);
    }

    /* -------------------- LISTAR -------------------- */
    public function index(): ResponseInterface
    {
        $m = new PostModel();

        // base builder con join para autor
        $builder = $m->select('p.id_posts,p.title,p.content,p.state,p.created_at,u.name_users AS author,u.email AS author_email')
                     ->from('posts p')
                     ->join('users u','u.id_users=p.user_id','left');

        // si NO es admin, solo activos
        if (!$this->isAdmin()) {
            $builder->where('p.state', 1);
        }

        $rows = $builder->orderBy('p.created_at', 'DESC')->findAll();
        return $this->response->setJSON($rows);
    }

    /* -------------------- MIS POSTS -------------------- */
    public function mine(): ResponseInterface
    {
        $uid = $this->userId();
        if (!$uid) return $this->response->setStatusCode(401)->setJSON(['message'=>'Unauthorized']);

        $m = new PostModel();
        $rows = $m->select('p.id_posts,p.title,p.content,p.state,p.created_at,u.name_users AS author,u.email AS author_email')
                  ->from('posts p')
                  ->join('users u','u.id_users=p.user_id','left')
                  ->where('p.user_id',$uid)
                  ->orderBy('p.created_at','DESC')
                  ->findAll();

        return $this->response->setJSON($rows);
    }

    /* -------------------- CREAR -------------------- */
    public function create(): ResponseInterface
    {
        $uid = $this->userId();
        if (!$uid) return $this->response->setStatusCode(401)->setJSON(['message'=>'Unauthorized']);

        $data = $this->request->getJSON(true) ?? [];
        $title = trim($data['title'] ?? '');
        $content = trim($data['content'] ?? '');

        if ($title === '' || $content === '') {
            return $this->response->setStatusCode(422)->setJSON(['message'=>'Título y contenido son requeridos.']);
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

        // devuelve con datos del autor
        $id = $m->getInsertID();
        $post = $m->select('p.id_posts,p.title,p.content,p.state,p.created_at,u.name_users AS author,u.email AS author_email')
                  ->from('posts p')
                  ->join('users u','u.id_users=p.user_id','left')
                  ->where('p.id_posts',$id)
                  ->first();

        return $this->response->setJSON($post);
    }

    /* -------------------- ACTUALIZAR -------------------- */
    public function update($id = null): ResponseInterface
    {
        if ($id === null) return $this->response->setStatusCode(422)->setJSON(['message'=>'ID requerido']);
        if (!$this->isAdmin()) return $this->response->setStatusCode(403)->setJSON(['message'=>'Forbidden']);

        $payload = $this->request->getJSON(true) ?? [];
        // Solo permitimos estos campos
        $save = array_intersect_key($payload, array_flip(['title','content','state']));

        if (array_key_exists('state', $save)) {
            $save['state'] = (int) $save['state'];
        }
        if (empty($save)) {
            return $this->response->setStatusCode(422)->setJSON(['message'=>'No hay campos válidos']);
        }

        $save['updated_at'] = date('Y-m-d H:i:s');

        $m = new PostModel();
        if (!$m->update($id, $save)) {
            return $this->response->setStatusCode(400)->setJSON(['message'=>'No se pudo actualizar']);
        }

        $row = $m->select('p.id_posts,p.title,p.content,p.state,p.created_at,u.name_users AS author,u.email AS author_email')
                 ->from('posts p')->join('users u','u.id_users=p.user_id','left')
                 ->where('p.id_posts',$id)->first();

        return $this->response->setJSON($row ?? ['ok'=>true]);
    }

    /* -------------------- ELIMINAR -------------------- */
    public function delete($id = null): ResponseInterface
    {
        if ($id === null) return $this->response->setStatusCode(422)->setJSON(['message'=>'ID requerido']);
        if (!$this->isAdmin()) return $this->response->setStatusCode(403)->setJSON(['message'=>'Forbidden']);

        $m = new PostModel();
        if (!$m->delete($id)) {
            return $this->response->setStatusCode(400)->setJSON(['message'=>'No se pudo eliminar']);
        }
        return $this->response->setJSON(['ok'=>true]);
    }
}