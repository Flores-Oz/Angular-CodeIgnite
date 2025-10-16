import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService, User } from '../../app/core/users.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <h2 class="text-xl font-semibold mb-4">Administración de usuarios</h2>

  <div class="bg-white rounded-2xl border">
    <table class="w-full text-sm">
      <thead class="bg-gray-100">
        <tr>
          <th class="text-left p-3">Nombre</th>
          <th class="text-left p-3">Email</th>
          <th class="text-left p-3">Estado</th>
          <th class="text-left p-3">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let u of users()" class="border-t">
          <td class="p-3">
            <input [(ngModel)]="u.name_users" class="border rounded-lg px-2 py-1 w-48">
          </td>
          <td class="p-3">
            <input [(ngModel)]="u.email" class="border rounded-lg px-2 py-1 w-56">
          </td>
          <td class="p-3">
            <select [(ngModel)]="u.state" class="border rounded-lg px-2 py-1">
              <option [ngValue]="1">Activo</option>
              <option [ngValue]="0">Inactivo</option>
            </select>
          </td>
          <td class="p-3 flex gap-2">
            <button (click)="save(u)" class="px-3 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Guardar</button>
            <button (click)="remove(u)" class="px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700">Eliminar</button>
            <button (click)="openRoles(u)" class="px-3 py-1 rounded-lg bg-gray-600 text-white hover:bg-gray-700">Roles</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Modal roles (súper simple) -->
  <div *ngIf="rolesModal()" class="fixed inset-0 bg-black/40 flex items-center justify-center">
    <div class="bg-white rounded-2xl p-4 w-full max-w-md">
      <h3 class="text-lg font-semibold mb-3">Roles de {{ currentUser()?.name_users }}</h3>
      <div class="space-y-2">
        <label class="flex items-center gap-2">
          <input type="checkbox" [(ngModel)]="rolesDraft.admin"> <span>admin</span>
        </label>
        <label class="flex items-center gap-2">
          <input type="checkbox" [(ngModel)]="rolesDraft.user"> <span>user</span>
        </label>
      </div>
      <div class="mt-4 flex justify-end gap-2">
        <button (click)="rolesModal.set(false)" class="px-3 py-1 rounded-lg border">Cancelar</button>
        <button (click)="saveRoles()" class="px-3 py-1 rounded-lg bg-indigo-600 text-white">Guardar</button>
      </div>
    </div>
  </div>
  `
})
export class AdminComponent {
  private api = inject(UsersService);

  users = signal<User[]>([]);
  rolesModal = signal(false);
  currentUser = signal<User|undefined>(undefined);
  rolesDraft = { admin:false, user:false };

  ngOnInit(){ this.load(); }
  load(){ this.api.list().subscribe({ next: d => this.users.set(d) }); }

  save(u: User){ this.api.update(u.id_users, { name_users:u.name_users, email:u.email, state:u.state }).subscribe({ next: _ => this.load() }); }
  remove(u: User){ this.api.remove(u.id_users).subscribe({ next: _ => this.load() }); }

  openRoles(u: User){
    this.currentUser.set(u);
    this.api.rolesOf(u.id_users).subscribe({
      next: roles => {
        this.rolesDraft = { admin: roles.includes('admin'), user: roles.includes('user') };
        this.rolesModal.set(true);
      }
    });
  }

  saveRoles(){
    const u = this.currentUser(); if (!u) return;
    const roles = [ ...(this.rolesDraft.admin? ['admin'] : []), ...(this.rolesDraft.user? ['user'] : []) ];
    this.api.setRoles(u.id_users, roles).subscribe({ next: _ => { this.rolesModal.set(false); this.load(); } });
  }
}
