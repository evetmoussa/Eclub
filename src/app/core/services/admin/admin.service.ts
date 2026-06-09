// AdminService — calls real API endpoints with proper HTTP communication.
// Handles API response wrapper (isSuccess, error, value) and maps to local models.

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap, shareReplay } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  KpiCard, ManagementTile, ActivityItem, RequestsSummary,
  AdminAcademy, AdminTrainer, AdminMember, AdminOffer
} from '../../models/admin/admin.models';

/** API response wrapper structure from backend */
interface ApiResponse<T> {
  isSuccess: boolean;
  isFailure: boolean;
  error?: { code: string; description: string; statusCode: number };
  value?: T;
}

interface PaginatedApiResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

interface TrainerApiItem {
  id: number;
  fullName: string;
  specialization: string;
  imageUrl: string;
  rating: number;
  experienceYears: number;
  isActive: boolean;
  activeSessionsCount: number;
}

interface DashboardApiResponse {
  totalMembersCount: number;   totalMembersGrowth: number;
  totalTrainersCount: number;  totalTrainersGrowth: number;
  academiesCount: number;      academiesGrowth: number;
  pendingRequestsCount: number; pendingRequestsGrowth: number;
  activeOffersCount: number;   activeOffersGrowth: number;
  requestsApprovedCount: number;
  requestsPendingCount: number;
  requestsRejectedCount: number;
  requestsSuccessRate: number;
  recentActivities: ActivityApiItem[];
}

interface ActivityApiItem {
  id: number;
  title: string;
  description: string;
  timestamp: string;
  tag: string;
  type: string;
  imageUrl: string;
}

interface AcademyApiItem {
  id: number;
  name: string;
  description: string;
  location: string;
  imageUrl: string;
  type: string;
  isFeatured: boolean;
  isNew: boolean;
  isActive: boolean;
  displayOrder: number;
  sportId: number;
  sportName: string;
  trainersCount: number;
  growthRate: number;
}

interface MemberApiItem {
  id: string;
  fullName: string;
  email: string;
  status: string;
  joinedDate: string;
  profilePictureUrl: string;
}

