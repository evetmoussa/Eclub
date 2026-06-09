import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SportsService } from '../../core/services/sports.service';
import { SportClass } from '../../core/models/sport.model';
import { onImgError } from '../../core/utils/image-fallback';

interface Coach { id: number; name: string; avatar: string | null; }

/**
 * Academy details — lists the academy's real bookable classes from the API,
 * lets the user filter by coach, and books a session via
 * POST /api/sports/classes/{id}/book.
 */
@Component({
  selector: 'app-academy-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './academy-details.component.html',
  styleUrls: ['./academy-details.component.scss']
})
export class AcademyDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private sports = inject(SportsService);

  academyId!: number;
  academyName = '';
  sportName = '';

  loading = true;
  errorMsg = '';
  bookingId: number | null = null;   // class id currently being booked
  isFallback = false;                // true when showing all classes (none linked to this academy)

  classes: SportClass[] = [];
  coaches: Coach[] = [];
  /** null = "All coaches" */
  selectedCoachId: number | null = null;

  onImgError = onImgError;

  ngOnInit(): void {
    this.academyId = Number(this.route.snapshot.paramMap.get('id'));

    // Name/sport from query params give an instant title; the API is the source
    // of truth for the actual bookable sessions below.
    const qp = this.route.snapshot.queryParamMap;
    this.academyName = qp.get('name') || 'Academy';
    this.sportName   = qp.get('sport') || '';

    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMsg = '';
    this.sports.getClassesByAcademy(this.academyId).subscribe({
      next: ({ classes, isFallback }) => {
        this.classes = classes;
        this.isFallback = isFallback;
        this.coaches = this.deriveCoaches(classes);
        if (!this.sportName && classes[0]?.sportName) this.sportName = classes[0].sportName!;
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Could not load sessions for this academy.';
        this.loading = false;
      }
    });
  }

  /** Distinct coaches that teach this academy's classes. */
  private deriveCoaches(list: SportClass[]): Coach[] {
    const map = new Map<number, Coach>();
    for (const c of list) {
      if (c.coachId != null && !map.has(c.coachId)) {
        map.set(c.coachId, { id: c.coachId, name: c.coachName || 'Coach', avatar: c.coachImageUrl ?? null });
      }
    }
    return Array.from(map.values());
  }

  /** Classes shown as slots — filtered by the selected coach (or all). */
  get slots(): SportClass[] {
    return this.selectedCoachId == null
      ? this.classes
      : this.classes.filter(c => c.coachId === this.selectedCoachId);
  }

  selectCoach(id: number): void {
    this.selectedCoachId = this.selectedCoachId === id ? null : id;
  }

  isFull(c: SportClass): boolean {
    const avail = c.availableSlots ?? (c.maxParticipants - (c.currentParticipants ?? 0));
    return avail <= 0;
  }

  taken(c: SportClass): number {
    return c.currentParticipants ?? (c.maxParticipants - (c.availableSlots ?? c.maxParticipants));
  }

  /** Book the class via the API, then go to the booking confirmation. */
  bookNow(c: SportClass): void {
    if (this.isFull(c) || c.isBookedByCurrentUser || this.bookingId != null) return;
    this.bookingId = c.id;
    this.sports.bookClass(c.id).subscribe({
      next: () => {
        this.bookingId = null;
        this.router.navigate(['/blank-layout/booking-confirmed'], {
          queryParams: {
            classId: c.id,
            academyId: this.academyId,
            academyName: this.academyName,
            sport: this.sportName || c.sportName,
            coachName: c.coachName,
            time: c.timeRange || `${c.startTime} - ${c.endTime}`,
            price: c.price
          }
        });
      },
      error: (err) => {
        this.bookingId = null;
        this.errorMsg = err?.error?.message || err?.error?.detail || 'Booking failed. Please try again.';
        setTimeout(() => (this.errorMsg = ''), 4000);
      }
    });
  }

  goBack(): void { this.location.back(); }
}
