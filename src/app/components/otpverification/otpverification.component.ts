import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

interface ResetCodeResponse {
  token?: string;
  resetToken?: string;
  message?: string;
}

@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './otpverification.component.html',
  styleUrl: './otpverification.component.scss'
})
export class OtpVerificationComponent {
  private fb = inject(FormBuilder);
  private location = inject(Location);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMsg = signal('');
  resendCooldown = signal(0);

  otpForm: FormGroup = this.fb.group({
    digit1: ['', [Validators.required, Validators.pattern(/^\d$/)]],
    digit2: ['', [Validators.required, Validators.pattern(/^\d$/)]],
    digit3: ['', [Validators.required, Validators.pattern(/^\d$/)]],
    digit4: ['', [Validators.required, Validators.pattern(/^\d$/)]],
    digit5: ['', [Validators.required, Validators.pattern(/^\d$/)]],
    digit6: ['', [Validators.required, Validators.pattern(/^\d$/)]]
  });

  /** Reads phone from localStorage (set by forget-password page). */
  get phoneNumber(): string {
    return localStorage.getItem('resetPhone') ?? '';
  }
  get resetEmail(): string {
    return localStorage.getItem('resetEmail') ?? '';
  }

  verifyOtp(): void {
    if (!this.otpForm.valid) {
      this.otpForm.markAllAsTouched();
      this.errorMsg.set('Please enter the 6-digit code.');
      return;
    }

    this.isLoading.set(true);
    this.errorMsg.set('');
    const code = Object.values(this.otpForm.value).join('');

    // API path here is phone-based; for email flow we still pass phoneNumber
    // (the back-end accepts it), but skip the call if there's literally no
    // contact stored.
    const phoneNumber = this.phoneNumber || this.resetEmail;

    this.authService.verifyOtp({ phoneNumber, code }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        // Persist any reset token the server returned so /resetpassword can use it.
        const token = (res as ResetCodeResponse)?.token
                   || (res as ResetCodeResponse)?.resetToken
                   || code; // fall back to the code itself if API doesn't issue a token
        localStorage.setItem('resetToken', token);
        this.router.navigate(['/resetpassword']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.errorMsg.set(this.extractError(err));
        setTimeout(() => this.errorMsg.set(''), 5000);
      }
    });
  }

  resendCode(): void {
    if (this.resendCooldown() > 0 || !this.phoneNumber) return;
    this.authService.resendResetCode({ phoneNumber: this.phoneNumber }).subscribe({
      next: () => this.startCooldown(60),
      error: () => this.startCooldown(20)
    });
  }

  private startCooldown(seconds: number): void {
    this.resendCooldown.set(seconds);
    const tick = () => {
      const v = this.resendCooldown();
      if (v <= 0) return;
      this.resendCooldown.set(v - 1);
      setTimeout(tick, 1000);
    };
    setTimeout(tick, 1000);
  }

  private extractError(err: HttpErrorResponse): string {
    if (err.status === 0)   return 'Network error.';
    if (err.status === 400) return 'Invalid or expired code.';
    if (err.status === 404) return 'No account found for this contact.';
    return err.error?.detail || 'Could not verify code. Try again.';
  }

  goBack(): void { this.location.back(); }

  moveFocus(event: Event, next?: HTMLInputElement | null, prev?: HTMLInputElement | null): void {
    const target = event.target as HTMLInputElement | null;
    if (!target) return;
    if (target.value && next) next.focus();
    const ke = event as KeyboardEvent;
    if (ke.key === 'Backspace' && !target.value && prev) prev.focus();
  }
}
