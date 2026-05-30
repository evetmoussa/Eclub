import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
      unread: !n.isRead
    };
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
  viewDetails(a: DisplayAlert): void { this.markRead(a); }
  remove(a: DisplayAlert): void { this.center.remove(a.id); }
  markAll(): void { this.center.markAllRead(); }
}
