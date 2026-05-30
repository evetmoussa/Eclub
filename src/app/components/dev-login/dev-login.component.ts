import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DevTokenService } from '../../core/services/dev-token.service';
import { HomeService } from '../../core/services/home.service';

/**
 * Quick dev-only screen to paste a JWT (e.g. one obtained from Postman)
 * and have the rest of the app behave as if a real login happened.
 *
 * Visit: /dev-login
 */
@Component({
  selector: 'app-dev-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dev-login.component.html',
  styleUrl: './dev-login.component.scss'
})
export class DevLoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dev = inject(DevTokenService);
  private home = inject(HomeService);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    token:    ['', [Validators.required, Validators.minLength(20)]],
    role:     ['admin', [Validators.required]],
    lifetime: [60 * 60 * 24, [Validators.required, Validators.min(60)]]
  });

  decoded: unknown = null;
  snapshot: Record<string, string | null> | null = null;

  msg = '';
  isError = false;

  ngOnInit(): void {
    this.snapshot = this.dev.inspect();

    // Live-update the JWT preview as the textarea changes.
    this.form.get('token')!.valueChanges.subscribe((v: string) => {
      this.decoded = v ? this.dev.decodeJwt(v.trim()) : null;
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const token: string = this.form.get('token')!.value.trim();
    const role: 'member' | 'admin' = this.form.get('role')!.value;
    const lifetime: number = +this.form.get('lifetime')!.value;

    if (role === 'admin') this.dev.setAdminToken(token, lifetime);
    else                  this.dev.setMemberToken(token, lifetime);

    this.snapshot = this.dev.inspect();
    this.msg = `Token saved as ${role}. Verifying with /api/home …`;
    this.isError = false;

    // Verify the token immediately by hitting a protected endpoint.
    this.home.getHomeData().subscribe({
      next: () => {
        this.msg = 'Token works! Redirecting to home …';
        setTimeout(() => this.router.navigate(['/blank-layout/home']), 800);
      },
      error: (err) => {
        this.isError = true;
        this.msg = `API rejected the token (${err?.status}). Double-check it in Postman.`;
      }
    });
  }

  clear(): void {
    this.dev.clearAll();
    this.snapshot = this.dev.inspect();
    this.decoded = null;
    this.msg = 'All tokens cleared.';
    this.isError = false;
  }
}
