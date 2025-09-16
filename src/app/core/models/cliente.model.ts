export interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
  activo: boolean;
  fechaCreacion: Date;
  televisores?: any[];
  configuracion: ConfiguracionCliente;
}

export interface ConfiguracionCliente {
  rotacionAutomatica: boolean;
  tiempoRotacion: number;
  horarioOperacion: HorarioOperacion;
}

export interface HorarioOperacion {
  inicio: string;
  fin: string;
}

export interface CreateClienteRequest {
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
  activo?: boolean;
  configuracion?: Partial<ConfiguracionCliente>;
}

export interface UpdateClienteRequest {
  nombre?: string;
  email?: string;
  activo?: boolean;
  configuracion?: Partial<ConfiguracionCliente>;
}