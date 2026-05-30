import { Routes } from '@angular/router';

import { AdminloginComponent } from './components/adminlogin/adminlogin.component';
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
import { BookingComponent } from './components/booking/booking.component';
import { DevLoginComponent } from './components/dev-login/dev-login.component';
import { AcademyDetailsComponent } from './components/academy-details/academy-details.component';
import { BookingSummaryComponent } from './components/booking-summary/booking-summary.component';
import { BookingConfirmedComponent } from './components/booking-confirmed/booking-confirmed.component';
import { RenewMembershipComponent } from './components/renew-membership/renew-membership.component';
import { MembershipPaymentComponent } from './components/membership-payment/membership-payment.component';
import { MembershipSuccessComponent } from './components/membership-success/membership-success.component';
import { ChatAssistantComponent } from './components/chat-assistant/chat-assistant.component';
import { EventsListComponent } from './components/events-list/events-list.component';
import { EmailConfirmationComponent } from './components/email-confirmation/email-confirmation.component';
import { TrainerProfileComponent } from './components/trainer-profile/trainer-profile.component';
import { CoachApplyComponent } from './components/coach-apply/coach-apply.component';

// ----- Admin -----
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AdminAcademiesComponent } from './components/admin-academies/admin-academies.component';
import { AdminTrainersComponent } from './components/admin-trainers/admin-trainers.component';
import { AdminMembersComponent } from './components/admin-members/admin-members.component';
import { AdminOffersComponent } from './components/admin-offers/admin-offers.component';
import { AdminRequestsComponent } from './components/admin-requests/admin-requests.component';

// ----- Coach -----
import { CoachLayoutComponent } from './layout/coach-layout/coach-layout.component';
import { CoachDashboardComponent } from './components/coach-dashboard/coach-dashboard.component';
import { CoachClassesComponent } from './components/coach-classes/coach-classes.component';
import { CoachScheduleComponent } from './components/coach-schedule/coach-schedule.component';
import { CoachProfileComponent } from './components/coach-profile/coach-profile.component';

export const routes: Routes = [
  { path: '',                component: SplashComponent,         title: 'Eclub' },
  { path: 'authlayout',      component: AuthLayoutComponent,     title: 'Welcome' },

  { path: 'register',        component: RegisterComponent,       title: 'Register' },
  { path: 'login',           component: LoginComponent,          title: 'Member Login' },
  { path: 'admin-login',     component: AdminloginComponent,     title: 'Admin Login' },
  { path: 'forget-password', component: ForgetPasswordComponent, title: 'Forgot Password' },
  { path: 'otpverification', component: OtpVerificationComponent,title: 'OTP Verification' },
  { path: 'resetpassword',   component: ResetPasswordComponent,  title: 'Reset Password' },
  { path: 'email-confirm',   component: EmailConfirmationComponent, title: 'Confirm Email' },
  { path: 'coach-apply',    component: CoachApplyComponent,        title: 'Apply to Coach' },

  { path: 'dev-login',       component: DevLoginComponent,       title: 'Dev Token Loader' },

  {
    path: 'blank-layout',
    component: BlankLayoutComponent,
    children: [
      { path: '',     redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent, title: 'Home' },

      { path: 'sports',                   component: SportsComponent,           title: 'Academies' },
      { path: 'academy/:id',              component: AcademyDetailsComponent,   title: 'Academy' },
      { path: 'trainer/:id',              component: TrainerProfileComponent,   title: 'Trainer' },
      { path: 'booking-summary/:classId', component: BookingSummaryComponent,   title: 'Booking Summary' },
      { path: 'booking-confirmed',        component: BookingConfirmedComponent, title: 'Booking Confirmed' },

      { path: 'events', component: EventsListComponent, title: 'Events' },

      { path: 'renew-membership',    component: RenewMembershipComponent,   title: 'Renew Membership' },
      { path: 'membership-payment',  component: MembershipPaymentComponent, title: 'Payment Method' },
      { path: 'membership-success',  component: MembershipSuccessComponent, title: 'Payment Successful' },

      { path: 'assistant',     component: ChatAssistantComponent,     title: 'Smart Sports Assistant' },
      { path: 'notification',  component: NotificationsComponent,     title: 'Notifications' },
      { path: 'profile',       component: ProfileComponent,           title: 'Profile' },
      { path: 'booking',       component: BookingComponent,           title: 'My Bookings' }
    ]
  },

  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: '',           redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',  component: AdminDashboardComponent, title: 'Admin Dashboard' },
      { path: 'academies',  component: AdminAcademiesComponent, title: 'Admin Academies' },
      { path: 'trainers',   component: AdminTrainersComponent,  title: 'Admin Trainers'  },
      { path: 'members',    component: AdminMembersComponent,   title: 'Admin Members'   },
      { path: 'offers',     component: AdminOffersComponent,    title: 'Admin Offers'    },
      { path: 'requests',   component: AdminRequestsComponent,  title: 'Admin Requests'  },
      { path: 'settings',   component: AdminDashboardComponent, title: 'Admin Settings'  },
      { path: 'support',    component: AdminDashboardComponent, title: 'Admin Support'   }
    ]
  },

  {
    path: 'coach',
    component: CoachLayoutComponent,
    children: [
      { path: '',          redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: CoachDashboardComponent, title: 'Coach Dashboard' },
      { path: 'classes',   component: CoachClassesComponent,   title: 'My Classes' },
      { path: 'schedule',  component: CoachScheduleComponent,  title: 'My Schedule' },
      { path: 'profile',   component: CoachProfileComponent,   title: 'Coach Profile' },
      { path: 'notifications', component: CoachDashboardComponent, title: 'Notifications' }
    ]
  },

  { path: '**', component: NotfoundComponent, title: 'Page not found' }
];
