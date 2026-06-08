// AdminService — calls real API endpoints with proper HTTP communication.
// Handles API response wrapper (isSuccess, error, value) and maps to local models.

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
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

interface PaginatedApiResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/admin`;


  // ---------- DASHBOARD (mocked for now) ----------
  getKpis(): Observable<KpiCard[]> {
    return new Observable(observer => {
      observer.next([
        { key: 'members',  label: 'TOTAL MEMBERS',    value: '12,482', delta: 12, icon: 'group',           tone: 'green'  },
        { key: 'trainers', label: 'TOTAL TRAINERS',   value: '842',    delta: 4,  icon: 'sports',          tone: 'blue'   },
        { key: 'academies',label: 'ACADEMIES',        value: '156',    delta: 0,  icon: 'school',          tone: 'violet' },
        { key: 'requests', label: 'PENDING REQUESTS', value: '42',     delta: 28, icon: 'pending_actions', tone: 'amber'  },
        { key: 'offers',   label: 'ACTIVE OFFERS',    value: '24',     delta: 8,  icon: 'local_offer',     tone: 'rose'   }
      ]);
      observer.complete();
    });
  }

  getManagementTiles(): Observable<ManagementTile[]> {
    return new Observable(observer => {
      observer.next([
        { key: 'trainers',  title: 'Trainers',  subtitle: 'Manage coaching staff',     icon: 'sports',      count: 842,    trend: 4,  route: '/admin/trainers'  },
        { key: 'academies', title: 'Academies', subtitle: 'Sports programs & venues',  icon: 'school',      count: 156,    trend: 2,  route: '/admin/academies' },
        { key: 'members',   title: 'Members',   subtitle: 'Active subscribers',        icon: 'group',       count: 12482,  trend: 12, route: '/admin/members'   },
        { key: 'offers',    title: 'Offers',    subtitle: 'Promotions & discounts',    icon: 'local_offer', count: 24,     trend: 8,  route: '/admin/offers'    }
      ]);
      observer.complete();
    });
  }

  getActivities(): Observable<ActivityItem[]> {
    return new Observable(observer => {
      observer.next([
        { id: 1, type: 'member',  title: 'New member joined',  description: 'Sarah Williams subscribed to Premium plan',  timeAgo: '5 min ago',  icon: 'person_add',      tone: 'green'  },
        { id: 2, type: 'trainer', title: 'Trainer approved',   description: 'Coach Marco approved for Football Academy',  timeAgo: '32 min ago', icon: 'verified_user',   tone: 'blue'   },
        { id: 3, type: 'academy', title: 'Academy activated',  description: 'Tennis Pro Academy went live',               timeAgo: '1 h ago',    icon: 'school',          tone: 'violet' },
        { id: 4, type: 'request', title: 'Pending request',    description: '12 new membership requests need review',     timeAgo: '2 h ago',    icon: 'pending_actions', tone: 'amber'  },
        { id: 5, type: 'offer',   title: 'Offer published',    description: 'Summer Camp 2026 — 25% off launched',        timeAgo: '4 h ago',    icon: 'local_offer',     tone: 'rose'   },
        { id: 6, type: 'member',  title: 'Renewal completed',  description: 'Khaled M. renewed annual plan',              timeAgo: '6 h ago',    icon: 'autorenew',       tone: 'green'  }
      ]);
      observer.complete();
    });
  }

  getRequestsSummary(): Observable<RequestsSummary> {
    return new Observable(observer => {
      observer.next({
        successRate: 84, total: 312, approved: 262, pending: 32, rejected: 18
      });
      observer.complete();
    });
  }

  // ---------- TRAINERS (HTTP) ----------
  getTrainers(): Observable<AdminTrainer[]> {
    return this.http.get<ApiResponse<PaginatedApiResponse<TrainerApiItem>>>(
      `${this.baseUrl}/trainers`
    ).pipe(
      map(res => {
        if (!res.isSuccess || !res.value?.items) return [];
        return res.value.items.map(item => this.mapTrainerFromApi(item));
      }),
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
    return this.http.post<ApiResponse<TrainerApiItem>>(
      `${this.baseUrl}/trainers`,
      payload
    ).pipe(
      map(res => {
        if (!res.isSuccess || !res.value) throw new Error(res.error?.description || 'Failed to create trainer');
        return this.mapTrainerFromApi(res.value);
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

    return this.http.put<ApiResponse<TrainerApiItem>>(
      `${this.baseUrl}/trainers/${id}`,
      payload
    ).pipe(
      map(res => {
        if (!res.isSuccess || !res.value) throw new Error(res.error?.description || 'Failed to update trainer');
        return this.mapTrainerFromApi(res.value);
      })
    );
  }

  deleteTrainer(id: number): Observable<void> {
    return this.http.delete<ApiResponse<null>>(
      `${this.baseUrl}/trainers/${id}`
    ).pipe(
      map(res => {
        if (!res.isSuccess) throw new Error(res.error?.description || 'Failed to delete trainer');
      })
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

  // ---------- ACADEMIES (HTTP - for now using mock) ----------
  getAcademies(): Observable<AdminAcademy[]> {
    return new Observable(observer => {
      observer.next([
        { id: 1, name: 'Elite Football Academy', sport: 'Football',   imageUrl: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600',   status: 'Active',   trainersCount: 18, membersCount: 320, growth: 12, location: 'Cairo, EG' },
        { id: 2, name: 'Pro Tennis Center',      sport: 'Tennis',     imageUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600', status: 'Active',   trainersCount: 9,  membersCount: 142, growth: 8,  location: 'Alexandria, EG' }
      ]);
      observer.complete();
    });
  }

  createAcademy(data: Omit<AdminAcademy, 'id'>): Observable<AdminAcademy> {
    return new Observable(observer => {
      observer.next({ ...data, id: Math.floor(Math.random() * 10000) });
      observer.complete();
    });
  }

  updateAcademy(id: number, data: Partial<AdminAcademy>): Observable<AdminAcademy> {
    return new Observable(observer => {
      observer.next({ ...data, id } as AdminAcademy);
      observer.complete();
    });
  }

  deleteAcademy(id: number): Observable<void> {
    return new Observable(observer => {
      observer.next();
      observer.complete();
    });
  }

  // ---------- MEMBERS (HTTP - for now using mock) ----------
  getMembers(): Observable<AdminMember[]> {
    return new Observable(observer => {
      observer.next([
        { id: 1, name: 'Sarah Williams', email: 'sarah.w@gmail.com',    avatarUrl: 'https://i.pravatar.cc/200?img=20', plan: 'Premium',  status: 'Active',   joinedAt: '2025-11-12', lastActive: '5 min ago' }
      ]);
      observer.complete();
    });
  }

  updateMember(id: number, data: Partial<AdminMember>): Observable<AdminMember> {
    return new Observable(observer => {
      observer.next({ ...data, id } as AdminMember);
      observer.complete();
    });
  }

  deleteMember(id: number): Observable<void> {
    return new Observable(observer => {
      observer.next();
      observer.complete();
    });
  }

  // ---------- OFFERS (HTTP - for now using mock) ----------
  getOffers(): Observable<AdminOffer[]> {
    return new Observable(observer => {
      observer.next([
        { id: 1, title: 'Summer Camp 2026',    description: 'All-access pass for kids 8-14',         imageUrl: 'https://images.unsplash.com/photo-1551739440-5dd934d3a94a?w=600', status: 'Active',    discount: 25,  startsAt: '2026-05-01', endsAt: '2026-08-31', redemptions: 412 }
      ]);
      observer.complete();
    });
  }

  createOffer(data: Omit<AdminOffer, 'id'>): Observable<AdminOffer> {
    return new Observable(observer => {
      observer.next({ ...data, id: Math.floor(Math.random() * 10000) });
      observer.complete();
    });
  }

  updateOffer(id: number, data: Partial<AdminOffer>): Observable<AdminOffer> {
    return new Observable(observer => {
      observer.next({ ...data, id } as AdminOffer);
      observer.complete();
    });
  }

  deleteOffer(id: number): Observable<void> {
    return new Observable(observer => {
      observer.next();
      observer.complete();
    });
  }

}
