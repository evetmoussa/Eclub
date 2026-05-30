import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface SideLink {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent {
  primary: SideLink[] = [
    { icon: 'space_dashboard', label: 'Dashboard', route: '/admin/dashboard' },
    { icon: 'sports',          label: 'Trainers',  route: '/admin/trainers'  },
    { icon: 'school',          label: 'Academies', route: '/admin/academies' },
    { icon: 'group',           label: 'Members',   route: '/admin/members'   },
    { icon: 'local_offer',     label: 'Offers',    route: '/admin/offers'    },
    { icon: 'pending_actions', label: 'Requests',  route: '/admin/requests', badge: 42 }
  ];

  secondary: SideLink[] = [
    { icon: 'settings',     label: 'Settings', route: '/admin/settings' },
    { icon: 'help_outline', label: 'Support',  route: '/admin/support'  }
  ];
}
