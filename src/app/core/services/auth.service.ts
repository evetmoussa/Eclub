// auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import {
  LoginRequest, RegisterRequest, ForgotPasswordRequest,
  ResetPasswordRequest, VerifyResetCodeRequest, ResendResetCodeRequest,
  ConfirmEmailRequest, ResendConfirmationRequest, TokenPair
} from '../models/auth/auth-dtos';

/**
 * Matches backend E_Club.DTOs.Auth.Responses.AuthResponse exactly.
 * Fields are camelCased by System.Text.Json default policy.
 */
export interface AuthResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  token: string;
  expiresIn: number;
  refreshToken: string;
  refreshTokenExpiration: string;
  membershipId?: string | null;
  digitalAccessKey?: string | null;
}

export const AUTH_KEYS = {
  memberToken: 'memberToken',
  memberRefresh: 'memberRefreshToken',
  memberExpiry: 'memberTokenExpiry',
  memberId: 'memberId',
  memberEmail: 'memberEmail',
  memberName: 'memberName',
  adminToken: 'adminToken',
  adminRefresh: 'adminRefreshToken',
  adminExpiry: 'adminTokenExpiry',
  adminRefreshExpiry: 'adminRefreshExpiry',
  adminId: 'adminId',
  adminEmail: 'adminEmail',
  adminName: 'adminName',
  userType: 'userType'
} as const;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;
  private http = inject(HttpClient);
  private router = inject(Router);

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, data);
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, data).pipe(
      tap(res => this.saveMemberSession(res))
    );
  }

  adminLogin(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, data).pipe(
      tap(res => this.saveAdminSession(res))
    );
  }

  forgetPassword(data: ForgotPasswordRequest): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/forgot-password`, data);
  }

  verifyOtp(data: VerifyResetCodeRequest): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/verify-reset-code`, data);
  }

  resendResetCode(data: ResendResetCodeRequest): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/resend-reset-code`, data);
  }

  resetPassword(data: ResetPasswordRequest): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/reset-password`, data);
  }

  confirmEmail(data: ConfirmEmailRequest): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/confirm-email`, data);
  }

  resendConfirmation(data: ResendConfirmationRequest): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/resend-confirmation`, data);
  }

  /** Backend expects BOTH the access token and refresh token in the body. */
  revokeToken(): Observable<unknown> {
    const token = this.getActiveToken() ?? '';
    const refreshToken =
      localStorage.getItem(AUTH_KEYS.adminRefresh) ??
      localStorage.getItem(AUTH_KEYS.memberRefresh) ?? '';
    const body: TokenPair = { token, refreshToken };
    return this.http.post(`${this.baseUrl}/revoke-token`, body);
  }

  /** Refresh expects { token, refreshToken } — both required by the API. */
  refreshToken(refreshToken: string): Observable<AuthResponse> {
    const body: TokenPair = { token: this.getActiveToken() ?? '', refreshToken };
    return this.http.post<AuthResponse>(`${this.baseUrl}/refresh-token`, body);
  }

  private saveMemberSession(res: AuthResponse): void {
    if (!res?.token) return;
    localStorage.setItem(AUTH_KEYS.memberToken, res.token);
    if (res.refreshToken) localStorage.setItem(AUTH_KEYS.memberRefresh, res.refreshToken);
    if (res.expiresIn) {
      const expiry = new Date().getTime() + res.expiresIn * 1000;
      localStorage.setItem(AUTH_KEYS.memberExpiry, expiry.toString());
    }
    if (res.id)        localStorage.setItem(AUTH_KEYS.memberId, String(res.id));
    if (res.email)     localStorage.setItem(AUTH_KEYS.memberEmail, res.email);
    if (res.firstName) localStorage.setItem(AUTH_KEYS.memberName, `${res.firstName} ${res.lastName ?? ''}`.trim());
    localStorage.setItem(AUTH_KEYS.userType, 'member');
  }

  private saveAdminSession(res: AuthResponse): void {
    if (!res?.token) return;
    localStorage.setItem(AUTH_KEYS.adminToken, res.token);
    if (res.refreshToken) localStorage.setItem(AUTH_KEYS.adminRefresh, res.refreshToken);
    if (res.expiresIn) {
      const expiry = new Date().getTime() + res.expiresIn * 1000;
      localStorage.setItem(AUTH_KEYS.adminExpiry, expiry.toString());
    }
    if (res.refreshTokenExpiration) {
      localStorage.setItem(AUTH_KEYS.adminRefreshExpiry, new Date(res.refreshTokenExpiration).getTime().toString());
    }
    if (res.id)        localStorage.setItem(AUTH_KEYS.adminId, String(res.id));
    if (res.email)     localStorage.setItem(AUTH_KEYS.adminEmail, res.email);
    if (res.firstName) localStorage.setItem(AUTH_KEYS.adminName, `${res.firstName} ${res.lastName ?? ''}`.trim());
    localStorage.setItem(AUTH_KEYS.userType, 'admin');
  }

  logoutAdmin(): void {
    [
      AUTH_KEYS.adminToken, AUTH_KEYS.adminRefresh, AUTH_KEYS.adminExpiry,
      AUTH_KEYS.adminRefreshExpiry, AUTH_KEYS.adminId, AUTH_KEYS.adminEmail,
      AUTH_KEYS.adminName, AUTH_KEYS.userType
    ].forEach(k => localStorage.removeItem(k));
    this.router.navigate(['/admin-login']);
  }

  logoutMember(): void {
    [
      AUTH_KEYS.memberToken, AUTH_KEYS.memberRefresh, AUTH_KEYS.memberExpiry,
      AUTH_KEYS.memberId, AUTH_KEYS.memberEmail, AUTH_KEYS.memberName,
      AUTH_KEYS.userType
    ].forEach(k => localStorage.removeItem(k));
    this.router.navigate(['/login']);
  }

  logout(): void {
    if (this.getUserType() === 'admin') this.logoutAdmin();
    else this.logoutMember();
  }

  isAdminLoggedIn(): boolean {
    const token = localStorage.getItem(AUTH_KEYS.adminToken);
    if (!token) return false;
    const expiry = localStorage.getItem(AUTH_KEYS.adminExpiry);
    return expiry ? new Date().getTime() < parseInt(expiry, 10) : true;
  }

  isMemberLoggedIn(): boolean {
    const token = localStorage.getItem(AUTH_KEYS.memberToken);
    if (!token) return false;
    const expiry = localStorage.getItem(AUTH_KEYS.memberExpiry);
    return expiry ? new Date().getTime() < parseInt(expiry, 10) : true;
  }

  getAdminToken(): string | null  { return localStorage.getItem(AUTH_KEYS.adminToken); }
  getMemberToken(): string | null { return localStorage.getItem(AUTH_KEYS.memberToken); }
  getActiveToken(): string | null { return this.getAdminToken() ?? this.getMemberToken(); }
  getUserType(): string | null    { return localStorage.getItem(AUTH_KEYS.userType); }

  isAdmin(): boolean  { return this.getUserType() === 'admin'  && this.isAdminLoggedIn(); }
  isMember(): boolean { return this.getUserType() === 'member' && this.isMemberLoggedIn(); }

  checkTokenAndRedirect(): void {
    if (this.isMemberLoggedIn()) {
      const url = this.router.url;
      if (url === '/' || url.includes('/login') || url.includes('/authlayout')) {
        this.router.navigate(['/blank-layout/home']);
      }
      return;
    }
    if (this.isAdminLoggedIn()) {
      const url = this.router.url;
      if (url === '/' || url.includes('/admin-login')) {
        this.router.navigate(['/admin/dashboard']);
      }
    }
  }
}
