import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin/admin.service';
import { AdminAcademy } from '../../core/models/admin/admin.models';
import {
  EntityFormModalComponent, FieldDef
} from '../admin-shared/entity-form-modal/entity-form-modal.component';
import { PagerComponent } from '../admin-shared/pager/pager.component';
import { coverBackground } from '../../core/utils/image-fallback';

type SortBy = 'name' | 'members' | 'growth';

@Component({
  selector: 'app-admin-academies',
  standalone: true,
  imports: [CommonModule, FormsModule, EntityFormModalComponent, PagerComponent],
  templateUrl: './admin-academies.component.html',
  styleUrl: './admin-academies.component.scss'
})
export class AdminAcademiesComponent implements OnInit {
  private admin = inject(AdminService);

  all = signal<AdminAcademy[]>([]);
  query = signal('');
  sport = signal<string>('All');
  status = signal<string>('All');
  sortBy = signal<SortBy>('name');

  // Modal state
  modalOpen = signal(false);
  editing = signal<AdminAcademy | null>(null);
  isSubmitting = signal(false);

  /** Form schema for the modal — declarative, matches AdminAcademy. */
  readonly fields: FieldDef[] = [
    { key: 'name',     label: 'Academy name', type: 'text',  required: true, width: 'full', placeholder: 'e.g. Elite Football Academy' },
    { key: 'sport',    label: 'Sport',        type: 'text',  required: true, placeholder: 'Football, Tennis…' },
    { key: 'location', label: 'Location',     type: 'text',  required: true, placeholder: 'Cairo, EG' },
    { key: 'imageUrl', label: 'Cover image URL', type: 'url', required: false, width: 'full', placeholder: 'https://…' },
    { key: 'status',   label: 'Status',       type: 'select', required: true, options: [
        { value: 'Active', label: 'Active' },
        { value: 'Paused', label: 'Paused' },
        { value: 'Archived', label: 'Archived' }
      ] },
    { key: 'trainersCount', label: 'Trainers',  type: 'number', min: 0 },
    { key: 'membersCount',  label: 'Members',   type: 'number', min: 0 },
    { key: 'growth',        label: 'Growth %',  type: 'number', hint: 'Can be negative' }
  ];

  sports = computed<string[]>(() => {
    const set = new Set(this.all().map(a => a.sport));
    return ['All', ...Array.from(set)];
  });

  filtered = computed<AdminAcademy[]>(() => {
    const q = this.query().toLowerCase().trim();
    const sp = this.sport();
    const st = this.status();
    const sb = this.sortBy();

    let arr = this.all().filter(a =>
      (sp === 'All' || a.sport === sp) &&
      (st === 'All' || a.status === st) &&
      (q === '' || a.name.toLowerCase().includes(q) || a.location.toLowerCase().includes(q))
    );

    arr = [...arr].sort((a, b) => {
      if (sb === 'members') return b.membersCount - a.membersCount;
      if (sb === 'growth')  return b.growth - a.growth;
      return a.name.localeCompare(b.name);
    });
    return arr;
  });

  // ===== Pagination (client-side over the filtered list) =====
  readonly pageSize = 9;
  page = signal(1);

  totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize)));

  /** Academies visible on the current page (page clamped to valid range). */
  paged = computed<AdminAcademy[]>(() => {
    const current = Math.min(this.page(), this.totalPages());
    const start = (current - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  // Filter setters that also reset to the first page, so you never land on an
  // empty page after narrowing the results.
  setQuery(v: string):  void { this.query.set(v);  this.page.set(1); }
  setSport(v: string):  void { this.sport.set(v);  this.page.set(1); }
  setStatus(v: string): void { this.status.set(v); this.page.set(1); }
  setSortBy(v: SortBy): void { this.sortBy.set(v); this.page.set(1); }

  /** Card cover with graceful fallback (full URL, local path, or default). */
  coverUrl(raw: string | null | undefined): string { return coverBackground(raw); }

  ngOnInit(): void { this.refresh(); }

  refresh(): void {
    this.admin.getAcademies().subscribe(v => { this.all.set(v); this.page.set(1); });
  }

  openAdd(): void {
    this.editing.set(null);
    this.modalOpen.set(true);
  }
  openEdit(item: AdminAcademy): void {
    this.editing.set(item);
    this.modalOpen.set(true);
  }
  closeModal(): void {
    this.modalOpen.set(false);
    this.editing.set(null);
  }

  onSubmit(value: Record<string, unknown>): void {
    this.isSubmitting.set(true);
    const payload = this.normalize(value);
    const cur = this.editing();
    const op$ = cur
      ? this.admin.updateAcademy(cur.id, payload)
      : this.admin.createAcademy({
          ...payload,
          imageUrl: (payload.imageUrl as string) ||
            'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600'
        } as Omit<AdminAcademy, 'id'>);
    op$.subscribe({
      next: () => { this.isSubmitting.set(false); this.closeModal(); this.refresh(); },
      error: () => { this.isSubmitting.set(false); }
    });
  }

  remove(item: AdminAcademy): void {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    this.admin.deleteAcademy(item.id).subscribe(() => this.refresh());
  }

  private normalize(v: Record<string, unknown>): Partial<AdminAcademy> {
    return {
      ...v,
      trainersCount: Number(v['trainersCount'] ?? 0),
      membersCount:  Number(v['membersCount']  ?? 0),
      growth:        Number(v['growth']        ?? 0)
    } as Partial<AdminAcademy>;
  }
}
