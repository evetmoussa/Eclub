import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoachesService } from '../../core/services/coaches.service';
import { AdminService } from '../../core/services/admin/admin.service';
import { CoachApplication } from '../coach-apply/coach-apply.component';

const STORAGE_KEY = 'coach.applications';

type Tab = 'All' | 'Pending' | 'Approved' | 'Rejected';

@Component({
  selector: 'app-admin-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-requests.component.html',
  styleUrl: './admin-requests.component.scss'
})
export class AdminRequestsComponent implements OnInit {
  private coaches = inject(CoachesService);
  private admin = inject(AdminService);

  applications = signal<CoachApplication[]>([]);
  tab = signal<Tab>('Pending');
  query = signal('');
  busyIds = signal<Set<number>>(new Set());
  toast = signal('');

  readonly counts = computed(() => {
    const list = this.applications();
    return {
      all:      list.length,
      pending:  list.filter(a => a.status === 'Pending').length,
      approved: list.filter(a => a.status === 'Approved').length,
      rejected: list.filter(a => a.status === 'Rejected').length
    };
  });

  readonly filtered = computed<CoachApplication[]>(() => {
    const q = this.query().toLowerCase().trim();
    return this.applications()
      .filter(a => this.tab() === 'All' || a.status === this.tab())
      .filter(a =>
        q === '' ||
        a.fullName.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.specialization.toLowerCase().includes(q)
      );
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list: CoachApplication[] = raw ? JSON.parse(raw) : [];
      if (!list.length) {
        const seed: CoachApplication[] = [
          { id: 1, fullName: 'Ahmed Hassan', email: 'ahmed.h@gmail.com', phoneNumber: '01001112233', specialization: 'Boxing',     experienceYears: 6, bio: 'Former national boxing champion. 6 years coaching youth.', submittedAt: new Date(Date.now() - 86400000).toISOString(),  status: 'Pending'  },
          { id: 2, fullName: 'Mariam Tarek', email: 'mariam.t@yahoo.com',phoneNumber: '01122334455', specialization: 'Pilates',    experienceYears: 4, bio: 'Certified Pilates instructor specializing in rehabilitation.',    submittedAt: new Date(Date.now() - 3600000 ).toISOString(),  status: 'Pending'  },
          { id: 3, fullName: 'Hossam Saber', email: 'hossam.s@gmail.com',phoneNumber: '01211223344', specialization: 'Basketball', experienceYears: 9, bio: 'Played college ball; great with teens.',                          submittedAt: new Date(Date.now() - 604800000).toISOString(), status: 'Approved' }
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
        this.applications.set(seed);
      } else {
        this.applications.set(list);
      }
    } catch {
      this.applications.set([]);
    }
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.applications()));
  }

  approve(app: CoachApplication): void {
    const busy = new Set(this.busyIds());
    busy.add(app.id);
    this.busyIds.set(busy);

    this.coaches.create({
      fullName:        app.fullName,
      specialization:  app.specialization,
      experienceYears: app.experienceYears,
      bio:             app.bio,
      email:           app.email,
      phoneNumber:     app.phoneNumber,
      imageUrl:        app.imageUrl ?? null
    }).subscribe({
      next: () => this.finalize(app, 'Approved', 'Coach created and notified.'),
      error: () => {
        this.admin.createTrainer({
          name: app.fullName, role: app.specialization, rating: 0, sessions: 0,
          email: app.email, phone: app.phoneNumber, status: 'Active',
          avatarUrl: app.imageUrl || `https://i.pravatar.cc/200?u=${app.email}`
        }).subscribe(() => this.finalize(app, 'Approved', 'Approved (mock - API unavailable).'));
      }
    });
  }

  reject(app: CoachApplication): void {
    if (!confirm(`Reject ${app.fullName}'s application?`)) return;
    this.finalize(app, 'Rejected', 'Application rejected.');
  }

  private finalize(app: CoachApplication, status: 'Approved' | 'Rejected', msg: string): void {
    this.applications.update(list =>
      list.map(a => a.id === app.id ? { ...a, status } : a)
    );
    this.persist();
    const busy = new Set(this.busyIds());
    busy.delete(app.id);
    this.busyIds.set(busy);
    this.toast.set(msg);
    setTimeout(() => this.toast.set(''), 3500);
  }

  isBusy(id: number): boolean { return this.busyIds().has(id); }

  initialsFor(a: CoachApplication): string {
    return a.fullName
      .split(/\s+/)
      .slice(0, 2)
      .map(s => s.charAt(0).toUpperCase())
      .join('') || 'C';
  }

  clearRejected(): void {
    if (!confirm('Remove all rejected applications from the inbox?')) return;
    this.applications.update(list => list.filter(a => a.status !== 'Rejected'));
    this.persist();
  }
}
