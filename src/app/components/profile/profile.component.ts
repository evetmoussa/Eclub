import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AccountService, AccountProfile } from '../../core/services/account.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private router = inject(Router);
  private account = inject(AccountService);
  private auth = inject(AuthService);

  fullName = 'Julian Alvarez';
  avatarUrl: string | null = null;
  email = '';
  isLoading = false;

  get initials(): string {
    return (this.fullName || 'M').split(/\s+/)
      .slice(0, 2)
      .map(s => s.charAt(0).toUpperCase())
      .join('') || 'M';
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.account.getProfile()
      .pipe(catchError(() => of<AccountProfile | null>(null)))
      .subscribe(p => {
        this.isLoading = false;
        if (!p) return;
        const joined = ((p.firstName ?? '') + ' ' + (p.lastName ?? '')).trim();
        this.fullName = p.fullName || joined || this.fullName;
        this.email = p.email || '';
        this.avatarUrl = p.avatarUrl ?? null;
      });
  }

  go(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    this.auth.logout();
  }

  onAvatarPicked(evt: Event): void {
    const input = evt.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.avatarUrl = reader.result as string;
    reader.readAsDataURL(file);
  }
}
