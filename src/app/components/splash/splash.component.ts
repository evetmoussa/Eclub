import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-splash',
  standalone: true,
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss']
})
export class SplashComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);

  progress = 0;
  private interval?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.interval = setInterval(() => {
      this.progress += 4;
      if (this.progress >= 100) {
        this.clear();
        this.navigateNext();
      }
    }, 120);
  }

  ngOnDestroy(): void {
    this.clear();
  }

  private clear(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }

  private navigateNext(): void {
    if (this.authService.isAdminLoggedIn()) {
      this.router.navigate(['/admin/dashboard']);
    } else if (this.authService.isMemberLoggedIn()) {
      this.router.navigate(['/blank-layout/home']);
    } else {
      this.router.navigate(['/authlayout']);
    }
  }
}
