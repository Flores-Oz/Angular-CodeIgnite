import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-shell',
  imports: [CommonModule, RouterLink, RouterOutlet],   // y esto
  template: `
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="font-semibold">Panel</div>
        <nav class="flex items-center gap-4">
          <a routerLink="/dashboard" class="text-sm text-gray-700 hover:text-indigo-600">Inicio</a>
          <a *ngIf="isAdmin()" routerLink="/users" class="text-sm text-gray-700 hover:text-indigo-600">Usuarios</a>
          <a routerLink="/content" class="text-sm text-gray-700 hover:text-indigo-600">Contenido</a>
          <a *ngIf="isAdmin()" routerLink="/admin" class="text-sm text-gray-700 hover:text-indigo-600">Administración</a>
          <span class="text-sm text-gray-500"> {{ email() }} </span>
          <button (click)="logout()" class="text-sm text-red-600 hover:underline">Salir</button>
        </nav>
      </div>
    </header>
    <main class="max-w-6xl mx-auto px-4 py-6">
      <router-outlet />
    </main>
  </div>
  `
})
export class ShellComponent {
  private auth = inject(AuthService);
  email = () => this.auth.payload?.email ?? '';
  isAdmin = () => (this.auth.payload?.roles ?? []).includes('admin');
  logout(){ this.auth.logout(); location.href = '/login'; }
}
