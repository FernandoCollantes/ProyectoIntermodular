import { Pregunta } from './pregunta.model';

// Legacy interface for exam preview
export interface ExamenPreview {
    fecha_creacion: Date;
    preguntas: Pregunta[];
    nombre?: string;
}

export interface GenerateExamParams {
    subject: string;
    amount: number;
}

export interface DownloadExamDto extends ExamenPreview {
    nombre: string;
}

// New Exam interface for draft/published system
export interface Examen {
    _id?: string;
    titulo: string;
    asignatura: string;
    ras: string[];
    duracion: number;
    intentos: number;
    preguntas: string[]; // Array of question IDs
    opciones: {
        aleatorio: boolean;
        respuestas_inmediatas: boolean;
        limite_tiempo: boolean;
        navegacion_libre: boolean;
    };
    estado: 'borrador' | 'publicado';
    creador: string;
    createdAt?: Date;
    updatedAt?: Date;
}
