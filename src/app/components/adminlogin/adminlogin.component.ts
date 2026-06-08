// adminlogin.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Location, NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-adminlogin',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, RouterLink],
  templateUrl: './adminlogin.component.html',
  styleUrls: ['./adminlogin.component.scss']
})
export class AdminloginComponent implements OnInit {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private location = inject(Location);

  isLoading = false;
  msgError = '';
  showPassword = false;
  passwordStrength = 0;

  adminLoginForm: FormGroup = this.fb.group({
    email: [null, [Validators.required, Validators.email]],
    password: [null, [
      Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    ]],
   
  });

  ngOnInit(): void {
    // Already-authenticated admins skip the form and go straight to the dashboard.
    if (this.authService.isAdminLoggedIn()) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  hasLength(): boolean {
    const password = this.adminLoginForm.get('password')?.value || '';
    return password.length >= 8;
  }

  hasNumberOrSpecial(): boolean {
    const password = this.adminLoginForm.get('password')?.value || '';
    return /[0-9@$!%*?&]/.test(password);
  }

  hasUpperAndLower(): boolean {
    const password = this.adminLoginForm.get('password')?.value || '';
    return /[A-Z]/.test(password) && /[a-z]/.test(password);
  }

  checkPasswordStrength(): void {
    let strength = 0;
    if (this.hasLength())          strength++;
    if (this.hasNumberOrSpecial()) strength++;
    if (this.hasUpperAndLower())   strength++;
    this.passwordStrength = Math.min(strength, 3);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  loginSubmit(): void {
    if (!this.adminLoginForm.valid) {
      this.adminLoginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.msgError = '';

    const loginData = {
      email:    this.adminLoginForm.get('email')?.value?.toString().trim().toLowerCase(),
      password: this.adminLoginForm.get('password')?.value,
    
      isAdmin:  true
    };

    this.authService.adminLogin(loginData).subscribe({
      next: () => {
        this.isLoading = false;
        // Admins land in the dedicated admin shell, never the member home.
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.msgError = this.extractError(err);
        setTimeout(() => (this.msgError = ''), 5000);
      }
    });
  }

  private extractError(err: HttpErrorResponse): string {
    if (err.status === 0)   return 'Network error - check your internet connection.';
    if (err.status === 401) return 'Invalid email, password, or club code.';
    if (err.status === 404) return 'Admin account not found.';
    return err.error?.message || err.error?.title || 'Login failed. Please try again.';
  }

  goBack(): void {
    this.location.back();
  }
}
