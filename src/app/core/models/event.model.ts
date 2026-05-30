/* ============================================================
 *  Events models — match swagger /api/Events + /api/events
 * ============================================================ */

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface AppEvent {
  id: number;
  title: string;
  description: string;
  location: string;
  startDate: string;          // ISO
  endDate: string;            // ISO
  imageUrl: string | null;
  maxParticipants: number;
  currentParticipants: number;
  status: string;             // "Upcoming" | "Live" | "Ended" | ...
  countdown?: Countdown | null;
}

export interface EventCreate {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  imageUrl?: string;
  maxParticipants: number;
}

export interface MyEventRegistration {
  id?: number;
  eventId: number;
  eventTitle?: string;
  registeredOn?: string;
  status?: string;
}
