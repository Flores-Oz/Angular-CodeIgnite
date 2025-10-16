import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService, User } from '../../app/core/users.service';
import { AuthService } from '../../app/core/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-users',
  template: `
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-xl font-semibold">Usuarios</h2>
    <button *ngIf="canCreate()" (click)="toggleCreate()"
            class="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700">
      {{ showCreate() ? 'Cancelar' : 'Nuevo' }}
    </button>
  </div>

  <form *ngIf="showCreate()" (ngSubmit)="create()" class="bg-white rounded-2xl p-4 border space-y-3 mb-6">
    <div>
      <label class="text-sm">Nombre</label>
      <input class="mt-1 w-full border rounded-xl px-3 py-2" [(ngModel)]="draft.name_users" name="name_users" required>
    </div>
    <div>
      <label class="text-sm">Email</label>
      <input class="mt-1 w-full border rounded-xl px-3 py-2" [(ngModel)]="draft.email" name="email" required email>
    </div>
    <div>
      <label class="text-sm">Password</label>
      <input type="password" class="mt-1 w-full border rounded-xl px-3 py-2" [(ngModel)]="draft.password" name="password" required>
    </div>
    <button class="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700">Crear</button>
    <span class="text-sm text-red-600" *ngIf="error()">{{ error() }}</span>
  </form>

  <div class="bg-white rounded-2xl border">
    <table class="w-full text-sm">
      <thead class="bg-gray-100">
        <tr>
          <th class="text-left p-3">Nombre</th>
          <th class="text-left p-3">Email</th>
          <th class="text-left p-3">Estado</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let u of users(); trackBy: trackById" class="border-t">
          <td class="p-3">{{ u.name_users }}</td>
          <td class="p-3">{{ u.email }}</td>
          <td class="p-3">
            <span class="px-2 py-0.5 rounded-full text-xs"
                  [class.bg-green-100]="u.state===1"
                  [class.text-green-700]="u.state===1"
                  [class.bg-gray-200]="u.state!==1"
                  [class.text-gray-700]="u.state!==1">
              {{ u.state===1 ? 'Activo' : 'Inactivo' }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  `
})
export class UsersComponent {
  private api = inject(UsersService);
  private auth = inject(AuthService);

  users = signal<User[]>([]);
  showCreate = signal(false);
  error = signal<string|undefined>(undefined);

  draft = { name_users:'', email:'', password:'' };

  ngOnInit(){ this.load(); }
  load(){ this.api.list().subscribe({ next: d => this.users.set(d) }); }
  toggleCreate(){ this.showCreate.set(!this.showCreate()); }

  // Si quieres que solo ADMIN cree:
  canCreate(){ return this.auth.hasRole?.('ADMIN') ?? true; }

  create(){
    this.api.create(this.draft).subscribe({
      next: _ => {
        this.draft = {name_users:'', email:'', password:''};
        this.showCreate.set(false);
        this.load();
        this.error.set(undefined);
      },
      error: e => this.error.set(e?.error?.message ?? 'Error al crear')
    });
  }

  trackById = (_: number, u: User) => u.id_users;
}