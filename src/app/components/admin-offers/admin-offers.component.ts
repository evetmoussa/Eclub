import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminMockService } from '../../core/services/admin/admin-mock.service';
import { AdminOffer } from '../../core/models/admin/admin.models';
import {
  EntityFormModalComponent, FieldDef
} from '../admin-shared/entity-form-modal/entity-form-modal.component';

type OfferTab = 'All' | 'Active' | 'Scheduled' | 'Expired';

@Component({
  selector: 'app-admin-offers',
  standalone: true,
  imports: [CommonModule, FormsModule, EntityFormModalComponent],
  templateUrl: './admin-offers.component.html',
  styleUrl: './admin-offers.component.scss'
})
export class AdminOffersComponent implements OnInit {
  private mock = inject(AdminMockService);

  tabs: OfferTab[] = ['All', 'Active', 'Scheduled', 'Expired'];
  activeTab = signal<OfferTab>('All');
  query = signal('');

  all = signal<AdminOffer[]>([]);

  modalOpen = signal(false);
  editing = signal<AdminOffer | null>(null);
  isSubmitting = signal(false);

  readonly fields: FieldDef[] = [
    { key: 'title',       label: 'Offer title',  type: 'text',     required: true, width: 'full' },
    { key: 'description', label: 'Description',  type: 'textarea', width: 'full' },
    { key: 'imageUrl',    label: 'Image URL',    type: 'url',      width: 'full' },
    { key: 'discount',    label: 'Discount %',   type: 'number',   required: true, min: 0, max: 100 },
    { key: 'status',      label: 'Status',       type: 'select',   required: true, options: [
        { value: 'Active', label: 'Active' },
        { value: 'Scheduled', label: 'Scheduled' },
        { value: 'Expired', label: 'Expired' }
      ] },
    { key: 'startsAt', label: 'Start date', type: 'date', required: true },
    { key: 'endsAt',   label: 'End date',   type: 'date', required: true },
    { key: 'redemptions', label: 'Redemptions', type: 'number', min: 0, width: 'full' }
  ];

  stats = computed(() => {
    const list = this.all();
    const active = list.filter(o => o.status === 'Active').length;
    const totalRedeem = list.reduce((s, o) => s + o.redemptions, 0);
    const expiringSoon = list.filter(o => {
      const d = new Date(o.endsAt).getTime() - Date.now();
      return o.status === 'Active' && d > 0 && d < 30 * 24 * 60 * 60 * 1000;
    }).length;
    const redemptionRate = totalRedeem
      ? +((totalRedeem / (totalRedeem + 200)) * 100).toFixed(1)
      : 0;
    return { active, redemptionRate, expiringSoon };
  });

  filtered = computed<AdminOffer[]>(() => {
    const tab = this.activeTab();
    const q = this.query().toLowerCase().trim();
    return this.all()
      .filter(o => tab === 'All' || o.status === tab)
      .filter(o => q === '' || o.title.toLowerCase().includes(q) || o.description.toLowerCase().includes(q));
  });

  ngOnInit(): void { this.refresh(); }
  refresh(): void { this.mock.getOffers().subscribe(v => this.all.set(v)); }

  openAdd():  void { this.editing.set(null); this.modalOpen.set(true); }
  openEdit(o: AdminOffer): void { this.editing.set(o); this.modalOpen.set(true); }
  closeModal(): void { this.modalOpen.set(false); this.editing.set(null); }

  onSubmit(value: Record<string, unknown>): void {
    this.isSubmitting.set(true);
    const payload = this.normalize(value);
    const cur = this.editing();
    const op$ = cur
      ? this.mock.updateOffer(cur.id, payload)
      : this.mock.createOffer({
          ...payload,
          imageUrl: (payload.imageUrl as string) ||
            'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600'
        } as Omit<AdminOffer, 'id'>);
    op$.subscribe({
      next: () => { this.isSubmitting.set(false); this.closeModal(); this.refresh(); },
      error: () => { this.isSubmitting.set(false); }
    });
  }

  remove(o: AdminOffer): void {
    if (!confirm(`Delete offer "${o.title}"?`)) return;
    this.mock.deleteOffer(o.id).subscribe(() => this.refresh());
  }

  private normalize(v: Record<string, unknown>): Partial<AdminOffer> {
    return {
      ...v,
      discount:    Number(v['discount']    ?? 0),
      redemptions: Number(v['redemptions'] ?? 0)
    } as Partial<AdminOffer>;
  }
}
