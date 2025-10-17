import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { RolesService, Role } from '../../app/core/roles.service';

@Component({
  standalone: true,
  selector: 'app-admin-roles',
  imports: [CommonModule, FormsModule],
  templateUrl: 'admin-roles.component.html'
})
export class AdminRolesComponent {
  private api = inject(RolesService);

  roles = signal<Role[]>([]);
  showCreate = signal(false);
  draft = { name_roles: '' };

  ngOnInit(){ this.load(); }

  private showError(msg: string) {
    Swal.fire({ icon: 'error', title: 'Error', text: msg });
  }
  private toastOk(title: string) {
    Swal.fire({ icon: 'success', title, timer: 1200, showConfirmButton: false });
  }

  load() {
    this.api.list().subscribe({
      next: d => this.roles.set(d),
      error: e => this.showError(e?.error?.message ?? 'No se pudieron cargar los roles')
    });
  }

  toggleCreate() { this.showCreate.set(!this.showCreate()); }

  async create(f: NgForm) {
    if (f.invalid) {
      this.showError('Nombre de rol requerido.');
      return;
    }
    const { isConfirmed } = await Swal.fire({
      icon: 'question',
      title: 'Crear rol',
      text: `¿Crear rol "${this.draft.name_roles}"?`,
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar'
    });
    if (!isConfirmed) return;

    this.api.create({ name_roles: this.draft.name_roles.trim() }).subscribe({
      next: _ => { this.toastOk('Rol creado'); this.draft.name_roles=''; this.showCreate.set(false); this.load(); },
      error: e => this.showError(e?.error?.message ?? 'No se pudo crear el rol')
    });
  }

  async save(r: Role) {
    if (!r.name_roles?.trim()) {
      this.showError('El nombre del rol no puede estar vacío.');
      return;
    }
    const { isConfirmed } = await Swal.fire({
      icon: 'question',
      title: 'Guardar cambios',
      text: `¿Guardar cambios del rol "${r.name_roles}"?`,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar'
    });
    if (!isConfirmed) return;

    this.api.update(r.id_roles, { name_roles: r.name_roles, state: r.state }).subscribe({
      next: _ => { this.toastOk('Guardado'); this.load(); },
      error: e => this.showError(e?.error?.message ?? 'No se pudo guardar')
    });
  }

  async toggleState(r: Role) {
    const toInactive = r.state == 1;
    const { isConfirmed } = await Swal.fire({
      icon: 'question',
      title: toInactive ? 'Desactivar rol' : 'Activar rol',
      text: toInactive ? 'El rol quedará inactivo.' : 'El rol volverá a estar activo.',
      showCancelButton: true,
      confirmButtonText: toInactive ? 'Desactivar' : 'Activar',
      cancelButtonText: 'Cancelar'
    });
    if (!isConfirmed) return;

    this.api.update(r.id_roles, { state: toInactive ? 0 : 1 }).subscribe({
      next: _ => { this.toastOk(toInactive ? 'Desactivado' : 'Activado'); this.load(); },
      error: e => this.showError(e?.error?.message ?? 'No se pudo cambiar el estado')
    });
  }

  async remove(r: Role) {
    const { isConfirmed } = await Swal.fire({
      icon: 'warning',
      title: 'Eliminar rol',
      html: `¿Seguro que deseas eliminar el rol <b>${r.name_roles}</b>?`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (!isConfirmed) return;

    this.api.remove(r.id_roles).subscribe({
      next: _ => { this.toastOk('Eliminado'); this.load(); },
      error: e => this.showError(e?.error?.message ?? 'No se pudo eliminar')
    });
  }
}
