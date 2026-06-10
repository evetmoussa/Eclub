import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Sport, SportClass, SportsScreen, SpecialEvent, MyBooking,
  Academy, AcademiesScreen
} from '../models/sport.model';
import { ACADEMIES_MOCK } from '../mock/academy.mock';

/**
 * Wraps every /api/sports/* endpoint exposed by the back-end.
 * Authorization header is added transparently by authInterceptor.
 */
@Injectable({ providedIn: 'root' })
export class SportsService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/sports`;

  /* ====================================================
   *  Read endpoints
   * ==================================================== */

  /** Whole "sports" screen (sports list + upcoming classes + special event). */
  getScreen(sportId?: number): Observable<SportsScreen> {
    let params = new HttpParams();
    if (sportId != null) params = params.set('sportId', sportId);
    console.info('[SportsService] GET /screen sportId=', sportId);
    return this.http.get<SportsScreen>(`${this.baseUrl}/screen`, { params }).pipe(
      tap(res => console.info('[SportsService] ← screen', res))
    );
  }

  /** Plain list of sports. */
  getSports(): Observable<Sport[]> {
    return this.http.get<Sport[]>(this.baseUrl).pipe(
      tap(res => console.info('[SportsService] ← sports', res?.length))
    );
  }

  /** All classes — optionally filtered by sport. */
  getClasses(sportId?: number): Observable<SportClass[]> {
    let params = new HttpParams();
    if (sportId != null) params = params.set('sportId', sportId);
    return this.http.get<SportClass[]>(`${this.baseUrl}/classes`, { params }).pipe(
      tap(res => console.info('[SportsService] ← classes', res?.length))
    );
  }

  /**
   * Bookable classes/sessions for an academy details page.
   * The API exposes classes via /sports/classes (each carries academyId).
   * Returns { classes, isFallback }:
   *   - classes scoped to this academy when any are linked, OR
   *   - ALL available classes as a fallback when none are linked yet
   *     (many backend classes currently have academyId = null).
   * `isFallback` lets the UI tell the user the list isn't academy-specific.
   */
  getClassesByAcademy(academyId: number): Observable<{ classes: SportClass[]; isFallback: boolean }> {
    return this.http.get<SportClass[]>(`${this.baseUrl}/classes`).pipe(
      map(list => {
        const all = list ?? [];
        const scoped = all.filter(c => c.academyId === academyId);
        return scoped.length
          ? { classes: scoped, isFallback: false }
          : { classes: all, isFallback: true };
      }),
      tap(res => console.info('[SportsService] ← academy classes', academyId, res.classes.length, 'fallback=', res.isFallback))
    );
  }

  /**
   * Member-facing academies list from the real endpoint GET /api/academies/screen
   * (returns { featured, all } with full academy data incl. embedded trainers).
   * Members can read this; /api/admin/academies is admin-only (403 for members).
   */
  getAcademiesScreen(): Observable<AcademiesScreen> {
    return this.http.get<AcademiesScreen>(`${environment.apiBaseUrl}/api/academies/screen`).pipe(
      map(res => ({ featured: res?.featured ?? [], all: res?.all ?? [] })),
      tap(res => console.info('[SportsService] ← academies/screen', res.all.length))
    );
  }

  /** Special event for a sport (returns 404 if none — caller should swallow). */
  getSpecialEvent(sportId?: number): Observable<SpecialEvent | null> {
    let params = new HttpParams();
    if (sportId != null) params = params.set('sportId', sportId);
    return this.http.get<SpecialEvent>(`${this.baseUrl}/special-event`, { params });
  }

  /** Bookings of the currently logged-in user. */
  getMyBookings(): Observable<MyBooking[]> {
    return this.http.get<MyBooking[]>(`${this.baseUrl}/my-bookings`).pipe(
      tap(res => console.info('[SportsService] ← my-bookings', res?.length))
    );
  }

  /* ====================================================
   *  Write endpoints
   * ==================================================== */

  bookClass(classId: number): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/classes/${classId}/book`, {});
  }

  cancelBooking(classId: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/classes/${classId}/book`);
  }

  joinClass(classId: number): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/classes/${classId}/join`, {});
  }

  createClass(payload: Partial<SportClass>): Observable<SportClass> {
    return this.http.post<SportClass>(`${this.baseUrl}/classes`, payload);
  }

  updateClass(id: number, payload: Partial<SportClass>): Observable<SportClass> {
    return this.http.put<SportClass>(`${this.baseUrl}/classes/${id}`, payload);
  }

  deleteClass(id: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/classes/${id}`);
  }

  /* ====================================================
   *  Legacy mock helpers — kept so the existing
   *  AcademyDetails page keeps working.
   * ==================================================== */
  getAcademies(): Observable<Academy[]> {
    return of(ACADEMIES_MOCK);
  }

  getAcademyById(id: number): Observable<Academy | undefined> {
    return of(ACADEMIES_MOCK.find(a => a.id === id));
  }
}
