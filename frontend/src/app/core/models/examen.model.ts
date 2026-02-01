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
    preguntas: string[]; // Array of question IDs
    estado: 'borrador' | 'publicado';
    creador: string;
    duracion?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
