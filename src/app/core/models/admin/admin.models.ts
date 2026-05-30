// Admin domain models — used across Dashboard / Academies / Trainers / Members / Offers
// They map 1:1 to the planned API contract so we can swap mock for HTTP later.

export interface KpiCard {
  key: string;
  label: string;
  value: string;
  delta: number;          // percentage change vs previous period (can be negative)
  icon: string;           // Material Symbols name
  tone?: 'green' | 'blue' | 'amber' | 'rose' | 'violet';
}

export interface ManagementTile {
  key: 'trainers' | 'academies' | 'members' | 'offers';
  title: string;
  subtitle: string;
  icon: string;
  count: number;
  trend: number;          // % growth
  route: string;
}

export interface ActivityItem {
  id: number;
  type: 'member' | 'trainer' | 'academy' | 'offer' | 'request';
  title: string;
  description: string;
  timeAgo: string;
  icon: string;
  tone: 'green' | 'blue' | 'amber' | 'rose' | 'violet';
}

export interface RequestsSummary {
  successRate: number;    // 0..100
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

export interface AdminAcademy {
  id: number;
  name: string;
  sport: string;          // e.g. Football, Tennis
  imageUrl: string;
  status: 'Active' | 'Paused' | 'Archived';
  trainersCount: number;
  membersCount: number;
  growth: number;         // percentage growth this month
  location: string;
}

export interface AdminTrainer {
  id: number;
  name: string;
  role: string;           // primary specialty / sport
  avatarUrl: string;
  status: 'Active' | 'On leave' | 'Inactive';
  rating: number;         // 0..5
  sessions: number;
  email: string;
  phone: string;
}

export interface AdminMember {
  id: number;
  name: string;
  email: string;
  avatarUrl: string;
  plan: 'Premium' | 'Standard' | 'Coach' | 'Pending';
  status: 'Active' | 'Pending' | 'Suspended';
  joinedAt: string;       // ISO
  lastActive: string;     // human-readable e.g. "2h ago"
}

export interface AdminOffer {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  status: 'Active' | 'Scheduled' | 'Expired';
  discount: number;       // percentage
  startsAt: string;       // ISO
  endsAt: string;         // ISO
  redemptions: number;
}
