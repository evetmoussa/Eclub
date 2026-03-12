import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Location, NgClass } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass,RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './resetpassword.component.html',
  styleUrl: './resetpassword.component.scss'
})
export class ResetPasswordComponent {

private fb = inject(FormBuilder);
private location = inject(Location);
private authService = inject(AuthService);

isLoading = false;
showPassword = false;
showConfirm = false;

resetForm:FormGroup = this.fb.group({

password:[
null,
[Validators.required, Validators.minLength(8)]
],

confirmPassword:[
null,
Validators.required
]

})

resetPassword(){

if(this.resetForm.valid){

this.isLoading = true;

this.authService.resetPassword(this.resetForm.value).subscribe({

next:(res)=>{

this.isLoading = false;
console.log(res);

// هنا ممكن نرجع login بعد النجاح

},

error:(err)=>{

this.isLoading = false;
console.log(err);

}

})

}else{

this.resetForm.markAllAsTouched();

}

}

goBack(){
this.location.back();
}

togglePassword(){
this.showPassword = !this.showPassword;
}

toggleConfirm(){
this.showConfirm = !this.showConfirm;
}

}