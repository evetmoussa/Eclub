import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingsCenterService } from '../../core/services/bookings-center.service';
import { NotificationsCenterService } from '../../core/services/notifications-center.service';

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
  }

  setPayment(p: Payment) { this.payment = p; }

  confirm() {
    // Push the booking into the local center so it appears immediately on /booking
    this.bookingsCenter.pushLocal({
      classId: this.classId || -Date.now(),
      classTitle: this.sessionLabel || 'Training Session',
      sportName: this.sportName,
      timeRange: `${this.startTime} - ${this.endTime}`,
      location: this.academyName,
      status: 'Confirmed'
    });

    // And drop a notification.
    this.center.pushLocal({
      title: 'Booking Confirmed!',
      body: `Your session at ${this.academyName} with coach ${this.coachName} is confirmed.`,
      type: 'Booking',
      icon: 'event_available',
      iconHue: 'green'
    });

    // Land directly on the Bookings page (in the navbar).
    this.router.navigate(['/blank-layout/booking']);
  }

  cancel() { this.location.back(); }
}
