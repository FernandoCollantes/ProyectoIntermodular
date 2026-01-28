// Para MOSTRAR preguntas (Lectura)
export interface Pregunta {
    _id: string; // Obligatorio aquí porque ya existe en BD
    enunciado: string;
    opciones: string[];
    respuesta_correcta: string;
    asignatura: string; 
    tema: string;
    dificultad: number;
    criterios: string[];
}

// Para CREAR preguntas (Envío al endpoint de Andy)
export interface CrearPreguntaDto {
    enunciado: string;
    asignatura: string;        // ID del Módulo (ej: "0179")
    tema: string;              // Nombre del RA (ej: "RA1: Comprende...")
    dificultad: number;        // 3, 5 u 8
    respuesta_correcta: string; // El texto de la opción correcta
    opciones: string[];        // Las 4 opciones juntas
    criterios: string[];       // Array de códigos de los criterios seleccionados
}