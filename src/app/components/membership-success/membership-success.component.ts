import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationsCenterService } from '../../core/services/notifications-center.service';

@Component({
  selector: 'app-membership-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './membership-success.component.html',
  styleUrls: ['./membership-success.component.scss']
})
export class MembershipSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private center = inject(NotificationsCenterService);
  private router = inject(Router);
  private location = inject(Location);

  planTitle = '6 Months';
  method    = 'Mobile Wallet';
  start     = '';
  expiry    = '';

  ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap;
    this.planTitle = q.get('planTitle') || this.planTitle;
    this.method    = q.get('method')    || this.method;
    this.start     = q.get('start')     || new Date().toISOString();
    this.expiry    = q.get('expiry')    || new Date().toISOString();

    this.center.pushLocal({
      title: 'Membership Renewed!',
      body: `Your ${this.planTitle} membership is active. Valid until ${new Date(this.expiry).toLocaleDateString()}.`,
      type: 'Membership',
      icon: 'card_membership',
      iconHue: 'blue'
    });
  }

  goBack() { this.location.back(); }

  goHome() {
    this.router.navigate(['/blank-layout/home']);
  }
}
