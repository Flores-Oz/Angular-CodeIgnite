<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class CheckDBSeeder extends Seeder
{
    public function run()
    {
        $db = \Config\Database::connect();
        $row = $db->query('SELECT DATABASE() AS db')->getFirstRow();
        echo "Conectado a la base: " . ($row->db ?? 'NULL') . PHP_EOL;

        $roles = $db->query('SELECT COUNT(*) as total FROM roles')->getFirstRow();
        echo "Roles encontrados: " . $roles->total . PHP_EOL;

        $perms = $db->query('SELECT COUNT(*) as total FROM permissions')->getFirstRow();
        echo "Permisos encontrados: " . $perms->total . PHP_EOL;

        $users = $db->query('SELECT COUNT(*) as total FROM users')->getFirstRow();
        echo "Usuarios encontrados: " . $users->total . PHP_EOL;
    }
}
