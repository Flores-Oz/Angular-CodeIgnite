-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 17-10-2025 a las 07:18:41
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

-- --------------------------------------------------------
-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS systemrol CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Usar la base de datos
USE systemrol;

-- Configuración de entorno
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
 /*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
 /*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
 /*!40101 SET NAMES utf8mb4 */;
--
-- Estructura de tabla para la tabla `migrations`
--

CREATE TABLE `migrations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `version` varchar(255) NOT NULL,
  `class` varchar(255) NOT NULL,
  `group` varchar(255) NOT NULL,
  `namespace` varchar(255) NOT NULL,
  `time` int(11) NOT NULL,
  `batch` int(11) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `migrations`
--

INSERT INTO `migrations` (`id`, `version`, `class`, `group`, `namespace`, `time`, `batch`) VALUES
(1, '2025-10-16-111223', 'App\\Database\\Migrations\\CreateUsers', 'default', 'App', 1760614042, 1),
(2, '2025-10-16-111251', 'App\\Database\\Migrations\\CreateRoles', 'default', 'App', 1760614042, 1),
(3, '2025-10-16-111303', 'App\\Database\\Migrations\\CreatePermissions', 'default', 'App', 1760614042, 1),
(4, '2025-10-16-111323', 'App\\Database\\Migrations\\CreatePivotTables', 'default', 'App', 1760614042, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `permissions`
--

CREATE TABLE `permissions` (
  `id_permissions` int(11) UNSIGNED NOT NULL,
  `name_permissions` varchar(60) NOT NULL,
  `description` varchar(160) DEFAULT NULL,
  `state` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `permissions`
--

INSERT INTO `permissions` (`id_permissions`, `name_permissions`, `description`, `state`, `created_at`, `updated_at`) VALUES
(1, 'users.view', 'Ver usuarios', 1, '2025-10-16 05:52:32', '2025-10-16 05:52:32'),
(2, 'users.create', 'Crear usuarios', 1, '2025-10-16 05:52:32', '2025-10-16 05:52:32'),
(3, 'users.update', 'Editar usuarios', 1, '2025-10-16 05:52:32', '2025-10-16 05:52:32'),
(4, 'users.delete', 'Eliminar usuarios', 1, '2025-10-16 05:52:32', '2025-10-16 05:52:32'),
(5, 'users.state', 'Activar/Desactivar usuarios', 1, '2025-10-16 05:52:32', '2025-10-16 05:52:32');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `posts`
--

CREATE TABLE `posts` (
  `id_posts` int(11) UNSIGNED NOT NULL,
  `user_id` int(11) UNSIGNED NOT NULL,
  `title` varchar(120) NOT NULL,
  `content` text NOT NULL,
  `state` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `posts`
--

INSERT INTO `posts` (`id_posts`, `user_id`, `title`, `content`, `state`, `created_at`, `updated_at`) VALUES
(2, 2, 'Hola Mundo', 'Hola Mundo', 1, '2025-10-16 20:29:33', '2025-10-16 20:29:33'),
(3, 2, 'hellow', 'hellow', 1, '2025-10-16 20:29:49', '2025-10-17 00:22:46'),
(6, 3, 'Deus', 'Volt', 0, '2025-10-16 23:32:00', '2025-10-17 00:39:48'),
(7, 2, 'fdgs', 'gfsg', 0, '2025-10-16 23:33:50', '2025-10-17 01:28:52'),
(8, 3, 'Hollow', 'Ataraxia', 1, '2025-10-16 23:49:05', '2025-10-17 00:33:29'),
(9, 2, 'Hello', 'Moto', 1, '2025-10-17 00:42:58', '2025-10-17 00:42:58'),
(11, 3, 'Flag', 'Red', 1, '2025-10-17 01:27:17', '2025-10-17 01:45:33');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id_roles` int(11) UNSIGNED NOT NULL,
  `name_roles` varchar(40) NOT NULL,
  `state` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id_roles`, `name_roles`, `state`, `created_at`, `updated_at`) VALUES
(1, 'admin', 1, '2025-10-16 05:52:16', '2025-10-16 05:52:16'),
(2, 'user', 1, '2025-10-16 05:52:16', '2025-10-16 05:52:16'),
(3, 'ado', 1, '2025-10-17 04:00:45', '2025-10-17 04:00:45');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `role_permission`
--

CREATE TABLE `role_permission` (
  `role_id` int(11) UNSIGNED NOT NULL,
  `permission_id` int(11) UNSIGNED NOT NULL,
  `state` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `role_permission`
--

INSERT INTO `role_permission` (`role_id`, `permission_id`, `state`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '2025-10-16 05:52:50', '2025-10-16 05:52:50'),
(1, 2, 1, '2025-10-16 05:52:50', '2025-10-16 05:52:50'),
(1, 3, 1, '2025-10-16 05:52:50', '2025-10-16 05:52:50'),
(1, 4, 1, '2025-10-16 05:52:50', '2025-10-16 05:52:50'),
(1, 5, 1, '2025-10-16 05:52:50', '2025-10-16 05:52:50');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id_users` int(11) UNSIGNED NOT NULL,
  `name_users` varchar(80) NOT NULL,
  `email` varchar(120) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `state` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id_users`, `name_users`, `email`, `password_hash`, `state`, `created_at`, `updated_at`) VALUES
(2, 'Usuario ', 'user@example.test', '$2y$10$4T4KrVa0h9R69XNGaRfCBOrzn1VMMX4E9utNqX0PkQ17XOaC1Dnae', 1, '2025-10-16 12:15:33', '2025-10-17 03:55:48'),
(3, 'Super Admin', 'superadmin@example.test', '$2y$10$ludSp4VDyMzolaunuK6XMO602zYowlmbavAWTInv5uukvRSizwcDW', 1, '2025-10-16 13:28:52', '2025-10-16 13:28:52'),
(4, 'Jose Jose', 'jose@example.test', '$2y$10$YG377SJjdOFkRlWCCEbaKujD63Ag7FbyTkNhUaaRC9sPVt0ArG3qy', 1, '2025-10-17 03:58:43', '2025-10-17 03:58:43');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_permission`
--

