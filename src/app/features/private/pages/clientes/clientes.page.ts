import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Cliente, CreateClienteRequest, UpdateClienteRequest } from '../../../../core/models/cliente.model';
import { ClienteService } from '../../../../core/services/cliente.service';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.page.html',
  styleUrls: ['./clientes.page.scss']
})
export class ClientesPage implements OnInit {
  
  clientes$: Observable<Cliente[]>;
  filteredClientes: Cliente[] = [];
  searchTerm: string = '';
  showCreateModal: boolean = false;
  clienteForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder, 
    private router: Router,
    private clienteService: ClienteService
  ) {
    this.clienteForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.email]],
      telefono: [''],
      direccion: [''],
      activo: [true]
    });
    
    this.clientes$ = this.clienteService.getClientes();
  }

  ngOnInit() {
    this.clientes$.subscribe(clientes => {
      this.filteredClientes = clientes;
    });
  }

  filterClientes() {
    this.clientes$.subscribe(clientes => {
      if (!this.searchTerm.trim()) {
        this.filteredClientes = [...clientes];
        return;
      }

      const term = this.searchTerm.toLowerCase().trim();
      this.filteredClientes = clientes.filter(cliente =>
        cliente.nombre.toLowerCase().includes(term) ||
        cliente.email.toLowerCase().includes(term)
      );
    });
  }

  openCreateModal() {
    this.showCreateModal = true;
    this.clienteForm.reset({
      nombre: '',
      email: '',
      telefono: '',
      direccion: '',
      activo: true
    });
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.clienteForm.reset();
  }

  async createCliente() {
    if (this.clienteForm.valid) {
      try {
        const clienteData: CreateClienteRequest = {
          nombre: this.clienteForm.value.nombre,
          email: this.clienteForm.value.email,
          telefono: this.clienteForm.value.telefono,
          direccion: this.clienteForm.value.direccion,
          activo: this.clienteForm.value.activo
        };
        
        await this.clienteService.createCliente(clienteData);
        this.closeCreateModal();
        this.showSuccessMessage('Cliente creado exitosamente');
      } catch (error) {
        console.error('Error al crear cliente:', error);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.clienteForm.controls).forEach(key => {
      const control = this.clienteForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  verTelevisores(cliente: Cliente) {
    this.router.navigate(['/private/televisores'], { 
      queryParams: { clienteId: cliente.id } 
    });
  }

  openOptionsMenu(cliente: Cliente) {
    console.log('Opciones para cliente:', cliente);
  }

  private showSuccessMessage(message: string) {
    console.log('Éxito:', message);
  }

  private showInfoMessage(message: string) {
    console.log('Info:', message);
  }

  get nombreControl() {
    return this.clienteForm.get('nombre');
  }

  get emailControl() {
    return this.clienteForm.get('email');
  }

  get activoControl() {
    return this.clienteForm.get('activo');
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.clienteForm.get(controlName);
    return !!(control && control.hasError(errorType) && (control.dirty || control.touched));
  }

  getErrorMessage(controlName: string): string {
    const control = this.clienteForm.get(controlName);
    if (control && control.errors && (control.dirty || control.touched)) {
      const fieldName = this.getFieldName(controlName);
      
      if (control.errors['required']) {
        return `${fieldName} es requerido`;
      }
      if (control.errors['email']) {
        return `${fieldName} debe ser un email válido`;
      }
      if (control.errors['minlength']) {
        const requiredLength = control.errors['minlength'].requiredLength;
        return `${fieldName} debe tener al menos ${requiredLength} caracteres`;
      }
    }
    return '';
  }

  private getFieldName(controlName: string): string {
    const fieldNames: { [key: string]: string } = {
      'nombre': 'Nombre',
      'email': 'Email',
      'activo': 'Estado'
    };
    return fieldNames[controlName] || controlName;
  }
}
