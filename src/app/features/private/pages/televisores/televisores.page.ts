import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TelevisorService } from '../../../../core/services/televisor.service';
import { ClienteService } from '../../../../core/services/cliente.service';
import { ImagenService } from '../../../../core/services/imagen.service';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { CreateTelevisorRequest, Televisor } from '../../../../core/models/televisor.model';
import { Cliente } from '../../../../core/models/cliente.model';
import { ImagenTv, HorarioImagen, DiaSemana } from '../../../../core/models/imagen.model';
import { lastValueFrom, take } from 'rxjs';

declare const bootstrap: any;

// --- INTERFACES LOCALES ---
interface TelevisorLocal extends Televisor {
  imagenesCount: number;
  estado: 'Activo' | 'Desconectado' | 'En_linea';
  resolucion: string;
}

interface ImagenTvLocal extends ImagenTv {
  uiColor: string;
  showDetails?: boolean; // Propiedad para controlar la visibilidad de los detalles en la tabla
}

interface TimeSlot {
  time: string;
  status: 'available' | 'occupied' | 'selected';
  occupiedBy?: string;
  color?: string;
}

@Component({
  selector: 'app-televisores',
  templateUrl: './televisores.page.html',
  styleUrls: ['./televisores.page.scss'],
})
export class TelevisoresPage implements OnInit {
  // Forms
  newTvForm!: FormGroup;
  scheduleForm!: FormGroup;

  // Estado del Componente
  allTvs: TelevisorLocal[] = [];
  filteredTvs: TelevisorLocal[] = [];
  clientesDisponibles: Cliente[] = [];
  selectedTv: TelevisorLocal | null = null;
  selectedTvImages: ImagenTvLocal[] = [];
  selectedImage: ImagenTvLocal | null = null;
  clienteId: string | null = null;
  clienteNombre = '';
  pageTitle = '';
  pageSubtitle = '';
  emptyStateMessage = '';
  isUploading = false;
  guardandoHorario = false;

  // Estado del Modal
  showImageModal = false;
  isDragOver = false;
  currentModalStep: 'images' | 'schedule' = 'images';
  selectedFiles: File[] = [];

  // Datos y Estado de Programación
  private colorPalette: string[] = ['#3498db', '#2ecc71', '#e74c3c', '#f1c40f', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];
  diasSemana: DiaSemana[] = [
    { value: 1, label: 'Lunes' }, { value: 2, label: 'Martes' }, { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' }, { value: 5, label: 'Viernes' }, { value: 6, label: 'Sábado' },
    { value: 0, label: 'Domingo' },
  ];
  selectedDays: number[] = [];
  timeSlots: TimeSlot[] = [];
  selectionStart: TimeSlot | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private televisorService: TelevisorService,
    private clienteService: ClienteService,
    private imagenService: ImagenService,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.route.queryParams.subscribe(params => {
      this.clienteId = params['clienteId'] || null;
      this.loadInitialData();
    });
  }

