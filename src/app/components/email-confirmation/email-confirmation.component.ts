// email-confirmation.component.ts — Landing page after /register success.
// Tells the user to check their email and exposes a "Resend" action that
// hits /auth/resend-confirmation.

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-email-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './email-confirmation.component.html',
  styleUrl: './email-confirmation.component.scss'
})
export class EmailConfirmationComponent implements OnInit {
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);

  email = signal<string>('');
  cooldown = signal<number>(0);    // seconds remaining before they can resend
  status = signal<'' | 'sending' | 'sent' | 'error'>('');
  errorMsg = signal<string>('');

  ngOnInit(): void {
    const fromQuery = this.route.snapshot.queryParamMap.get('email');
    const fromStorage = localStorage.getItem('pendingConfirmEmail');
    this.email.set(fromQuery ?? fromStorage ?? '');
    if (fromQuery) localStorage.setItem('pendingConfirmEmail', fromQuery);
  }

  resend(): void {
    if (this.cooldown() > 0 || !this.email()) return;
    this.status.set('sending');
    this.errorMsg.set('');

    this.auth.resendConfirmation({ email: this.email() }).subscribe({
      next: () => {
        this.status.set('sent');
        this.startCooldown(60);
        setTimeout(() => this.status.set(''), 4000);
      },
      error: (err: HttpErrorResponse) => {
        this.status.set('error');
        this.errorMsg.set(
          err.error?.detail || err.error?.title || 'Could not resend. Try again in a minute.'
        );
        // Still cooldown briefly to discourage spamming.
        this.startCooldown(20);
      }
    });
  }

  private startCooldown(seconds: number): void {
    this.cooldown.set(seconds);
    const tick = () => {
      const v = this.cooldown();
      if (v <= 0) return;
      this.cooldown.set(v - 1);
      setTimeout(tick, 1000);
    };
    setTimeout(tick, 1000);
  }

  goBack(): void { this.location.back(); }
  goToLogin(): void { this.router.navigate(['/login']); }
}
