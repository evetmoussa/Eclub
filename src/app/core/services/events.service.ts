import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppEvent, EventCreate, MyEventRegistration } from '../models/event.model';

/**
 * Wraps every /api/Events/* endpoint. Read paths (featured, upcoming,
 * by id) require auth like everything else in this back-end. Mutations
 * (POST/PUT/DELETE) are admin-only — the back-end will reject if the
 * member token is sent.
 */
@Injectable({ providedIn: 'root' })
export class EventsService {
  private http = inject(HttpClient);
  // Note: case matters on the back-end. The swagger uses both /api/Events
  // (capital E) for read/write and /api/events (lowercase) for registrations.
  private readonly baseUrl    = `${environment.apiBaseUrl}/api/Events`;
  private readonly regBaseUrl = `${environment.apiBaseUrl}/api/events`;

  /* ───────── Reads ───────── */

  /** Single highlighted event — used on the home page. */
  getFeatured(): Observable<AppEvent> {
    return this.http.get<AppEvent>(`${this.baseUrl}/featured`).pipe(
      tap(r => console.info('[EventsService] ← featured', r?.id))
    );
  }

  /** All events that haven't started yet, ordered by date. */
  getUpcoming(): Observable<AppEvent[]> {
    return this.http.get<AppEvent[]>(`${this.baseUrl}/upcoming`).pipe(
      tap(r => console.info('[EventsService] ← upcoming', r?.length))
    );
  }

  getById(id: number): Observable<AppEvent> {
    return this.http.get<AppEvent>(`${this.baseUrl}/${id}`);
  }

  /* ───────── Member-side registrations ───────── */

  /** Register the logged-in member to an event. */
  register(eventId: number): Observable<unknown> {
    return this.http.post(`${this.regBaseUrl}/${eventId}/register`, {});
  }

  /** Cancel my registration for that event. */
  cancelRegistration(eventId: number): Observable<unknown> {
    return this.http.delete(`${this.regBaseUrl}/${eventId}/register`);
  }

  /** All events I'm registered to. */
  myRegistrations(): Observable<MyEventRegistration[]> {
    return this.http.get<MyEventRegistration[]>(`${this.regBaseUrl}/my-registrations`).pipe(
      tap(r => console.info('[EventsService] ← my-registrations', r?.length))
    );
  }

  /* ───────── Admin CRUD ───────── */

  create(payload: EventCreate): Observable<AppEvent> {
    return this.http.post<AppEvent>(this.baseUrl, payload);
  }

  update(id: number, payload: EventCreate): Observable<AppEvent> {
    return this.http.put<AppEvent>(`${this.baseUrl}/${id}`, payload);
  }

  remove(id: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
