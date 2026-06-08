// login.component.ts (Member login)
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Location, NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private location = inject(Location);

  isLoading = false;
  msgError = '';

  // Backend LoginRequest accepts: email, membershipId, sequenceNumber, clubCode,
  // password, isAdmin. We collect email + sequenceNumber + password from the user.
  loginForm: FormGroup = this.fb.group({
    email:          [null, [Validators.required, Validators.email]],
   
    password:       [null, [
      Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    ]]
  });

  ngOnInit(): void {
    if (this.authService.isMemberLoggedIn()) {
      const isCoach = localStorage.getItem('userRole') === 'Coach';
      this.router.navigate([isCoach ? '/coach/dashboard' : '/blank-layout/home']);
    }
  }

  loginSubmit(): void {
    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.msgError = '';

    const loginData = {
      email:          this.loginForm.get('email')?.value?.toString().trim().toLowerCase(),
    
      password:       this.loginForm.get('password')?.value,
      isAdmin:        false
    };

    this.authService.login(loginData).subscribe({
      next: (res) => {
        this.isLoading = false;
        const looksLikeCoach =
          /coach|trainer/i.test(res?.email ?? '') ||
          localStorage.getItem('userRole') === 'Coach';
        if (looksLikeCoach) {
          this.router.navigate(['/coach/dashboard']);
        } else {
          this.router.navigate(['/blank-layout/home']);
        }
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
    if (err.status === 401) return 'Invalid email, sequence number, or password.';
    if (err.status === 404) return 'Account not found.';
    return err.error?.message || err.error?.title || 'Login failed. Please try again.';
  }

  goBack(): void {
    this.location.back();
  }
}
