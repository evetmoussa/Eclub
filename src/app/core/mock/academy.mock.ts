import { Academy } from '../models/sport.model';

export const ACADEMIES_MOCK: Academy[] = [
  {
    id: 1,
    name: 'Swimming Academy',
    location: 'Cairo',
    image: 'https://picsum.photos/400/200?random=1',
    coaches: [
      { id: 1, name: 'Mike', image: 'https://i.pravatar.cc/100?img=1' },
      { id: 2, name: 'Sarah', image: 'https://i.pravatar.cc/100?img=2' },
      { id: 3, name: 'Alex', image: 'https://i.pravatar.cc/100?img=3' },
      { id: 4, name: 'John', image: 'https://i.pravatar.cc/100?img=4' }
    ],
    sessions: [
      // 17 MAR
      { id: 1, date: '2026-03-17', startTime: '08:00 AM', endTime: '09:00 AM', coachId: 1 },
      { id: 2, date: '2026-03-17', startTime: '09:00 AM', endTime: '10:00 AM', coachId: 1 },
      { id: 3, date: '2026-03-17', startTime: '10:00 AM', endTime: '11:00 AM', coachId: 2 },
      { id: 4, date: '2026-03-17', startTime: '11:00 AM', endTime: '12:00 PM', coachId: 3 },

      // 18 MAR
      { id: 5, date: '2026-03-18', startTime: '08:00 AM', endTime: '09:00 AM', coachId: 2 },
      { id: 6, date: '2026-03-18', startTime: '09:00 AM', endTime: '10:00 AM', coachId: 3 },
      { id: 7, date: '2026-03-18', startTime: '10:00 AM', endTime: '11:00 AM', coachId: 4 },

      // 19 MAR
      { id: 8, date: '2026-03-19', startTime: '09:00 AM', endTime: '10:00 AM', coachId: 1 },
      { id: 9, date: '2026-03-19', startTime: '10:00 AM', endTime: '11:00 AM', coachId: 2 },

      // 20 MAR
      { id: 10, date: '2026-03-20', startTime: '08:00 AM', endTime: '09:00 AM', coachId: 3 },
      { id: 11, date: '2026-03-20', startTime: '09:00 AM', endTime: '10:00 AM', coachId: 4 },

      // 21 MAR
      { id: 12, date: '2026-03-21', startTime: '10:00 AM', endTime: '11:00 AM', coachId: 1 },
      { id: 13, date: '2026-03-21', startTime: '11:00 AM', endTime: '12:00 PM', coachId: 2 },

      // 22 MAR
      { id: 14, date: '2026-03-22', startTime: '08:00 AM', endTime: '09:00 AM', coachId: 3 },
      { id: 15, date: '2026-03-22', startTime: '09:00 AM', endTime: '10:00 AM', coachId: 4 }
    ]
  },

  {
    id: 2,
    name: 'Tennis Academy',
    location: 'Alexandria',
    image: 'https://picsum.photos/400/200?random=2',
    coaches: [
      { id: 5, name: 'Emma', image: 'https://i.pravatar.cc/100?img=5' },
      { id: 6, name: 'David', image: 'https://i.pravatar.cc/100?img=6' }
    ],
    sessions: [
      { id: 16, date: '2026-03-17', startTime: '08:00 AM', endTime: '09:00 AM', coachId: 5 },
      { id: 17, date: '2026-03-18', startTime: '09:00 AM', endTime: '10:00 AM', coachId: 6 },
      { id: 18, date: '2026-03-19', startTime: '10:00 AM', endTime: '11:00 AM', coachId: 5 }
    ]
  },

  {
    id: 3,
    name: 'Football Academy',
    location: 'Giza',
    image: 'https://picsum.photos/400/200?random=3',
    coaches: [
      { id: 7, name: 'Mohamed', image: 'https://i.pravatar.cc/100?img=7' },
      { id: 8, name: 'Omar', image: 'https://i.pravatar.cc/100?img=8' }
    ],
    sessions: [
      { id: 19, date: '2026-03-20', startTime: '05:00 PM', endTime: '06:00 PM', coachId: 7 },
      { id: 20, date: '2026-03-21', startTime: '06:00 PM', endTime: '07:00 PM', coachId: 8 }
    ]
  }
];