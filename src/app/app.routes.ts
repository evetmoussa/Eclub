import { AdminloginComponent } from './components/adminlogin/adminlogin.component';
import { Routes } from '@angular/router';
import { SplashComponent } from './components/splash/splash.component';
import { NotfoundComponent } from './components/notfound/notfound.component';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { ForgetPasswordComponent } from './components/forgetpassword/forgetpassword.component';
import { OtpVerificationComponent } from './components/otpverification/otpverification.component';
import { ResetPasswordComponent } from './components/resetpassword/resetpassword.component';
import { HomeComponent } from './components/home/home.component';
import { SportsComponent } from './components/sports/sports.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { ProfileComponent } from './components/profile/profile.component';
import { BlankLayoutComponent } from './layout/blank-layout/blank-layout.component';



//import { LoginComponent } from './pages/login/login.component';

export const routes: Routes = [

  { path: '', component: SplashComponent },

  { path: 'authlayout', component: AuthLayoutComponent },

  { path: 'register', component: RegisterComponent },

  { path: 'login', component: LoginComponent },

  { path: 'admin-login', component: AdminloginComponent},

   { path: 'forget-password', component: ForgetPasswordComponent },

   { path: 'otpverification', component: OtpVerificationComponent },

    { path: 'resetpassword', component: ResetPasswordComponent },


   { path: 'blank-layout', component:BlankLayoutComponent,
    children:[

     

      { path: 'home', component: HomeComponent },

     { path: 'sports', component: SportsComponent },

     { path: 'notification', component:NotificationsComponent  },

      { path: 'profile', component: ProfileComponent},

   ] },
   
      

   


  { path: 'notfound', component: NotfoundComponent },

  
 
  
];