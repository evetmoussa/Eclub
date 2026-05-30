import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CoachMockService } from '../../core/services/coach/coach-mock.service';
import { Coach } from '../../core/models/coach.model';
import { AuthService } from '../../core/services/auth.service';

interface SideLink { icon: string; label: string; route: string; }

@Component({
  selector: 'app-coach-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './coach-layout.component.html',
  styleUrl: './coach-layout.component.scss'
})
export class CoachLayoutComponent implements OnInit {
  private mock = inject(CoachMockService);
  private auth = inject(AuthService);
  private router = inject(Router);

  primary: SideLink[] = [
    { icon: 'space_dashboard', label: 'Dashboard', route: '/coach/dashboard' },
    { icon: 'event',           label: 'My Classes', route: '/coach/classes'  },
    { icon: 'calendar_month',  label: 'Schedule',  route: '/coach/schedule' },
    { icon: 'person',          label: 'My Profile',route: '/coach/profile'  }
  ];

  secondary: SideLink[] = [
    { icon: 'notifications', label: 'Notifications', route: '/coach/notifications' }
  ];

  me = signal<Coach | null>(null);

  readonly initials = computed(() => {
    const n = this.me()?.fullName || 'Coach';
    return n.split(/\s+/).slice(0, 2).map(s => s.charAt(0).toUpperCase()).join('') || 'C';
  });

  ngOnInit(): void {
    this.mock.getMyProfile().subscribe(c => this.me.set(c));
  }

  logout(): void {
    // Coaches use the same auth as members for now.
    this.auth.logoutMember();
    this.router.navigate(['/login']);
  }
}
