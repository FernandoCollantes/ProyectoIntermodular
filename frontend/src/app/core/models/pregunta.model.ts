// src/app/core/models/pregunta.model.ts

export interface Pregunta {
  _id?: string;
  enunciado: string;
  asignatura: string; // ID del módulo
  tema: string;       // Aquí guardaremos el RA
  dificultad: number;
  respuesta_correcta: string;
  opciones: string[];
  autor?: string;
  createdAt?: Date;
}

// El DTO que enviamos a Andy también se simplifica
export interface CrearPreguntaDto {
  enunciado: string;
  asignatura: string;
  tema: string;
  dificultad: number;
  respuesta_correcta: string;
  opciones: string[];
  // criterios: string[]; <-- ELIMINADO
}