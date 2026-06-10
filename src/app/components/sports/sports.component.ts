import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';

import { SportsService } from '../../core/services/sports.service';
import { NotificationsCenterService } from '../../core/services/notifications-center.service';
import { BookingsCenterService } from '../../core/services/bookings-center.service';
import {
  Sport, SportClass, SportsScreen, MyBooking, AcademyScreenItem
} from '../../core/models/sport.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-sports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sports.component.html',
  styleUrls: ['./sports.component.scss']
})
export class SportsComponent implements OnInit {
  private sports = inject(SportsService);
  private center = inject(NotificationsCenterService);
  private bookingsCenter = inject(BookingsCenterService);
  private router = inject(Router);

  screen?: SportsScreen;
  isLoading = false;
  loadError = '';

  /** Academies from GET /api/academies/screen. */
  academies: AcademyScreenItem[] = [];

  selectedSportId: number | null = null;
  search = '';

  myBookings: MyBooking[] = [];
  loadingBookings = false;

  toast = '';
  toastError = false;

  ngOnInit(): void {
    this.loadScreen();
    this.loadMyBookings();
    this.loadAcademies();
  }

  /** Load the member academies list from /api/academies/screen. */
  loadAcademies(): void {
    this.sports.getAcademiesScreen()
      .pipe(catchError(() => of({ featured: [], all: [] as AcademyScreenItem[] })))
      .subscribe(res => (this.academies = res.all));
  }

  loadScreen(sportId: number | null = this.selectedSportId): void {
    this.isLoading = true;
    this.loadError = '';

    this.sports.getScreen(sportId ?? undefined)
      .pipe(catchError(err => {
        console.warn('[SportsComponent] failed to load screen', err);
        this.loadError = err?.status === 401
          ? 'Please sign in to see Academies.'
          : 'Could not load Academies. Please try again.';
        return of<SportsScreen | null>(null);
      }))
      .subscribe(res => {
        this.isLoading = false;
        if (res) this.screen = res;
      });
  }

  loadMyBookings(): void {
    this.loadingBookings = true;
    this.sports.getMyBookings()
      .pipe(catchError(() => of<MyBooking[]>([])))
      .subscribe(list => {
        this.myBookings = list || [];
        this.loadingBookings = false;
        this.markBookedOnClasses();
      });
  }

  // ===== Sport chips: show 10, then "See more" =====
  readonly CHIP_LIMIT = 10;
  showAllSports = false;

  /** Sport chips to render — capped at CHIP_LIMIT unless expanded. */
  get visibleSportChips(): Sport[] {
    const all = this.screen?.sports ?? [];
    return this.showAllSports ? all : all.slice(0, this.CHIP_LIMIT);
  }
  get hasMoreSportChips(): boolean {
    return (this.screen?.sports?.length ?? 0) > this.CHIP_LIMIT;
  }
  get hiddenSportCount(): number {
    return Math.max(0, (this.screen?.sports?.length ?? 0) - this.CHIP_LIMIT);
  }
  toggleSports(): void { this.showAllSports = !this.showAllSports; }

  selectSport(id: number | null): void {
    this.selectedSportId = id;
    this.loadScreen(id);
  }

  onSearch(value: string): void {
    this.search = (value || '').trim().toLowerCase();
  }

  /** Academies filtered by the hero-search input. */
  get visibleAcademies(): AcademyScreenItem[] {
    const all = this.academies;
    if (!this.search) return all;
    return all.filter(a =>
      (a.name || '').toLowerCase().includes(this.search) ||
      (a.sportName || '').toLowerCase().includes(this.search) ||
      (a.location || '').toLowerCase().includes(this.search)
    );
  }

  get visibleClasses(): SportClass[] {
    const all = this.screen?.upcomingClasses ?? [];
    if (!this.search) return all;
    return all.filter(c =>
      (c.title || '').toLowerCase().includes(this.search) ||
      (c.description || '').toLowerCase().includes(this.search) ||
      (c.location || '').toLowerCase().includes(this.search) ||
      (c.sportName || '').toLowerCase().includes(this.search)
    );
  }

