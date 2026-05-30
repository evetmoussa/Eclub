import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { QuickService } from '../../core/models/home/home.model';

@Component({
  selector: 'app-home-services',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home-services.component.html',
  styleUrl: './home-services.component.scss'
})
export class HomeServicesComponent {
  @Input() services: QuickService[] = [];

  showAll = false;

  get visibleServices(): QuickService[] {
    return this.showAll ? this.services : this.services.slice(0, 4);
  }

  toggleServices(): void { this.showAll = !this.showAll; }

  trackById(_: number, item: QuickService) { return item.id; }

  /** Map a quick-service tile to an actual route that exists in app.routes.ts.
   *  Previously this returned routes like /sports/events that 404'd. */
  serviceRoute(service: QuickService): (string | number)[] {
    const ep = (service?.endpoint || service?.name || '').toLowerCase();
    if (ep.includes('book'))                                  return ['/blank-layout/booking'];
    if (ep.includes('tournament') || ep.includes('event'))    return ['/blank-layout/events'];
    if (ep.includes('coach') || ep.includes('academy') ||
        ep.includes('sport') || ep.includes('club'))          return ['/blank-layout/sports'];
    if (ep.includes('renew') || ep.includes('membership'))    return ['/blank-layout/renew-membership'];
    if (ep.includes('chat') || ep.includes('assistant') ||
        ep.includes('ai'))                                    return ['/blank-layout/assistant'];
    if (ep.includes('notif'))                                 return ['/blank-layout/notification'];
    return ['/blank-layout/sports'];
  }
}
