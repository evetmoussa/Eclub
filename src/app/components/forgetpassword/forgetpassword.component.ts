import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Location, NgFor } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-forget-password',
  standalone:true,
  imports:[ReactiveFormsModule,RouterLink, RouterLinkActive, RouterOutlet,NgFor],
  templateUrl: './forgetpassword.component.html',
  styleUrl: './forgetpassword.component.scss'
})
export class ForgetPasswordComponent {

private fb = inject(FormBuilder);
private location = inject(Location);
private authService = inject(AuthService);
private router = inject(Router);

isLoading:boolean = false;
msgError:string = "";

forgetForm:FormGroup = this.fb.group({

contact:[
null,
Validators.required
]

});

sendCode(){

if(this.forgetForm.valid){

console.log("go to otp");

this.router.navigate(['/otpverification']);

}else{

this.forgetForm.markAllAsTouched();

}

}

goBack(): void {
  this.location.back();
}

}