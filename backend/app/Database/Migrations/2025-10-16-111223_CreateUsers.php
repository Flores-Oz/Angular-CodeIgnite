<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateUsers extends Migration
{
    public function up()
    {
         $this->forge->addField([
            'id_users'      => ['type'=>'INT','constraint'=>11,'unsigned'=>true,'auto_increment'=>true],
            'name_users'    => ['type'=>'VARCHAR','constraint'=>80],
            'email'         => ['type'=>'VARCHAR','constraint'=>120],
            'password_hash' => ['type'=>'VARCHAR','constraint'=>255],
            'state'        => ['type'=>'TINYINT','constraint'=>1,'default'=>1], // 1=activo, 0=inactivo
            'created_at'    => ['type'=>'DATETIME','null'=>true],
            'updated_at'    => ['type'=>'DATETIME','null'=>true],
        ]);
        $this->forge->addKey('id_users', true);
        $this->forge->addUniqueKey('email');
        $this->forge->createTable('users');
    }

    public function down()
    {
        $this->forge->dropTable('users');
    }
}
