import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';

interface Plan {
  id: 'm6' | 'y1';
  title: string;
  caption: string;
  price: number;
  badge?: string;
  saving?: number;
}

@Component({
  selector: 'app-renew-membership',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './renew-membership.component.html',
  styleUrls: ['./renew-membership.component.scss']
})
export class RenewMembershipComponent {
  private router = inject(Router);
  private location = inject(Location);

  /** Mock — will come from the user profile / membership endpoint. */
  expiryDate = '25 Dec 2024';

  plans: Plan[] = [
    { id: 'm6', title: '6 Months', caption: 'Best for short-term commitment', price: 1200 },
    { id: 'y1', title: '1 Year',  caption: 'Save more with yearly plan',     price: 2000, badge: 'BEST VALUE', saving: 400 }
  ];

  selectedId: Plan['id'] = 'y1';

  select(p: Plan) { this.selectedId = p.id; }

  get selected(): Plan { return this.plans.find(p => p.id === this.selectedId)!; }

  goBack() { this.location.back(); }

  continue() {
    const p = this.selected;
    this.router.navigate(['/blank-layout/membership-payment'], {
      queryParams: {
        planId: p.id,
        planTitle: p.title,
        planCaption: 'Full Club Access',
        price: p.price,
        currency: 'EGP'
      }
    });
  }
}
