import { Component, HostListener, Input, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, AUTH_KEYS } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  @Input() unreadCount = 0;

  /** Whether the user dropdown (profile menu) is open. */
  menuOpen = signal(false);

  readonly memberName = computed(() =>
    localStorage.getItem(AUTH_KEYS.memberName) || 'Member'
  );
  readonly memberEmail = computed(() =>
    localStorage.getItem(AUTH_KEYS.memberEmail) || ''
  );
  readonly initials = computed(() => {
    const n = this.memberName();
    return n.split(/\s+/).slice(0, 2).map(s => s.charAt(0).toUpperCase()).join('') || 'M';
  });

  toggleMenu(): void { this.menuOpen.set(!this.menuOpen()); }
  closeMenu(): void { this.menuOpen.set(false); }

  @HostListener('document:click', ['$event'])
  onDocClick(evt: MouseEvent): void {
    const target = evt.target as HTMLElement;
    if (!target.closest('.profile-avatar') && !target.closest('.profile-menu')) {
      this.closeMenu();
    }
  }

  logout(): void {
    this.closeMenu();
    this.auth.logoutMember();
  }
}
