export interface Pregunta {
    _id?: string;
    enunciado: string;
    opciones: string[];
    respuesta_correcta: string;
    asignatura: string;
    tema: string;
    dificultad: number;
}

// Ahora el DTO es idéntico a lo que espera Mongoose
export interface CrearPreguntaDto {
    enunciado: string;
    asignatura: string;
    tema: string;
    dificultad: number;
    respuesta_correcta: string;
    opciones: string[]; // <--- Cambiado de incorrect_options a opciones
}