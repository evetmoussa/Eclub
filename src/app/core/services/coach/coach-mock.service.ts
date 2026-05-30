// coach-mock.service.ts — Returns Observables of mock data for the Coach
// workspace. Replace the bodies with HttpClient calls once the API ships.

import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  CoachKpi, CoachClassSummary, CoachStudent, CoachActivity,
  ScheduleSlot, CoachReview, ClassAttendance
} from '../../models/coach/coach-workspace.models';
import { Coach } from '../../models/coach.model';

@Injectable({ providedIn: 'root' })
export class CoachMockService {
  private readonly LATENCY = 200;

  /** The current signed-in coach (mock self-profile). */
  getMyProfile(): Observable<Coach> {
    return of<Coach>({
      id: 1,
      fullName: 'Marco Silva',
      specialization: 'Football',
      imageUrl: 'https://i.pravatar.cc/300?img=12',
      bio: 'UEFA-licensed football coach with 12 years of experience training youth and adult teams. Focus on technique, conditioning and game-IQ.',
      experienceYears: 12,
      rating: 4.9,
      phoneNumber: '+20 100 111 2233',
      email: 'marco@eclub.com',
      isActive: true
    }).pipe(delay(this.LATENCY));
  }

  /** Dashboard KPIs. */
  getKpis(): Observable<CoachKpi[]> {
    return of<CoachKpi[]>([
      { key: 'today',    label: "TODAY'S CLASSES",  value: '3',    delta: 0,   icon: 'today',          tone: 'green'  },
      { key: 'students', label: 'TOTAL STUDENTS',    value: '184',  delta: 8,   icon: 'group',          tone: 'blue'   },
      { key: 'rating',   label: 'AVG RATING',        value: '4.9',  delta: 2,   icon: 'star',           tone: 'amber'  },
      { key: 'earnings', label: 'MONTH EARNINGS',    value: 'EGP 12.4k', delta: 14, icon: 'payments', tone: 'violet' }
    ]).pipe(delay(this.LATENCY));
  }

