import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  

  private baseUrl = 'API_URL';

  private http = inject(HttpClient);

  constructor() {}

  register(data:object):Observable<any>{

    // هنا هنحط API لما يتحدد
    return this.http.post('API_URL/register', data);

  }


  login(data:object):Observable<any>{
  return this.http.post('API_URL/login', data);
}

// ⭐ forget password
  forgetPassword(data:object):Observable<any>{
    return this.http.post(`${this.baseUrl}/forget-password`, data);
  }

    verifyOtp(data:any){
    return this.http.post('API_URL/verify-otp',data);
     }

  resetPassword(data:any){
    return this.http.post('API_URL/reset-password',data);
      }

}

