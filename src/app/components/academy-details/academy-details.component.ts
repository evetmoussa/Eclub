import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

interface Coach   { id: number; name: string; avatar?: string; rating?: number; reviews?: number; }
interface Slot    { id: number; label: string; startTime: string; endTime: string; capacity: number; max: number; }
interface DateChip{ key: string; day: number; month: string; weekday: string; }

/**
 * Academy details — pick a coach + a date + a session slot, then go to
 * booking summary. Mock data lives here for now; once the API endpoint
 * is wired we just swap the mocks for the real fetch.
 */
@Component({
  selector: 'app-academy-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './academy-details.component.html',
  styleUrls: ['./academy-details.component.scss']
})
export class AcademyDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);

  academyId!: number;
  academyName = 'Football Academy';
  sportName = 'Football';

  coaches: Coach[] = [
    { id: 1, name: 'Marco Silva',  rating: 4.9, reviews: 86 },
    { id: 2, name: 'Layla Hassan', rating: 5.0, reviews: 124 }
  ];
  selectedCoachId = 2;

  dates: DateChip[] = [];
  selectedDate = '';

  slots: Slot[] = [
    { id: 1, label: 'Session 1', startTime: '9:00 AM',  endTime: '10:00 AM', capacity: 1,  max: 20 },
    { id: 2, label: 'Session 2', startTime: '10:00 AM', endTime: '11:00 AM', capacity: 20, max: 20 },
    { id: 3, label: 'Session 3', startTime: '11:00 AM', endTime: '12:00 PM', capacity: 8,  max: 20 },
    { id: 4, label: 'Session 4', startTime: '5:00 PM',  endTime: '6:00 PM',  capacity: 4,  max: 20 }
  ];

  ngOnInit(): void {
    this.academyId = Number(this.route.snapshot.paramMap.get('id') ?? 1);

    const qp = this.route.snapshot.queryParamMap;
    this.academyName = qp.get('name') || (this.academyId === 2 ? 'Tennis Academy' : 'Football Academy');
    this.sportName   = qp.get('sport') || (this.academyId === 2 ? 'Tennis' : 'Football');

    const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    const weekdays = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
    const today = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      this.dates.push({
        key: d.toISOString().slice(0, 10),
        day: d.getDate(),
        month: months[d.getMonth()],
        weekday: weekdays[d.getDay()]
      });
    }
    this.selectedDate = this.dates[1]?.key || this.dates[0].key;
  }

  selectCoach(id: number) { this.selectedCoachId = id; }
  selectDate(k: string)   { this.selectedDate = k; }

  isFull(s: Slot) { return s.capacity >= s.max; }

  bookNow(s: Slot) {
    if (this.isFull(s)) return;
    const coach = this.coaches.find(c => c.id === this.selectedCoachId);
    this.router.navigate(['/blank-layout/booking-summary', s.id], {
      queryParams: {
        academyId:   this.academyId,
        academyName: this.academyName,
        sport:       this.sportName,
        coachName:   coach?.name,
        coachId:     this.selectedCoachId,
        date:        this.selectedDate,
        startTime:   s.startTime,
        endTime:     s.endTime,
        sessionLabel: s.label
      }
    });
  }

  goBack() { this.location.back(); }
}
