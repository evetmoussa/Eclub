import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Matches backend E_Club.DTOs.Users.Responses.UserProfileResponse.
 * `fullName` and `avatarUrl` are NOT on the server — kept here as optional
 * client-side derived fields for the profile UI.
 */
export interface AccountProfile {
  email: string;
  userName: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  nationalId?: string | null;
  membershipId?: string | null;
  sequenceNumber?: string | null;
  digitalAccessKey?: string | null;
  clubCode?: string | null;
  createdOn?: string;
  roles?: string[];
  fullName?: string;
  avatarUrl?: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
}

/**
 * Wraps GET/PUT /account/profile and PUT /account/change-password.
 */
@Injectable({ providedIn: 'root' })
export class AccountService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/account`;

  getProfile(): Observable<AccountProfile> {
    return this.http.get<AccountProfile>(`${this.baseUrl}/profile`);
  }

  updateProfile(data: UpdateProfileRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/profile`, data);
  }

  changePassword(data: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/change-password`, data);
  }
}
