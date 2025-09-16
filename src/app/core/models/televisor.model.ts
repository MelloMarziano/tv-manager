export interface Televisor {
  id: string;
  clienteId: string;
  nombre: string;
  ubicacion: string;
  activo: boolean;
  fechaCreacion: Date;
  configuracion: ConfiguracionTelevisor;
}

export interface ConfiguracionTelevisor {
  resolucion: string;
  orientacion: 'horizontal' | 'vertical';
  tiempoTransicion: number;
}

export interface CreateTelevisorRequest {
  clienteId: string;
  nombre: string;
  ubicacion: string;
  activo?: boolean;
  configuracion?: Partial<ConfiguracionTelevisor>;
}

export interface UpdateTelevisorRequest {
  nombre?: string;
  ubicacion?: string;
  activo?: boolean;
  configuracion?: Partial<ConfiguracionTelevisor>;
}