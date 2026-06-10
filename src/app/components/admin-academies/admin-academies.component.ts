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

  /** Real sports loaded from the API — used for the form's Sport dropdown. */
  sportOptions = signal<{ id: number; name: string }[]>([]);
  /** Coaches loaded from the API — used for the class form's Coach dropdown. */
  coachOptions = signal<{ id: number; name: string; imageUrl: string | null }[]>([]);

  // Modal state
  modalOpen = signal(false);
  editing = signal<AdminAcademy | null>(null);
  isSubmitting = signal(false);

  // Add-Class modal state
  classModalOpen = signal(false);
  classAcademy = signal<AdminAcademy | null>(null);
  classSubmitting = signal(false);
  classError = signal('');

  /** Form schema for the Add-Class modal. Sport + Coach are real dropdowns.
   *  Sport is required because the backend rejects an invalid sportId with
   *  "Sport not found" (some academies have no sportId set). */
  classFields = computed<FieldDef[]>(() => [
    { key: 'title',    label: 'Class title', type: 'text', required: true, width: 'full', placeholder: 'e.g. Morning Training' },
    { key: 'coachId',  label: 'Coach', type: 'select', required: true,
      placeholder: 'Select a coach…',
      options: this.coachOptions().map(c => ({ value: c.id, label: c.name })) },
    { key: 'location', label: 'Location', type: 'text', required: true, placeholder: 'e.g. Field A' },
    { key: 'date',     label: 'Date',  type: 'date', required: true },
    { key: 'startTime',label: 'Start', type: 'time', required: true },
    { key: 'endTime',  label: 'End',   type: 'time', required: true },
    { key: 'maxParticipants', label: 'Capacity', type: 'number', required: true, min: 1 },
    { key: 'price',    label: 'Price (EGP)', type: 'number', required: true, min: 0 }
  ]);

  /** Form schema for the modal. Sport is a dropdown of real sports so the
   *  academy links to a valid sportId (was a free-text field → sportId 0). */
  fields = computed<FieldDef[]>(() => [
    { key: 'name',     label: 'Academy name', type: 'text',  required: true, width: 'full', placeholder: 'e.g. Elite Football Academy' },
    { key: 'sport',    label: 'Sport',        type: 'select', required: true,
      placeholder: 'Select a sport…',
      options: this.sportOptions().map(s => ({ value: s.name, label: s.name })) },
    { key: 'type',     label: 'Type',         type: 'select', required: true, options: [
        { value: 'Academy', label: 'Academy' },
        { value: 'Court',   label: 'Court' },
        { value: 'Locker',  label: 'Locker' }
      ] },
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
  ]);

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

  ngOnInit(): void {
    this.refresh();
    this.admin.getSports().subscribe(s => this.sportOptions.set(s));
    this.admin.getCoaches().subscribe(c => this.coachOptions.set(c));
  }

  // ===== Add Class flow =====
  openAddClass(academy: AdminAcademy): void {
    this.classAcademy.set(academy);
    this.classError.set('');
    this.classModalOpen.set(true);
  }
  closeClassModal(): void {
    this.classModalOpen.set(false);
    this.classAcademy.set(null);
  }

  onSubmitClass(value: Record<string, unknown>): void {
    const academy = this.classAcademy();
    if (!academy) return;
    this.classSubmitting.set(true);
    this.classError.set('');

    const date = String(value['date'] ?? '');
    // Build a full ISO datetime (yyyy-MM-ddTHH:mm:ss) — the backend rejects
    // time-only or AM/PM strings. The <input type="time"> yields "HH:mm".
    const toIso = (t: string): string => {
      let hhmm = String(t || '').trim();
      const ampm = hhmm.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (ampm) {
        let h = Number(ampm[1]) % 12;
        if (/pm/i.test(ampm[3])) h += 12;
        hhmm = `${String(h).padStart(2, '0')}:${ampm[2]}`;
      }
      if (!/^\d{2}:\d{2}$/.test(hhmm)) hhmm = '00:00';
      return `${date}T${hhmm}:00`;
    };

    // The class inherits the ACADEMY's sport — a class in an academy must use
    // the same sportId as the academy itself. Resolve from the academy's
    // sportId, falling back to matching its sport name against the sports list.
    const sportId = academy.sportId
      ?? this.sportOptions().find(s => s.name === academy.sport)?.id
      ?? 0;
    if (!sportId) {
      this.classSubmitting.set(false);
      this.classError.set(`"${academy.name}" has no sport set. Edit the academy and choose a sport first.`);
      return;
    }

    this.admin.createClass({
      title: String(value['title'] ?? ''),
      type: 'Regular',
      location: String(value['location'] ?? ''),
      sportId,
      startTime: toIso(String(value['startTime'] ?? '')),
      endTime: toIso(String(value['endTime'] ?? '')),
      maxParticipants: Number(value['maxParticipants'] ?? 1),
      price: Number(value['price'] ?? 0),
      coachId: Number(value['coachId']),
      academyId: academy.id
    }).subscribe({
      next: () => { this.classSubmitting.set(false); this.closeClassModal(); this.refresh(); },
      error: (err) => {
        this.classSubmitting.set(false);
        this.classError.set(err?.error?.title || err?.error?.message || 'Could not create the class.');
      }
    });
  }

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
    const sportName = String(v['sport'] ?? '');
    const sportId = this.sportOptions().find(s => s.name === sportName)?.id ?? 0;
    const type = (['Academy', 'Court', 'Locker'].includes(String(v['type']))
      ? v['type'] : 'Academy') as AdminAcademy['type'];
    return {
      ...v,
      sportId,                                          // resolve dropdown name → real sportId
      type,                                             // backend enum (not the sport name)
      trainersCount: Number(v['trainersCount'] ?? 0),
      membersCount:  Number(v['membersCount']  ?? 0),
      growth:        Number(v['growth']        ?? 0)
    } as Partial<AdminAcademy>;
  }
}
