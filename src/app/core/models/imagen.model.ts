export interface ImagenTv {
  id: string;
  nombre: string;
  url: string;
  televisorId: string;
  clienteId?: string;
  horarios: HorarioImagen[];
  fechaCreacion: Date;
  archivo?: File; // Campo opcional para el archivo durante la carga
}

export interface HorarioImagen {
  id: string;
  horaInicio: string;
  horaFin: string;
  dias: DiaSemana[];
}

export interface DiaSemana {
  value: number; // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  label: string;
}
