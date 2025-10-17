# 🧭 Base de datos: `systemrol`

Este esquema implementa **usuarios, roles, permisos y publicaciones**, con soporte para:

- Asignación de **roles a usuarios**.
- Asignación de **permisos a roles y/o usuarios** (incluyendo overrides específicos por usuario).
- Activación / desactivación lógica mediante `state`.
- Publicaciones asociadas a usuarios con control de estado.

---

## 📂 Tablas principales

### 1. `users` — Usuarios del sistema
| Campo            | Tipo             | Descripción                          |
|-------------------|-------------------|----------------------------------------|
| `id_users`        | PK, autoincrement | Identificador único                   |
| `name_users`      | varchar(80)       | Nombre completo                       |
| `email`           | varchar(120)     | Correo único                          |
| `password_hash`   | varchar(255)     | Hash de contraseña (bcrypt u otro)    |
| `state`           | tinyint(1)       | 1 = activo, 0 = inactivo              |
| `created_at` / `updated_at` | datetime | Timestamps de creación / actualización |

🔸 **Índices:**  
- PK en `id_users`  
- `email` único

🔸 **Relaciones:**  
- `user_role.user_id` → roles asociados  
- `user_permission.user_id` → permisos directos  
- `posts.user_id` → publicaciones creadas

---

### 2. `roles` — Catálogo de roles
| Campo            | Tipo             | Descripción                   |
|-------------------|-------------------|-------------------------------|
| `id_roles`        | PK, autoincrement | Identificador de rol         |
| `name_roles`      | varchar(40)       | Nombre único del rol         |
| `state`           | tinyint(1)        | 1 = activo, 0 = inactivo     |
| `created_at` / `updated_at` | datetime | Timestamps                   |

🔸 **Relaciones:**  
- `user_role.role_id` → usuarios asignados  
- `role_permission.role_id` → permisos asociados

---

### 3. `permissions` — Permisos atómicos
| Campo                 | Tipo              | Descripción                                 |
|------------------------|--------------------|---------------------------------------------|
| `id_permissions`       | PK, autoincrement  | Identificador de permiso                   |
| `name_permissions`     | varchar(60)       | Nombre único (`users.view`, etc.)          |
| `description`          | varchar(160)     | Descripción del permiso                    |
| `state`                | tinyint(1)       | 1 = activo, 0 = inactivo                   |
| `created_at` / `updated_at` | datetime | Timestamps                                |

🔸 **Ejemplos de permisos:**  
`users.view`, `users.create`, `users.update`, `users.delete`, `users.state`

---

### 4. `user_role` — Pivot N:M usuarios ↔ roles
| Campo         | Tipo         | Descripción                          |
|---------------|--------------|---------------------------------------|
| `user_id`     | FK → users   | Usuario                              |
| `role_id`     | FK → roles   | Rol asignado                         |
| `state`       | tinyint(1)   | 1 = activo / 0 = inactivo            |
| `created_at` / `updated_at` | datetime | Timestamps                   |

🔸 **PK compuesta:** `(user_id, role_id)`  
🔸 **Cascadas:** `ON DELETE/UPDATE CASCADE`  
🔸 Puedes **desactivar sin borrar** una asignación.

---

### 5. `role_permission` — Pivot N:M roles ↔ permisos
| Campo            | Tipo              | Descripción                       |
|-------------------|--------------------|------------------------------------|
| `role_id`         | FK → roles         | Rol                               |
| `permission_id`   | FK → permissions   | Permiso                           |
| `state`           | tinyint(1)         | 1 activo / 0 inactivo             |
| `created_at` / `updated_at` | datetime | Timestamps                        |

🔸 **PK compuesta:** `(role_id, permission_id)`  
🔸 **Cascadas:** `ON DELETE/UPDATE CASCADE`

---

### 6. `user_permission` — Pivot con overrides
| Campo            | Tipo              | Descripción                                   |
|-------------------|--------------------|-----------------------------------------------|
| `user_id`         | FK → users         | Usuario                                      |
| `permission_id`   | FK → permissions   | Permiso                                      |
| `allowed`         | tinyint(1)         | 1 = permitir, 0 = revocar                     |
| `state`           | tinyint(1)         | 1/0 (activo/inactivo)                        |
| `created_at` / `updated_at` | datetime | Timestamps                                   |

🔸 **PK compuesta:** `(user_id, permission_id)`  
🔸 **Lógica de overrides:**  
- Herencia = permisos de roles activos  
- `allowed = 0` → revoca permiso heredado  
- `allowed = 1` → otorga permiso aunque no esté en el rol

---

### 7. `posts` — Publicaciones de usuarios
| Campo            | Tipo              | Descripción                            |
|-------------------|--------------------|-----------------------------------------|
| `id_posts`        | PK, autoincrement  | Identificador                          |
| `user_id`         | FK → users        | Autor                                  |
| `title`           | varchar(120)      | Título                                 |
| `content`         | text              | Contenido                              |
| `state`           | tinyint(1)        | 1 = activo, 0 = inactivo              |
| `created_at` / `updated_at` | datetime | Timestamps                         |

🔸 Los posts se muestran o no según `state`.

---

## 🧭 Relaciones
![Texto alternativo](RELACIONES.png)
- `state` permite activar/desactivar sin eliminar.  
- `ON DELETE CASCADE` limpia vínculos y posts al borrar físicamente usuarios o roles.

---

## 🧰 Semántica de `state`

- `1` → activo (visible / aplicable)  
- `0` → inactivo (oculto / no aplicable)  
Aplica a todas las tablas que incluyen `state`.

> 📝 Para desactivar usuarios sin perder datos relacionados, basta con actualizar `state = 0` sin borrar.

---

## 🌱 Datos de ejemplo (seed del dump)

- **Roles**:
  - `admin` (id 1, activo)
  - `user` (id 2, activo)

- **Permissions**:
  - `users.view`, `users.create`, `users.update`, `users.delete`, `users.state` (activos)
  - `(Ya no se utilizaron por cuestion tiempo pero queda muestra de que podria haber aun mas control para las operaciones)`
- **Role_permission**:
  - El rol `admin` tiene los 5 permisos anteriores.

- **Users**:
  - `user@example.test` (id 2, rol `user` activo; admin inactivo)
  - `superadmin@example.test` (id 3, rol `admin` activo)

- **Posts**:
  - Registros con estados mixtos (`state = 1` / `0`).

---

## 🛡️ Notas adicionales

- Puedes **inactivar** usuarios, roles o permisos sin perder relaciones.
- Los `DELETE` físicos activan **cascadas** → borran posts y pivotes relacionados.
- Para entornos productivos es recomendable usar **soft deletes** o flags lógicos.
- Todas las claves foráneas están definidas con **ON DELETE/UPDATE CASCADE**.

---





