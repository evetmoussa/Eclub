import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Public endpoints that MUST go out without an Authorization header,
 * even if a token happens to exist in storage. These are anonymous
 * by design, and adding a stale token can confuse the back-end.
 */
const PUBLIC_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh-token',
  '/auth/confirm-email',
  '/auth/resend-confirmation',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-reset-code',
  '/auth/resend-reset-code'
];

/** Hostnames that are NOT our backend — never send our token to them. */
const EXTERNAL_HOSTS = [
  'hf.space',          // huggingface spaces (chatbot)
  'huggingface.co',
  'unsplash.com',      // image CDN
  'pravatar.cc'
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // 0) External hosts: pass-through, no token, no logging.
  if (EXTERNAL_HOSTS.some(h => req.url.toLowerCase().includes(h))) {
    return next(req);
  }

  // 1) Decide whether this is a public endpoint on our own backend.
  const isPublic = PUBLIC_ENDPOINTS.some(p =>
    req.url.toLowerCase().includes(p)
  );

  // 2) Pick the token that matches the target API — admin token for
  //    /api/admin/*, member token otherwise — so coexisting sessions don't
  //    cross-contaminate (member token on an admin endpoint → 403).
  const token = authService.getTokenForUrl(req.url);

  // 3) Attach Bearer token if we have one and the endpoint isn't public
  let outgoing = req;
  if (token && !isPublic) {
    outgoing = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    console.info(
      `%c[AuthInterceptor] → ${req.method} ${req.url}\n  Token attached (length=${token.length})`,
      'color:#1AD55F'
    );
  } else {
    console.info(
      `%c[AuthInterceptor] → ${req.method} ${req.url}\n  No token sent (isPublic=${isPublic}, hasToken=${!!token})`,
      'color:#94a3b8'
    );
  }

  // 4) Forward and log the response status for easier debugging
  return next(outgoing).pipe(
    tap({
      next: (event: any) => {
        if (event?.status !== undefined) {
          console.info(
            `%c[AuthInterceptor] ← ${event.status} ${req.method} ${req.url}`,
            'color:#0EA5E9'
          );
        }
      },
      error: (err) => {
        console.warn(
          `%c[AuthInterceptor] ✖ ${err?.status ?? '?'} ${req.method} ${req.url}`,
          'color:#ef4444',
          err?.error
        );
      }
    })
  );
};
