import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';

import { EventsService } from '../../core/services/events.service';
import { NotificationsCenterService } from '../../core/services/notifications-center.service';
import { AppEvent, MyEventRegistration } from '../../core/models/event.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.scss']
})
export class EventsListComponent implements OnInit {
  private events = inject(EventsService);
  private center = inject(NotificationsCenterService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  upcoming: AppEvent[] = [];
  myEventIds = new Set<number>();

  isLoading = false;
  loadError = '';

  toast = '';
  toastError = false;

  highlightId: number | null = null;

  ngOnInit(): void {
    this.highlightId = Number(this.route.snapshot.queryParamMap.get('id') ?? 0) || null;
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.loadError = '';

    forkJoin({
      list:  this.events.getUpcoming().pipe(catchError(err => { throw err; })),
      mine:  this.events.myRegistrations().pipe(catchError(() => of<MyEventRegistration[]>([])))
    })
      .pipe(catchError(err => {
        this.loadError = err?.status === 401
          ? 'Please sign in to see events.'
          : 'Could not load events.';
        return of({ list: [] as AppEvent[], mine: [] as MyEventRegistration[] });
      }))
      .subscribe(({ list, mine }) => {
        this.isLoading = false;
        this.upcoming = list;
        this.myEventIds = new Set(mine.map(m => m.eventId));

        // Auto-register if landed via /events?id=X&action=register and not yet registered.
        const action = this.route.snapshot.queryParamMap.get('action');
        if (this.highlightId && action === 'register' && !this.myEventIds.has(this.highlightId)) {
          this.register(this.highlightId);
        }
      });
  }

  isRegistered(e: AppEvent): boolean { return this.myEventIds.has(e.id); }

  register(id: number): void {
    this.events.register(id).subscribe({
      next: () => {
        this.myEventIds.add(id);
        const ev = this.upcoming.find(e => e.id === id);
        if (ev) ev.currentParticipants += 1;
        this.showToast('Registered successfully!');
        this.center.pushLocal({
          title: 'Event Registration Confirmed!',
          body: `You're registered for '${ev?.title ?? 'the event'}'.`,
          type: 'Event',
          icon: 'celebration',
          iconHue: 'orange'
        });
      },
      error: (err) => this.showToast(err?.error?.detail || 'Could not register.', true)
    });
  }

  cancel(id: number): void {
    this.events.cancelRegistration(id).subscribe({
      next: () => {
        this.myEventIds.delete(id);
        const ev = this.upcoming.find(e => e.id === id);
        if (ev) ev.currentParticipants = Math.max(0, ev.currentParticipants - 1);
        this.showToast('Registration cancelled.');
      },
      error: (err) => this.showToast(err?.error?.detail || 'Could not cancel.', true)
    });
  }

  resolveImage(url: string | null | undefined): string {
    const fallback = 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=900';
    if (!url) return fallback;
    if (/^https?:\/\//i.test(url)) return url;
    return `${environment.apiBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  onImgError(evt: Event): void {
    const img = evt.target as HTMLImageElement;
    const fallback = 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=900';
    if (img.src !== fallback) img.src = fallback;
  }

  trackById(_: number, e: AppEvent) { return e.id; }

  private showToast(msg: string, isError = false, ms = 3000): void {
    this.toast = msg;
    this.toastError = isError;
    setTimeout(() => (this.toast = ''), ms);
  }

  goBack() { this.router.navigate(['/blank-layout/home']); }
}
