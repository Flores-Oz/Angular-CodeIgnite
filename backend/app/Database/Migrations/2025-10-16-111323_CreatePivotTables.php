<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreatePivotTables extends Migration
{
    public function up()
    {
           // user_role (vínculo usuario–rol)
        $this->forge->addField([
            'user_id'    => ['type'=>'INT','constraint'=>11,'unsigned'=>true],
            'role_id'    => ['type'=>'INT','constraint'=>11,'unsigned'=>true],
            'state'     => ['type'=>'TINYINT','constraint'=>1,'default'=>1],
            'created_at' => ['type'=>'DATETIME','null'=>true],
            'updated_at' => ['type'=>'DATETIME','null'=>true],
        ]);
        $this->forge->addKey(['user_id','role_id'], true);
        $this->forge->addForeignKey('user_id','users','id_users','CASCADE','CASCADE');
        $this->forge->addForeignKey('role_id','roles','id_roles','CASCADE','CASCADE');
        $this->forge->createTable('user_role');

        // role_permission (vínculo rol–permiso)
        $this->forge->addField([
            'role_id'       => ['type'=>'INT','constraint'=>11,'unsigned'=>true],
            'permission_id' => ['type'=>'INT','constraint'=>11,'unsigned'=>true],
            'state'        => ['type'=>'TINYINT','constraint'=>1,'default'=>1],
            'created_at'    => ['type'=>'DATETIME','null'=>true],
            'updated_at'    => ['type'=>'DATETIME','null'=>true],
        ]);
        $this->forge->addKey(['role_id','permission_id'], true);
        $this->forge->addForeignKey('role_id','roles','id_roles','CASCADE','CASCADE');
        $this->forge->addForeignKey('permission_id','permissions','id_permissions','CASCADE','CASCADE');
        $this->forge->createTable('role_permission');

        // (opcional) user_permission — overrides por usuario
        $this->forge->addField([
            'user_id'       => ['type'=>'INT','constraint'=>11,'unsigned'=>true],
            'permission_id' => ['type'=>'INT','constraint'=>11,'unsigned'=>true],
            'allowed'       => ['type'=>'TINYINT','constraint'=>1,'default'=>1], // 1 concede, 0 revoca
            'state'        => ['type'=>'TINYINT','constraint'=>1,'default'=>1],
            'created_at'    => ['type'=>'DATETIME','null'=>true],
            'updated_at'    => ['type'=>'DATETIME','null'=>true],
        ]);
        $this->forge->addKey(['user_id','permission_id'], true);
        $this->forge->addForeignKey('user_id','users','id_users','CASCADE','CASCADE');
        $this->forge->addForeignKey('permission_id','permissions','id_permissions','CASCADE','CASCADE');
        $this->forge->createTable('user_permission');
    }

    public function down()
    {
        $this->forge->dropTable('user_permission');
        $this->forge->dropTable('role_permission');
        $this->forge->dropTable('user_role');
    }
}
