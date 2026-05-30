import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HomeService } from '../../core/services/home.service';
import { HomeResponse } from '../../core/models/home/home.model';
import { HomeSliderComponent } from '../home-slider/home-slider.component';
import { HomeServicesComponent } from '../home-services/home-services.component';
import { environment } from '../../../environments/environment';
import { BookingsCenterService } from '../../core/services/bookings-center.service';
import { AUTH_KEYS } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, HomeSliderComponent, HomeServicesComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private homeService = inject(HomeService);
  private router = inject(Router);
  private bookingsCenter = inject(BookingsCenterService);

  homeData?: HomeResponse;
  isLoading = false;
  loadError = '';
  year = new Date().getFullYear();

  /** Friendly greeting based on local time of day. */
  readonly greeting = computed(() => {
    const h = new Date().getHours();
    if (h < 5)  return 'Good night';
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  });

  readonly memberFirstName = computed(() => {
    const full = localStorage.getItem(AUTH_KEYS.memberName) || '';
    return full.split(/\s+/)[0] || 'there';
  });

  /** Upcoming bookings the user has — derived from the live BookingsCenter. */
  readonly upcomingBookings = computed(() => this.bookingsCenter.all().length);

  /** Days remaining on the user's membership (placeholder until /account ships). */
  readonly daysToRenewal = computed(() => {
    const stored = localStorage.getItem('membershipExpiry');
    if (!stored) return 28;
    const diff = new Date(stored).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 86400000));
  });

  /** Fallback used everywhere when the API returns null / 404 image. */
  private readonly FALLBACK_IMG =
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200';

  resolveImage(url: string | null | undefined): string {
    if (!url) return this.FALLBACK_IMG;
    if (/^https?:\/\//i.test(url)) return url;
    return `${environment.apiBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  onCoverError(evt: Event): void {
    const img = evt.target as HTMLImageElement;
    if (img.src !== this.FALLBACK_IMG) {
      img.src = this.FALLBACK_IMG;
    }
  }

  ngOnInit(): void {
    this.loadHomeData();
    this.bookingsCenter.refresh();
  }

  loadHomeData(): void {
    this.isLoading = true;
    this.loadError = '';
    this.homeService.getHomeData().subscribe({
      next: (res) => {
        this.homeData = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load home data', err);
        this.isLoading = false;
        this.loadError = err?.status === 401
          ? 'Please sign in to see your personalised home.'
          : 'Could not load home data. Please try again.';
      }
    });
  }

  joinEvent(eventId: number): void {
    this.router.navigate(['/blank-layout/events'], { queryParams: { id: eventId, action: 'register' } });
  }

  viewEvent(eventId: number): void {
    this.router.navigate(['/blank-layout/events'], { queryParams: { id: eventId } });
  }
}