  /** Classes assigned to the coach. */
  getMyClasses(): Observable<CoachClassSummary[]> {
    const today = new Date();
    const fmt = (offsetDays: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offsetDays);
      return d.toISOString().slice(0, 10);
    };
    return of<CoachClassSummary[]>([
      { id: 101, title: 'Football Basics — U14',    sport: 'Football', date: fmt(0), startTime: '16:00', endTime: '17:00', location: 'Field A',   enrolled: 18, capacity: 20, status: 'Upcoming'  },
      { id: 102, title: 'Pro Tactics — Adults',     sport: 'Football', date: fmt(0), startTime: '18:00', endTime: '19:30', location: 'Field B',   enrolled: 14, capacity: 16, status: 'Upcoming'  },
      { id: 103, title: 'Goalkeeper Clinic',        sport: 'Football', date: fmt(0), startTime: '20:00', endTime: '21:00', location: 'Field A',   enrolled: 6,  capacity: 8,  status: 'Upcoming'  },
      { id: 104, title: 'Saturday Match Prep',      sport: 'Football', date: fmt(2), startTime: '10:00', endTime: '11:30', location: 'Field C',   enrolled: 22, capacity: 24, status: 'Upcoming'  },
      { id: 105, title: 'Conditioning Session',     sport: 'Football', date: fmt(3), startTime: '17:00', endTime: '18:00', location: 'Gym',       enrolled: 11, capacity: 12, status: 'Upcoming'  },
      { id: 106, title: 'Youth Skills (last week)', sport: 'Football', date: fmt(-7),startTime: '16:00', endTime: '17:00', location: 'Field A',   enrolled: 18, capacity: 20, status: 'Completed' }
    ]).pipe(delay(this.LATENCY));
  }

  /** Students enrolled in a specific class (mock). */
  getRoster(classId: number): Observable<CoachStudent[]> {
    const base: CoachStudent[] = [
      { id: 1, fullName: 'Sarah Williams', email: 'sarah@gmail.com', avatarUrl: 'https://i.pravatar.cc/100?img=20', joinedAt: '2025-11-12' },
      { id: 2, fullName: 'Omar Selim',     email: 'omar@gmail.com',  avatarUrl: 'https://i.pravatar.cc/100?img=22', joinedAt: '2025-09-04' },
      { id: 3, fullName: 'Mariam Adel',    email: 'mariam@yahoo.com',avatarUrl: 'https://i.pravatar.cc/100?img=23', joinedAt: '2024-06-18' },
      { id: 4, fullName: 'Khaled Mostafa', email: 'khaled@gmail.com',avatarUrl: 'https://i.pravatar.cc/100?img=25', joinedAt: '2026-04-29' },
      { id: 5, fullName: 'Yara Nour',      email: 'yara@gmail.com',  avatarUrl: 'https://i.pravatar.cc/100?img=26', joinedAt: '2025-01-22' },
      { id: 6, fullName: 'Hana Magdy',     email: 'hana@gmail.com',  avatarUrl: 'https://i.pravatar.cc/100?img=28', joinedAt: '2025-07-30' }
    ];
    // Slightly different roster size per class.
    const size = Math.max(3, Math.min(6, 3 + (classId % 4)));
    return of(base.slice(0, size)).pipe(delay(this.LATENCY));
  }

  /** Weekly schedule slots — Sunday=0 ... Saturday=6 */
  getSchedule(): Observable<ScheduleSlot[]> {
    return of<ScheduleSlot[]>([
      { weekday: 0, startTime: '16:00', endTime: '17:00', classId: 101, classTitle: 'U14 Basics',    state: 'class'   },
      { weekday: 0, startTime: '18:00', endTime: '19:30', classId: 102, classTitle: 'Pro Tactics',   state: 'class'   },
      { weekday: 1, startTime: '17:00', endTime: '18:00', classId: 105, classTitle: 'Conditioning', state: 'class'   },
      { weekday: 2, startTime: '20:00', endTime: '21:00', classId: 103, classTitle: 'GK Clinic',     state: 'class'   },
      { weekday: 3, startTime: '16:00', endTime: '17:30',                                             state: 'free'    },
      { weekday: 4, startTime: '16:00', endTime: '20:00',                                             state: 'blocked' },
      { weekday: 5, startTime: '10:00', endTime: '11:30', classId: 104, classTitle: 'Match Prep',    state: 'class'   },
      { weekday: 6, startTime: '09:00', endTime: '12:00',                                             state: 'free'    }
    ]).pipe(delay(this.LATENCY));
  }

  /** Recent reviews from members. */
  getReviews(): Observable<CoachReview[]> {
    return of<CoachReview[]>([
      { id: 1, memberName: 'Sarah Williams', memberAvatar: 'https://i.pravatar.cc/80?img=20', rating: 5, comment: 'Amazing energy and very clear instructions. My son loves the sessions!', createdAt: '2026-05-10' },
      { id: 2, memberName: 'Omar Selim',     memberAvatar: 'https://i.pravatar.cc/80?img=22', rating: 5, comment: 'Best football coach I have trained with. Highly recommend.',           createdAt: '2026-05-02' },
      { id: 3, memberName: 'Yara Nour',      memberAvatar: 'https://i.pravatar.cc/80?img=26', rating: 4, comment: 'Great drills, would love more individual feedback.',                    createdAt: '2026-04-22' },
      { id: 4, memberName: 'Khaled M.',      memberAvatar: 'https://i.pravatar.cc/80?img=25', rating: 5, comment: 'Punctual, professional, and fun.',                                       createdAt: '2026-04-10' }
    ]).pipe(delay(this.LATENCY));
  }

  /** Recent activity feed for the dashboard. */
  getActivities(): Observable<CoachActivity[]> {
    return of<CoachActivity[]>([
      { id: 1, type: 'booking', title: 'New student joined',  description: 'Yara Nour booked Football Basics — U14', timeAgo: '12 min ago', icon: 'person_add',      tone: 'green'  },
      { id: 2, type: 'review',  title: 'New 5-star review',   description: 'Sarah Williams left a 5-star review',     timeAgo: '1 h ago',    icon: 'star',            tone: 'amber'  },
      { id: 3, type: 'class',   title: 'Class started',       description: 'Pro Tactics — Adults · Field B',          timeAgo: '2 h ago',    icon: 'event_available', tone: 'blue'   },
      { id: 4, type: 'payout',  title: 'Weekly payout',       description: 'EGP 3,200 transferred to your account',    timeAgo: 'Yesterday',  icon: 'payments',        tone: 'violet' }
    ]).pipe(delay(this.LATENCY));
  }

  /** Saves attendance (mock — replace with PUT call). */
  saveAttendance(payload: ClassAttendance): Observable<{ message: string }> {
    console.info('[CoachMockService] saveAttendance', payload);
    return of({ message: 'Attendance saved.' }).pipe(delay(this.LATENCY));
  }

  /** Toggle a slot blocked/free (mock). */
  toggleSlot(weekday: number, startTime: string): Observable<{ message: string }> {
    console.info('[CoachMockService] toggleSlot', weekday, startTime);
    return of({ message: 'Slot updated.' }).pipe(delay(this.LATENCY));
  }
}
