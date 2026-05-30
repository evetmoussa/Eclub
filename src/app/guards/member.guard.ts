// guards/member.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

export const memberGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isMemberLoggedIn()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
