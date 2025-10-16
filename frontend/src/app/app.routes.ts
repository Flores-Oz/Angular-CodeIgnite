import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { roleGuard } from './core/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  { path: 'login', loadComponent: () => import('../pages/login/login.component').then(m => m.LoginComponent) },

  { path: 'dashboard', canActivate: [authGuard],
    loadComponent: () => import('../pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },

  { path: 'admin', canActivate: [roleGuard('ADMIN')],
    loadComponent: () => import('../pages/admin/admin.component').then(m => m.AdminComponent)
  },

  { path: 'unauthorized',
    loadComponent: () => import('../pages/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },

  { path: '**', redirectTo: 'dashboard' }
];
