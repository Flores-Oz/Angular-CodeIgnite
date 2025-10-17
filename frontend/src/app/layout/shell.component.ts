import { Component, inject, computed } from '@angular/core';
import { Router, RouterLink, RouterOutlet, RouterLinkActive} from '@angular/router';
import { AuthService } from '../core/auth.service';
import { CommonModule } from '@angular/common';


@Component({
  standalone: true,
  selector: 'app-shell',
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './shell.component.html'
})
export class ShellComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  // email mostrado en el header
  email = computed(() => this.auth.payload?.email ?? '');

  // rol ADMIN (case-insensitive)
  isAdmin = computed(() => {
    const roles = (this.auth.payload?.roles ?? []).map((r: string) => (r || '').toUpperCase());
    return roles.includes('ADMIN');
  });

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
    // Si prefieres forzar recarga limpia:
    // location.href = '/login';
  }
}