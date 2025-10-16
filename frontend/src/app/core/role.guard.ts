import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const roleGuard = (required: string): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (auth.isLogged() && auth.hasRole(required)) return true;
    router.navigate(['/unauthorized']);
    return false;
  };
};