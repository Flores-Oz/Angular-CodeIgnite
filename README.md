# 🧭 Sistema de Gestión de Roles y Publicaciones

> **Aplicación web Fullstack** para la gestión de usuarios, roles, permisos y publicaciones.  
> Construida con **Angular**, **CodeIgniter 4** y **MariaDB/MySQL**, con autenticación **JWT**.

---

## 📁 Estructura del proyecto

```
├── backend/              # API REST en CodeIgniter 4
│   ├── app/
│   ├── public/
│   └── ...
├── frontend/             # SPA en Angular
│   ├── src/
│   ├── angular.json
│   └── ...
├── database/
│   └── systemrol.sql     # Dump de la base de datos
└── README.md
```

---

## 🧰 Tecnologías utilizadas

| Componente       | Tecnología        | Versión        |
|-------------------|--------------------|----------------|
| Frontend          | Angular            | 17.x           |
| Backend           | CodeIgniter        | 4.x            |
| Base de datos     | MariaDB / MySQL    | 10.4+          |
| Autenticación     | JWT (Bearer Token) | —              |
| Estilos UI        | Tailwind CSS       | 3.x            |
| Alertas UI        | SweetAlert2        | —              |

---

## 🚀 Requisitos previos

* Node.js `v18+`
* Composer
* PHP `8.2+`
* MariaDB o MySQL `5.7+`
* Git *(opcional)*

---

## 🛠️ Configuración

### 1. 🐘 Backend (CodeIgniter)

```
cd backend
composer install
cp env .env
php spark key:generate
```

Editar `.env`:

```
database.default.hostname = localhost
database.default.database = systemrol
database.default.username = root
database.default.password = 
database.default.DBDriver = MySQLi
app.baseURL = 'http://localhost:8080/'
```

Ejecutar servidor local:

```
php spark serve
```

👉 Acceso por defecto: [http://localhost:8080](http://localhost:8080)

---

### 2. 🧮 Base de datos

Crear base de datos e importar dump:

```
mysql -u root -p -e "CREATE DATABASE systemrol;"
mysql -u root -p systemrol < database/systemrol.sql
```

**Incluye:**

* Usuarios iniciales (admin / user)  
* Roles (`admin`, `user`)  
* Permisos base (`users.view`, `users.create`, etc.)  
* Publicaciones de ejemplo

> ⚠️ Los datos de conexión en `.env` deben coincidir con el entorno local.

---

### 3. 🌐 Frontend (Angular)

```
cd frontend
npm install
```

Crear `proxy.conf.json` si no existe:

```
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
}
```

Ejecutar servidor de desarrollo:

```
ng serve --proxy-config proxy.conf.json
```

👉 Acceso por defecto: [http://localhost:4200](http://localhost:4200)

---

## 🔐 Credenciales iniciales

| Email                    | Rol   | Contraseña |
|---------------------------|-------|------------|
| superadmin@example.test   | admin | Admin#2025 |
| user@example.test         | user  | user1234   |


---

## 🧭 Características principales

### 👤 Gestión de usuarios
* CRUD completo (crear, editar, eliminar, activar/desactivar)  
* Asignación dinámica de roles  
* Validaciones visuales con SweetAlert2

### 🛡️ Control de roles y permisos
* Rol **admin** con permisos predefinidos  
* Rol **user** con permisos básicos  
* Sistema extensible para agregar permisos personalizados

### 📰 Publicaciones
* Creación de publicaciones por usuario autenticado  
* Edición, eliminación y activación/desactivación  
* Vistas en modo **lista**, **grid** y **tabla**

### 🔐 Seguridad y autorización
* Autenticación con JWT  
* Guards `authGuard` y `roleGuard` en frontend  
* Filtros `jwt` en backend para proteger endpoints

---

## 🧭 Rutas principales (Frontend)

| Ruta              | Rol requerido | Descripción                          |
|--------------------|---------------|---------------------------------------|
| `/login`           | —             | Inicio de sesión                      |
| `/dashboard`       | user/admin    | Panel principal                       |
| `/content`         | user/admin    | Ver / crear publicaciones             |
| `/content`         | admin    | Editar / Eliminar / Inabilitar / Activar publicaciones             |
| `/admin/users`     | admin         | Gestión de usuarios                   |
| `/admin/roles`     | admin         | Gestión de roles                      |
| `/unauthorized`    | —             | Página 401/403 no autorizado          |

---

## 🧰 Comandos útiles

### Backend

```
php spark serve      # iniciar servidor API
php spark migrate    # ejecutar migraciones
php spark db:seed    # ejecutar seeders (si agregas)
```

### Frontend

```
ng serve             # servidor de desarrollo
ng build             # build de producción
```

---
