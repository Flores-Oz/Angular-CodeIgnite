import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export function roleGuard(required: string | string[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    // Convertir roles requeridos a mayúsculas
    const need = (Array.isArray(required) ? required : [required])
      .map(r => (r || '').toString().toUpperCase());

    // Tomar roles del token payload
    const userRoles = (auth.payload?.roles ?? [])
      .map((r: string) => (r || '').toUpperCase());

    // Validar si el usuario tiene al menos uno de los roles requeridos
    const ok = need.some(r => userRoles.includes(r));

    if (!ok) {
      router.navigateByUrl('/dashboard');
      return false;
    }
    return true;
  };
}