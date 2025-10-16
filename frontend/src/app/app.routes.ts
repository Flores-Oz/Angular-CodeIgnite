import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { roleGuard } from './core/role.guard';
import { ShellComponent } from './layout/shell.component';


export const routes: Routes = [
  { path: 'login', loadComponent: () => import('../pages/login/login.component').then(m => m.LoginComponent) },

  { path: '', component: ShellComponent, canActivate: [authGuard], children: [
      { path: 'dashboard', loadComponent: () => import('../pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'users', loadComponent: () => import('../pages/users/users.component').then(m => m.UsersComponent) },
      { path: 'admin', canActivate: [roleGuard('admin')], loadComponent: () => import('../pages/admin/admin.component').then(m => m.AdminComponent) },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
  ]},

  { path: '**', redirectTo: '' }
];