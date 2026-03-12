import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass,Location } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  private fb = inject(FormBuilder);
private _AuthService = inject(AuthService);
  private _Router = inject(Router);
  private location = inject(Location);

  isLoading:boolean = false;
  msgError:string = "";
  msgSuccess:boolean = false;
registerForm: FormGroup = this.fb.group({
  name: [null, [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(20)
  ]],
  email: [null, [
    Validators.required,
    Validators.email
  ]],
  phone: [null, [
    Validators.required,
    Validators.pattern(/^01[0125][0-9]{8}$/)
  ]],
  idNumber: [null, [     
    Validators.required,
    Validators.pattern(/^(?:[A-Z0-9]{6,9}|\d{14})$/)
  ]],
  password: [null, [
    Validators.required,
    Validators.pattern(/^\w{6,}$/)
  ]],
  rePassword: [null, [
    Validators.required
  ]]
}, { validators: this.confirmPassword });


  registerSubmit():void{

    if(this.registerForm.valid){

      this.isLoading = true;

    //  this._AuthService.register(this.registerForm.value).subscribe({

    //     next:(res:any)=>{

    //       this.isLoading = false;

    //       if(res.message === "success"){

    //         this.msgSuccess = true;

    //         setTimeout(()=>{

    //           this._Router.navigate(['/login']);

    //         },1000)

    //       }

    //     },

    //     error:(err:HttpErrorResponse)=>{

    //       this.isLoading = false;

    //       this.msgError = err.error.message;

    //     }

    //   })

    this._AuthService.register(this.registerForm.value).subscribe({

  next:(res)=>{

    console.log(res);

  },

  error:(err)=>{

    console.log(err);

  }

})

    }

    else{

      this.registerForm.markAllAsTouched();

    }

  }



  confirmPassword(g:AbstractControl){

    if(g.get('password')?.value === g.get('rePassword')?.value){

      return null;

    }

    else{

      return {mismatch:true};

    }

  }
  
goBack(){
this.location.back();
}

}