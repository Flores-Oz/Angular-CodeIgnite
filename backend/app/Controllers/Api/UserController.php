<?php

namespace App\Controllers\Api;

use App\Models\UserModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class UserController extends ResourceController
{
    public function index(){
        $m = new UserModel();
        return $this->response->setJSON($m->select('id_users,name_users,email,state')->findAll());
    }

    public function create(){
        $data = $this->request->getJSON(true);
        if (!($data['name_users']??null) || !($data['email']??null) || !($data['password']??null))
            return $this->fail('Datos incompletos', 422);

        $m = new UserModel();
        $ok = $m->insert([
            'name_users'    => $data['name_users'],
            'email'         => $data['email'],
            'password_hash' => password_hash($data['password'], PASSWORD_BCRYPT),
            'state'         => 1,
            'created_at'    => date('Y-m-d H:i:s'),
            'updated_at'    => date('Y-m-d H:i:s'),
        ]);
        if (!$ok) return $this->fail('No se pudo crear', 400);
        return $this->response->setJSON($m->select('id_users,name_users,email,state')->find($m->getInsertID()));
    }

    public function update($id){
        $data = $this->request->getJSON(true);
        $m = new UserModel();
        $save = array_intersect_key($data, array_flip(['name_users','email','state']));
        $save['updated_at'] = date('Y-m-d H:i:s');
        if (!$m->update($id, $save)) return $this->fail('No se pudo actualizar', 400);
        return $this->response->setJSON($m->select('id_users,name_users,email,state')->find($id));
    }

    public function delete($id){
        $m = new UserModel();
        if (!$m->delete($id)) return $this->fail('No se pudo eliminar', 400);
        return $this->response->setJSON(['ok'=>true]);
    }

    public function roles($id){
        $db = Database::connect();
        $rows = $db->table('user_role ur')
            ->select('r.name_roles')
            ->join('roles r','r.id_roles=ur.role_id')
            ->where('ur.user_id',$id)->where('ur.state',1)->where('r.state',1)->get()->getResultArray();
        return $this->response->setJSON(array_map(fn($r)=>$r['name_roles'],$rows));
    }

    public function setRoles($id){
        $data = $this->request->getJSON(true);
        $roles = $data['roles'] ?? [];
        $db = Database::connect();

        // desactivar actuales
        $db->table('user_role')->where('user_id',$id)->update(['state'=>0,'updated_at'=>date('Y-m-d H:i:s')]);

        // activar los enviados
        if ($roles) {
            $roleIds = $db->table('roles')->select('id_roles,name_roles')->whereIn('name_roles',$roles)->get()->getResultArray();
            foreach($roleIds as $r){
                $db->table('user_role')->replace([
                    'user_id' => $id,
                    'role_id' => $r['id_roles'],
                    'state'   => 1,
                    'created_at'=>date('Y-m-d H:i:s'),
                    'updated_at'=>date('Y-m-d H:i:s'),
                ]);
            }
        }
        return $this->response->setJSON(['ok'=>true]);
    }

    private function fail($msg, $code){ return $this->response->setStatusCode($code)->setJSON(['message'=>$msg]); }
}