  private initializeForms(): void {
    this.newTvForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      ubicacion: ['', Validators.required],
      resolucion: ['1920x1080', Validators.required],
      clienteId: ['', this.clienteId ? [] : [Validators.required]],
    });
    this.scheduleForm = this.fb.group({
      horaInicio: ['', Validators.required],
      horaFin: ['', Validators.required],
    }, { validators: this.timeRangeValidator });
  }

  private timeRangeValidator(group: FormGroup): { [key: string]: any } | null {
    const start = group.get('horaInicio')?.value;
    const end = group.get('horaFin')?.value;
    return start && end && start >= end ? { invalidTimeRange: true } : null;
  }

  // --- CARGA DE DATOS ---
  private async loadInitialData(): Promise<void> {
    this.setupPageContent();
    if (this.clienteId) {
      try {
        const cliente = await lastValueFrom(this.clienteService.getClienteById(this.clienteId).pipe(take(1)));
        this.clienteNombre = cliente?.nombre || '';
      } catch (error) {
        this.snackbarService.presentToastDanger('Error al cargar datos del cliente.');
        this.router.navigate(['/private/televisores']);
        return;
      }
    } else {
      this.clienteService.getClientes().pipe(take(1)).subscribe({
        next: clientes => this.clientesDisponibles = clientes,
        error: err => {
          console.error("Error al cargar clientes:", err);
          this.snackbarService.presentToastDanger("No se pudieron cargar los clientes.");
        }
      });
    }
    this.loadTelevisores();
  }

  private setupPageContent(): void {
    this.pageTitle = this.clienteId ? `Televisores de ${this.clienteNombre}` : 'Todos los Televisores';
    this.pageSubtitle = this.clienteId ? 'Gestiona los televisores de este cliente' : 'Gestiona todos los televisores del sistema';
    this.emptyStateMessage = this.clienteId ? 'Este cliente aún no tiene televisores.' : 'No hay televisores en el sistema.';
  }

  private loadTelevisores(): void {
    this.televisorService.getTelevisores().pipe(take(1)).subscribe({
      next: televisores => {
        this.allTvs = televisores.map(tv => this.mapToTelevisorLocal(tv));
        this.filteredTvs = this.clienteId ? this.allTvs.filter(tv => tv.clienteId === this.clienteId) : this.allTvs;
        this.loadTvImageCounts();
      },
      error: err => {
        console.error("Error al cargar televisores:", err);
        this.snackbarService.presentToastDanger("Error fatal: No se pudieron cargar los televisores.");
        this.filteredTvs = [];
      }
    });
  }

  private mapToTelevisorLocal(tv: Televisor): TelevisorLocal {
    return { ...tv, imagenesCount: 0, estado: tv.estado, resolucion: tv.configuracion?.resolucion || 'N/A' };
  }

  private loadTvImageCounts(): void {
    this.filteredTvs.forEach(tv => {
      this.imagenService.getImagenesByTelevisor(tv.id).pipe(take(1)).subscribe({
        next: imgs => tv.imagenesCount = imgs.length,
        error: err => {
          console.error(`Error al contar imágenes para TV ${tv.id}:`, err);
          tv.imagenesCount = 0;
        }
      });
    });
  }

  // --- GESTIÓN DE MODALES ---
  openNewTvModal(): void {
    new bootstrap.Modal(document.getElementById('newTvModal')).show();
  }

  async onSubmitNewTv(): Promise<void> {
    if (this.newTvForm.invalid) {
      this.snackbarService.presentToastWarning('Por favor, completa todos los campos requeridos.');
      return;
    }
    const form = this.newTvForm.value;
    const request: CreateTelevisorRequest = {
      nombre: form.nombre, ubicacion: form.ubicacion, clienteId: this.clienteId || form.clienteId, activo: true,
      configuracion: { resolucion: form.resolucion, orientacion: 'horizontal', tiempoTransicion: 5000 }
    };
    try {
      await this.televisorService.createTelevisor(request);
      this.snackbarService.presentToastSuccess('Televisor creado con éxito');
      this.loadTelevisores();
      bootstrap.Modal.getInstance(document.getElementById('newTvModal'))?.hide();
    } catch (err) {
      this.snackbarService.presentToastDanger('Error al crear el televisor');
    }
  }

  openImageModal(tv: TelevisorLocal): void {
    this.selectedTv = tv;
    this.showImageModal = true;
    this.loadTvImages(tv.id);
  }

  closeImageModal(): void {
    this.showImageModal = false;
    this.currentModalStep = 'images';
    this.resetScheduleStep();
  }

  private async loadTvImages(tvId: string): Promise<void> {
    try {
      const images$ = this.imagenService.getImagenesByTelevisor(tvId).pipe(take(1));
      const images = await lastValueFrom(images$);
      this.selectedTvImages = images.map((img, index) => ({
        ...img,
        uiColor: this.colorPalette[index % this.colorPalette.length],
        showDetails: false // Inicializa showDetails a false
      }));
    } catch (error) {
      this.selectedTvImages = [];
      this.snackbarService.presentToastDanger('No se pudieron cargar las imágenes.');
    }
  }

  // --- LÓGICA DE PROGRAMACIÓN ---
  programarImagen(image: ImagenTvLocal): void {
    this.selectedImage = image;
    this.currentModalStep = 'schedule';
    this.resetScheduleStep();
  }

  backToImages(): void {
    this.currentModalStep = 'images';
  }

  private resetScheduleStep(): void {
    this.selectionStart = null;
    if (this.timeSlots.length > 0) {
      this.timeSlots.forEach(s => { if(s.status === 'selected') s.status = 'available' });
    }
    this.scheduleForm.reset({ horaInicio: '', horaFin: '' });
    this.selectedDays = [];
    this.timeSlots = [];
  }

  private static toMinutes(time: string): number {
    if (!time) return 0;
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  private getImageInitials(name: string): string {
    if (!name) return '?';
    const words = name.split(' ');
    if (words.length > 1) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  buildScheduleTimeline(): void {
    if (this.selectedDays.length === 0) {
      this.timeSlots = [];
      return;
    }
    const stepMinutes = 30;
    const slots: TimeSlot[] = [];
    for (let min = 0; min < 24 * 60; min += stepMinutes) {
      const time = `${Math.floor(min / 60).toString().padStart(2, '0')}:${(min % 60).toString().padStart(2, '0')}`;
      slots.push({ time, status: 'available' });
    }
    const allSchedules = this.selectedTvImages.flatMap(img => img.horarios.map(h => ({ ...h, imageName: img.nombre, color: img.uiColor })));
    slots.forEach(slot => {
      const slotStart = TelevisoresPage.toMinutes(slot.time);
      const slotEnd = slotStart + stepMinutes;
      for (const schedule of allSchedules) {
        if (schedule.dias.some(d => this.selectedDays.includes(d.value))) {
          const scheduleStart = TelevisoresPage.toMinutes(schedule.horaInicio);
          const scheduleEnd = TelevisoresPage.toMinutes(schedule.horaFin);
          if (slotStart < scheduleEnd && slotEnd > scheduleStart) {
            slot.status = 'occupied';
            slot.occupiedBy = schedule.imageName;
            slot.color = schedule.color;
            break;
          }
        }
      }
    });
    this.timeSlots = slots;
  }

  onTimeSlotClick(clickedSlot: TimeSlot): void {
    if (clickedSlot.status === 'occupied') return;
    if (this.selectionStart === clickedSlot) {
      this.clearScheduleSelection();
      return;
    }
    if (!this.selectionStart) {
      this.selectionStart = clickedSlot;
      clickedSlot.status = 'selected';
      this.scheduleForm.patchValue({ horaInicio: clickedSlot.time, horaFin: '' });
    } else {
      const startIndex = this.timeSlots.indexOf(this.selectionStart);
      const endIndex = this.timeSlots.indexOf(clickedSlot);
      const [start, end] = startIndex > endIndex ? [endIndex, startIndex] : [startIndex, endIndex];
      const range = this.timeSlots.slice(start, end + 1);
      if (range.some(slot => slot.status === 'occupied')) {
        this.snackbarService.presentToastDanger('La selección no puede cruzar un horario ocupado.');
        this.clearScheduleSelection();
        return;
      }
      this.clearScheduleSelection(false);
      range.forEach(slot => slot.status = 'selected');
      const finalSlotIndex = end + 1;
      const finalTime = finalSlotIndex < this.timeSlots.length ? this.timeSlots[finalSlotIndex].time : '23:59';
      this.scheduleForm.patchValue({ horaInicio: this.timeSlots[start].time, horaFin: finalTime });
    }
  }

  clearScheduleSelection(resetForm: boolean = true): void {
    this.timeSlots.forEach(slot => {
      if (slot.status === 'selected') slot.status = 'available';
    });
    this.selectionStart = null;
    if(resetForm) {
      this.scheduleForm.reset({ horaInicio: '', horaFin: '' });
    }
  }

  private checkScheduleConflict(newSchedule: { horaInicio: string; horaFin: string; dias: number[] }): { conflict: boolean; message: string } {
    const allSchedules = this.selectedTvImages.flatMap(img => img.horarios.map(h => ({ ...h, imageName: img.nombre })));
    const newStart = TelevisoresPage.toMinutes(newSchedule.horaInicio);
    const newEnd = TelevisoresPage.toMinutes(newSchedule.horaFin);
    for (const existing of allSchedules) {
        const hasCommonDays = existing.dias.some(d => newSchedule.dias.includes(d.value));
        if (hasCommonDays) {
            const existingStart = TelevisoresPage.toMinutes(existing.horaInicio);
            const existingEnd = TelevisoresPage.toMinutes(existing.horaFin);
            if (newStart < existingEnd && existingStart < newEnd) {
                return { conflict: true, message: `Conflicto con "${existing.imageName}" (${existing.horaInicio} - ${existing.horaFin})` };
            }
        }
    }
    return { conflict: false, message: '' };
  }

  async addScheduleToImage(): Promise<void> {
    if (this.scheduleForm.invalid) { this.snackbarService.presentToastWarning('El rango de horas no es válido.'); return; }
    if (this.selectedDays.length === 0) { this.snackbarService.presentToastWarning('Debes seleccionar al menos un día.'); return; }
    const formValue = this.scheduleForm.value;
    const newScheduleData = { ...formValue, dias: this.selectedDays };
    const conflict = this.checkScheduleConflict(newScheduleData);
    if (conflict.conflict) {
      this.snackbarService.presentToastDanger(conflict.message);
      return;
    }
    this.guardandoHorario = true;
    const nuevoHorario: Omit<HorarioImagen, 'id'> = { ...formValue, dias: this.getSelectedDaysAsObjects() };
    try {
      await lastValueFrom(this.imagenService.agregarHorario(this.selectedImage!.id, nuevoHorario));
      this.snackbarService.presentToastSuccess('Horario guardado');
      await this.loadTvImages(this.selectedTv!.id);
      this.backToImages();
    } catch (error) {
      this.snackbarService.presentToastDanger('Error al guardar el horario');
    } finally {
      this.guardandoHorario = false;
    }
  }

  async removeSchedule(image: ImagenTv, scheduleId: string): Promise<void> {
    if (!confirm('¿Eliminar este horario?')) return;
    try {
      await lastValueFrom(this.imagenService.eliminarHorario(image.id, scheduleId));
      this.snackbarService.presentToastSuccess('Horario eliminado');
      await this.loadTvImages(this.selectedTv!.id);
    } catch {
      this.snackbarService.presentToastDanger('Error al eliminar');
    }
  }

  // --- SELECTOR DE DÍAS ---
  onDayChange(day: DiaSemana): void {
    const idx = this.selectedDays.indexOf(day.value);
    if (idx > -1) this.selectedDays.splice(idx, 1); else this.selectedDays.push(day.value);
    this.clearScheduleSelection();
    this.buildScheduleTimeline();
  }
  selectAllDays(): void { this.selectedDays = this.diasSemana.map(d => d.value); this.clearScheduleSelection(); this.buildScheduleTimeline(); }
  selectWeekdays(): void { this.selectedDays = [1, 2, 3, 4, 5]; this.clearScheduleSelection(); this.buildScheduleTimeline(); }
  selectWeekends(): void { this.selectedDays = [6, 0]; this.clearScheduleSelection(); this.buildScheduleTimeline(); }
  clearDays(): void { this.selectedDays = []; this.timeSlots = []; this.clearScheduleSelection(); }
  getSelectedDaysAsObjects(): DiaSemana[] {
    return this.diasSemana.filter(d => this.selectedDays.includes(d.value));
  }

  // --- HELPERS Y OTROS ---
  getDaysText(dias: DiaSemana[]): string {
    if (!dias || dias.length === 0) return 'Sin días';
    if (dias.length === 7) return 'Todos los días';
    const dayNames: { [key: number]: string } = { 0: 'D', 1: 'L', 2: 'M', 3: 'X', 4: 'J', 5: 'V', 6: 'S' };
    return dias.map(dia => dayNames[dia.value] || '?').join(', ');
  }
  is24_7(image: ImagenTv): boolean { return image.horarios.length === 0; }
  
  // Lógica de carga de archivos
  onDragOver(event: DragEvent): void { event.preventDefault(); this.isDragOver = true; }
  onDragLeave(event: DragEvent): void { event.preventDefault(); this.isDragOver = false; }
  onMultipleDrop(event: DragEvent): void {
    event.preventDefault(); this.isDragOver = false;
    if (event.dataTransfer?.files) this.selectedFiles = Array.from(event.dataTransfer.files);
  }
  onMultipleFileSelect(event: any): void { this.selectedFiles = Array.from(event.target.files); }
  removeSelectedFile(index: number): void { this.selectedFiles.splice(index, 1); }
  
  uploadMultipleImages(): void {
    if (!this.selectedTv || this.selectedFiles.length === 0) return;
    this.isUploading = true;
    setTimeout(() => {
      this.isUploading = false;
      this.snackbarService.presentToastSuccess(`${this.selectedFiles.length} imágenes subidas (simulación)`);
      this.selectedFiles = [];
      this.loadTvImages(this.selectedTv!.id);
      this.loadTelevisores();
    }, 1500);
  }

  deleteImage(image: ImagenTv): void {
    if (!confirm('¿Estás seguro?')) return;
    this.imagenService.deleteImagen(image).subscribe({
      next: () => {
        this.snackbarService.presentToastSuccess('Imagen eliminada');
        this.loadTvImages(this.selectedTv!.id);
        this.loadTelevisores();
      },
      error: (err) => this.snackbarService.presentToastDanger('Error al eliminar la imagen'),
    });
  }
}