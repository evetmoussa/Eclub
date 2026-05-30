// guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isMemberLoggedIn() || authService.isAdminLoggedIn()) {
    return true;
  }

  router.navigate(['/']);
  return false;
};
