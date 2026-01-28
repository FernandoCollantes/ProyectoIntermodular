/**
 * Refleja el Criterio_de_Evaluacion del XML 
 * y el esquema Criterio de Andy.
 */
export interface Criterio {
    _id?: string;        // ID de MongoDB
    codigo: string;      // XML: cod="a"
    nombre: string;      // XML: nombre="Se ha identificado..."
    descripcion?: string; // Por si Andy usa este campo para texto largo
}

/**
 * Refleja el Resultado_de_Aprendizaje del XML.
 * (Pendiente de implementar por Andy en Backend)
 */
export interface ResultadoAprendizaje {
    codigo: string;      // XML: cod="1"
    nombre: string;      // XML: nombre="Comprende información..."
    criterios: Criterio[];
}

/**
 * Refleja el Modulo del XML 
 * y el esquema Asignatura de Andy.
 */
export interface AsignaturaJerarquia {
    _id: string;         // El código (ej: "0179")
    nombre: string;      // El nombre (ej: "Inglés profesional GS")
    resultados_aprendizaje?: ResultadoAprendizaje[];
}

/**
 * Refleja el Titulo del XML 
 * y el esquema Curso de Andy.
 */
export interface CursoJerarquia {
    _id: string;         // El código del ciclo (ej: "ADG03S")
    nombre: string;      // El nombre del ciclo (ej: "Adm. y Finanzas")
    asignaturas: AsignaturaJerarquia[];
}