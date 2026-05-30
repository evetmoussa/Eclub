import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Banner } from '../models/home/home.model';

export interface BannerWrite {
  title: string;
  subtitle: string;
  imageUrl: string;
  actionUrl?: string | null;
  isActive: boolean;
  displayOrder: number;
  type: string;
}

/**
 * Wraps the /api/banners endpoints (read + admin CRUD + toggle).
 */
@Injectable({ providedIn: 'root' })
export class BannersService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/banners`;

  list(): Observable<Banner[]> {
    return this.http.get<Banner[]>(this.baseUrl).pipe(
      tap(r => console.info('[BannersService] ← list', r?.length))
    );
  }

  getById(id: number): Observable<Banner> {
    return this.http.get<Banner>(`${this.baseUrl}/${id}`);
  }

  create(payload: BannerWrite): Observable<Banner> {
    return this.http.post<Banner>(this.baseUrl, payload);
  }

  update(id: number, payload: BannerWrite): Observable<Banner> {
    return this.http.put<Banner>(`${this.baseUrl}/${id}`, payload);
  }

  remove(id: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  toggleStatus(id: number): Observable<unknown> {
    return this.http.put(`${this.baseUrl}/${id}/toggle-status`, {});
  }
}
