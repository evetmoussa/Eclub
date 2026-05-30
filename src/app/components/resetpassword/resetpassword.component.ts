import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './resetpassword.component.html',
  styleUrl: './resetpassword.component.scss'
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private location = inject(Location);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  showPassword = signal(false);
  showConfirm = signal(false);
  msgError = signal('');
  msgSuccess = signal(false);

  resetForm: FormGroup = this.fb.group({
    password: [null, [
      Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    ]],
    confirmPassword: [null, Validators.required]
  }, { validators: this.matchPasswords });

  private matchPasswords(g: AbstractControl) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  get hasMismatch(): boolean {
    return !!this.resetForm.errors?.['mismatch']
      && !!this.resetForm.get('confirmPassword')?.touched;
  }

  resetPassword(): void {
    if (!this.resetForm.valid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    const token = localStorage.getItem('resetToken') ?? '';
    const email = localStorage.getItem('resetEmail') ?? undefined;
    const phoneNumber = localStorage.getItem('resetPhone') ?? undefined;

    if (!token || (!email && !phoneNumber)) {
      this.msgError.set('Reset session expired. Please start the forgot-password flow again.');
      setTimeout(() => this.router.navigate(['/forget-password']), 2500);
      return;
    }

    this.isLoading.set(true);
    this.msgError.set('');

    const payload = {
      token,
      newPassword: this.resetForm.get('password')?.value as string,
      ...(email ? { email } : {}),
      ...(phoneNumber ? { phoneNumber } : {})
    };

    this.authService.resetPassword(payload as { token: string; newPassword: string; email?: string; phoneNumber?: string }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.msgSuccess.set(true);
        // Clean up the recovery state, then send the user to login.
        ['resetToken', 'resetEmail', 'resetPhone'].forEach(k => localStorage.removeItem(k));
        setTimeout(() => this.router.navigate(['/login']), 1800);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.msgError.set(this.extractError(err));
        setTimeout(() => this.msgError.set(''), 6000);
      }
    });
  }

  private extractError(err: HttpErrorResponse): string {
    if (err.status === 0)   return 'Network error.';
    if (err.status === 400) return err.error?.detail || 'Invalid or expired reset token.';
    if (err.status === 404) return 'Account not found.';
    return err.error?.detail || 'Could not reset password. Try again.';
  }

  goBack(): void { this.location.back(); }
  togglePassword(): void { this.showPassword.set(!this.showPassword()); }
  toggleConfirm(): void { this.showConfirm.set(!this.showConfirm()); }
}
