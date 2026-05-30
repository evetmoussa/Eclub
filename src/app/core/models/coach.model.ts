// coach.model.ts — Matches backend E_Club.DTOs.Coaches.* records exactly.

export interface Coach {
  id: number;
  fullName: string;
  specialization: string;       // e.g. "Football"
  imageUrl?: string | null;
  bio?: string | null;
  experienceYears: number;
  rating: number;                // 0..5 (double on the server)
  phoneNumber?: string | null;
  email?: string | null;
  isActive: boolean;
}

export interface CoachCreateRequest {
  fullName: string;
  specialization: string;
  imageUrl?: string | null;
  bio?: string | null;
  experienceYears: number;
  phoneNumber?: string | null;
  email?: string | null;
}

export type CoachUpdateRequest = CoachCreateRequest;

export interface CoachAssignmentResult {
  message?: string;
}
