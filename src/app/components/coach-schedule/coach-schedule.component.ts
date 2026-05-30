import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoachMockService } from '../../core/services/coach/coach-mock.service';
import { ScheduleSlot } from '../../core/models/coach/coach-workspace.models';

@Component({
  selector: 'app-coach-schedule',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './coach-schedule.component.html',
  styleUrl: './coach-schedule.component.scss'
})
export class CoachScheduleComponent implements OnInit {
  private mock = inject(CoachMockService);

  slots = signal<ScheduleSlot[]>([]);
  weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  /** Group slots by weekday. */
  readonly byDay = computed<Record<number, ScheduleSlot[]>>(() => {
    const map: Record<number, ScheduleSlot[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    for (const s of this.slots()) map[s.weekday].push(s);
    Object.values(map).forEach(list =>
      list.sort((a, b) => a.startTime.localeCompare(b.startTime))
    );
    return map;
  });

  /** Stats */
  readonly stats = computed(() => {
    const list = this.slots();
    return {
      classes:  list.filter(s => s.state === 'class').length,
      blocked:  list.filter(s => s.state === 'blocked').length,
      free:     list.filter(s => s.state === 'free').length
    };
  });

  ngOnInit(): void {
    this.mock.getSchedule().subscribe(v => this.slots.set(v));
  }

  toggle(slot: ScheduleSlot): void {
    if (slot.state === 'class') return; // Don't toggle existing classes.
    const next = slot.state === 'free' ? 'blocked' : 'free';
    this.mock.toggleSlot(slot.weekday, slot.startTime).subscribe(() => {
      this.slots.update(list =>
        list.map(s => s === slot ? { ...s, state: next } : s)
      );
    });
  }
}
