import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationsCenterService } from '../../core/services/notifications-center.service';

@Component({
  selector: 'app-booking-confirmed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-confirmed.component.html',
  styleUrls: ['./booking-confirmed.component.scss']
})
export class BookingConfirmedComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private center = inject(NotificationsCenterService);
  private router = inject(Router);

  bookingId = '';
  academyName = 'Tennis Academy';
  coachName = 'kareem';
  date = '';
  startTime = '9:00 AM';
  duration = '1 Hour';
  capacity = 1;
  max = 20;

  ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap;
    this.bookingId   = q.get('bookingId')   || 'SC-SESSION_2026_5_2_1';
    this.academyName = q.get('academyName') || this.academyName;
    this.coachName   = q.get('coachName')   || this.coachName;
    this.date        = q.get('date')        || new Date().toISOString().slice(0,10);
    this.startTime   = q.get('startTime')   || this.startTime;
    this.duration    = q.get('duration')    || this.duration;
    this.capacity    = Number(q.get('capacity') ?? 1);
    this.max         = Number(q.get('max')      ?? 20);

    // Drop a local notification so the bell badge updates instantly.
    this.center.pushLocal({
      title: 'Booking Confirmed!',
      body: `Your session at ${this.academyName} with coach ${this.coachName} is confirmed.`,
      type: 'Booking',
      icon: 'event_available',
      iconHue: 'green'
    });
  }

  goToBookings() {
    this.router.navigate(['/blank-layout/booking']);
  }

  backToAcademy() {
    this.router.navigate(['/blank-layout/sports']);
  }
}
