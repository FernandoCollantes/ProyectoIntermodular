const PreguntaModel = require('../models/PreguntaModelo');
const PreguntaClass = require('../classes/Pregunta');

/**
 * Recupera preguntas filtradas por el nuevo esquema de Módulos y RAs
 */
exports.getQuestionsByCriteria = async (filters) => {
    try {
        const { asignatura, dificultad, tema, creador } = filters;
        const matchCriteria = {};

        // Filtros directos por String (más eficientes)
        if (asignatura) {
            matchCriteria.asignatura = { $regex: new RegExp(asignatura, 'i') };
        }

        if (tema) {
            // MongoDB maneja automáticamente el regex en arrays:
            // busca si ALGUNO de los elementos del array coincide con el regex.
            matchCriteria.tema = { $regex: new RegExp(tema, 'i') };
        }

        if (dificultad !== undefined && dificultad !== '') {
            matchCriteria.dificultad = parseInt(dificultad, 10);
        }

        if (creador) {
            matchCriteria.creador = creador;
        }

        const rawQuestions = await PreguntaModel.find(matchCriteria)
            .sort({ createdAt: -1 })
            .lean();

        // Adaptamos los resultados al formato que espera el Frontend
        return rawQuestions.map(q => {
            // Usamos la clase Pregunta para formatear si es necesario
            const preguntaInstance = new PreguntaClass(q);
            return preguntaInstance.getClientData();
        });
    } catch (error) {
        throw new Error('Error al recuperar preguntas: ' + error.message);
    }
};

/**
 * Guarda la pregunta directamente como viene del controlador
 */
exports.createQuestion = async (data) => {
    try {
        // 'data' ya contiene: enunciado, opciones, respuesta_correcta (index), 
        // asignatura, tema, dificultad y creador.
        const newQuestion = new PreguntaModel(data);
        return await newQuestion.save();
    } catch (error) {
        // Si hay un error de validación en el Modelo, saltará aquí
        throw new Error('Error en la base de datos al guardar: ' + error.message);
    }
}


/**
 * Elimina una pregunta por ID
 */
exports.deleteQuestion = async (id) => {
    return await PreguntaModel.findByIdAndDelete(id);
};

/**
 * Actualiza una pregunta por ID
 */
exports.updateQuestion = async (id, data) => {
    return await PreguntaModel.findByIdAndUpdate(id, data, { new: true });
};

/**
 * Obtiene una pregunta por ID
 */
exports.getQuestionById = async (id) => {
    return await PreguntaModel.findById(id).lean();
};