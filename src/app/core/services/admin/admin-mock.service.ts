// admin-mock.service.ts — Mock-data layer for admin dashboard pages.
// Now supports full CRUD (create / update / delete) with localStorage
// persistence, so changes survive page reloads.
// Once the real API ships, swap the bodies for HttpClient calls — consumers
// already use Observables so the swap is transparent.

import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  KpiCard, ManagementTile, ActivityItem, RequestsSummary,
  AdminAcademy, AdminTrainer, AdminMember, AdminOffer
} from '../../models/admin/admin.models';

type Entity = AdminAcademy | AdminTrainer | AdminMember | AdminOffer;

@Injectable({ providedIn: 'root' })
export class AdminMockService {
  private readonly LATENCY = 200;

  // ---------- LocalStorage helpers ----------
  private read<T>(key: string, fallback: T[]): T[] {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length ? parsed : fallback;
    } catch { return fallback; }
  }
  private write<T>(key: string, value: T[]): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
  private nextId(list: { id: number }[]): number {
    return list.length ? Math.max(...list.map(x => x.id)) + 1 : 1;
  }

  // ---------- DASHBOARD ----------
  getKpis(): Observable<KpiCard[]> {
    return of<KpiCard[]>([
      { key: 'members',  label: 'TOTAL MEMBERS',    value: '12,482', delta: 12, icon: 'group',           tone: 'green'  },
      { key: 'trainers', label: 'TOTAL TRAINERS',   value: '842',    delta: 4,  icon: 'sports',          tone: 'blue'   },
      { key: 'academies',label: 'ACADEMIES',        value: '156',    delta: 0,  icon: 'school',          tone: 'violet' },
      { key: 'requests', label: 'PENDING REQUESTS', value: '42',     delta: 28, icon: 'pending_actions', tone: 'amber'  },
      { key: 'offers',   label: 'ACTIVE OFFERS',    value: '24',     delta: 8,  icon: 'local_offer',     tone: 'rose'   }
    ]).pipe(delay(this.LATENCY));
  }

  getManagementTiles(): Observable<ManagementTile[]> {
    return of<ManagementTile[]>([
      { key: 'trainers',  title: 'Trainers',  subtitle: 'Manage coaching staff',     icon: 'sports',      count: 842,    trend: 4,  route: '/admin/trainers'  },
      { key: 'academies', title: 'Academies', subtitle: 'Sports programs & venues',  icon: 'school',      count: 156,    trend: 2,  route: '/admin/academies' },
      { key: 'members',   title: 'Members',   subtitle: 'Active subscribers',        icon: 'group',       count: 12482,  trend: 12, route: '/admin/members'   },
      { key: 'offers',    title: 'Offers',    subtitle: 'Promotions & discounts',    icon: 'local_offer', count: 24,     trend: 8,  route: '/admin/offers'    }
    ]).pipe(delay(this.LATENCY));
  }

  getActivities(): Observable<ActivityItem[]> {
    return of<ActivityItem[]>([
      { id: 1, type: 'member',  title: 'New member joined',  description: 'Sarah Williams subscribed to Premium plan',  timeAgo: '5 min ago',  icon: 'person_add',      tone: 'green'  },
      { id: 2, type: 'trainer', title: 'Trainer approved',   description: 'Coach Marco approved for Football Academy',  timeAgo: '32 min ago', icon: 'verified_user',   tone: 'blue'   },
      { id: 3, type: 'academy', title: 'Academy activated',  description: 'Tennis Pro Academy went live',               timeAgo: '1 h ago',    icon: 'school',          tone: 'violet' },
      { id: 4, type: 'request', title: 'Pending request',    description: '12 new membership requests need review',     timeAgo: '2 h ago',    icon: 'pending_actions', tone: 'amber'  },
      { id: 5, type: 'offer',   title: 'Offer published',    description: 'Summer Camp 2026 — 25% off launched',        timeAgo: '4 h ago',    icon: 'local_offer',     tone: 'rose'   },
      { id: 6, type: 'member',  title: 'Renewal completed',  description: 'Khaled M. renewed annual plan',              timeAgo: '6 h ago',    icon: 'autorenew',       tone: 'green'  }
    ]).pipe(delay(this.LATENCY));
  }

  getRequestsSummary(): Observable<RequestsSummary> {
    return of<RequestsSummary>({
      successRate: 84, total: 312, approved: 262, pending: 32, rejected: 18
    }).pipe(delay(this.LATENCY));
  }

  // ---------- ACADEMIES (CRUD) ----------
  private readonly K_ACADEMY = 'admin.academies';
  private seedAcademies: AdminAcademy[] = [
    { id: 1, name: 'Elite Football Academy', sport: 'Football',   imageUrl: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600',   status: 'Active',   trainersCount: 18, membersCount: 320, growth: 12, location: 'Cairo, EG' },
    { id: 2, name: 'Pro Tennis Center',      sport: 'Tennis',     imageUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600', status: 'Active',   trainersCount: 9,  membersCount: 142, growth: 8,  location: 'Alexandria, EG' },
    { id: 3, name: 'Champions Basketball',   sport: 'Basketball', imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600',   status: 'Active',   trainersCount: 7,  membersCount: 96,  growth: 4,  location: 'Giza, EG' },
    { id: 4, name: 'Aquatic Training Hub',   sport: 'Swimming',   imageUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600', status: 'Paused',   trainersCount: 6,  membersCount: 58,  growth: -2, location: 'New Cairo, EG' },
    { id: 5, name: 'Smart Karate Dojo',      sport: 'Karate',     imageUrl: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=600',   status: 'Active',   trainersCount: 5,  membersCount: 74,  growth: 6,  location: 'Maadi, EG' },
    { id: 6, name: 'Velocity Cycling Club',  sport: 'Cycling',    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600', status: 'Archived', trainersCount: 3,  membersCount: 21,  growth: -8, location: 'Sheikh Zayed, EG' }
  ];
  getAcademies(): Observable<AdminAcademy[]> {
    return of(this.read(this.K_ACADEMY, this.seedAcademies)).pipe(delay(this.LATENCY));
  }
  createAcademy(data: Omit<AdminAcademy, 'id'>): Observable<AdminAcademy> {
    const list = this.read(this.K_ACADEMY, this.seedAcademies);
    const created: AdminAcademy = { ...data, id: this.nextId(list) };
    this.write(this.K_ACADEMY, [created, ...list]);
    return of(created).pipe(delay(this.LATENCY));
  }
  updateAcademy(id: number, data: Partial<AdminAcademy>): Observable<AdminAcademy> {
    const list = this.read(this.K_ACADEMY, this.seedAcademies).map(a => a.id === id ? { ...a, ...data, id } : a);
    this.write(this.K_ACADEMY, list);
    return of(list.find(a => a.id === id)!).pipe(delay(this.LATENCY));
  }
  deleteAcademy(id: number): Observable<void> {
    this.write(this.K_ACADEMY, this.read(this.K_ACADEMY, this.seedAcademies).filter(a => a.id !== id));
    return of(void 0).pipe(delay(this.LATENCY));
  }

  // ---------- TRAINERS (CRUD) ----------
  private readonly K_TRAINER = 'admin.trainers';
  private seedTrainers: AdminTrainer[] = [
    { id: 1, name: 'Marco Silva',   role: 'Football',   avatarUrl: 'https://i.pravatar.cc/200?img=12', status: 'Active',   rating: 4.9, sessions: 248, email: 'marco@eclub.com',  phone: '+20 100 111 2233' },
    { id: 2, name: 'Layla Hassan',  role: 'Tennis',     avatarUrl: 'https://i.pravatar.cc/200?img=47', status: 'Active',   rating: 4.8, sessions: 192, email: 'layla@eclub.com',  phone: '+20 100 222 3344' },
    { id: 3, name: 'Omar Khaled',   role: 'Basketball', avatarUrl: 'https://i.pravatar.cc/200?img=33', status: 'Active',   rating: 4.7, sessions: 168, email: 'omar@eclub.com',   phone: '+20 100 333 4455' },
    { id: 4, name: 'Nadia Farouk',  role: 'Swimming',   avatarUrl: 'https://i.pravatar.cc/200?img=49', status: 'On leave', rating: 4.9, sessions: 211, email: 'nadia@eclub.com',  phone: '+20 100 444 5566' },
    { id: 5, name: 'Hassan Ali',    role: 'Karate',     avatarUrl: 'https://i.pravatar.cc/200?img=14', status: 'Active',   rating: 4.6, sessions: 142, email: 'hassan@eclub.com', phone: '+20 100 555 6677' },
    { id: 6, name: 'Sara Ibrahim',  role: 'Yoga',       avatarUrl: 'https://i.pravatar.cc/200?img=45', status: 'Active',   rating: 5.0, sessions: 287, email: 'sara@eclub.com',   phone: '+20 100 666 7788' },
    { id: 7, name: 'Tarek Mansour', role: 'Boxing',     avatarUrl: 'https://i.pravatar.cc/200?img=15', status: 'Inactive', rating: 4.4, sessions: 89,  email: 'tarek@eclub.com',  phone: '+20 100 777 8899' },
    { id: 8, name: 'Maya Saleh',    role: 'Pilates',    avatarUrl: 'https://i.pravatar.cc/200?img=44', status: 'Active',   rating: 4.8, sessions: 174, email: 'maya@eclub.com',   phone: '+20 100 888 9900' }
  ];
  getTrainers(): Observable<AdminTrainer[]> {
    return of(this.read(this.K_TRAINER, this.seedTrainers)).pipe(delay(this.LATENCY));
  }
  createTrainer(data: Omit<AdminTrainer, 'id'>): Observable<AdminTrainer> {
    const list = this.read(this.K_TRAINER, this.seedTrainers);
    const created: AdminTrainer = { ...data, id: this.nextId(list) };
    this.write(this.K_TRAINER, [created, ...list]);
    return of(created).pipe(delay(this.LATENCY));
  }
  updateTrainer(id: number, data: Partial<AdminTrainer>): Observable<AdminTrainer> {
    const list = this.read(this.K_TRAINER, this.seedTrainers).map(t => t.id === id ? { ...t, ...data, id } : t);
    this.write(this.K_TRAINER, list);
    return of(list.find(t => t.id === id)!).pipe(delay(this.LATENCY));
  }
  deleteTrainer(id: number): Observable<void> {
    this.write(this.K_TRAINER, this.read(this.K_TRAINER, this.seedTrainers).filter(t => t.id !== id));
    return of(void 0).pipe(delay(this.LATENCY));
  }

  // ---------- MEMBERS ----------
  private readonly K_MEMBER = 'admin.members';
  private seedMembers: AdminMember[] = [
    { id: 1, name: 'Sarah Williams', email: 'sarah.w@gmail.com',    avatarUrl: 'https://i.pravatar.cc/200?img=20', plan: 'Premium',  status: 'Active',   joinedAt: '2025-11-12', lastActive: '5 min ago' },
    { id: 2, name: 'Omar Selim',     email: 'omar.s@outlook.com',   avatarUrl: 'https://i.pravatar.cc/200?img=22', plan: 'Standard', status: 'Active',   joinedAt: '2025-09-04', lastActive: '1 h ago'  },
    { id: 3, name: 'Mariam Adel',    email: 'mariam@yahoo.com',     avatarUrl: 'https://i.pravatar.cc/200?img=23', plan: 'Premium',  status: 'Active',   joinedAt: '2024-06-18', lastActive: '2 h ago'  },
    { id: 4, name: 'Coach Dina',     email: 'dina.coach@eclub.com', avatarUrl: 'https://i.pravatar.cc/200?img=24', plan: 'Coach',    status: 'Active',   joinedAt: '2023-03-01', lastActive: 'Just now' },
    { id: 5, name: 'Khaled Mostafa', email: 'khaled@gmail.com',     avatarUrl: 'https://i.pravatar.cc/200?img=25', plan: 'Standard', status: 'Pending',  joinedAt: '2026-04-29', lastActive: 'Yesterday' },
    { id: 6, name: 'Yara Nour',      email: 'yara.n@gmail.com',     avatarUrl: 'https://i.pravatar.cc/200?img=26', plan: 'Premium',  status: 'Active',   joinedAt: '2025-01-22', lastActive: '3 h ago'  },
    { id: 7, name: 'Aly Tharwat',    email: 'aly.t@gmail.com',      avatarUrl: 'https://i.pravatar.cc/200?img=27', plan: 'Standard', status: 'Suspended',joinedAt: '2024-12-10', lastActive: '2 weeks ago' },
    { id: 8, name: 'Hana Magdy',     email: 'hana.m@gmail.com',     avatarUrl: 'https://i.pravatar.cc/200?img=28', plan: 'Premium',  status: 'Active',   joinedAt: '2025-07-30', lastActive: '20 min ago' }
  ];
  getMembers(): Observable<AdminMember[]> {
    return of(this.read(this.K_MEMBER, this.seedMembers)).pipe(delay(this.LATENCY));
  }
  updateMember(id: number, data: Partial<AdminMember>): Observable<AdminMember> {
    const list = this.read(this.K_MEMBER, this.seedMembers).map(m => m.id === id ? { ...m, ...data, id } : m);
    this.write(this.K_MEMBER, list);
    return of(list.find(m => m.id === id)!).pipe(delay(this.LATENCY));
  }
  deleteMember(id: number): Observable<void> {
    this.write(this.K_MEMBER, this.read(this.K_MEMBER, this.seedMembers).filter(m => m.id !== id));
    return of(void 0).pipe(delay(this.LATENCY));
  }

  // ---------- OFFERS (CRUD) ----------
  private readonly K_OFFER = 'admin.offers';
  private seedOffers: AdminOffer[] = [
    { id: 1, title: 'Summer Camp 2026',    description: 'All-access pass for kids 8-14',         imageUrl: 'https://images.unsplash.com/photo-1551739440-5dd934d3a94a?w=600', status: 'Active',    discount: 25,  startsAt: '2026-05-01', endsAt: '2026-08-31', redemptions: 412 },
    { id: 2, title: 'Annual Renewal',      description: '2 months free on yearly plans',         imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600', status: 'Active',    discount: 16,  startsAt: '2026-04-01', endsAt: '2026-06-30', redemptions: 187 },
    { id: 3, title: 'New Member Welcome',  description: 'First month free for new members',      imageUrl: 'https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?w=600', status: 'Active',    discount: 100, startsAt: '2026-01-01', endsAt: '2026-12-31', redemptions: 921 },
    { id: 4, title: 'Tennis Pro Bundle',   description: 'Tennis lessons + gear discount',        imageUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600', status: 'Scheduled', discount: 30,  startsAt: '2026-06-01', endsAt: '2026-09-30', redemptions: 0   },
    { id: 5, title: 'Ramadan Family Plan', description: 'Family discount during Ramadan',        imageUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600', status: 'Expired',   discount: 35,  startsAt: '2026-02-15', endsAt: '2026-03-30', redemptions: 256 },
    { id: 6, title: 'Coaches Special',     description: 'Premium coaching tools at half price',  imageUrl: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600',  status: 'Active',    discount: 50,  startsAt: '2026-04-15', endsAt: '2026-07-15', redemptions: 64  }
  ];
  getOffers(): Observable<AdminOffer[]> {
    return of(this.read(this.K_OFFER, this.seedOffers)).pipe(delay(this.LATENCY));
  }
  createOffer(data: Omit<AdminOffer, 'id'>): Observable<AdminOffer> {
    const list = this.read(this.K_OFFER, this.seedOffers);
    const created: AdminOffer = { ...data, id: this.nextId(list) };
    this.write(this.K_OFFER, [created, ...list]);
    return of(created).pipe(delay(this.LATENCY));
  }
  updateOffer(id: number, data: Partial<AdminOffer>): Observable<AdminOffer> {
    const list = this.read(this.K_OFFER, this.seedOffers).map(o => o.id === id ? { ...o, ...data, id } : o);
    this.write(this.K_OFFER, list);
    return of(list.find(o => o.id === id)!).pipe(delay(this.LATENCY));
  }
  deleteOffer(id: number): Observable<void> {
    this.write(this.K_OFFER, this.read(this.K_OFFER, this.seedOffers).filter(o => o.id !== id));
    return of(void 0).pipe(delay(this.LATENCY));
  }
}
