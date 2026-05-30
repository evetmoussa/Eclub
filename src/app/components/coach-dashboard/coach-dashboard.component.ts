import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CoachMockService } from '../../core/services/coach/coach-mock.service';
import {
  CoachKpi, CoachClassSummary, CoachActivity, CoachReview
} from '../../core/models/coach/coach-workspace.models';
import { Coach } from '../../core/models/coach.model';

@Component({
  selector: 'app-coach-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './coach-dashboard.component.html',
  styleUrl: './coach-dashboard.component.scss'
})
export class CoachDashboardComponent implements OnInit {
  private mock = inject(CoachMockService);

  me = signal<Coach | null>(null);
  kpis = signal<CoachKpi[]>([]);
  classes = signal<CoachClassSummary[]>([]);
  feed = signal<CoachActivity[]>([]);
  reviews = signal<CoachReview[]>([]);
  isLoading = signal(true);

  readonly today = computed(() => {
    const todayIso = new Date().toISOString().slice(0, 10);
    return this.classes()
      .filter(c => c.date === todayIso && c.status !== 'Completed')
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  });

  readonly nextClass = computed(() => this.today()[0] || null);

  ngOnInit(): void {
    this.mock.getMyProfile().subscribe(c => this.me.set(c));
    this.mock.getKpis().subscribe(v => this.kpis.set(v));
    this.mock.getActivities().subscribe(v => this.feed.set(v));
    this.mock.getReviews().subscribe(v => this.reviews.set(v));
    this.mock.getMyClasses().subscribe(v => {
      this.classes.set(v);
      this.isLoading.set(false);
    });
  }

  greeting(): string {
    const h = new Date().getHours();
    if (h < 5)  return 'Good night';
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }
}
