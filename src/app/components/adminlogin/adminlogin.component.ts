import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Location } from '@angular/common';

@Component({
  selector: 'app-adminlogin',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './adminlogin.component.html',
  styleUrl: './adminlogin.component.scss'
})
export class AdminloginComponent {

  // injections
  private fb = inject(FormBuilder);
  private _AuthService = inject(AuthService);
  private _Router = inject(Router);
   private location = inject(Location);

  // states
  isLoading:boolean = false;
  msgError:string = "";

  // password UI
  showPassword:boolean = false;
  passwordStrength:number = 0;
  hasLength:boolean = false;
  hasNumber:boolean = false;

  // form
  adminLoginForm:FormGroup = this.fb.group({

    email:[
      null,
      [
        Validators.required,
        Validators.email
      ]
    ],

    password:[
      null,
      [
        Validators.required,
        Validators.pattern(/^.{6,}$/)
      ]
    ],

    clubCode:[
      null,
      [
        Validators.required
      ]
    ]

  });

  // show / hide password
  togglePassword():void{
    this.showPassword = !this.showPassword;
  }

  // password strength check
  checkPasswordStrength():void{

    const password = this.adminLoginForm.get('password')?.value || "";

    this.hasLength = password.length >= 8;

    this.hasNumber = /[0-9!@#$%^&*]/.test(password);

    this.passwordStrength = 0;

    if(this.hasLength) this.passwordStrength++;

    if(this.hasNumber) this.passwordStrength++;

    if(password.length > 10) this.passwordStrength++;

  }

  // submit
 loginSubmit():void{

if(this.adminLoginForm.valid){

  this.isLoading = true;
  this.msgError = "";

  this._AuthService.login(this.adminLoginForm.value).subscribe({

    next:(res)=>{

      this.isLoading = false;

      // لو فيه token
      if(res.token){
        localStorage.setItem("adminToken",res.token);
      }

      this._Router.navigate(['/dashboard']);

    },

    error:(err:HttpErrorResponse)=>{

      this.isLoading = false;

      this.msgError = err.error?.message || "Login failed";

    }

  });

}
else{

  this.adminLoginForm.markAllAsTouched();

}

}
  goToForget():void{
  this._Router.navigate(['/forget-password']);
}

  goBack(){
this.location.back();
}

}