<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreatePermissions extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id_permissions'   => ['type'=>'INT','constraint'=>11,'unsigned'=>true,'auto_increment'=>true],
            'name_permissions' => ['type'=>'VARCHAR','constraint'=>60],   // p.ej. 'users.create'
            'description'      => ['type'=>'VARCHAR','constraint'=>160,'null'=>true],
            'state'           => ['type'=>'TINYINT','constraint'=>1,'default'=>1],
            'created_at'       => ['type'=>'DATETIME','null'=>true],
            'updated_at'       => ['type'=>'DATETIME','null'=>true],
        ]);
        $this->forge->addKey('id_permissions', true);
        $this->forge->addUniqueKey('name_permissions');
        $this->forge->createTable('permissions');
    }

    public function down()
    {
        $this->forge->dropTable('permissions');
    }
}
