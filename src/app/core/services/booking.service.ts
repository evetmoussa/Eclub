import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Booking {
  id: number;
  title: string;
  coach: string;
  date: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  price: number;
  duration: string;
  image: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private bookings: Booking[] = [
    {
      id: 1,
      title: 'Football Academy',
      coach: 'Sarah Jenkins',
      date: 'Mon, 24 Oct • 05:00 PM',
      status: 'upcoming',
      price: 50,
      duration: '1 Hour',
      image: 'assets/istockphoto-512923151-1024x1024.jpg'
    },
    {
      id: 2,
      title: 'Basketball Academy',
      coach: 'Michael Jordan',
      date: 'Sat, 15 Oct • 06:00 PM',
      status: 'completed',
      price: 40,
      duration: '1 Hour',
      image: 'assets/stadiu.jpeg'
    },
    {
      id: 3,
      title: 'Tennis Academy',
      coach: 'Roger Federer',
      date: 'Mon, 10 Oct • 09:00 AM',
      status: 'cancelled',
      price: 30,
      duration: '1 Hour',
      image: 'assets/stadium.jpeg'
    }
  ];

  getBookings(): Observable<Booking[]> {
    return of(this.bookings);
  }
}
