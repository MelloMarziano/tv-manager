export interface Contenido {
  id: string;
  clienteId: string;
  nombre: string;
  tipo: 'imagen' | 'video';
  url: string;
  activo: boolean;
  fechaCreacion: Date;
  metadata: MetadataContenido;
}

export interface MetadataContenido {
  tamaño: number;
  duracion?: number;
  resolucion: string;
  formato: string;
}

export interface CreateContenidoRequest {
  clienteId: string;
  nombre: string;
  tipo: 'imagen' | 'video';
  archivo: File;
  activo?: boolean;
}

export interface UpdateContenidoRequest {
  nombre?: string;
  activo?: boolean;
}