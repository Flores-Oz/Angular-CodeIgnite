import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { UsersService, User } from '../..//app/core/users.service';
import { RolesService } from '../..//app/core/roles.service';
import { RolesModalComponent } from '../admin/roles-modal.component';

@Component({
  standalone: true,
  selector: 'app-admin-users',
  imports: [CommonModule, FormsModule, RolesModalComponent],
  templateUrl: './admin-users.component.html'
})
export class AdminUsersComponent {
  private usersApi = inject(UsersService);
  private rolesApi = inject(RolesService);

  users = signal<User[]>([]);
  loading = signal(false);
  error = signal<string|undefined>(undefined);

  // Crear usuario
  showCreate = signal(false);
  draft = { name_users: '', email: '', password: '' };

  // Modal roles
  rolesModal = signal(false);
  currentUser = signal<User|undefined>(undefined);
  availableRoleNames = signal<string[]>([]);
  selectedRoleNames = signal<Set<string>>(new Set());

  ngOnInit() {
    this.loadUsers();
  }

  trackById = (_: number, u: User) => u.id_users;

  private showError(msg: string) {
    Swal.fire({ icon: 'error', title: 'Error', text: msg });
  }
  private toastOk(title: string) {
    Swal.fire({ icon: 'success', title, timer: 1200, showConfirmButton: false });
  }

  // ---- USERS CRUD ----
  loadUsers() {
    this.loading.set(true);
    this.usersApi.list().subscribe({
      next: d => { this.users.set(d); this.loading.set(false); },
      error: e => { this.loading.set(false); this.showError(e?.error?.message ?? 'No se pudieron cargar usuarios'); }
    });
  }

  toggleCreate() { this.showCreate.set(!this.showCreate()); }

  async createUser(f: NgForm) {
    if (f.invalid) {
      this.showError('Por favor completa todos los campos (nombre, email y contraseña).');
      return;
    }
    const { isConfirmed } = await Swal.fire({
      icon: 'question',
      title: 'Crear usuario',
      text: `¿Crear usuario "${this.draft.name_users}"?`,
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar'
    });
    if (!isConfirmed) return;

    this.usersApi.create(this.draft).subscribe({
      next: _ => {
        this.toastOk('Usuario creado');
        this.draft = { name_users:'', email:'', password:'' };
        this.showCreate.set(false);
        this.loadUsers();
      },
      error: e => this.showError(e?.error?.message ?? 'No se pudo crear el usuario')
    });
  }

  async saveUser(u: User) {
    if (!u.name_users || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u.email)) {
      this.showError('Nombre y un email válido son requeridos.');
      return;
    }
    const { isConfirmed } = await Swal.fire({
      icon: 'question',
      title: 'Guardar cambios',
      text: `¿Guardar cambios de "${u.name_users}"?`,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar'
    });
    if (!isConfirmed) return;

    this.usersApi.update(u.id_users, { name_users: u.name_users, email: u.email, state: u.state }).subscribe({
      next: _ => { this.toastOk('Guardado'); this.loadUsers(); },
      error: e => this.showError(e?.error?.message ?? 'No se pudo guardar')
    });
  }

  async toggleState(u: User) {
    const toInactive = u.state == 1;
    const { isConfirmed } = await Swal.fire({
      icon: 'question',
      title: toInactive ? 'Desactivar usuario' : 'Activar usuario',
      text: toInactive ? 'El usuario quedará inactivo.' : 'El usuario volverá a estar activo.',
      showCancelButton: true,
      confirmButtonText: toInactive ? 'Desactivar' : 'Activar',
      cancelButtonText: 'Cancelar'
    });
    if (!isConfirmed) return;

    this.usersApi.update(u.id_users, { state: toInactive ? 0 : 1 }).subscribe({
      next: _ => { this.toastOk(toInactive ? 'Desactivado' : 'Activado'); this.loadUsers(); },
      error: e => this.showError(e?.error?.message ?? 'No se pudo cambiar el estado')
    });
  }

  async removeUser(u: User) {
    const { isConfirmed } = await Swal.fire({
      icon: 'warning',
      title: 'Eliminar usuario',
      html: `¿Seguro que deseas eliminar a <b>${u.name_users}</b>?`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (!isConfirmed) return;

    this.usersApi.remove(u.id_users).subscribe({
      next: _ => { this.toastOk('Eliminado'); this.loadUsers(); },
      error: e => this.showError(e?.error?.message ?? 'No se pudo eliminar')
    });
  }

  // ---- ROLES (asignación a usuario) ----
  openRoles(u: User) {
    this.currentUser.set(u);
    // Cargar lista de roles del sistema
    this.rolesApi.list().subscribe({
      next: roles => {
        const names = roles.filter(r=>r.state==1).map(r => r.name_roles);
        this.availableRoleNames.set(names);
        // Cargar roles del usuario
        this.usersApi.rolesOf(u.id_users).subscribe({
          next: userRoles => {
            this.selectedRoleNames.set(new Set(userRoles));
            this.rolesModal.set(true);
          },
          error: e => this.showError(e?.error?.message ?? 'No se pudieron cargar los roles del usuario')
        });
      },
      error: e => this.showError(e?.error?.message ?? 'No se pudieron cargar los roles disponibles')
    });
  }

  async saveUserRoles(newRoles: string[]) {
    const u = this.currentUser(); if (!u) return;
    const { isConfirmed } = await Swal.fire({
      icon: 'question',
      title: 'Guardar roles',
      text: `Asignar roles a "${u.name_users}"`,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar'
    });
    if (!isConfirmed) return;

    this.usersApi.setRoles(u.id_users, newRoles).subscribe({
      next: _ => { this.rolesModal.set(false); this.toastOk('Roles guardados'); this.loadUsers(); },
      error: e => this.showError(e?.error?.message ?? 'No se pudieron guardar los roles')
    });
  }
}
