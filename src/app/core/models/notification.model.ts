export interface AppNotification {
  id: number;
  title: string;
  body: string;
  type?: string;        // e.g. "Booking", "Event", ...
  icon?: string;        // material symbol name
  iconHue?: 'green' | 'orange' | 'blue';
  isRead: boolean;
  createdAt: string;    // ISO
  actionUrl?: string | null;
}

export interface UnreadCountResponse {
  count: number;
}
