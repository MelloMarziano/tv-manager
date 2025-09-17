export interface User {
  id?: string; // Firestore document ID
  nombre: string;
  username: string;
  email: string;
  password?: string; // Contraseña (se recomienda hashear antes de guardar)
  role: 'admin' | 'editor' | 'normal'; // Roles predefinidos
  activo?: boolean; // Si el usuario está activo o no
  fechaCreacion?: Date; // Fecha de creación del usuario
}
