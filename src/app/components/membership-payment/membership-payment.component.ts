import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

type PayMethod = 'card' | 'wallet' | 'club';

interface PayOption {
  id: PayMethod;
  title: string;
  caption: string;
  icon: string;
}

@Component({
  selector: 'app-membership-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './membership-payment.component.html',
  styleUrls: ['./membership-payment.component.scss']
})
export class MembershipPaymentComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);

  planId = 'm6';
  planTitle = '6 Months';
  planCaption = 'Full Club Access';
  price = 1200;
  currency = 'EGP';

  options: PayOption[] = [
    { id: 'card',   title: 'Credit / Debit Card', caption: '',                              icon: 'credit_card' },
    { id: 'wallet', title: 'Mobile Wallet',       caption: 'Vodafone Cash, Orange Money',   icon: 'account_balance_wallet' },
    { id: 'club',   title: 'Pay at Club',         caption: 'Complete payment at the club',  icon: 'storefront' }
  ];

  selected: PayMethod = 'card';
  showConfirm = false;

  ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap;
    this.planId      = q.get('planId')      || this.planId;
    this.planTitle   = q.get('planTitle')   || this.planTitle;
    this.planCaption = q.get('planCaption') || this.planCaption;
    this.price       = Number(q.get('price') ?? this.price);
    this.currency    = q.get('currency')    || this.currency;
  }

  get selectedOption(): PayOption {
    return this.options.find(o => o.id === this.selected)!;
  }

  pick(id: PayMethod) { this.selected = id; }
  goBack() { this.location.back(); }

  askConfirm()    { this.showConfirm = true;  }
  cancelConfirm() { this.showConfirm = false; }

  pay() {
    this.showConfirm = false;
    const method = this.selectedOption.title;
    const start = new Date();
    const expiry = new Date(start);
    if (this.planId === 'y1') expiry.setFullYear(expiry.getFullYear() + 1);
    else                      expiry.setMonth(expiry.getMonth() + 6);

    this.router.navigate(['/blank-layout/membership-success'], {
      queryParams: {
        planTitle: this.planTitle,
        method,
        start: start.toISOString(),
        expiry: expiry.toISOString()
      }
    });
  }
}
