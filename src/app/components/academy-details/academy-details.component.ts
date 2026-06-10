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

  classes: SportClass[] = [];
  coaches: Coach[] = [];
  /** null = "All coaches" */
  selectedCoachId: number | null = null;

  onImgError = onImgError;

  sportId = 0;

  ngOnInit(): void {
    this.academyId = Number(this.route.snapshot.paramMap.get('id'));

    // Name/sport/sportId from query params. sportId scopes the classes shown,
    // since an academy's classes carry the academy's sportId.
    const qp = this.route.snapshot.queryParamMap;
    this.academyName = qp.get('name') || 'Academy';
    this.sportName   = qp.get('sport') || '';
    this.sportId     = Number(qp.get('sportId') ?? 0);

    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMsg = '';
    // Filter classes by the academy's SPORT (the backend doesn't persist
    // academyId on classes, but every class carries its sportId).
    const classes$ = this.sportId
      ? this.sports.getClassesBySport(this.sportId)
      : this.sports.getClassesByAcademy(this.academyId);
    classes$.subscribe({
      next: (classes) => {
        this.classes = classes;
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

  /** Go to the Booking Summary review step; the actual booking happens there. */
  bookNow(c: SportClass): void {
    if (this.isFull(c) || c.isBookedByCurrentUser) return;
    this.router.navigate(['/blank-layout/booking-summary', c.id], {
      queryParams: {
        academyId: this.academyId,
        academyName: this.academyName,
        sport: this.sportName || c.sportName,
        coachName: c.coachName,
        startTime: c.startTime,
        endTime: c.endTime,
        date: c.startTime,
        sessionLabel: c.title,
        price: c.price
      }
    });
  }

  goBack(): void { this.location.back(); }
}
