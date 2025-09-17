import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/models/user.model';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { Observable, lastValueFrom } from 'rxjs';

declare const bootstrap: any;

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss']
})
export class UsersPage implements OnInit {
  users$: Observable<User[]>;
  filteredUsers: User[] = [];
  userForm!: FormGroup;
  showUserModal: boolean = false;
  isEditMode: boolean = false;
  currentUser: User | null = null;

  roles: ('admin' | 'editor' | 'normal')[] = ['admin', 'editor', 'normal'];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackbarService: SnackbarService
  ) {
    this.users$ = this.userService.getUsers();
  }

  ngOnInit(): void {
    this.initializeForm();
    this.users$.subscribe(users => {
      this.filteredUsers = users;
    });
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      id: [null],
      nombre: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['normal', Validators.required],
      activo: [true]
    });
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.currentUser = null;
    this.userForm.reset({
      nombre: '',
      username: '',
      email: '',
      password: '',
      role: 'normal',
      activo: true
    });
    // Habilitar el campo de contraseña para creación
    this.userForm.get('password')?.enable();
    new bootstrap.Modal(document.getElementById('userModal')).show();
  }

  openEditModal(user: User): void {
    this.isEditMode = true;
    this.currentUser = user;
    this.userForm.patchValue(user);
    // Deshabilitar el campo de contraseña para edición (a menos que se quiera cambiar)
    this.userForm.get('password')?.disable();
    new bootstrap.Modal(document.getElementById('userModal')).show();
  }

  closeUserModal(): void {
    bootstrap.Modal.getInstance(document.getElementById('userModal'))?.hide();
    this.userForm.reset();
  }

  async onSubmit(): Promise<void> {
    if (this.userForm.invalid) {
      this.snackbarService.presentToastWarning('Por favor, completa todos los campos requeridos.');
      return;
    }

    const userData: User = this.userForm.getRawValue(); // getRawValue para incluir campos deshabilitados

    try {
      if (this.isEditMode) {
        await this.userService.updateUser(userData);
        this.snackbarService.presentToastSuccess('Usuario actualizado con éxito');
      } else {
        await this.userService.createUser(userData);
        this.snackbarService.presentToastSuccess('Usuario creado con éxito');
      }
      this.closeUserModal();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      this.snackbarService.presentToastDanger('Error al guardar usuario.');
    }
  }

  async deleteUser(user: User): Promise<void> {
    if (!user.id) return;
    if (confirm(`¿Estás seguro de que quieres eliminar a ${user.username}?`)) {
      try {
        await this.userService.deleteUser(user.id);
        this.snackbarService.presentToastSuccess('Usuario eliminado con éxito');
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        this.snackbarService.presentToastDanger('Error al eliminar usuario.');
      }
    }
  }

  // Helper para mostrar el rol de forma legible
  getRoleText(role: string): string {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'editor': return 'Editor';
      case 'normal': return 'Normal';
      default: return role;
    }
  }

  // Helper para formatear la fecha
  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }
}