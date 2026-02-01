// Para MOSTRAR preguntas (Lectura)
export interface Pregunta {
    _id: string; // Obligatorio aquí porque ya existe en BD
    enunciado: string;
    opciones: string[];
    respuesta_correcta: number; // Index of the correct answer (0-3)
    asignatura: string;
    tema: string[];            // Array de códigos de RAs (ej: ["RA1", "RA2"])
    dificultad: number;
}

// Para CREAR preguntas (Envío al endpoint de Andy)
export interface CrearPreguntaDto {
    enunciado: string;
    asignatura: string;        // ID del Módulo (ej: "0179")
    tema: string[];            // Array de códigos de RAs (ej: ["RA1", "RA2"])
    dificultad: number;        // 3, 5 u 8
    respuesta_correcta: string; // El índice como string para el form
    opciones: string[];        // Las 4 opciones juntas
    criterios?: string[];      // Opcional, mantendremos compatibilidad si es necesario
}