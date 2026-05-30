import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './forgetpassword.component.html',
  styleUrl: './forgetpassword.component.scss'
})
export class ForgetPasswordComponent {
  private fb = inject(FormBuilder);
  private location = inject(Location);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = false;
  msgError = '';
  msgSuccess = '';

  forgetForm: FormGroup = this.fb.group({
    contact: [null, [Validators.required, this.contactValidator]]
  });

  /** Allow only well-formed email OR Egyptian phone (01[0125]xxxxxxxx). */
  private contactValidator(ctrl: { value: string | null }) {
    const v = (ctrl.value ?? '').toString().trim();
    if (!v) return null;
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    const isPhone = /^01[0125][0-9]{8}$/.test(v);
    return (isEmail || isPhone) ? null : { format: true };
  }

  sendCode(): void {
    if (!this.forgetForm.valid) {
      this.forgetForm.markAllAsTouched();
      this.msgError = 'Please enter a valid email or Egyptian phone (01x xxxx xxxx).';
      setTimeout(() => (this.msgError = ''), 5000);
      return;
    }

    this.isLoading = true;
    this.msgError = '';
    this.msgSuccess = '';

    const contact = (this.forgetForm.get('contact')?.value ?? '').toString().trim();
    const isEmail = /@/.test(contact);

    // API rejects the request if a field is present but malformed, so send
    // ONLY the field that matches what the user actually typed.
    const payload = isEmail
      ? { email: contact.toLowerCase() }
      : { phoneNumber: contact };

    this.authService.forgetPassword(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.msgSuccess = isEmail
          ? 'A reset code was sent to your email.'
          : 'A reset code was sent via SMS.';
        if (isEmail) localStorage.setItem('resetEmail', contact.toLowerCase());
        else         localStorage.setItem('resetPhone', contact);
        setTimeout(() => this.router.navigate(['/otpverification']), 600);
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
    if (err.status === 404) return 'No account found for this email or phone.';
    if (err.status === 400 && err.error?.errors) {
      const first = (Object.values(err.error.errors).flat() as string[])[0];
      if (first) return first;
    }
    return err.error?.detail || err.error?.title || 'Could not send the reset code. Please try again.';
  }

  goBack(): void {
    this.location.back();
  }
}
