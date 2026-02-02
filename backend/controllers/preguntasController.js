const preguntasService = require('../services/preguntasService');
const pdfService = require('../services/pdfService');

/**
 * Genera y descarga un PDF del examen
 */
exports.downloadPdf = async (req, res) => {
    try {
        const examData = req.body; // Expects DownloadExamDto structure

        if (!examData || !examData.preguntas) {
            return res.status(400).json({ success: false, message: 'Datos del examen inválidos' });
        }

        const doc = pdfService.generateExamPdf(examData);

        // Set response headers regarding the PDF file
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${examData.nombre || 'examen'}.pdf"`);

        // Pipe the document to the response
        doc.pipe(res);

    } catch (e) {
        console.error("Error generating PDF:", e);
        res.status(500).json({ success: false, message: e.message });
    }
};

/**
 * Busca preguntas basadas en criterios de filtrado
 */
exports.searchQuestions = async (req, res) => {
    try {
        // Adaptamos los filtros al nuevo esquema (asignatura y tema/RA)
        const { asignatura, dificultad, tema, creador } = req.query;

        const questionsList = await preguntasService.getQuestionsByCriteria({
            asignatura,
            dificultad,
            tema,
            creador
        });

        res.status(200).json({
            success: true,
            total_found: questionsList.length,
            questions: questionsList
        });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

/**
 * Añade una nueva pregunta al sistema
 */
exports.addQuestion = async (req, res) => {
    try {
        const {
            enunciado,
            asignatura,         // Nombre del módulo (ej: "Sistemas Informáticos")
            tema,               // Código del RA (ej: "RA1")
            dificultad,         // Número (0, 1, 2)
            opciones,           // Array de strings [opt1, opt2, opt3, opt4]
            respuesta_correcta, // Índice numérico (0-3)
            creador
        } = req.body;

        // 1. Validación de campos obligatorios
        if (!enunciado || !asignatura || !tema || !opciones || respuesta_correcta === undefined || !creador) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos obligatorios para crear la pregunta.'
            });
        }

        // 2. Validación de consistencia de RAs (tema debe ser array)
        if (!Array.isArray(tema) || tema.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'La pregunta debe estar asociada a al menos un RA (tema).'
            });
        }

        // 3. Validación de consistencia de opciones
        if (!Array.isArray(opciones) || opciones.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'La pregunta debe tener al menos dos opciones.'
            });
        }

        // 3. Llamada al servicio para persistencia
        // Pasamos el objeto limpio directamente al servicio
        const newQuestion = await preguntasService.createQuestion({
            enunciado,
            asignatura,
            tema,
            opciones,
            dificultad: Number(dificultad),
            respuesta_correcta: Number(respuesta_correcta),
            creador
        });

        res.status(201).json({
            success: true,
            message: '¡Pregunta creada con éxito!',
            question: newQuestion
        });

    } catch (error) {
        console.error("Error en el controlador al crear pregunta:", error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor: ' + error.message
        });
    }
}


/**
 * Elimina una pregunta (requiere ID)
 */
exports.deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await preguntasService.deleteQuestion(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Pregunta no encontrada' });
        }
        res.status(200).json({ success: true, message: 'Pregunta eliminada' });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

/**
 * Actualiza una pregunta (requiere ID)
 */
exports.updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        // Ensure respuesta_correcta is integer if present
        if (data.respuesta_correcta !== undefined) {
            data.respuesta_correcta = Number(data.respuesta_correcta);
        }

        const updated = await preguntasService.updateQuestion(id, data);
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Pregunta no encontrada' });
        }
        res.status(200).json({ success: true, message: 'Pregunta actualizada', question: updated });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

/**
 * Obtiene una pregunta por ID
 */
exports.getQuestionById = async (req, res) => {
    try {
        const { id } = req.params;
        const question = await preguntasService.getQuestionById(id);
        if (!question) {
            return res.status(404).json({ success: false, message: 'Pregunta no encontrada' });
        }
        res.status(200).json({ success: true, question });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

/**
 * Añade múltiples preguntas al sistema (bulk)
 */
exports.bulkAdd = async (req, res) => {
    try {
        const questions = req.body;

        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere un array de preguntas no vacío.'
            });
        }

        const results = await preguntasService.bulkCreateQuestions(questions);

        res.status(201).json({
            success: true,
            message: `¡${results.length} preguntas creadas con éxito!`,
            questions: results
        });

    } catch (error) {
        console.error("Error en el controlador al crear preguntas en bloque:", error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor: ' + error.message
        });
    }
};