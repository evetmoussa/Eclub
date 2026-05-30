import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminMockService } from '../../core/services/admin/admin-mock.service';
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
  private mock = inject(AdminMockService);
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
    this.mock.getKpis().subscribe(v => this.kpis.set(v));
    this.mock.getManagementTiles().subscribe(v => this.tiles.set(v));
    this.mock.getActivities().subscribe(v => this.feed.set(v));
    this.mock.getRequestsSummary().subscribe(v => {
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
