import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, of } from 'rxjs';
import { SportsService } from './sports.service';
import { MyBooking } from '../models/sport.model';

/**
 * Single source of truth for the user's bookings.
 *
 *  • Server-side bookings come from GET /api/sports/my-bookings.
 *  • Local bookings are pushed by `pushLocal(...)` immediately after a
 *    successful Book / Confirm Booking action — so the user sees their
 *    booking in the navbar Bookings page even before the server list
 *    is refetched.
 *
 *  Locals are merged on top, deduped by classId.
 */
@Injectable({ providedIn: 'root' })
export class BookingsCenterService {
  private sports = inject(SportsService);

  private readonly server = signal<MyBooking[]>([]);
  private readonly local  = signal<MyBooking[]>([]);
  readonly isLoading = signal(false);

  /** Combined list, locals first, deduped by classId. */
  readonly all = computed<MyBooking[]>(() => {
    const seen = new Set<number>();
    const merged: MyBooking[] = [];
    for (const b of [...this.local(), ...this.server()]) {
      if (seen.has(b.classId)) continue;
      seen.add(b.classId);
      merged.push(b);
    }
    return merged.sort((a, b) =>
      new Date(b.bookedOn).getTime() - new Date(a.bookedOn).getTime()
    );
  });

  /** Fetch the latest server list. */
  refresh(): void {
    this.isLoading.set(true);
    this.sports.getMyBookings()
      .pipe(catchError(() => of<MyBooking[]>([])))
      .subscribe(list => {
        this.server.set(list || []);
        this.isLoading.set(false);
      });
  }

  /**
   * Add a booking that the user just made on the client. Survives until
   * the next refresh, where the server entry (matching by classId) takes
   * over and replaces ours.
   */
  pushLocal(b: Partial<MyBooking> & Pick<MyBooking, 'classId' | 'classTitle'>): MyBooking {
    const entry: MyBooking = {
      bookingId: b.bookingId ?? -Date.now(),
      classId: b.classId,
      classTitle: b.classTitle,
      sportName: b.sportName ?? '',
      timeRange: b.timeRange ?? '',
      location: b.location ?? '',
      bookedOn: b.bookedOn ?? new Date().toISOString(),
      status: b.status ?? 'Confirmed'
    };
    this.local.update(list => [entry, ...list.filter(x => x.classId !== entry.classId)]);
    return entry;
  }

  /** Drop a local booking after the user cancels it. */
  removeByClassId(classId: number): void {
    this.local.update(list => list.filter(b => b.classId !== classId));
    this.server.update(list => list.filter(b => b.classId !== classId));
  }

  cancel(classId: number): void {
    this.sports.cancelBooking(classId).subscribe({
      next: () => this.removeByClassId(classId),
      error: () => this.refresh()
    });
  }
}
