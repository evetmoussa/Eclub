// footer.component.ts — Global web-sized footer used by BlankLayout.

import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  readonly year = new Date().getFullYear();

  email = signal('');
  status = signal<'' | 'sent' | 'invalid'>('');

  readonly canSubmit = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email().trim()));

  subscribe(): void {
    if (!this.canSubmit()) {
      this.status.set('invalid');
      setTimeout(() => this.status.set(''), 3500);
      return;
    }
    // Backend endpoint can be wired here later — for now we just acknowledge.
    this.status.set('sent');
    this.email.set('');
    setTimeout(() => this.status.set(''), 3500);
  }
}
