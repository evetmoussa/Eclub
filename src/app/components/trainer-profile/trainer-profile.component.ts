// trainer-profile.component.ts — Member-facing read-only profile for a coach.
// Pulls from the same data the admin uses (AdminMockService) so editing a
// trainer in admin reflects immediately here.

import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminMockService } from '../../core/services/admin/admin-mock.service';
import { AdminTrainer } from '../../core/models/admin/admin.models';

interface ScheduleSlot {
  weekday: string;
  date: string;     // ISO date
  startTime: string;
  endTime: string;
  title: string;
  spotsLeft: number;
}

@Component({
  selector: 'app-trainer-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './trainer-profile.component.html',
  styleUrl: './trainer-profile.component.scss'
})
export class TrainerProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private mock = inject(AdminMockService);

  trainer = signal<AdminTrainer | null>(null);
  isLoading = signal(true);
  notFound = signal(false);

  /** Mock weekly schedule — deterministic per-trainer so it doesn't shuffle on reload. */
  schedule = signal<ScheduleSlot[]>([]);

  /** Star rating as integers/halves for the icon row. */
  readonly stars = computed(() => {
    const r = this.trainer()?.rating ?? 0;
    return { full: Math.floor(r), half: r % 1 >= .5 ? 1 : 0, empty: 5 - Math.ceil(r) };
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id') ?? 0);
    this.mock.getTrainers().subscribe(list => {
      const found = list.find(t => t.id === id) ?? null;
      this.trainer.set(found);
      this.notFound.set(!found);
      this.isLoading.set(false);
      if (found) this.schedule.set(this.buildSchedule(found));
    });
  }

  /** Build a deterministic 5-day schedule starting today. */
  private buildSchedule(t: AdminTrainer): ScheduleSlot[] {
    const weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const slots: ScheduleSlot[] = [];
    const base = (t.id * 7) % 11; // small per-trainer offset for variety
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const hour = 9 + ((base + i) % 8);
      slots.push({
        weekday: weekdays[d.getDay()],
        date: d.toISOString().slice(0, 10),
        startTime: `${hour.toString().padStart(2,'0')}:00`,
        endTime:   `${(hour + 1).toString().padStart(2,'0')}:00`,
        title: `${t.role} Session`,
        spotsLeft: Math.max(2, 12 - ((base + i * 2) % 11))
      });
    }
    return slots;
  }

  bookSession(slot: ScheduleSlot): void {
    // Route to the booking-summary using a synthetic class id (negative to mark mock).
    const synthClassId = (this.trainer()?.id ?? 0) * 1000 + new Date(slot.date).getDate();
    this.router.navigate(['/blank-layout/booking-summary', synthClassId], {
      queryParams: {
        coachName: this.trainer()?.name,
        coachId:   this.trainer()?.id,
        sport:     this.trainer()?.role,
        date:      slot.date,
        startTime: slot.startTime,
        endTime:   slot.endTime,
        sessionLabel: slot.title
      }
    });
  }

  /** Goes to Academies prefilled with the trainer's specialty as the search. */
  bookGeneric(): void {
    const t = this.trainer();
    if (!t) return;
    this.router.navigate(['/blank-layout/sports'], { queryParams: { q: t.role } });
  }

  goBack(): void { this.location.back(); }
}
