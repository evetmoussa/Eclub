import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Location, NgClass } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private location = inject(Location);

  isLoading = false;
  msgError = '';
  msgSuccess = false;
  showPassword = false;

  registerForm: FormGroup = this.fb.group({
    name:       [null, [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    email:      [null, [Validators.required, Validators.email]],
    phone:      [null, [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
    idNumber:   [null, [Validators.required, Validators.pattern(/^\d{14}$/)]],
    password:   [null, [
      Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    ]],
    rePassword: [null, [Validators.required]],
    isAdmin:    [false]
  }, { validators: this.confirmPassword });

  registerSubmit(): void {
    if (!this.registerForm.valid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.msgError = '';
    this.msgSuccess = false;

    const isAdmin = !!this.registerForm.get('isAdmin')?.value;

    // Match swagger schema: { fullName, email, password, phoneNumber, nationalId, isAdmin }
    const requestBody = {
      fullName:    this.registerForm.get('name')?.value?.trim(),
      email:       this.registerForm.get('email')?.value?.toString().trim().toLowerCase(),
      password:    this.registerForm.get('password')?.value,
      phoneNumber: this.registerForm.get('phone')?.value,
      nationalId:  this.registerForm.get('idNumber')?.value,
      isAdmin
    };

    this.authService.register(requestBody).subscribe({
      next: () => {
        this.isLoading = false;
        this.msgSuccess = true;
        localStorage.setItem('userType', isAdmin ? 'admin' : 'member');
        // Admins typically don't need email confirmation flow — send them straight to login.
        // Members get bounced to the dedicated "check your inbox" page with their email pre-filled.
        if (isAdmin) {
          setTimeout(() => this.router.navigate(['/admin-login']), 1500);
        } else {
          localStorage.setItem('pendingConfirmEmail', requestBody.email);
          setTimeout(() => {
            this.router.navigate(['/email-confirm'], {
              queryParams: { email: requestBody.email }
            });
          }, 1200);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.msgError = this.extractError(err);
        setTimeout(() => (this.msgError = ''), 6000);
      }
    });
  }

  private extractError(err: HttpErrorResponse): string {
    if (err.status === 0)   return 'Network error - check your internet connection.';
    if (err.status === 400) {
      if (err.error?.errors) {
        const first = (Object.values(err.error.errors).flat() as string[])[0];
        if (first) return first;
      }
      return err.error?.message || err.error?.title || 'Invalid registration data.';
    }
    if (err.status === 409) return 'This email is already registered.';
    return err.error?.message || err.error?.title || 'Registration failed. Please try again.';
  }

  getPasswordStrength(): number {
    const password = this.registerForm.get('password')?.value || '';
    let strength = 0;
    if (password.length >= 8)         strength += 25;
    if (/[a-z]/.test(password))       strength += 25;
    if (/[A-Z]/.test(password))       strength += 25;
    if (/[0-9]/.test(password))       strength += 25;
    if (/[@$!%*?&]/.test(password))   strength += 25;
    return Math.min(strength, 100);
  }

  getPasswordColor(): string {
    const s = this.getPasswordStrength();
    if (s < 40) return '#ef4444';
    if (s < 70) return '#f59e0b';
    return '#22c55e';
  }

  getStrengthText(): string {
    const s = this.getPasswordStrength();
    if (s < 40) return 'Weak';
    if (s < 70) return 'Medium';
    return 'Strong';
  }

  confirmPassword(g: AbstractControl) {
    return g.get('password')?.value === g.get('rePassword')?.value
      ? null
      : { mismatch: true };
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  goBack(): void {
    this.location.back();
  }
}
