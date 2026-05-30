import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoachMockService } from '../../core/services/coach/coach-mock.service';
import { Coach, CoachUpdateRequest } from '../../core/models/coach.model';
import { CoachReview } from '../../core/models/coach/coach-workspace.models';
import { CoachesService } from '../../core/services/coaches.service';

@Component({
  selector: 'app-coach-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './coach-profile.component.html',
  styleUrl: './coach-profile.component.scss'
})
export class CoachProfileComponent implements OnInit {
  private mock = inject(CoachMockService);
  private api = inject(CoachesService);

  me = signal<Coach | null>(null);
  reviews = signal<CoachReview[]>([]);

  /** Editable form state — separate signals so we can detect dirty state cheaply. */
  fullName = signal('');
  specialization = signal('');
  bio = signal('');
  experienceYears = signal(0);
  phoneNumber = signal('');
  email = signal('');
  imageUrl = signal('');

  saving = signal(false);
  saved = signal(false);
  errorMsg = signal('');

  readonly initials = computed(() => {
    const n = this.fullName() || this.me()?.fullName || 'Coach';
    return n.split(/\s+/).slice(0, 2).map(s => s.charAt(0).toUpperCase()).join('') || 'C';
  });

  readonly avgRating = computed(() => {
    const list = this.reviews();
    if (!list.length) return this.me()?.rating ?? 0;
    return +(list.reduce((s, r) => s + r.rating, 0) / list.length).toFixed(1);
  });

  ngOnInit(): void {
    this.mock.getMyProfile().subscribe(c => {
      this.me.set(c);
      this.fullName.set(c.fullName);
      this.specialization.set(c.specialization);
      this.bio.set(c.bio ?? '');
      this.experienceYears.set(c.experienceYears);
      this.phoneNumber.set(c.phoneNumber ?? '');
      this.email.set(c.email ?? '');
      this.imageUrl.set(c.imageUrl ?? '');
    });
    this.mock.getReviews().subscribe(v => this.reviews.set(v));
  }

  save(): void {
    const id = this.me()?.id;
    if (!id) return;
    this.saving.set(true);
    this.errorMsg.set('');
    const payload: CoachUpdateRequest = {
      fullName:        this.fullName(),
      specialization:  this.specialization(),
      bio:             this.bio() || null,
      experienceYears: Number(this.experienceYears() || 0),
      phoneNumber:     this.phoneNumber() || null,
      email:           this.email() || null,
      imageUrl:        this.imageUrl() || null
    };
    this.api.update(id, payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 2500);
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMsg.set(err?.error?.detail || 'Could not save changes.');
        setTimeout(() => this.errorMsg.set(''), 4000);
      }
    });
  }

  onPickPhoto(evt: Event): void {
    const file = (evt.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.imageUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }
}
