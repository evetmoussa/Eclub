import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { HomeResponse } from '../models/home/home.model';
import { environment } from '../../../environments/environment';

/**
 * Wraps GET /api/home (protected — requires Bearer token).
 * The Authorization header is added transparently by authInterceptor.
 */
@Injectable({ providedIn: 'root' })
export class HomeService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/home`;

  getHomeData(): Observable<HomeResponse> {
    console.info('[HomeService] GET', this.baseUrl);
      const token = localStorage.getItem('adminToken');
    return this.http.get<HomeResponse>(this.baseUrl).pipe(
      tap({
        next: (res) => console.info('[HomeService] ← OK', res),
        error: (err) => console.warn('[HomeService] ← ERROR', err?.status, err?.error)
      })
    );
  }
}
