import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BookingsCenterService } from '../../core/services/bookings-center.service';
import { MyBooking } from '../../core/models/sport.model';

type Tab = 'all' | 'upcoming' | 'cancelled';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {
  private bookings = inject(BookingsCenterService);
  private router = inject(Router);

  readonly all       = computed(() => this.bookings.all());
  readonly isLoading = computed(() => this.bookings.isLoading());

  selectedTab = signal<Tab>('all');

  readonly visible = computed(() => {
    const t = this.selectedTab();
    const list = this.all();
    if (t === 'all')        return list;
    if (t === 'upcoming')   return list.filter(b => (b.status || '').toLowerCase() === 'confirmed');
    if (t === 'cancelled')  return list.filter(b => (b.status || '').toLowerCase() === 'cancelled');
    return list;
  });

  toast = '';
  toastError = false;

  ngOnInit(): void {
    this.bookings.refresh();
  }

  switchTab(t: Tab) { this.selectedTab.set(t); }
  trackBy(_: number, b: MyBooking) { return b.classId; }

  cancel(b: MyBooking): void {
    this.bookings.cancel(b.classId);
    this.showToast('Booking cancelled');
  }

  goBookMore(): void {
    this.router.navigate(['/blank-layout/sports']);
  }

  iconFor(sport: string | undefined): string {
    const s = (sport || '').toLowerCase();
    if (s.includes('football'))    return 'sports_soccer';
    if (s.includes('basketball'))  return 'sports_basketball';
    if (s.includes('tennis'))      return 'sports_tennis';
    if (s.includes('yoga'))        return 'self_improvement';
    return 'sports';
  }

  private showToast(msg: string, isError = false, ms = 2500) {
    this.toast = msg;
    this.toastError = isError;
    setTimeout(() => (this.toast = ''), ms);
  }
}
