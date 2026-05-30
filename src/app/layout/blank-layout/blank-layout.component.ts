import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { NotificationsCenterService } from '../../core/services/notifications-center.service';

@Component({
  selector: 'app-blank-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './blank-layout.component.html',
  styleUrl: './blank-layout.component.scss'
})
export class BlankLayoutComponent implements OnInit {
  private center = inject(NotificationsCenterService);

  /** Live unread count — updates the moment a local notification fires. */
  readonly unreadCount = computed(() => this.center.unreadCount());

  ngOnInit(): void {
    this.center.refresh();
  }
}
