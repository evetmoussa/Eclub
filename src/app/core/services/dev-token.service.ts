import { Injectable, inject } from '@angular/core';
import { AUTH_KEYS } from './auth.service';

/**
 * Development helper to manually inject a JWT obtained from Postman
 * (or any other testing tool) into localStorage under the SAME keys
 * used by AuthService — so the rest of the app behaves as if the user
 * went through a real login.
 *
 * NOT intended for production. Remove (or guard with environment.production)
 * once a real login flow is fully wired up.
 */
@Injectable({ providedIn: 'root' })
export class DevTokenService {

  /** Save the pasted token as a member session. */
  setMemberToken(token: string, expiresInSeconds = 60 * 60 * 24): void {
    const expiry = new Date().getTime() + expiresInSeconds * 1000;
    localStorage.setItem(AUTH_KEYS.memberToken, token);
    localStorage.setItem(AUTH_KEYS.memberExpiry, expiry.toString());
    localStorage.setItem(AUTH_KEYS.userType, 'member');
    console.info('[DevTokenService] Member token saved. Expires:', new Date(expiry));
  }

  /** Save the pasted token as an admin session. */
  setAdminToken(token: string, expiresInSeconds = 60 * 60 * 24): void {
    const expiry = new Date().getTime() + expiresInSeconds * 1000;
    localStorage.setItem(AUTH_KEYS.adminToken, token);
    localStorage.setItem(AUTH_KEYS.adminExpiry, expiry.toString());
    localStorage.setItem(AUTH_KEYS.userType, 'admin');
    console.info('[DevTokenService] Admin token saved. Expires:', new Date(expiry));
  }

  /** Clear every auth-related entry. */
  clearAll(): void {
    Object.values(AUTH_KEYS).forEach(k => localStorage.removeItem(k));
    console.info('[DevTokenService] All tokens cleared.');
  }

  /** Snapshot of what's currently stored (for debugging). */
  inspect(): Record<string, string | null> {
    const out: Record<string, string | null> = {};
    Object.values(AUTH_KEYS).forEach(k => (out[k] = localStorage.getItem(k)));
    return out;
  }

  /** Decode the JWT payload without verifying the signature (just for display). */
  decodeJwt(token: string): unknown {
    try {
      const [, payload] = token.split('.');
      if (!payload) return null;
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json);
    } catch {
      return null;
    }
  }
}
