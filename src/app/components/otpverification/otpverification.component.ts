import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { Location } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor,RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './otpverification.component.html',
  styleUrl: './otpverification.component.scss'
})
export class OtpVerificationComponent {

private fb = inject(FormBuilder);
private location = inject(Location);
private authService = inject(AuthService);
private router = inject(Router);


isLoading = false;

otpForm: FormGroup = this.fb.group({
digit1:['',[Validators.required]],
digit2:['',[Validators.required]],
digit3:['',[Validators.required]],
digit4:['',[Validators.required]],
digit5:['',[Validators.required]],
digit6:['',[Validators.required]],
});

verifyOtp() {

  if(this.otpForm.valid) {

    this.isLoading = true;

    const otp = Object.values(this.otpForm.value).join('');
    const data = { otp: otp };

    this.authService.verifyOtp(data).subscribe({

      next: (res) => {
        this.isLoading = false;
        console.log(res);
        this.router.navigate(['/resetpassword']);
      },

      error: (err) => {
        this.isLoading = false;
        console.log(err);

        // مؤقتاً خليها تروح للصفحة حتى لو الـ API فشل
        this.router.navigate(['/resetpassword']);
      }

    });

  } else {
    this.otpForm.markAllAsTouched();
  }

}
goBack(){
this.location.back();
}

// تحريك المؤشر تلقائي
moveFocus(
  event:any,
  next?: HTMLInputElement | null,
  prev?: HTMLInputElement | null
){

if(event.target.value && next){
next.focus();
}

if(event.key === "Backspace" && !event.target.value && prev){
prev.focus();
}

}

goToReset() {
  // هنا ممكن تمرري state لو حابة تعرضي contact مثلاً
  this.router.navigate(['/resetpassword']);
}


}