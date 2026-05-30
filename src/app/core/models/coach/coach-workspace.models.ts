// coach-workspace.models.ts — Types used across the Coach workspace
// (dashboard, classes, schedule, profile). Designed to match likely
// backend shapes once endpoints are wired.

export interface CoachKpi {
  key: string;
  label: string;
  value: string;
  delta: number;
  icon: string;
  tone?: 'green' | 'blue' | 'amber' | 'rose' | 'violet';
}

export interface CoachClassSummary {
  id: number;
  title: string;
  sport: string;
  date: string;          // ISO yyyy-mm-dd
  startTime: string;     // HH:mm
  endTime: string;       // HH:mm
  location: string;
  enrolled: number;
  capacity: number;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
}

export interface CoachStudent {
  id: number;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  joinedAt: string;
}

export interface ClassAttendance {
  classId: number;
  date: string;
  roster: { studentId: number; present: boolean }[];
}

export interface ScheduleSlot {
  weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6;   // 0 = Sunday
  startTime: string;
  endTime: string;
  classId?: number;
  classTitle?: string;
  state: 'class' | 'free' | 'blocked';
}

export interface CoachReview {
  id: number;
  memberName: string;
  memberAvatar?: string;
  rating: number;          // 1..5
  comment: string;
  createdAt: string;
}

export interface CoachActivity {
  id: number;
  type: 'class' | 'review' | 'booking' | 'payout';
  title: string;
  description: string;
  timeAgo: string;
  icon: string;
  tone: 'green' | 'blue' | 'amber' | 'rose' | 'violet';
}
