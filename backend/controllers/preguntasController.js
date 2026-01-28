const preguntasService = require('../services/preguntasService');

exports.searchQuestions = async (req, res) => {
    try {
        const { subject, difficulty, theme, criterioId, resultadoId } = req.query;
        const questionsList = await preguntasService.getQuestionsByCriteria({
            subject, difficulty, theme, criterioId, resultadoId
        });
        res.status(200).json({ success: true, total_found: questionsList.length, questions: questionsList });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.addQuestion = async (req, res) => {
    try {
        const { enunciado, asignatura, criterios_evaluacion, dificultad, respuesta_correcta, incorrect_options } = req.body;
        if (!enunciado || !asignatura || !criterios_evaluacion || !respuesta_correcta) return res.status(400).json({ success: false, message: 'Faltan campos.' });

        const criteriosArray = Array.isArray(criterios_evaluacion) ? criterios_evaluacion : [criterios_evaluacion];
        const newQuestion = await preguntasService.createQuestion({
            enunciado, asignatura, criterios_evaluacion: criteriosArray,
            dificultad: parseInt(dificultad) || 1,
            respuesta_correcta, incorrect_options
        });
        res.status(201).json({ success: true, message: 'Pregunta creada', question: newQuestion });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};