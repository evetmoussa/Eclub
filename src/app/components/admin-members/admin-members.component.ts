import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin/admin.service';
import { AdminMember } from '../../core/models/admin/admin.models';

type Tab = 'All Members' | 'Premium' | 'Coaches' | 'Pending';

@Component({
  selector: 'app-admin-members',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-members.component.html',
  styleUrl: './admin-members.component.scss'
})
export class AdminMembersComponent implements OnInit {
  private admin = inject(AdminService);

  tabs: Tab[] = ['All Members', 'Premium', 'Coaches', 'Pending'];
  activeTab = signal<Tab>('All Members');

  all = signal<AdminMember[]>([]);
  query = signal('');

  /** Subscriptions chart points (mock data points for the last 7 days) */
  chartPoints = [42, 56, 48, 70, 62, 88, 95];

  stats = computed(() => {
    const list = this.all();
    return {
      activeSubs: list.filter(m => m.status === 'Active').length,
      total: list.length,
      retention: 94.2,
      monthly: '+12%'
    };
  });

  filtered = computed<AdminMember[]>(() => {
    const tab = this.activeTab();
    const q = this.query().toLowerCase().trim();
    return this.all()
      .filter(m =>
        tab === 'All Members' ? true :
        tab === 'Premium'     ? m.plan === 'Premium' :
        tab === 'Coaches'     ? m.plan === 'Coach'   :
        m.status === 'Pending'
      )
      .filter(m => q === '' || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
  });

  /** Build polyline points scaled into the 240×60 viewBox */
  polyPoints = computed(() => {
    const pts = this.chartPoints;
    const max = Math.max(...pts);
    const w = 240, h = 60, step = w / (pts.length - 1);
    return pts.map((v, i) => `${(i * step).toFixed(1)},${(h - (v / max) * (h - 8)).toFixed(1)}`).join(' ');
  });

  ngOnInit(): void {
    this.admin.getMembers().subscribe(v => this.all.set(v));
  }
}
