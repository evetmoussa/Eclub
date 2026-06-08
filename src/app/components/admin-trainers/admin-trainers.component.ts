import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin/admin.service';
import { AdminTrainer } from '../../core/models/admin/admin.models';
import {
  EntityFormModalComponent, FieldDef
} from '../admin-shared/entity-form-modal/entity-form-modal.component';

@Component({
  selector: 'app-admin-trainers',
  standalone: true,
  imports: [CommonModule, FormsModule, EntityFormModalComponent],
  templateUrl: './admin-trainers.component.html',
  styleUrl: './admin-trainers.component.scss'
})
export class AdminTrainersComponent implements OnInit {
  private admin = inject(AdminService);

  all = signal<AdminTrainer[]>([]);
  query = signal('');
  filterRole = signal<string>('All');

  modalOpen = signal(false);
  editing = signal<AdminTrainer | null>(null);
  isSubmitting = signal(false);

  readonly fields: FieldDef[] = [
    { key: 'name',  label: 'Full name', type: 'text',  required: true, width: 'full', placeholder: 'e.g. Marco Silva' },
    { key: 'role',  label: 'Specialty', type: 'text',  required: true, placeholder: 'Football, Tennis…' },
    { key: 'email', label: 'Email',     type: 'email', required: true, placeholder: 'name@eclub.com' },
    { key: 'phone', label: 'Phone',     type: 'tel',   placeholder: '+20 100 …' },
    { key: 'avatarUrl', label: 'Avatar URL', type: 'url', width: 'full', placeholder: 'https://…' },
    { key: 'status', label: 'Status', type: 'select', required: true, options: [
        { value: 'Active', label: 'Active' },
        { value: 'On leave', label: 'On leave' },
        { value: 'Inactive', label: 'Inactive' }
      ] },
    { key: 'rating',   label: 'Rating',   type: 'number', min: 0, max: 5, hint: '0-5 stars' },
    { key: 'sessions', label: 'Sessions', type: 'number', min: 0 }
  ];

  stats = computed(() => {
    const list = this.all();
    const total = list.length;
    const sessions = list.reduce((s, t) => s + t.sessions, 0);
    const avgRating = total
      ? +(list.reduce((s, t) => s + t.rating, 0) / total).toFixed(1)
      : 0;
    return { total, sessions, avgRating, growth: 12 };
  });

  roles = computed<string[]>(() => {
    const set = new Set(this.all().map(t => t.role));
    return ['All', ...Array.from(set)];
  });

  filtered = computed<AdminTrainer[]>(() => {
    const q = this.query().toLowerCase().trim();
    const r = this.filterRole();
    return this.all().filter(t =>
      (r === 'All' || t.role === r) &&
      (q === '' || t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q))
    );
  });

  ngOnInit(): void { this.refresh(); }
  refresh(): void { this.admin.getTrainers().subscribe(v => this.all.set(v)); }

  openAdd():  void { this.editing.set(null); this.modalOpen.set(true); }
  openEdit(t: AdminTrainer): void { this.editing.set(t); this.modalOpen.set(true); }
  closeModal(): void { this.modalOpen.set(false); this.editing.set(null); }

  onSubmit(value: Record<string, unknown>): void {
    this.isSubmitting.set(true);
    const payload = this.normalize(value);
    const cur = this.editing();
    const op$ = cur
      ? this.admin.updateTrainer(cur.id, payload)
      : this.admin.createTrainer({
          ...payload,
          avatarUrl: (payload.avatarUrl as string) ||
            `https://i.pravatar.cc/200?img=${Math.floor(Math.random() * 70)}`
        } as Omit<AdminTrainer, 'id'>);
    op$.subscribe({
      next: () => { this.isSubmitting.set(false); this.closeModal(); this.refresh(); },
      error: () => { this.isSubmitting.set(false); }
    });
  }

  remove(t: AdminTrainer): void {
    if (!confirm(`Remove trainer "${t.name}"?`)) return;
    this.admin.deleteTrainer(t.id).subscribe(() => this.refresh());
  }

  private normalize(v: Record<string, unknown>): Partial<AdminTrainer> {
    return {
      ...v,
      rating:   Number(v['rating']   ?? 0),
      sessions: Number(v['sessions'] ?? 0)
    } as Partial<AdminTrainer>;
  }
}
