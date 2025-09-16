import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

interface Televisor {
  id: number;
  nombre: string;
  ubicacion: string;
  resolucion: string;
  estado: 'Activo' | 'Desconectado' | 'En_linea';
  ultimaConexion: string;
  imagenes: number;
  clienteId: number;
  clienteNombre: string;
}

interface ImagenTv {
  id: number;
  nombre: string;
  url: string;
  archivo?: File;
  horarios: HorarioImagen[];
  fechaCreacion: string;
}

interface HorarioImagen {
  id: number;
  horaInicio: string;
  horaFin: string;
  dias: DiaSemana[];
}

interface DiaSemana {
  value: number;
  label: string;
}

@Component({
  selector: 'app-televisores',
  templateUrl: './televisores.page.html',
  styleUrls: ['./televisores.page.scss'],
})
export class TelevisoresPage implements OnInit {
  // Form
  newTvForm!: FormGroup;
  showNewTvModal = false;

  // Data
  allTvs: Televisor[] = [];
  filteredTvs: Televisor[] = [];
  
  // Filters
  searchTerm = '';
  selectedFilter = 'todos';

  // Route params
  clienteId: number | null = null;
  clienteNombre = '';

  // UI State
  pageTitle = '';
  pageSubtitle = '';
  emptyStateMessage = '';

  // Image Management Modal
  showImageModal = false;
  selectedTv: Televisor | null = null;
  selectedTvImages: ImagenTv[] = [];
  isDragOver = false;
  editingImage: ImagenTv | null = null;
  
  // Modal Steps
  currentModalStep: 'images' | 'schedule' = 'images';
  
  // Schedule Programming Modal
  showScheduleModal = false;
  scheduleForm!: FormGroup;
  selectedImage: ImagenTv | null = null;
  selectedDays: number[] = [];
  
  // Days of the week
  diasSemana: DiaSemana[] = [
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
    { value: 0, label: 'Domingo' }
  ];

  // Stats
  get totalTvs(): number {
    return this.filteredTvs.length;
  }

  get activeTvs(): number {
    return this.filteredTvs.filter(tv => tv.estado === 'Activo').length;
  }

