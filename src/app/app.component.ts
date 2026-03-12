import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SplashComponent } from "./components/splash/splash.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Eclub';
}
