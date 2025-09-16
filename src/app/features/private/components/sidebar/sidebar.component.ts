import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { SidebarService } from '../services/sidebar.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IconService } from 'src/app/core/services/icons/icons.service';

export interface SidebarMenuItem {
  name: string;
  icon: SafeHtml;
  route: string;
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
  filteredSidebarMenu = [
    {
      name: 'Dashboard',
      icon: 'bi-graph-up',
      iconColor: '#38bdf8', // verde menta
      route: '/dashboard',
    },
    {
      name: 'Clientes',
      icon: 'bi-person',
      iconColor: '#38bdf8',
      route: '/clientes',
    },
    {
      name: 'Televisores',
      icon: 'bi-tv',
      iconColor: '#38bdf8',
      route: '/televisores',
    },
    {
      name: 'Programación',
      icon: 'bi-calendar3',
      iconColor: '#38bdf8',
      route: '/simulacion',
    },

    {
      name: 'Ajustes',
      icon: 'bi-sliders',
      iconColor: '#38bdf8',
      route: '/settings',
    },
  ];

  currentRoute = '';

  userRole = localStorage.getItem('role') || '';

  //   get visibleSidebarMenu() {
  //     return this.filteredSidebarMenu.filter((item) => {
  //       if (!item.roles) return true;
  //       return item.roles.includes(this.userRole);
  //     });
  //   }

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
