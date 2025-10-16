<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateRoles extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id_roles'      => ['type'=>'INT','constraint'=>11,'unsigned'=>true,'auto_increment'=>true],
            'name_roles'    => ['type'=>'VARCHAR','constraint'=>40],
            'state'        => ['type'=>'TINYINT','constraint'=>1,'default'=>1],
            'created_at'    => ['type'=>'DATETIME','null'=>true],
            'updated_at'    => ['type'=>'DATETIME','null'=>true],
        ]);
        $this->forge->addKey('id_roles', true);
        $this->forge->addUniqueKey('name_roles');
        $this->forge->createTable('roles');    }

    public function down()
    {
        $this->forge->dropTable('roles');
    }
}
