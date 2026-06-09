// pager.component.ts — reusable pagination control for admin list pages.
//
// Usage:
//   <app-pager [page]="page()" [totalPages]="totalPages()" (pageChange)="page.set($event)" />
//
// Purely presentational: it owns no state, just renders buttons and emits the
// requested page. The host keeps the `page` signal and slices its own list.

import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pager',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pager.component.html',
  styleUrl: './pager.component.scss'
})
export class PagerComponent {
  private _page = signal(1);
  private _total = signal(1);

  @Input() set page(v: number) { this._page.set(v || 1); }
  @Input() set totalPages(v: number) { this._total.set(Math.max(1, v || 1)); }

  @Output() pageChange = new EventEmitter<number>();

  readonly current = computed(() => Math.min(this._page(), this._total()));
  readonly total = computed(() => this._total());
  readonly pages = computed<number[]>(() =>
    Array.from({ length: this._total() }, (_, i) => i + 1)
  );

  go(p: number): void {
    const next = Math.min(Math.max(1, p), this._total());
    if (next !== this.current()) this.pageChange.emit(next);
  }
  prev(): void { this.go(this.current() - 1); }
  next(): void { this.go(this.current() + 1); }
}
