import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SportsService } from '../../core/services/sports.service';
import { Academy } from '../../core/models/sport.model';

@Component({
  selector: 'app-academies',
  templateUrl: './academies.component.html',
  styleUrls: ['./academies.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class AcademiesComponent implements OnInit {
  academies: Academy[] = [];

  constructor(
    private sportsService: SportsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.sportsService.getAcademies().subscribe(res => {
      this.academies = res;
    });
  }

  openDetails(id: number) {
    this.router.navigate(['/blank-layout/sports/academy', id]);
  }
}