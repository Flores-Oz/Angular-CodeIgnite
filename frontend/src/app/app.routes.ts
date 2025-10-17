import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { roleGuard } from './core/role.guard';
import { ShellComponent } from './layout/shell.component';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('../pages/login/login.component').then(m => m.LoginComponent) },

  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('../pages/dashboard/dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'content',   loadComponent: () => import('../pages/content/content.component').then(m => m.ContentComponent) },

      // ====== ADMIN con subrutas ======
      {
        path: 'admin',
        canActivate: [roleGuard('ADMIN')],
        children: [
          // redirige /admin -> /admin/users
          { path: '', pathMatch: 'full', redirectTo: 'users' },

          // CRUD Usuarios (en la misma carpeta admin)
          { path: 'users', loadComponent: () => import('../pages/admin/admin-users.component').then(m => m.AdminUsersComponent) },

          // CRUD Roles (en la misma carpeta admin)
          { path: 'roles', loadComponent: () => import('../pages/admin/admin-roles.component').then(m => m.AdminRolesComponent) },
        ]
      },

      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ]
  },

  { path: '**', redirectTo: '' }
];