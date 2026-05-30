// coaches.service.ts — Wraps /api/coaches/* endpoints.
// Types align 1:1 with backend DTOs (E_Club.DTOs.Coaches.*).

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

/** Matches E_Club.DTOs.Coaches.Responses.CoachResponse */
export interface ApiCoach {
  id: number;
  fullName: string;
  specialization: string;
  imageUrl?: string | null;
  bio?: string | null;
  experienceYears: number;
  rating: number;
  phoneNumber?: string | null;
  email?: string | null;
  isActive: boolean;
}

/** Matches E_Club.DTOs.Coaches.Requests.CreateCoachRequest
 *  Same body is used for PUT /api/coaches/:id. */
export interface CreateCoachRequest {
  fullName: string;
  specialization: string;
  imageUrl?: string | null;
  bio?: string | null;
  experienceYears: number;
  phoneNumber?: string | null;
  email?: string | null;
}

export type CoachUpdateRequest = CreateCoachRequest;

export interface CoachAssignmentResult {
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class CoachesService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/coaches`;

  /** GET /api/coaches */
  list(): Observable<ApiCoach[]> {
    return this.http.get<ApiCoach[]>(this.baseUrl).pipe(
      tap(res => console.info('[CoachesService] ← list', res?.length))
    );
  }

  /** GET /api/coaches/:id */
  getById(id: number): Observable<ApiCoach> {
    return this.http.get<ApiCoach>(`${this.baseUrl}/${id}`);
  }

  /** GET /api/coaches/specialization/:sport */
  bySpecialization(specialization: string): Observable<ApiCoach[]> {
    const safe = encodeURIComponent(specialization.trim());
    return this.http.get<ApiCoach[]>(`${this.baseUrl}/specialization/${safe}`);
  }

  /** POST /api/coaches — admin only. */
  create(payload: CreateCoachRequest): Observable<ApiCoach> {
    return this.http.post<ApiCoach>(this.baseUrl, payload);
  }

  /** PUT /api/coaches/:id — admin only. Returns { message }. */
  update(id: number, payload: CoachUpdateRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/${id}`, payload);
  }

  /** DELETE /api/coaches/:id — admin only (soft-deletes / deactivates). */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /** POST /api/coaches/classes/{classId}/assign/{coachId} — admin only. */
  assignToClass(classId: number, coachId: number): Observable<CoachAssignmentResult> {
    return this.http.post<CoachAssignmentResult>(
      `${this.baseUrl}/classes/${classId}/assign/${coachId}`, {}
    );
  }

  /** DELETE /api/coaches/classes/{classId}/assign — admin only. */
  unassignFromClass(classId: number): Observable<CoachAssignmentResult> {
    return this.http.delete<CoachAssignmentResult>(`${this.baseUrl}/classes/${classId}/assign`);
  }
}
