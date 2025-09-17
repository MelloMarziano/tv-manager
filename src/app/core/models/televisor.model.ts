export interface Televisor {
  id: string;
  clienteId: string | null;
  clienteNombre?: string;
  nombre: string;
  ubicacion: string;
  activo: boolean;
  estado: 'Activo' | 'Desconectado' | 'En_linea';
  ultimaConexion: Date;
  fechaCreacion: Date;
  configuracion: ConfiguracionTelevisor;
  imagenes?: number;
}

export interface ConfiguracionTelevisor {
  resolucion: string;
  orientacion: 'horizontal' | 'vertical';
  tiempoTransicion: number;
}

export interface CreateTelevisorRequest {
  clienteId?: string | null;
  clienteNombre?: string;
  nombre: string;
  ubicacion: string;
  activo?: boolean;
  estado?: 'Activo' | 'Desconectado' | 'En_linea';
  configuracion?: Partial<ConfiguracionTelevisor>;
}

export interface UpdateTelevisorRequest {
  nombre?: string;
  ubicacion?: string;
  activo?: boolean;
  configuracion?: Partial<ConfiguracionTelevisor>;
}