interface OfferApiItem {
  id: number;
  title: string;
  description: string;
  discountValue: string;
  targetAudience: string;
  imageUrl: string;
  status: string;
  startDate: string;
  endDate: string;
  usageCount: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/admin`;
  private readonly rootUrl = `${environment.apiBaseUrl}/api`;

  /** Components do client-side search/filter on the full list, so ask for everything. */
  private readonly PAGE_SIZE = 1000;

  // ============================================================
  //  DASHBOARD — GET /api/admin/dashboard
  //  One backend call feeds the four getters below. shareReplay
  //  collapses the dashboard component's 4 subscriptions into 1 HTTP call.
  // ============================================================
  /**
   * Fresh dashboard request, built per call. A previous implementation cached
   * this as a singleton field with shareReplay — which meant a 403 from an early
   * (stale-token) load got replayed forever, so the dashboard stayed empty even
   * after a valid admin login. Building it lazily ensures each load uses the
   * current auth token; shareReplay still collapses the 4 concurrent getter
   * subscriptions into one HTTP call for that single load.
   */
  private dashboard$(): Observable<DashboardApiResponse> {
    return this.http
      .get<ApiResponse<DashboardApiResponse> | DashboardApiResponse>(`${this.baseUrl}/dashboard`)
      .pipe(
        map(res => {
          // The backend may return the dashboard wrapped ({ isSuccess, value })
          // or as the raw DTO. Accept either shape.
          const wrapped = res as ApiResponse<DashboardApiResponse>;
          if (wrapped && typeof wrapped.isSuccess === 'boolean') {
            if (!wrapped.isSuccess || !wrapped.value) {
              throw new Error(wrapped.error?.description || 'Failed to load dashboard');
            }
            return wrapped.value;
          }
          const raw = res as DashboardApiResponse;
          if (!raw || typeof raw.totalMembersCount !== 'number') {
            throw new Error('Failed to load dashboard');
          }
          return raw;
        }),
        tap({
          next: () => console.info('[AdminService] dashboard fetched'),
          error: (err) => console.error('[AdminService] dashboard error:', err)
        }),
        shareReplay({ bufferSize: 1, refCount: true })
      );
  }

  /**
   * Extract the array of items from a list endpoint, tolerating both shapes:
   *   • wrapped:   { isSuccess, value: { items: [...] } }
   *   • raw paged: { items: [...], totalCount, ... }
   * Returns [] if neither shape yields items.
   */
  private static itemsOf<T>(
    res: ApiResponse<PaginatedApiResponse<T>> | PaginatedApiResponse<T>
  ): T[] {
    const wrapped = res as ApiResponse<PaginatedApiResponse<T>>;
    if (wrapped && typeof wrapped.isSuccess === 'boolean') {
      return wrapped.isSuccess && wrapped.value?.items ? wrapped.value.items : [];
    }
    const raw = res as PaginatedApiResponse<T>;
    return Array.isArray(raw?.items) ? raw.items : [];
  }

  /**
   * Unwrap a single DTO from a create/update response, tolerating both shapes:
   *   • wrapped: { isSuccess, value: {...} }  — throws on isSuccess === false
   *   • raw DTO: {...}
   * Returns null only for an empty body (e.g. 204 No Content).
   */
  private static dtoOf<T>(
    res: ApiResponse<T> | T | null,
    failMsg: string
  ): T | null {
    if (res == null) return null;
    const wrapped = res as ApiResponse<T>;
    if (typeof wrapped.isSuccess === 'boolean') {
      if (!wrapped.isSuccess) throw new Error(wrapped.error?.description || failMsg);
      return wrapped.value ?? null;
    }
    return res as T;
  }

  /**
   * Throw if a delete response came back as an explicit failure wrapper.
   * Raw / empty / 2xx-No-Content responses are treated as success.
   */
  private static assertDeleteOk(res: ApiResponse<unknown> | null, failMsg: string): void {
    if (res && typeof (res as ApiResponse<unknown>).isSuccess === 'boolean'
        && !(res as ApiResponse<unknown>).isSuccess) {
      throw new Error((res as ApiResponse<unknown>).error?.description || failMsg);
    }
  }

  private static fmt(n: number): string {
    if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k';
    return String(n);
  }

  getKpis(): Observable<KpiCard[]> {
    return this.dashboard$().pipe(map(d => ([
      { key: 'members',   label: 'TOTAL MEMBERS',    value: AdminService.fmt(d.totalMembersCount),  delta: Math.round(d.totalMembersGrowth),    icon: 'group',           tone: 'green'  },
      { key: 'trainers',  label: 'TOTAL TRAINERS',   value: AdminService.fmt(d.totalTrainersCount), delta: Math.round(d.totalTrainersGrowth),   icon: 'sports',          tone: 'blue'   },
      { key: 'academies', label: 'ACADEMIES',        value: AdminService.fmt(d.academiesCount),     delta: Math.round(d.academiesGrowth),       icon: 'school',          tone: 'violet' },
      { key: 'requests',  label: 'PENDING REQUESTS', value: AdminService.fmt(d.pendingRequestsCount), delta: Math.round(d.pendingRequestsGrowth), icon: 'pending_actions', tone: 'amber'  },
      { key: 'offers',    label: 'ACTIVE OFFERS',    value: AdminService.fmt(d.activeOffersCount),  delta: Math.round(d.activeOffersGrowth),    icon: 'local_offer',     tone: 'rose'   }
    ] as KpiCard[])));
  }

  getManagementTiles(): Observable<ManagementTile[]> {
    return this.dashboard$().pipe(map(d => ([
      { key: 'trainers',  title: 'Trainers',  subtitle: 'Manage coaching staff',    icon: 'sports',      count: d.totalTrainersCount, trend: Math.round(d.totalTrainersGrowth), route: '/admin/trainers'  },
      { key: 'academies', title: 'Academies', subtitle: 'Sports programs & venues', icon: 'school',      count: d.academiesCount,     trend: Math.round(d.academiesGrowth),     route: '/admin/academies' },
      { key: 'members',   title: 'Members',   subtitle: 'Active subscribers',       icon: 'group',       count: d.totalMembersCount,  trend: Math.round(d.totalMembersGrowth),  route: '/admin/members'   },
      { key: 'offers',    title: 'Offers',    subtitle: 'Promotions & discounts',   icon: 'local_offer', count: d.activeOffersCount,  trend: Math.round(d.activeOffersGrowth),  route: '/admin/offers'    }
    ] as ManagementTile[])));
  }

  getActivities(): Observable<ActivityItem[]> {
    return this.dashboard$().pipe(
      map(d => (d.recentActivities ?? []).map(a => this.mapActivityFromApi(a)))
    );
  }

  getRequestsSummary(): Observable<RequestsSummary> {
    return this.dashboard$().pipe(map(d => ({
      successRate: Math.round(d.requestsSuccessRate),
      total:       d.requestsApprovedCount + d.requestsPendingCount + d.requestsRejectedCount,
      approved:    d.requestsApprovedCount,
      pending:     d.requestsPendingCount,
      rejected:    d.requestsRejectedCount
    } as RequestsSummary)));
  }

  /**
   * Single dashboard fetch that returns all four view pieces at once.
   * Preferred over calling the four getters separately — it makes ONE HTTP
   * request per load (the separate getters would each fire their own).
   */
  getDashboardBundle(): Observable<{
    kpis: KpiCard[];
    tiles: ManagementTile[];
    activities: ActivityItem[];
    summary: RequestsSummary;
  }> {
    return this.dashboard$().pipe(map(d => ({
      kpis: [
        { key: 'members',   label: 'TOTAL MEMBERS',    value: AdminService.fmt(d.totalMembersCount),  delta: Math.round(d.totalMembersGrowth),    icon: 'group',           tone: 'green'  },
        { key: 'trainers',  label: 'TOTAL TRAINERS',   value: AdminService.fmt(d.totalTrainersCount), delta: Math.round(d.totalTrainersGrowth),   icon: 'sports',          tone: 'blue'   },
        { key: 'academies', label: 'ACADEMIES',        value: AdminService.fmt(d.academiesCount),     delta: Math.round(d.academiesGrowth),       icon: 'school',          tone: 'violet' },
        { key: 'requests',  label: 'PENDING REQUESTS', value: AdminService.fmt(d.pendingRequestsCount), delta: Math.round(d.pendingRequestsGrowth), icon: 'pending_actions', tone: 'amber'  },
        { key: 'offers',    label: 'ACTIVE OFFERS',    value: AdminService.fmt(d.activeOffersCount),  delta: Math.round(d.activeOffersGrowth),    icon: 'local_offer',     tone: 'rose'   }
      ] as KpiCard[],
      tiles: [
        { key: 'trainers',  title: 'Trainers',  subtitle: 'Manage coaching staff',    icon: 'sports',      count: d.totalTrainersCount, trend: Math.round(d.totalTrainersGrowth), route: '/admin/trainers'  },
        { key: 'academies', title: 'Academies', subtitle: 'Sports programs & venues', icon: 'school',      count: d.academiesCount,     trend: Math.round(d.academiesGrowth),     route: '/admin/academies' },
        { key: 'members',   title: 'Members',   subtitle: 'Active subscribers',       icon: 'group',       count: d.totalMembersCount,  trend: Math.round(d.totalMembersGrowth),  route: '/admin/members'   },
        { key: 'offers',    title: 'Offers',    subtitle: 'Promotions & discounts',   icon: 'local_offer', count: d.activeOffersCount,  trend: Math.round(d.activeOffersGrowth),  route: '/admin/offers'    }
      ] as ManagementTile[],
      activities: (d.recentActivities ?? []).map(a => this.mapActivityFromApi(a)),
      summary: {
        successRate: Math.round(d.requestsSuccessRate),
        total:       d.requestsApprovedCount + d.requestsPendingCount + d.requestsRejectedCount,
        approved:    d.requestsApprovedCount,
        pending:     d.requestsPendingCount,
        rejected:    d.requestsRejectedCount
      } as RequestsSummary
    })));
  }

  private mapActivityFromApi(a: ActivityApiItem): ActivityItem {
    const t = (a.type || '').toLowerCase();
    const type = (['member', 'trainer', 'academy', 'offer', 'request'].includes(t)
      ? t : 'member') as ActivityItem['type'];
    const tone: Record<ActivityItem['type'], ActivityItem['tone']> = {
      member: 'green', trainer: 'blue', academy: 'violet', request: 'amber', offer: 'rose'
    };
    const icon: Record<ActivityItem['type'], string> = {
      member: 'person_add', trainer: 'verified_user', academy: 'school',
      request: 'pending_actions', offer: 'local_offer'
    };
    return {
      id: a.id,
      type,
      title: a.title,
      description: a.description,
      timeAgo: this.timeAgo(a.timestamp),
      icon: icon[type],
      tone: tone[type]
    };
  }

  /** "5 min ago" style relative label from an ISO timestamp. */
  private timeAgo(iso: string): string {
    const t = Date.parse(iso);
    if (isNaN(t)) return '';
    const s = Math.max(0, Math.floor((Date.now() - t) / 1000));
    if (s < 60) return `${s} sec ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m} min ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} h ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d} d ago`;
    return new Date(t).toLocaleDateString();
  }

  // ============================================================
  //  TRAINERS — GET/POST /api/admin/trainers, PUT/DELETE /api/admin/trainers/{id}
  // ============================================================
  getTrainers(): Observable<AdminTrainer[]> {
    const params = new HttpParams().set('page', 1).set('pageSize', this.PAGE_SIZE);
    return this.http.get<ApiResponse<PaginatedApiResponse<TrainerApiItem>> | PaginatedApiResponse<TrainerApiItem>>(
      `${this.baseUrl}/trainers`, { params }
    ).pipe(
      map(res => AdminService.itemsOf(res).map(item => this.mapTrainerFromApi(item))),
      tap({
        next: (data) => console.info('[AdminService] trainers fetched:', data.length),
        error: (err) => console.error('[AdminService] trainers error:', err)
      })
    );
  }

  createTrainer(data: Omit<AdminTrainer, 'id'>): Observable<AdminTrainer> {
    const payload = {
      fullName: data.name,
      specialization: data.role,
      imageUrl: data.avatarUrl,
      rating: data.rating,
      experienceYears: 0,
      isActive: data.status === 'Active'
    };
    return this.http.post<ApiResponse<TrainerApiItem> | TrainerApiItem | null>(
      `${this.baseUrl}/trainers`,
      payload
    ).pipe(
      map(res => {
        const dto = AdminService.dtoOf(res, 'Failed to create trainer');
        if (!dto) throw new Error('Failed to create trainer');
        return this.mapTrainerFromApi(dto);
      })
    );
  }

  updateTrainer(id: number, data: Partial<AdminTrainer>): Observable<AdminTrainer> {
    const payload: any = {};
    if (data.name) payload.fullName = data.name;
    if (data.role) payload.specialization = data.role;
    if (data.avatarUrl) payload.imageUrl = data.avatarUrl;
    if (data.rating !== undefined) payload.rating = data.rating;
    if (data.status !== undefined) payload.isActive = data.status === 'Active';

    return this.http.put<ApiResponse<TrainerApiItem> | TrainerApiItem | null>(
      `${this.baseUrl}/trainers/${id}`,
      payload
    ).pipe(
      map(res => {
        const dto = AdminService.dtoOf(res, 'Failed to update trainer');
        // 204 No Content → echo back the merged data the caller already holds.
        return dto ? this.mapTrainerFromApi(dto) : ({ ...(data as AdminTrainer), id });
      })
    );
  }

  deleteTrainer(id: number): Observable<void> {
    return this.http.delete<ApiResponse<null> | null>(
      `${this.baseUrl}/trainers/${id}`
    ).pipe(
      map(res => AdminService.assertDeleteOk(res, 'Failed to delete trainer'))
    );
  }

  private mapTrainerFromApi(item: TrainerApiItem): AdminTrainer {
    return {
      id: item.id,
      name: item.fullName,
      role: item.specialization,
      avatarUrl: item.imageUrl,
      status: item.isActive ? 'Active' : 'Inactive',
      rating: item.rating,
      sessions: item.activeSessionsCount,
      email: '', // API doesn't provide email
      phone: ''  // API doesn't provide phone
    };
  }

  // ============================================================
  //  ACADEMIES — GET /api/admin/academies (read)
  //              POST/PUT/DELETE /api/academies/{id} (write)
  // ============================================================
  getAcademies(): Observable<AdminAcademy[]> {
    const params = new HttpParams().set('page', 1).set('pageSize', this.PAGE_SIZE);
    return this.http.get<ApiResponse<PaginatedApiResponse<AcademyApiItem>> | PaginatedApiResponse<AcademyApiItem>>(
      `${this.baseUrl}/academies`, { params }
    ).pipe(
      map(res => AdminService.itemsOf(res).map(item => this.mapAcademyFromApi(item))),
      tap({
        next: (data) => console.info('[AdminService] academies fetched:', data.length),
        error: (err) => console.error('[AdminService] academies error:', err)
      })
    );
  }

  createAcademy(data: Omit<AdminAcademy, 'id'>): Observable<AdminAcademy> {
    return this.http.post<ApiResponse<AcademyApiItem> | AcademyApiItem | null>(
      `${this.rootUrl}/academies`,
      this.toAcademyPayload(data)
    ).pipe(
      map(res => {
        const dto = AdminService.dtoOf(res, 'Failed to create academy');
        if (!dto) throw new Error('Failed to create academy');
        return this.mapAcademyFromApi(dto);
      })
    );
  }

  updateAcademy(id: number, data: Partial<AdminAcademy>): Observable<AdminAcademy> {
    // PUT may return the academy, a wrapped academy, or 204 No Content.
    return this.http.put<ApiResponse<AcademyApiItem> | AcademyApiItem | null>(
      `${this.rootUrl}/academies/${id}`,
      this.toAcademyPayload(data)
    ).pipe(
      map(res => {
        const dto = AdminService.dtoOf(res, 'Failed to update academy');
        return dto ? this.mapAcademyFromApi(dto) : ({ ...(data as AdminAcademy), id });
      })
    );
  }

  deleteAcademy(id: number): Observable<void> {
    return this.http.delete<ApiResponse<null> | null>(
      `${this.rootUrl}/academies/${id}`
    ).pipe(
      map(res => AdminService.assertDeleteOk(res, 'Failed to delete academy'))
    );
  }

  private mapAcademyFromApi(item: AcademyApiItem): AdminAcademy {
    const type = (['Academy', 'Court', 'Locker'].includes(item.type)
      ? item.type : 'Academy') as AdminAcademy['type'];
    return {
      id: item.id,
      name: item.name,
      sport: item.sportName || '',
      sportId: item.sportId,
      type,
      imageUrl: item.imageUrl,
      status: item.isActive ? 'Active' : 'Paused',
      trainersCount: item.trainersCount ?? 0,
      membersCount: 0,                         // not exposed by the API
      growth: Math.round(item.growthRate ?? 0),
      location: item.location || ''
    };
  }

  private toAcademyPayload(a: Partial<AdminAcademy>) {
    // `type` is a backend enum (Academy | Court | Locker) — NOT the sport name.
    // Sending the sport name here was rejected with "Academy.InvalidType".
    const type = (['Academy', 'Court', 'Locker'].includes(a.type ?? '')
      ? a.type : 'Academy');
    return {
      name: a.name ?? '',
      description: '',
      location: a.location ?? '',
      imageUrl: a.imageUrl ?? '',
      type,
      isFeatured: false,
      isNew: false,
      isActive: a.status ? a.status === 'Active' : true,
      displayOrder: 0,
      sportId: a.sportId ?? 0   // real sport id from the form (was hardcoded 0)
    };
  }

  // ============================================================
  //  LOOKUPS — sports & coaches (used to populate form dropdowns)
  // ============================================================
  getSports(): Observable<{ id: number; name: string }[]> {
    return this.http.get<{ id: number; name: string }[]>(`${this.rootUrl}/sports`).pipe(
      map(list => (list ?? []).map(s => ({ id: s.id, name: s.name })))
    );
  }

  getCoaches(): Observable<{ id: number; name: string; imageUrl: string | null }[]> {
    return this.http.get<Array<{ id: number; fullName: string; imageUrl: string | null }>>(
      `${this.rootUrl}/coaches`
    ).pipe(
      map(list => (list ?? []).map(c => ({ id: c.id, name: c.fullName, imageUrl: c.imageUrl ?? null })))
    );
  }

  // ============================================================
  //  CLASSES — create a session and assign a coach
  //  POST /api/sports/classes
  //  NOTE: the backend currently ignores academyId on create/update,
  //  so a new class is not linked to an academy (academyId stays null).
  //  We still send it so this works once the backend supports it.
  // ============================================================
  createClass(data: {
    title: string; description?: string; type: string; location: string;
    sportId: number; startTime: string; endTime: string;
    maxParticipants: number; price: number; coachId: number; academyId?: number | null;
  }): Observable<unknown> {
    return this.http.post(`${environment.apiBaseUrl}/api/sports/classes`, {
      title: data.title,
      description: data.description ?? '',
      type: data.type,
      location: data.location,
      sportId: data.sportId,
      startTime: data.startTime,
      endTime: data.endTime,
      maxParticipants: data.maxParticipants,
      price: data.price,
      coachId: data.coachId,
      academyId: data.academyId ?? null
    });
  }

  // ============================================================
  //  MEMBERS — GET /api/admin/members (read-only)
  // ============================================================
  getMembers(): Observable<AdminMember[]> {
    const params = new HttpParams().set('page', 1).set('pageSize', this.PAGE_SIZE);
    return this.http.get<ApiResponse<PaginatedApiResponse<MemberApiItem>> | PaginatedApiResponse<MemberApiItem>>(
      `${this.baseUrl}/members`, { params }
    ).pipe(
      map(res => AdminService.itemsOf(res).map(item => this.mapMemberFromApi(item))),
      tap({
        next: (data) => console.info('[AdminService] members fetched:', data.length),
        error: (err) => console.error('[AdminService] members error:', err)
      })
    );
  }

  private mapMemberFromApi(item: MemberApiItem): AdminMember {
    const status: AdminMember['status'] =
      item.status === 'Pending'   ? 'Pending'   :
      item.status === 'Suspended' ? 'Suspended' : 'Active';
    return {
      id: Number(item.id) || 0,     // API id is a GUID string; model expects number
      name: item.fullName,
      email: item.email,
      avatarUrl: item.profilePictureUrl,
      plan: 'Standard',             // not exposed by the API — sensible default
      status,
      joinedAt: item.joinedDate ? item.joinedDate.slice(0, 10) : '',
      lastActive: item.joinedDate ? this.timeAgo(item.joinedDate) : ''
    };
  }

  // ============================================================
  //  OFFERS — GET/POST /api/admin/offers, PUT/DELETE /api/admin/offers/{id}
  // ============================================================
  getOffers(): Observable<AdminOffer[]> {
    const params = new HttpParams().set('page', 1).set('pageSize', this.PAGE_SIZE);
    return this.http.get<ApiResponse<PaginatedApiResponse<OfferApiItem>> | PaginatedApiResponse<OfferApiItem>>(
      `${this.baseUrl}/offers`, { params }
    ).pipe(
      map(res => AdminService.itemsOf(res).map(item => this.mapOfferFromApi(item))),
      tap({
        next: (data) => console.info('[AdminService] offers fetched:', data.length),
        error: (err) => console.error('[AdminService] offers error:', err)
      })
    );
  }

  createOffer(data: Omit<AdminOffer, 'id'>): Observable<AdminOffer> {
    return this.http.post<ApiResponse<OfferApiItem> | OfferApiItem | null>(
      `${this.baseUrl}/offers`,
      this.toOfferPayload(data)
    ).pipe(
      map(res => {
        const dto = AdminService.dtoOf(res, 'Failed to create offer');
        if (!dto) throw new Error('Failed to create offer');
        return this.mapOfferFromApi(dto);
      })
    );
  }

  updateOffer(id: number, data: Partial<AdminOffer>): Observable<AdminOffer> {
    return this.http.put<ApiResponse<OfferApiItem> | OfferApiItem | null>(
      `${this.baseUrl}/offers/${id}`,
      this.toOfferPayload(data)
    ).pipe(
      map(res => {
        const dto = AdminService.dtoOf(res, 'Failed to update offer');
        return dto ? this.mapOfferFromApi(dto) : ({ ...(data as AdminOffer), id });
      })
    );
  }

  deleteOffer(id: number): Observable<void> {
    return this.http.delete<ApiResponse<null> | null>(
      `${this.baseUrl}/offers/${id}`
    ).pipe(
      map(res => AdminService.assertDeleteOk(res, 'Failed to delete offer'))
    );
  }

  private mapOfferFromApi(item: OfferApiItem): AdminOffer {
    const status: AdminOffer['status'] =
      item.status === 'Scheduled' ? 'Scheduled' :
      item.status === 'Expired'   ? 'Expired'   : 'Active';
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl,
      status,
      discount: this.parseDiscount(item.discountValue),
      startsAt: item.startDate ? item.startDate.slice(0, 10) : '',
      endsAt:   item.endDate   ? item.endDate.slice(0, 10)   : '',
      redemptions: item.usageCount ?? 0
    };
  }

  private toOfferPayload(o: Partial<AdminOffer>) {
    const payload: Record<string, unknown> = {
      title: o.title ?? '',
      description: o.description ?? '',
      discountValue: o.discount != null ? `${o.discount}%` : '',
      targetAudience: '',
      imageUrl: o.imageUrl ?? '',
      status: o.status ?? 'Active'
    };
    // Only send dates when present — the backend rejects empty-string dates (400),
    // and offers may legitimately be open-ended (no end date).
    if (o.startsAt) payload['startDate'] = new Date(o.startsAt).toISOString();
    if (o.endsAt)   payload['endDate']   = new Date(o.endsAt).toISOString();
    return payload;
  }

  /** API stores discount as a free string ("25%", "25", "$10"); pull the number out. */
  private parseDiscount(v: string): number {
    const n = parseFloat(String(v ?? '').replace(/[^0-9.]/g, ''));
    return isNaN(n) ? 0 : n;
  }
}
