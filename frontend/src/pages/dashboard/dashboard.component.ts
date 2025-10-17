import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../app/core/auth.service';
import Swal from 'sweetalert2';

import { UsersService, User } from '../../app/core/users.service';
import { PostsService, Post } from '../../app/core/posts.service';
import { RolesService, Role } from '../../app/core/roles.service';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html'
})

export class ShellComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  // rol ADMIN (case-insensitive)
  isAdmin = computed(() => {
    const roles = (this.auth.payload?.roles ?? []).map((r: string) => (r || '').toUpperCase());
    return roles.includes('ADMIN');
  });
}

export class AdminDashboardComponent {
  private usersApi = inject(UsersService);
  private postsApi = inject(PostsService);
  private rolesApi = inject(RolesService);

  loading = signal(false);

  // datasets
  users = signal<User[]>([]);
  posts = signal<Post[]>([]);
  roles = signal<Role[]>([]);

  // KPIs (computados)
  totalUsers      = computed(() => this.users().length);
  activeUsers     = computed(() => this.users().filter(u => +u.state === 1).length);
  totalPosts      = computed(() => this.posts().length);
  activePosts     = computed(() => this.posts().filter(p => +p.state === 1).length);
  activeRoles     = computed(() => this.roles().filter(r => +r.state === 1).length);

  // últimas publicaciones (máx 5)
  recentPosts = computed(() =>
    [...this.posts()]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
  );

  ngOnInit() {
    this.loadAll();
  }

  private showError(msg: string) {
    Swal.fire({ icon: 'error', title: 'Error', text: msg });
  }

  loadAll() {
    this.loading.set(true);

    // Carga en paralelo
    this.usersApi.list().subscribe({
      next: us => this.users.set(us),
      error: e => this.showError(e?.error?.message ?? 'No se pudieron cargar usuarios')
    });

    this.postsApi.list().subscribe({
      next: ps => {
        // ps puede ser Post[] o Paged<Post>; normalizamos
        const list = Array.isArray(ps) ? ps : (ps as any)?.data ?? [];
        this.posts.set(list);
      },
      error: e => this.showError(e?.error?.message ?? 'No se pudieron cargar publicaciones')
    });

    this.rolesApi.list().subscribe({
      next: rs => this.roles.set(rs),
      error: e => this.showError(e?.error?.message ?? 'No se pudieron cargar roles'),
      complete: () => this.loading.set(false)
    });
  }
}
