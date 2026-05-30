import { Component, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

/** Stored locally in the admin "Requests Inbox" until the API ships. */
export interface CoachApplication {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  specialization: string;
  experienceYears: number;
  bio: string;
  imageUrl?: string;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

const STORAGE_KEY = 'coach.applications';

@Component({
  selector: 'app-coach-apply',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './coach-apply.component.html',
  styleUrl: './coach-apply.component.scss'
})
export class CoachApplyComponent {
  private fb = inject(FormBuilder);
  private location = inject(Location);
  private router = inject(Router);

  isLoading = signal(false);
  submitted = signal(false);
  errorMsg = signal('');

  /** Sports the club offers — quick chips for fast selection. */
  popularSports = ['Football', 'Basketball', 'Tennis', 'Swimming', 'Karate', 'Yoga', 'Boxing', 'Pilates'];

  form: FormGroup = this.fb.group({
    fullName:        [null, [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
    email:           [null, [Validators.required, Validators.email]],
    phoneNumber:     [null, [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
    specialization:  [null, [Validators.required, Validators.maxLength(100)]],
    experienceYears: [0,    [Validators.required, Validators.min(0), Validators.max(50)]],
    bio:             [null, [Validators.required, Validators.minLength(40), Validators.maxLength(1000)]],
    imageUrl:        [null, [Validators.pattern(/^https?:\/\/.+/)]],
    agree:           [false, [Validators.requiredTrue]]
  });

  pickSport(name: string): void {
    this.form.get('specialization')?.setValue(name);
  }

  hasError(key: string): boolean {
    const c = this.form.get(key);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }
  err(key: string): AbstractControl | null { return this.form.get(key); }

  submit(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      this.errorMsg.set('Please fill in all required fields correctly.');
      setTimeout(() => this.errorMsg.set(''), 4000);
      return;
    }

    this.isLoading.set(true);
    const raw = this.form.value;
    const application: CoachApplication = {
      id: Date.now(),
      fullName:        raw.fullName.trim(),
      email:           raw.email.toString().trim().toLowerCase(),
      phoneNumber:     raw.phoneNumber.trim(),
      specialization:  raw.specialization.trim(),
      experienceYears: Number(raw.experienceYears),
      bio:             raw.bio.trim(),
      imageUrl:        raw.imageUrl?.trim() || undefined,
      submittedAt:     new Date().toISOString(),
      status:          'Pending'
    };

    // Persist into the admin "Requests Inbox" queue.
    try {
      const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as CoachApplication[];
      list.unshift(application);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Could not persist application', e);
    }

    // Simulate small network latency for nicer UX.
    setTimeout(() => {
      this.isLoading.set(false);
      this.submitted.set(true);
    }, 500);
  }

  goBack(): void { this.location.back(); }
  goLogin(): void { this.router.navigate(['/login']); }
}
