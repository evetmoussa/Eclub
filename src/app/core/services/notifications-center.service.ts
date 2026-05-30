import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, of } from 'rxjs';
import { NotificationsService } from './notifications.service';
import { AppNotification } from '../models/notification.model';

/**
 * Single source of truth for the user's notifications inbox.
 *
 * It merges two streams:
 *  1. Server-side notifications from GET /api/notifications  (authoritative)
 *  2. Local notifications pushed by `pushLocal(...)` whenever something
 *     happens in the UI that the back-end hasn't (yet) recorded — e.g.
 *     after a successful academy / event / membership booking.
 *
 * Local entries get a stable negative id so they never clash with server
 * ones, and they survive the next refresh by being re-merged on top of
 * the server list (until they're replaced or cleared by the user).
 */
@Injectable({ providedIn: 'root' })
export class NotificationsCenterService {
  private api = inject(NotificationsService);

  /** Local-only notifications (those we created on the client). */
  private readonly local = signal<AppNotification[]>([]);
  /** Server-side notifications fetched from /api/notifications. */
  private readonly server = signal<AppNotification[]>([]);

  /** Combined list, locals first, sorted by createdAt desc. */
  readonly all = computed<AppNotification[]>(() => {
    const arr = [...this.local(), ...this.server()];
    return arr.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });

  /** Unread count drives the navbar badge. */
  readonly unreadCount = computed(() => this.all().filter(n => !n.isRead).length);

  /* ────────────── Server fetches ────────────── */

  refresh(page = 1, pageSize = 20): void {
    this.api.list(page, pageSize)
      .pipe(catchError(() => of<AppNotification[]>([])))
      .subscribe(list => this.server.set(list || []));
  }

  /* ────────────── Local push ────────────── */

  /**
   * Insert a fresh notification into the inbox immediately.
   * Use it after a successful booking, registration, payment, etc.
   */
  pushLocal(opts: {
    title: string;
    body: string;
    icon?: string;
    iconHue?: 'green' | 'orange' | 'blue';
    type?: string;
    actionUrl?: string;
  }): AppNotification {
    const n: AppNotification = {
      id: -Date.now(),                               // negative id = local
      title: opts.title,
      body: opts.body,
      type: opts.type,
      icon: opts.icon,
      iconHue: opts.iconHue,
      isRead: false,
      createdAt: new Date().toISOString(),
      actionUrl: opts.actionUrl ?? null
    };
    this.local.update(list => [n, ...list]);
    return n;
  }

  /* ────────────── State changes ────────────── */

  markRead(id: number): void {
    if (id < 0) {
      this.local.update(list => list.map(n => n.id === id ? { ...n, isRead: true } : n));
      return;
    }
    this.server.update(list => list.map(n => n.id === id ? { ...n, isRead: true } : n));
    this.api.markRead(id).subscribe({
      error: () => this.refresh()
    });
  }

  markAllRead(): void {
    this.local.update(list => list.map(n => ({ ...n, isRead: true })));
    this.server.update(list => list.map(n => ({ ...n, isRead: true })));
    this.api.markAllRead().subscribe();
  }

  remove(id: number): void {
    if (id < 0) {
      this.local.update(list => list.filter(n => n.id !== id));
      return;
    }
    this.server.update(list => list.filter(n => n.id !== id));
    this.api.remove(id).subscribe({
      error: () => this.refresh()
    });
  }
}
