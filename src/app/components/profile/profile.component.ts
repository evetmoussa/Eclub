import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AccountService, AccountProfile, UpdateProfileRequest } from '../../core/services/account.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private router = inject(Router);
  private account = inject(AccountService);
  private auth = inject(AuthService);

  fullName = '';
  avatarUrl: string | null = null;
  email = '';
  isLoading = false;

  /** Full profile detail shown in the info card. */
  profile: AccountProfile | null = null;

  // Edit form state
  editing = false;
  isSaving = false;
  saveError = '';
  saveOk = '';
  form: { firstName: string; lastName: string; email: string; phoneNumber: string; imageUrl: string; bio: string } = {
    firstName: '', lastName: '', email: '', phoneNumber: '', imageUrl: '', bio: ''
  };

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
        this.profile = p;
        const joined = ((p.firstName ?? '') + ' ' + (p.lastName ?? '')).trim();
        this.fullName = p.fullName || joined || p.userName || '';
        this.email = p.email || '';
        // API returns the photo as imageUrl; avatarUrl is the client alias.
        this.avatarUrl = p.avatarUrl ?? p.imageUrl ?? null;
      });
  }

  openEdit(): void {
    const p = this.profile;
    this.form = {
      firstName: p?.firstName ?? '',
      lastName:  p?.lastName ?? '',
      email:     p?.email ?? this.email,
      phoneNumber: p?.phoneNumber ?? '',
      imageUrl:  p?.imageUrl ?? this.avatarUrl ?? '',
      bio:       p?.bio ?? ''
    };
    this.saveError = '';
    this.saveOk = '';
    this.editing = true;
  }

  cancelEdit(): void { this.editing = false; }

  save(): void {
    if (!this.form.firstName.trim() || !this.form.lastName.trim() || !this.form.email.trim()) {
      this.saveError = 'First name, last name and email are required.';
      return;
    }
    this.isSaving = true;
    this.saveError = '';
    const payload: UpdateProfileRequest = {
      firstName: this.form.firstName.trim(),
      lastName:  this.form.lastName.trim(),
      email:     this.form.email.trim(),
      phoneNumber: this.form.phoneNumber.trim() || null,
      imageUrl:  this.form.imageUrl.trim() || null,
      bio:       this.form.bio.trim() || null
    };
    this.account.updateProfile(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.editing = false;
        this.saveOk = 'Profile updated.';
        setTimeout(() => (this.saveOk = ''), 3000);
        this.load();   // refresh from the API so the page reflects the saved values
      },
      error: (err) => {
        this.isSaving = false;
        this.saveError = err?.error?.detail || err?.error?.title || 'Could not update profile.';
      }
    });
  }

  go(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    this.auth.logout();
  }
}
