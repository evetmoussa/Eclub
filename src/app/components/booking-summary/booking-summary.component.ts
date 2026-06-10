import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingsCenterService } from '../../core/services/bookings-center.service';
import { NotificationsCenterService } from '../../core/services/notifications-center.service';
import { SportsService } from '../../core/services/sports.service';

type Payment = 'cash' | 'wallet' | 'credit';

@Component({
  selector: 'app-booking-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-summary.component.html',
  styleUrls: ['./booking-summary.component.scss']
})
export class BookingSummaryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private bookingsCenter = inject(BookingsCenterService);
  private center = inject(NotificationsCenterService);
  private router = inject(Router);
  private location = inject(Location);
  private sports = inject(SportsService);

  classId = 0;
  academyId = 1;
  academyName = 'Tennis Academy';
  sportName = 'Tennis';
  coachName = 'kareem';
  coachRating = 5.0;
  coachReviews = 124;
  startTime = '9:00 AM';
  endTime = '10:00 AM';
  date = '';
  sessionLabel = 'Session 1';

  duration = '1 Hour';
  sessionFee = 45;
  serviceFee = 5;
  get total() { return this.sessionFee + this.serviceFee; }

  payment: Payment = 'wallet';

  isBooking = false;
  errorMsg = '';

  ngOnInit(): void {
    const p = this.route.snapshot.paramMap;
    const q = this.route.snapshot.queryParamMap;
    this.classId      = Number(p.get('classId') ?? 0);
    this.academyId    = Number(q.get('academyId') ?? 1);
    this.academyName  = q.get('academyName') || 'Tennis Academy';
    this.sportName    = q.get('sport') || 'Tennis';
    this.coachName    = q.get('coachName') || 'kareem';
    this.startTime    = q.get('startTime') || '9:00 AM';
    this.endTime      = q.get('endTime')   || '10:00 AM';
    this.date         = q.get('date') || new Date().toISOString().slice(0,10);
    this.sessionLabel = q.get('sessionLabel') || 'Session 1';
    const price = Number(q.get('price'));
    if (!isNaN(price) && price > 0) this.sessionFee = price;
  }

  setPayment(p: Payment) { this.payment = p; }

  /** Push optimistic local booking + notification (UI feedback). */
  private pushLocalBooking(): void {
    this.bookingsCenter.pushLocal({
      classId: this.classId || -Date.now(),
      classTitle: this.sessionLabel || 'Training Session',
      sportName: this.sportName,
      timeRange: `${this.startTime} - ${this.endTime}`,
      location: this.academyName,
      status: 'Confirmed'
    });
    this.center.pushLocal({
      title: 'Booking Confirmed!',
      body: `Your session at ${this.academyName} with coach ${this.coachName} is confirmed.`,
      type: 'Booking',
      icon: 'event_available',
      iconHue: 'green'
    });
  }

  confirm() {
    if (this.isBooking) return;
    this.errorMsg = '';

    // No real class id (e.g. trainer-profile synthetic booking) → keep the old
    // optimistic-only flow and go to the bookings page.
    if (!this.classId || this.classId < 0) {
      this.pushLocalBooking();
      this.router.navigate(['/blank-layout/booking']);
      return;
    }

    // Real class → book against the API, then go to the confirmation page.
    this.isBooking = true;
    this.sports.bookClass(this.classId).subscribe({
      next: () => {
        this.isBooking = false;
        this.pushLocalBooking();
        this.router.navigate(['/blank-layout/booking-confirmed'], {
          queryParams: {
            classId: this.classId,
            academyId: this.academyId,
            academyName: this.academyName,
            sport: this.sportName,
            coachName: this.coachName,
            time: `${this.startTime} - ${this.endTime}`,
            price: this.sessionFee
          }
        });
      },
      error: (err) => {
        this.isBooking = false;
        this.errorMsg = err?.error?.message || err?.error?.detail || 'Booking failed. Please try again.';
      }
    });
  }

  cancel() { this.location.back(); }
}
