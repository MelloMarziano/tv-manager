import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil, map, take } from 'rxjs/operators';
import { ClienteService } from '../../../../core/services/cliente.service';
import { TelevisorService } from '../../../../core/services/televisor.service';
import { ImagenService } from '../../../../core/services/imagen.service';
declare var $: any;
// import {
//   Firestore,
//   collection,
//   addDoc,
//   collectionData,
//   query,
//   where,
//   doc,
//   updateDoc,
// } from '@angular/fire/firestore';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Datos dinámicos para las estadísticas del dashboard
  statsData = {
    clientes: {
      total: 0,
      activos: 0,
    },
    televisores: {
      total: 0,
      enLinea: 0,
    },
    imagenes: {
      total: 0,
      descripcion: 'Total en el sistema',
    },
  };

  loading = true;

  // Datos mock para acciones rápidas
  quickActions = [
    {
      icon: 'bi-person-plus',
      text: 'Gestionar Clientes',
    },
    {
      icon: 'bi-tv',
      text: 'Ver Todos los TVs',
    },
  ];

  // Datos para actividad reciente
  recentActivities: any[] = [];
  // private firestore: Firestore
  constructor(
    private clienteService: ClienteService,
    private televisorService: TelevisorService,
    private imagenService: ImagenService
  ) {}

  ngOnInit(): void {
    this.loadDashboardStats();
    this.loadRecentActivities();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardStats(): void {
    this.loading = true;

    // Obtener estadísticas de clientes
    const clientes$ = this.clienteService.getClientes().pipe(
      map(clientes => ({
        total: clientes.length,
        activos: clientes.filter(c => c.activo).length
      }))
    );

    // Obtener estadísticas de televisores
    const televisores$ = this.televisorService.getTelevisores().pipe(
      map(televisores => ({
        total: televisores.length,
        enLinea: televisores.filter(tv => tv.estado === 'En_linea' || tv.estado === 'Activo').length
      }))
    );

    // Obtener estadísticas de imágenes
    const imagenes$ = this.imagenService.getAllImagenes().pipe(
      map(imagenes => ({
        total: imagenes.length,
        descripcion: 'Total en el sistema'
      }))
    );

    // Combinar todas las estadísticas
    combineLatest([clientes$, televisores$, imagenes$])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([clientesStats, televisoresStats, imagenesStats]) => {
          this.statsData = {
            clientes: clientesStats,
            televisores: televisoresStats,
            imagenes: imagenesStats
          };
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading dashboard stats:', error);
          this.loading = false;
        }
      });
  }

  private loadRecentActivities(): void {
    // Obtener actividades recientes combinando datos de diferentes servicios
    const clientes$ = this.clienteService.getClientes().pipe(take(1));
    const televisores$ = this.televisorService.getTelevisores().pipe(take(1));
    const imagenes$ = this.imagenService.getAllImagenes().pipe(take(1));

    combineLatest([clientes$, televisores$, imagenes$])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([clientes, televisores, imagenes]) => {
          const activities: any[] = [];

          // Agregar clientes recientes (últimos 2)
          const clientesRecientes = (clientes as any[])
            .filter(cliente => cliente.fechaCreacion)
            .sort((a: any, b: any) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
            .slice(0, 2);
          
          clientesRecientes.forEach((cliente: any) => {
            activities.push({
              title: 'Nuevo cliente registrado',
              description: cliente.nombre,
              time: this.getTimeAgo(cliente.fechaCreacion),
              icon: 'bi-person-plus',
              type: 'cliente'
            });
          });

          // Agregar televisores con cambios de estado recientes
          const televisoresRecientes = (televisores as any[])
            .filter((tv: any) => tv.ultimaConexion)
            .sort((a: any, b: any) => new Date(b.ultimaConexion).getTime() - new Date(a.ultimaConexion).getTime())
            .slice(0, 2);

          televisoresRecientes.forEach((tv: any) => {
            const cliente = (clientes as any[]).find((c: any) => c.id === tv.clienteId);
            activities.push({
              title: tv.estado === 'En_linea' ? 'TV conectado' : 'TV desconectado',
              description: `${cliente?.nombre || 'Cliente'} • ${tv.nombre}`,
              time: this.getTimeAgo(tv.ultimaConexion),
              icon: tv.estado === 'En_linea' ? 'bi-tv-fill' : 'bi-tv',
              type: 'televisor'
            });
          });

          // Agregar imágenes recientes (últimas 3)
          const imagenesRecientes = (imagenes as any[])
            .filter((imagen: any) => imagen.fechaCreacion)
            .sort((a: any, b: any) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
            .slice(0, 3);

          imagenesRecientes.forEach((imagen: any) => {
            const televisor = (televisores as any[]).find((tv: any) => tv.id === imagen.televisorId);
            const cliente = (clientes as any[]).find((c: any) => c.id === televisor?.clienteId);
            activities.push({
              title: 'Nueva imagen subida',
              description: `${cliente?.nombre || 'Cliente'} • ${imagen.nombre}`,
              time: this.getTimeAgo(imagen.fechaCreacion),
              icon: 'bi-image',
              type: 'imagen'
            });
          });

          // Ordenar todas las actividades por fecha y tomar las más recientes
          this.recentActivities = activities
            .sort((a, b) => {
              // Ordenar por timestamp implícito en el texto de tiempo
              const timeA = this.parseTimeAgo(a.time);
              const timeB = this.parseTimeAgo(b.time);
              return timeA - timeB;
            })
            .slice(0, 6);
        },
        error: (error) => {
          console.error('Error loading recent activities:', error);
          // Mantener datos mock en caso de error
        }
      });
  }

  getTimeAgo(date: Date | string): string {
    const now = new Date();
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    const diffInMs = now.getTime() - targetDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    if (diffInDays < 7) return `Hace ${diffInDays}d`;
    return targetDate.toLocaleDateString();
  }

  private parseTimeAgo(timeText: string): number {
    // Convertir texto de tiempo a número para ordenamiento
    if (timeText.includes('min')) {
      return parseInt(timeText.match(/\d+/)?.[0] || '0');
    } else if (timeText.includes('h')) {
      return parseInt(timeText.match(/\d+/)?.[0] || '0') * 60;
    } else if (timeText.includes('d')) {
      return parseInt(timeText.match(/\d+/)?.[0] || '0') * 60 * 24;
    } else {
      return 999999; // Para "hace tiempo" o "hace más de una semana"
    }
  }
}
