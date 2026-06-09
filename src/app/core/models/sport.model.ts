/* ============================================
 *  Sports API models — match swagger exactly
 * ============================================ */

export interface Sport {
  id: number;
  name: string;
  icon: string;        // Material Symbol name e.g. "sports_soccer"
  imageUrl: string | null;
  isActive: boolean;
}

export interface SportClass {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  sportId?: number;
  sportName?: string;
  startTime: string;   // ISO date or "09:00 AM"
  endTime: string;
  timeRange?: string;  // e.g. "09:00 AM - 10:00 AM"
  location: string;
  maxParticipants: number;
  currentParticipants?: number;
  availableSlots?: number;
  price: number;
  type: string;
  status?: string;     // e.g. "Upcoming"
  countdown?: string | null;
  isBooked?: boolean;
  isBookedByCurrentUser?: boolean;
  coachId?: number | null;
  coachName?: string | null;
  coachImageUrl?: string | null;
  academyId?: number | null;
}

export interface SpecialEvent {
  id: number;
  title: string;
  description?: string;
  imageUrl: string | null;
  startTime: string;
  endTime: string;
  location: string;
  maxParticipants?: number;
  currentParticipants?: number;
  price?: number;
  status?: string;
}

export interface SportsScreen {
  sports: Sport[];
  upcomingClasses: SportClass[];
  specialEvent: SpecialEvent | null;
}

export interface MyBooking {
  bookingId: number;
  classId: number;
  classTitle: string;
  sportName: string;
  timeRange: string;
  location: string;
  bookedOn: string;
  status: string;       // "Confirmed", "Cancelled", ...
}

/* ===== Legacy academy types (kept so the academy-details page
   keeps compiling — not used by the new sports screen) ===== */
export interface Coach {
  id: number;
  name: string;
  image: string;
}

export interface Session {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  coachId: number;
}

export interface Academy {
  id: number;
  name: string;
  location: string;
  image: string;
  coaches: Coach[];
  sessions: Session[];
}
