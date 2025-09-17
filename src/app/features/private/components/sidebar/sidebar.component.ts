import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { SidebarService } from '../services/sidebar.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IconService } from 'src/app/core/services/icons/icons.service';

export interface SidebarMenuItem {
  name: string;
  icon: SafeHtml;
  route: string;
  iconColor: string;
  roles?: string[]; // Añadido para control de acceso por rol
}

export interface SidebarMenuSection {
  title: string;
  items: SidebarMenuItem[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  yearActual = new Date().getFullYear();
  sidebarMenu: SidebarMenuItem[] = [
    {
      name: 'Dashboard',
      icon: 'bi-graph-up',
      iconColor: '#38bdf8', // verde menta
      route: '/dashboard',
      // roles: ['admin', 'editor', 'normal'],
    },
    {
      name: 'Clientes',
      icon: 'bi-person',
      iconColor: '#38bdf8',
      route: '/clientes',
      // roles: ['admin', 'editor', 'normal'],
    },
    {
      name: 'Televisores',
      icon: 'bi-tv',
      iconColor: '#38bdf8',
      route: '/televisores',
      // roles: ['admin', 'editor', 'normal'],
    },
    {
      name: 'Usuarios',
      icon: 'bi-people',
      iconColor: '#38bdf8',
      route: '/users',
      // roles: ['admin'], // Solo administradores pueden ver esta opción
    },
    {
      name: 'Ajustes',
      icon: 'bi-sliders',
      iconColor: '#38bdf8',
      route: '/settings',
      // roles: ['admin', 'editor', 'normal'],
    },
  ];

  currentRoute = '';

  userRole = localStorage.getItem('role') || '';

  get filteredSidebarMenu(): SidebarMenuItem[] {
    return this.sidebarMenu.filter((item) => {
      if (!item.roles) return true;
      return item.roles.includes(this.userRole);
    });
  }

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.urlAfterRedirects.replace('/private', '');
      }
    });
  }

  constructor(
    private router: Router,
    private sidebarService: SidebarService,
    private iconService: IconService,
    private sanitizer: DomSanitizer
  ) {}

  // Método para verificar si una ruta está activa
  isRouteActive(route: string): boolean {
    return this.router.isActive(route, true);
  }

  closeSidebar(): void {
    this.sidebarService.toggleSidebar(false);
  }

  getSanitizedIcon(name: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(
      this.iconService.getIcon(name)
    );
  }
}
