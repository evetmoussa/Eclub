import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationsCenterService } from '../../core/services/notifications-center.service';
import { AppNotification } from '../../core/models/notification.model';

interface DisplayAlert {
  id: number;
  icon: string;
  iconHue: 'green' | 'orange' | 'blue';
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type?: string;
  actionUrl?: string | null;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  private center = inject(NotificationsCenterService);
  private router = inject(Router);

  readonly alerts = computed<DisplayAlert[]>(() =>
    this.center.all().map(n => this.toDisplay(n))
  );
  readonly unread = computed(() => this.center.unreadCount());

  isLoading = false;
  loadError = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.loadError = '';
    this.center.refresh();
    // We don't get a direct loading signal here, but the request is cheap.
    setTimeout(() => (this.isLoading = false), 250);
  }

  private toDisplay(n: AppNotification): DisplayAlert {
    return {
      id: n.id,
      icon: n.icon || this.iconFromType(n.type),
      iconHue: n.iconHue || this.hueFromType(n.type),
      title: n.title,
      message: n.body,
      time: this.relative(n.createdAt),
      unread: !n.isRead,
      type: n.type,
      actionUrl: n.actionUrl
    };
  }

  /**
   * Map a notification to the page it should open, using both the backend
   * `type` (e.g. "Sport", "System", "Booking", "Event") and the title text.
   */
  private routeFor(a: DisplayAlert): string {
    const s = `${a.type ?? ''} ${a.title ?? ''} ${a.message ?? ''}`.toLowerCase();
    if (s.includes('event') || s.includes('tournament')) return '/blank-layout/events';
    if (s.includes('book') || s.includes('class') || s.includes('session')) return '/blank-layout/booking';
    if (s.includes('coach') || s.includes('academy') || s.includes('sport')) return '/blank-layout/sports';
    if (s.includes('member') || s.includes('payment') || s.includes('renew')) return '/blank-layout/renew-membership';
    return '/blank-layout/home';
  }

  private iconFromType(t?: string): string {
    if (!t) return 'notifications';
    const lc = t.toLowerCase();
    if (lc.includes('book') || lc.includes('class')) return 'event_available';
    if (lc.includes('event') || lc.includes('tournament')) return 'celebration';
    if (lc.includes('coach')) return 'sports';
    if (lc.includes('member') || lc.includes('payment')) return 'card_membership';
    return 'notifications';
  }
  private hueFromType(t?: string): 'green' | 'orange' | 'blue' {
    const lc = (t || '').toLowerCase();
    if (lc.includes('event') || lc.includes('tournament')) return 'orange';
    if (lc.includes('coach') || lc.includes('member'))     return 'blue';
    return 'green';
  }
  private relative(iso: string): string {
    if (!iso) return 'Just now';
    const ms = Date.now() - new Date(iso).getTime();
    if (ms < 60_000)         return 'Just now';
    if (ms < 3_600_000)      return `${Math.floor(ms / 60_000)}m ago`;
    if (ms < 86_400_000)     return `${Math.floor(ms / 3_600_000)}h ago`;
    return `${Math.floor(ms / 86_400_000)}d ago`;
  }

  markRead(a: DisplayAlert): void { this.center.markRead(a.id); }

  /** Mark read and open the related page (actionUrl if given, else by type). */
  viewDetails(a: DisplayAlert): void {
    this.markRead(a);
    const url = a.actionUrl?.trim();
    if (url) {
      // Absolute URL → leave the app; otherwise router-navigate within the SPA.
      if (/^https?:\/\//i.test(url)) { window.location.href = url; return; }
      this.router.navigateByUrl(url.startsWith('/') ? url : `/${url}`);
      return;
    }
    this.router.navigateByUrl(this.routeFor(a));
  }
  remove(a: DisplayAlert): void { this.center.remove(a.id); }
  markAll(): void { this.center.markAllRead(); }
}