CREATE TABLE `user_permission` (
  `user_id` int(11) UNSIGNED NOT NULL,
  `permission_id` int(11) UNSIGNED NOT NULL,
  `allowed` tinyint(1) NOT NULL DEFAULT 1,
  `state` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_role`
--

CREATE TABLE `user_role` (
  `user_id` int(11) UNSIGNED NOT NULL,
  `role_id` int(11) UNSIGNED NOT NULL,
  `state` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `user_role`
--

INSERT INTO `user_role` (`user_id`, `role_id`, `state`, `created_at`, `updated_at`) VALUES
(2, 1, 0, '2025-10-17 01:21:43', '2025-10-17 01:47:43'),
(2, 2, 1, '2025-10-16 12:15:41', '2025-10-17 01:47:43'),
(3, 1, 1, '2025-10-16 13:29:05', '2025-10-16 13:29:05'),
(4, 2, 1, '2025-10-17 03:58:50', '2025-10-17 03:58:50');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id_permissions`),
  ADD UNIQUE KEY `name_permissions` (`name_permissions`);

--
-- Indices de la tabla `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id_posts`),
  ADD KEY `posts_user_id_fk` (`user_id`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id_roles`),
  ADD UNIQUE KEY `name_roles` (`name_roles`);

--
-- Indices de la tabla `role_permission`
--
ALTER TABLE `role_permission`
  ADD PRIMARY KEY (`role_id`,`permission_id`),
  ADD KEY `role_permission_permission_id_foreign` (`permission_id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_users`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indices de la tabla `user_permission`
--
ALTER TABLE `user_permission`
  ADD PRIMARY KEY (`user_id`,`permission_id`),
  ADD KEY `user_permission_permission_id_foreign` (`permission_id`);

--
-- Indices de la tabla `user_role`
--
ALTER TABLE `user_role`
  ADD PRIMARY KEY (`user_id`,`role_id`),
  ADD KEY `user_role_role_id_foreign` (`role_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id_permissions` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `posts`
--
ALTER TABLE `posts`
  MODIFY `id_posts` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id_roles` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id_users` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id_users`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `role_permission`
--
ALTER TABLE `role_permission`
  ADD CONSTRAINT `role_permission_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id_permissions`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `role_permission_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id_roles`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `user_permission`
--
ALTER TABLE `user_permission`
  ADD CONSTRAINT `user_permission_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id_permissions`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_permission_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id_users`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `user_role`
--
ALTER TABLE `user_role`
  ADD CONSTRAINT `user_role_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id_roles`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_role_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id_users`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
