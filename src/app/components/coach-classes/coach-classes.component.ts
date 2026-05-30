import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CoachMockService } from '../../core/services/coach/coach-mock.service';
import {
  CoachClassSummary, CoachStudent
} from '../../core/models/coach/coach-workspace.models';

type Tab = 'All' | 'Today' | 'Upcoming' | 'Completed';

@Component({
  selector: 'app-coach-classes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './coach-classes.component.html',
  styleUrl: './coach-classes.component.scss'
})
export class CoachClassesComponent implements OnInit {
  private mock = inject(CoachMockService);
  private route = inject(ActivatedRoute);

  classes = signal<CoachClassSummary[]>([]);
  selectedId = signal<number | null>(null);
  tab = signal<Tab>('All');
  query = signal('');

  roster = signal<CoachStudent[]>([]);
  /** Map of studentId → present */
  attendance = signal<Record<number, boolean>>({});
  saving = signal(false);
  toast = signal('');

  readonly selected = computed<CoachClassSummary | null>(() => {
    const id = this.selectedId();
    return this.classes().find(c => c.id === id) ?? null;
  });

  readonly filtered = computed<CoachClassSummary[]>(() => {
    const q = this.query().toLowerCase().trim();
    const todayIso = new Date().toISOString().slice(0, 10);
    return this.classes()
      .filter(c => {
        if (this.tab() === 'Today')     return c.date === todayIso;
        if (this.tab() === 'Upcoming')  return c.status === 'Upcoming';
        if (this.tab() === 'Completed') return c.status === 'Completed';
        return true;
      })
      .filter(c => q === '' || c.title.toLowerCase().includes(q));
  });

  ngOnInit(): void {
    this.mock.getMyClasses().subscribe(list => {
      this.classes.set(list);
      // Auto-select the class from query param ?id=... or the first one.
      const fromQuery = Number(this.route.snapshot.queryParamMap.get('id'));
      const initial = list.find(c => c.id === fromQuery) || list[0];
      if (initial) this.selectClass(initial);
    });
  }

  selectClass(c: CoachClassSummary): void {
    this.selectedId.set(c.id);
    this.mock.getRoster(c.id).subscribe(students => {
      this.roster.set(students);
      // Default everyone marked absent.
      const att: Record<number, boolean> = {};
      students.forEach(s => att[s.id] = false);
      this.attendance.set(att);
    });
  }

  togglePresent(studentId: number): void {
    this.attendance.update(a => ({ ...a, [studentId]: !a[studentId] }));
  }

  markAllPresent(): void {
    const all: Record<number, boolean> = {};
    this.roster().forEach(s => all[s.id] = true);
    this.attendance.set(all);
  }

  saveAttendance(): void {
    const sel = this.selected();
    if (!sel) return;
    this.saving.set(true);
    const att = this.attendance();
    this.mock.saveAttendance({
      classId: sel.id,
      date: sel.date,
      roster: Object.keys(att).map(k => ({
        studentId: Number(k),
        present: att[Number(k)]
      }))
    }).subscribe(() => {
      this.saving.set(false);
      this.toast.set('Attendance saved.');
      setTimeout(() => this.toast.set(''), 2500);
    });
  }

  presentCount(): number {
    return Object.values(this.attendance()).filter(v => v).length;
  }
}