  openAcademy(a: AcademyScreenItem): void {
    this.router.navigate(['/blank-layout/academy', a.id], {
      queryParams: { name: a.name, sport: a.sportName ?? '', sportId: a.sportId ?? '' }
    });
  }

  academyImageFor(a: AcademyScreenItem): string {
    if (a.imageUrl) return this.resolveImage(a.imageUrl);
    const map: Record<string, string> = {
      football:   'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=900',
      basketball: 'https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=900',
      tennis:     'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=900',
      yoga:       'https://images.unsplash.com/photo-1593810450967-f9c42742e326?w=900'
    };
    const key = (a.sportName || '').toLowerCase();
    for (const k in map) if (key.includes(k)) return map[k];
    return 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=900';
  }

  book(c: SportClass): void {
    this.sports.bookClass(c.id).subscribe({
      next: () => {
        c.isBooked = true;
        c.currentParticipants = (c.currentParticipants ?? 0) + 1;
        this.showToast('Booked! Redirecting to your bookings…');

        this.bookingsCenter.pushLocal({
          classId: c.id,
          classTitle: c.title,
          sportName: c.sportName ?? '',
          timeRange: `${new Date(c.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(c.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          location: c.location ?? '',
          status: 'Confirmed'
        });

        this.center.pushLocal({
          title: 'Booking Confirmed!',
          body: `Your booking for '${c.title}' is confirmed.`,
          type: 'Booking',
          icon: 'event_available',
          iconHue: 'green'
        });

        this.router.navigate(['/blank-layout/booking']);
      },
      error: (err) => this.showToast(err?.error?.detail || 'Booking failed.', true)
    });
  }

  cancel(c: SportClass): void {
    this.sports.cancelBooking(c.id).subscribe({
      next: () => {
        c.isBooked = false;
        c.currentParticipants = Math.max(0, (c.currentParticipants ?? 1) - 1);
        this.showToast('Booking cancelled.');
        this.loadMyBookings();
      },
      error: (err) => this.showToast(err?.error?.detail || 'Could not cancel.', true)
    });
  }

  cancelBooking(classId: number): void {
    this.sports.cancelBooking(classId).subscribe({
      next: () => {
        this.myBookings = this.myBookings.filter(b => b.classId !== classId);
        this.showToast('Booking cancelled.');
        this.markBookedOnClasses();
      },
      error: (err) => this.showToast(err?.error?.detail || 'Could not cancel.', true)
    });
  }

  join(c: SportClass): void {
    this.sports.joinClass(c.id).subscribe({
      next: () => {
        this.showToast(`Joined ${c.title}!`);
        this.center.pushLocal({
          title: 'Joined a class!',
          body: `You've joined '${c.title}'.`,
          type: 'Class',
          icon: 'login',
          iconHue: 'blue'
        });
      },
      error: (err) => this.showToast(err?.error?.detail || 'Could not join.', true)
    });
  }

  private markBookedOnClasses(): void {
    if (!this.screen?.upcomingClasses?.length) return;
    const bookedIds = new Set(this.myBookings.map(b => b.classId));
    this.screen.upcomingClasses.forEach(c => {
      c.isBooked = bookedIds.has(c.id);
    });
  }

  resolveImage(url: string | null | undefined,
               fallback = 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=900'): string {
    if (!url) return fallback;
    if (/^https?:\/\//i.test(url)) return url;
    return `${environment.apiBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  sportFallback(c: SportClass): string {
    const map: Record<string, string> = {
      football:   'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=900',
      basketball: 'https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=900',
      tennis:     'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=900',
      yoga:       'https://images.unsplash.com/photo-1593810450967-f9c42742e326?w=900'
    };
    const key = (c.sportName || c.title || '').toLowerCase();
    for (const k in map) if (key.includes(k)) return map[k];
    return 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=900';
  }

  trackById(_: number, item: Sport)         { return item.id; }
  trackByClass(_: number, item: SportClass) { return item.id; }
  trackByAcademy(_: number, item: AcademyScreenItem) { return item.id; }

  private showToast(msg: string, isError = false, ms = 3000): void {
    this.toast = msg;
    this.toastError = isError;
    setTimeout(() => (this.toast = ''), ms);
  }
}
