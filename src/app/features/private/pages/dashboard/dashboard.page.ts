import { Component, OnInit } from '@angular/core';
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
export class DashboardPage implements OnInit {
  // Datos mock para las estadísticas del dashboard
  statsData = {
    clientes: {
      total: 12,
      activos: 10,
    },
    televisores: {
      total: 28,
      enLinea: 23,
    },
    imagenes: {
      total: 156,
      descripcion: 'Total en el sistema',
    },
    programacion: {
      total: 89,
      descripcion: 'Horarios activos',
    },
  };

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
    {
      icon: 'bi-calendar-plus',
      text: 'Programación Global',
    },
  ];

  // Datos mock para actividad reciente
  recentActivities = [
    {
      title: 'Nuevo cliente registrado',
      description: 'Hotel Plaza',
      time: 'hace 2 horas',
    },
    {
      title: 'TV desconectado',
      description: 'Restaurante Central • Pantalla Principal',
      time: 'hace 3 horas',
    },
    {
      title: 'Imagen programada',
      description: 'Café Luna • menu-especial.jpg',
      time: 'hace 5 horas',
    },
    {
      title: 'Cliente actualizado',
      description: 'Tienda Fashion',
      time: 'hace 1 día',
    },
  ];
  // private firestore: Firestore
  constructor() {}

  ngOnInit(): void {}
}
