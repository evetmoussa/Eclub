import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../core/services/admin/admin.service';
import {
  ActivityItem, KpiCard, ManagementTile, RequestsSummary
} from '../../core/models/admin/admin.models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  private admin = inject(AdminService);
  private router = inject(Router);

  kpis     = signal<KpiCard[]>([]);
  tiles    = signal<ManagementTile[]>([]);
  feed     = signal<ActivityItem[]>([]);
  summary  = signal<RequestsSummary | null>(null);
  isLoading = signal(true);

  /** Donut math — circumference 2πr where r=54  ⇒ ≈ 339.29 */
  readonly donut = computed(() => {
    const s = this.summary();
    const C = 2 * Math.PI * 54;
    const pct = s ? s.successRate : 0;
    return { dash: (pct / 100) * C, gap: C, pct };
  });

  ngOnInit(): void {
    this.admin.getKpis().subscribe(v => this.kpis.set(v));
    this.admin.getManagementTiles().subscribe(v => this.tiles.set(v));
    this.admin.getActivities().subscribe(v => this.feed.set(v));
    this.admin.getRequestsSummary().subscribe(v => {
      this.summary.set(v);
      this.isLoading.set(false);
    });
  }

  go(route: string) { this.router.navigate([route]); }

  fmt(n: number): string {
    if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k';
    return String(n);
  }
}
