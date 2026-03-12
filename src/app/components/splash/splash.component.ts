import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash',
  standalone: true,
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss']
})
export class SplashComponent implements OnInit {

  progress = 0;

  constructor(private router: Router) {}

  ngOnInit() {

    let interval = setInterval(() => {

      this.progress += 4;

      if (this.progress >= 100) {
        clearInterval(interval);
        this.router.navigate(['/authlayout']);
      }

    }, 120);

  }

}