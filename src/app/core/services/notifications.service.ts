import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppNotification, UnreadCountResponse } from '../models/notification.model';

/**
 * Wraps GET /api/notifications + related read/delete endpoints.
 * Authorization is added by authInterceptor.
 *
 * Per Swagger:
 *   GET    /api/notifications?page=1&pageSize=20    → AppNotification[]
 *   GET    /api/notifications/unread-count          → { count }
 *   PUT    /api/notifications/{id}/read             → 200
 *   PUT    /api/notifications/read-all              → { message }
 *   DELETE /api/notifications/{id}                  → 200
 *   POST   /api/notifications                       → admin-only create
 */
@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/notifications`;

  list(page = 1, pageSize = 20): Observable<AppNotification[]> {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);
    return this.http.get<AppNotification[]>(this.baseUrl, { params }).pipe(
      tap(res => console.info('[NotificationsService] ← list', res?.length))
    );
  }

  unreadCount(): Observable<UnreadCountResponse> {
    return this.http.get<UnreadCountResponse>(`${this.baseUrl}/unread-count`).pipe(
      tap(res => console.info('[NotificationsService] ← unread-count', res?.count))
    );
  }

  markRead(id: number): Observable<unknown> {
    return this.http.put(`${this.baseUrl}/${id}/read`, {});
  }

  markAllRead(): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/read-all`, {});
  }

  remove(id: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Admin-only: create a notification.
   * Expects { title, body, type, userId, referenceId, referenceType }.
   */
  create(payload: {
    title: string;
    body: string;
    type: number;
    userId: string;
    referenceId?: number;
    referenceType?: string;
  }): Observable<AppNotification> {
    return this.http.post<AppNotification>(this.baseUrl, payload);
  }
}