  get onlineTvs(): number {
    return this.filteredTvs.filter(tv => tv.estado === 'En_linea').length;
  }

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {
    this.initializeForm();
    this.initializeMockData();
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.clienteId = params['clienteId'] ? +params['clienteId'] : null;
      this.setupPageContent();
      this.filterTvsByClient();
    });
  }

  private initializeForm(): void {
    this.newTvForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      ubicacion: [''],
      resolucion: [''],
      activo: [true]
    });

    this.scheduleForm = this.formBuilder.group({
      horaInicio: ['', Validators.required],
      horaFin: ['', Validators.required],
      dias: [[], Validators.required]
    });
  }

  private initializeMockData(): void {
    this.allTvs = [
      {
        id: 1,
        nombre: 'Pantalla Principal',
        ubicacion: 'Entrada principal',
        resolucion: '1920x1080',
        estado: 'Activo',
        ultimaConexion: '15/09/2025 22:49',
        imagenes: 5,
        clienteId: 1,
        clienteNombre: 'Restaurante El Mediterráneo'
      },
      {
        id: 2,
        nombre: 'TV Cocina',
        ubicacion: 'Área de cocina',
        resolucion: '1366x768',
        estado: 'En_linea',
        ultimaConexion: '15/09/2025 22:39',
        imagenes: 3,
        clienteId: 1,
        clienteNombre: 'Restaurante El Mediterráneo'
      },
      {
        id: 3,
        nombre: 'Pantalla Lobby',
        ubicacion: 'Recepción principal',
        resolucion: '3840x2160',
        estado: 'Activo',
        ultimaConexion: '15/09/2025 23:15',
        imagenes: 12,
        clienteId: 2,
        clienteNombre: 'Hotel Plaza Central'
      },
      {
        id: 4,
        nombre: 'TV Habitación 101',
        ubicacion: 'Habitación 101',
        resolucion: '1920x1080',
        estado: 'Desconectado',
        ultimaConexion: '14/09/2025 18:30',
        imagenes: 5,
        clienteId: 2,
        clienteNombre: 'Hotel Plaza Central'
      },
      {
        id: 5,
        nombre: 'Pantalla Menú',
        ubicacion: 'Área de pedidos',
        resolucion: '1920x1080',
        estado: 'Activo',
        ultimaConexion: '15/09/2025 22:55',
        imagenes: 6,
        clienteId: 3,
        clienteNombre: 'Café Luna'
      },
      {
        id: 6,
        nombre: 'TV Probadores',
        ubicacion: 'Área de probadores',
        resolucion: '1366x768',
        estado: 'En_linea',
        ultimaConexion: '15/09/2025 21:45',
        imagenes: 15,
        clienteId: 4,
        clienteNombre: 'Tienda Fashion Style'
      },
      {
        id: 7,
        nombre: 'Pantalla Cardio',
        ubicacion: 'Zona cardiovascular',
        resolucion: '2560x1440',
        estado: 'Activo',
        ultimaConexion: '15/09/2025 23:10',
        imagenes: 4,
        clienteId: 5,
        clienteNombre: 'Gimnasio FitCenter'
      },
      {
        id: 8,
        nombre: 'TV Sala Espera',
        ubicacion: 'Sala de espera',
        resolucion: '1920x1080',
        estado: 'Desconectado',
        ultimaConexion: '15/09/2025 19:20',
        imagenes: 7,
        clienteId: 6,
        clienteNombre: 'Clínica Dental Sonrisa'
      }
    ];
  }

  private setupPageContent(): void {
    if (this.clienteId) {
      // Buscar el nombre del cliente
      const cliente = this.allTvs.find(tv => tv.clienteId === this.clienteId);
      this.clienteNombre = cliente ? cliente.clienteNombre : 'Cliente';
      this.pageTitle = `TVs de ${this.clienteNombre}`;
      this.pageSubtitle = `Gestiona los televisores de ${this.clienteNombre}`;
      this.emptyStateMessage = `No se encontraron televisores para ${this.clienteNombre}`;
    } else {
      this.pageTitle = 'Televisores';
      this.pageSubtitle = '';
      this.clienteNombre = '';
      this.emptyStateMessage = 'No se encontraron televisores en el sistema';
    }
  }

  private filterTvsByClient(): void {
    if (this.clienteId) {
      this.filteredTvs = this.allTvs.filter(tv => tv.clienteId === this.clienteId);
    } else {
      this.filteredTvs = [...this.allTvs];
    }
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let tvs = this.clienteId 
      ? this.allTvs.filter(tv => tv.clienteId === this.clienteId)
      : [...this.allTvs];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      tvs = tvs.filter(tv => 
        tv.nombre.toLowerCase().includes(searchLower) ||
        tv.ubicacion.toLowerCase().includes(searchLower) ||
        tv.resolucion.toLowerCase().includes(searchLower) ||
        tv.clienteNombre.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (this.selectedFilter !== 'todos') {
      switch (this.selectedFilter) {
        case 'activo':
          tvs = tvs.filter(tv => tv.estado === 'Activo');
          break;
        case 'desconectado':
          tvs = tvs.filter(tv => tv.estado === 'Desconectado');
          break;
        case 'en_linea':
          tvs = tvs.filter(tv => tv.estado === 'En_linea');
          break;
      }
    }

    this.filteredTvs = tvs;
  }

  goBack(): void {
    this.location.back();
  }

  openNewTvModal(): void {
    this.showNewTvModal = true;
    this.newTvForm.reset({
      nombre: '',
      ubicacion: '',
      resolucion: '',
      activo: true
    });
  }

  closeNewTvModal(): void {
    this.showNewTvModal = false;
    this.newTvForm.reset();
  }

  onSubmitNewTv(): void {
    if (this.newTvForm.valid) {
      const formValue = this.newTvForm.value;
      
      // Determinar el cliente para el nuevo TV
      let targetClienteId = this.clienteId || 1; // Default al primer cliente si no hay clienteId
      let targetClienteNombre = this.clienteNombre || 'Cliente por defecto';
      
      if (!this.clienteId) {
        // Si estamos en vista general, usar el primer cliente como ejemplo
        const firstClient = this.allTvs[0];
        targetClienteId = firstClient.clienteId;
        targetClienteNombre = firstClient.clienteNombre;
      }

      const newTv: Televisor = {
        id: Math.max(...this.allTvs.map(tv => tv.id)) + 1,
        nombre: formValue.nombre,
        ubicacion: formValue.ubicacion || 'Sin ubicación',
        resolucion: formValue.resolucion || '1920x1080',
        estado: formValue.activo ? 'Activo' : 'Desconectado',
        ultimaConexion: new Date().toLocaleString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        imagenes: 0,
        clienteId: targetClienteId,
        clienteNombre: targetClienteNombre
      };

      this.allTvs.push(newTv);
      this.filterTvsByClient();
      this.closeNewTvModal();

      console.log('Nuevo televisor creado:', newTv);
    }
  }

  // Image Management Methods
  openImageModal(tv: Televisor): void {
    this.selectedTv = tv;
    this.loadTvImages(tv.id);
    this.showImageModal = true;
  }

  closeImageModal(): void {
    this.showImageModal = false;
    this.selectedTv = null;
    this.selectedTvImages = [];
    this.editingImage = null;
  }

  private loadTvImages(tvId: number): void {
    // Simular carga de imágenes del televisor con la imagen proporcionada
    const testImageUrl = 'https://firebasestorage.googleapis.com/v0/b/tv-menu-97213.firebasestorage.app/o/TVMenuImages%2FNatureBlz-Timestamp(seconds%3D1730862614%2C%20nanoseconds%3D962893000)?alt=media&token=6e79c3b8-3900-4b34-ac20-8b621c1d44d6';
    
    this.selectedTvImages = [
      {
        id: 1,
        nombre: 'Menú Desayuno - Naturaleza',
        url: testImageUrl,
        horarios: [
          {
            id: 1,
            horaInicio: '06:00',
            horaFin: '10:00',
            dias: [
              { value: 1, label: 'Lunes' },
              { value: 2, label: 'Martes' },
              { value: 3, label: 'Miércoles' },
              { value: 4, label: 'Jueves' },
              { value: 5, label: 'Viernes' }
            ]
          }
        ],
        fechaCreacion: '15/01/2025 10:30'
      },
      {
        id: 2,
        nombre: 'Menú Almuerzo - Naturaleza',
        url: testImageUrl,
        horarios: [
          {
            id: 2,
            horaInicio: '12:00',
            horaFin: '16:00',
            dias: [
              { value: 1, label: 'Lunes' },
              { value: 2, label: 'Martes' },
              { value: 3, label: 'Miércoles' },
              { value: 4, label: 'Jueves' },
              { value: 5, label: 'Viernes' },
              { value: 6, label: 'Sábado' },
              { value: 0, label: 'Domingo' }
            ]
          }
        ],
        fechaCreacion: '15/01/2025 11:15'
      },
      {
        id: 3,
        nombre: 'Menú Cena - Naturaleza',
        url: testImageUrl,
        horarios: [
          {
            id: 3,
            horaInicio: '18:00',
            horaFin: '22:00',
            dias: [
              { value: 6, label: 'Sábado' },
              { value: 0, label: 'Domingo' }
            ]
          }
        ],
        fechaCreacion: '15/01/2025 12:00'
      },
      {
        id: 4,
        nombre: 'Promociones Especiales',
        url: testImageUrl,
        horarios: [],
        fechaCreacion: '15/01/2025 14:30'
      },
      {
        id: 5,
        nombre: 'Menú Bebidas - Naturaleza',
        url: testImageUrl,
        horarios: [
          {
            id: 4,
            horaInicio: '10:00',
            horaFin: '23:00',
            dias: [
              { value: 1, label: 'Lunes' },
              { value: 2, label: 'Martes' },
              { value: 3, label: 'Miércoles' },
              { value: 4, label: 'Jueves' },
              { value: 5, label: 'Viernes' },
              { value: 6, label: 'Sábado' },
              { value: 0, label: 'Domingo' }
            ]
          }
        ],
        fechaCreacion: '15/01/2025 15:45'
      }
    ];
  }

  // Drag and Drop Methods
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(files);
    }
  }

  onFileSelect(event: any): void {
    const files = event.target.files;
    if (files) {
      this.handleFiles(files);
    }
  }

  private handleFiles(files: FileList): void {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        this.addNewImage(file);
      }
    }
  }

  private addNewImage(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const newImage: ImagenTv = {
        id: Math.max(...this.selectedTvImages.map(img => img.id), 0) + 1,
        nombre: file.name.split('.')[0],
        url: e.target?.result as string,
        archivo: file,
        horarios: [],
        fechaCreacion: new Date().toLocaleString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      this.selectedTvImages.push(newImage);
    };
    reader.readAsDataURL(file);
  }

  editImage(image: ImagenTv): void {
    this.editingImage = { ...image };
  }

  deleteImage(imageId: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
      this.selectedTvImages = this.selectedTvImages.filter(img => img.id !== imageId);
    }
  }

  saveImageChanges(): void {
    if (this.editingImage) {
      const index = this.selectedTvImages.findIndex(img => img.id === this.editingImage!.id);
      if (index !== -1) {
        this.selectedTvImages[index] = { ...this.editingImage };
      }
      this.editingImage = null;
    }
  }

  cancelImageEdit(): void {
    this.editingImage = null;
  }

  // Schedule Programming Methods
  openScheduleModal(image: ImagenTv): void {
    this.selectedImage = image;
    this.selectedDays = [];
    this.scheduleForm.reset();
    this.currentModalStep = 'schedule';
  }

  closeScheduleModal(): void {
    this.selectedImage = null;
    this.selectedDays = [];
    this.scheduleForm.reset();
    this.currentModalStep = 'images';
  }

  // Método para volver al paso de imágenes
  backToImages(): void {
    this.currentModalStep = 'images';
    this.selectedImage = null;
    this.selectedDays = [];
    this.scheduleForm.reset();
  }

  // Método para saltar la programación de horarios
  skipScheduling(): void {
    if (this.selectedImage) {
      // La imagen se mostrará 24/7 por defecto (sin horarios específicos)
      console.log(`Imagen "${this.selectedImage.nombre}" configurada para mostrarse 24/7`);
    }
    this.backToImages();
  }

  onDayToggle(day: DiaSemana): void {
    const currentDays = this.scheduleForm.get('dias')?.value || [];
    const dayIndex = currentDays.findIndex((d: DiaSemana) => d.value === day.value);
    
    if (dayIndex > -1) {
      currentDays.splice(dayIndex, 1);
    } else {
      currentDays.push(day);
    }
    
    this.scheduleForm.patchValue({ dias: currentDays });
  }

  isDaySelected(day: DiaSemana): boolean {
    const selectedDays = this.scheduleForm.get('dias')?.value || [];
    return selectedDays.some((d: DiaSemana) => d.value === day.value);
  }

  getDaysText(dias: DiaSemana[]): string {
    if (dias.length === 7) {
      return 'Todos los días';
    } else if (dias.length === 5 && !dias.some(d => d.value === 0 || d.value === 6)) {
      return 'Lunes a Viernes';
    } else if (dias.length === 2 && dias.some(d => d.value === 0) && dias.some(d => d.value === 6)) {
      return 'Fines de semana';
    } else {
      return dias.map(d => d.label).join(', ');
    }
  }

  addScheduleToImage(): void {
    if (this.scheduleForm.valid && this.selectedImage) {
      const formValue = this.scheduleForm.value;
      const selectedDaysObjects = this.getSelectedDaysAsObjects();
      
      if (selectedDaysObjects.length > 0) {
        const newSchedule: HorarioImagen = {
          id: Date.now(),
          horaInicio: formValue.horaInicio,
          horaFin: formValue.horaFin,
          dias: selectedDaysObjects
        };

        this.selectedImage.horarios.push(newSchedule);
        console.log('Horario agregado:', newSchedule);
      }

      this.backToImages();
    }
  }

  removeSchedule(image: ImagenTv, scheduleId: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este horario?')) {
      image.horarios = image.horarios.filter(h => h.id !== scheduleId);
    }
  }

  // Métodos de gestión de días
  onDayChange(day: DiaSemana): void {
    const index = this.selectedDays.indexOf(day.value);
    if (index > -1) {
      this.selectedDays.splice(index, 1);
    } else {
      this.selectedDays.push(day.value);
    }
  }

  // Método para obtener los días seleccionados como objetos DiaSemana
  getSelectedDaysAsObjects(): DiaSemana[] {
    return this.diasSemana.filter(dia => this.selectedDays.includes(dia.value));
  }

  // Métodos de selección rápida de días
  selectAllDays(): void {
    this.selectedDays = [0, 1, 2, 3, 4, 5, 6];
  }

  selectWeekdays(): void {
    this.selectedDays = [1, 2, 3, 4, 5];
  }

  selectWeekends(): void {
    this.selectedDays = [0, 6];
  }

  clearDays(): void {
    this.selectedDays = [];
  }
}
