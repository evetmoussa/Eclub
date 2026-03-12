import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  private router = inject(Router);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private location = inject(Location);

  isLoading: boolean = false;
  msgError: string = "";

  loginForm: FormGroup = this.fb.group({
    memberId: [null, [
      Validators.required,
      Validators.minLength(3)
    ]],
    sequence: [null, [
      Validators.required
    ]],
    password: [null, [
      Validators.required,
      Validators.pattern(/^\w{6,}$/)
    ]]
  });

  loginSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.isLoading = false;
          this.msgError = err.error.message || "Login failed";
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  goBack(){
this.location.back();
}
}