const ResultadoAprendizajeModel = require('../models/ResultadoAprendizaje');

// --- CURSOS (OBSOLETO) ---
exports.getCursos = async () => {
    // Ya no usamos la colección Cursos. Devolvemos un array vacío o un mensaje.
    return [];
};

// --- ASIGNATURAS / MÓDULOS ---
/**
 * Obtiene la lista única de nombres de asignaturas (Módulos) 
 * que existen en la colección de Resultados de Aprendizaje.
 */
exports.getAsignaturas = async () => {
    try {
        // .distinct extrae los nombres únicos del campo 'asignatura'
        const asignaturasUnicas = await ResultadoAprendizajeModel.distinct('asignatura');
        return asignaturasUnicas.sort(); // Ordenadas alfabéticamente
    } catch (error) {
        throw new Error('Error al obtener asignaturas: ' + error.message);
    }
};

// --- RESULTADOS DE APRENDIZAJE ---
/**
 * Obtiene los RAs vinculados a un nombre de asignatura específico.
 */
exports.getResultadosAprendizaje = async (nombreAsignatura) => {
    try {
        const query = nombreAsignatura ? { asignatura: nombreAsignatura } : {};

        return await ResultadoAprendizajeModel.find(query)
            .sort({ codigo: 1 }); // Ordenados por RA1, RA2, etc.
    } catch (error) {
        throw new Error('Error al obtener RAs: ' + error.message);
    }
};

// --- CRITERIOS (OBSOLETO) ---
exports.getCriterios = async () => {
    // Ya no existen criterios individuales en el nuevo esquema
    return [];
};

// --- MÉTODOS DE CREACIÓN (Para el script de carga o mantenimiento) ---
exports.createResultadoAprendizaje = async (codigo, texto, asignatura) => {
    const nuevo = new ResultadoAprendizajeModel({
        codigo: codigo,
        texto: texto,
        asignatura: asignatura
    });
    return await nuevo.save();
};