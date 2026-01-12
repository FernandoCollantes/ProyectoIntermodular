import { Pregunta } from './pregunta.model';

export interface Examen {
    fecha_creacion: Date;
    preguntas: Pregunta[];
    nombre?: string; // Optional name for PDF
}

export interface GenerateExamParams {
    subject: string;
    amount: number;
}

export interface DownloadExamDto extends Examen {
    nombre: string;
}
