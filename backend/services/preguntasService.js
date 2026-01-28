const PreguntaModel = require('../models/PreguntaModelo');
const AsignaturaModel = require('../models/Asignatura');
const CriterioModel = require('../models/Criterio');
const PreguntaClass = require('../classes/Pregunta');

exports.getQuestionsByCriteria = async (filters) => {
    try {
        const { subject, difficulty, theme, criterioId, resultadoId } = filters;
        const matchCriteria = {};

        if (subject) {
            const asigDoc = await AsignaturaModel.findOne({ nombre: { $regex: new RegExp(subject, 'i') } });
            if (asigDoc) matchCriteria.asignatura = asigDoc._id;
            else return [];
        }

        if (criterioId) {
            matchCriteria.criterios_evaluacion = criterioId;
        } else if (resultadoId) {
            // Si filtramos por RA, buscamos todos sus criterios
            const criterios = await CriterioModel.find({ resultadoAprendizaje: resultadoId });
            const idsCriterios = criterios.map(c => c._id);
            matchCriteria.criterios_evaluacion = { $in: idsCriterios };
        } else if (theme) {
            const critDoc = await CriterioModel.findOne({ nombre: { $regex: new RegExp(theme, 'i') } });
            if (critDoc) matchCriteria.criterios_evaluacion = critDoc._id;
            else return [];
        }

        if (difficulty) matchCriteria.dificultad = parseInt(difficulty, 10);

        const rawQuestions = await PreguntaModel.find(matchCriteria)
            .populate('asignatura', 'nombre')
            .populate('criterios_evaluacion', 'nombre')
            .lean();

        return rawQuestions.map(q => {
            const criteriosStr = q.criterios_evaluacion ? q.criterios_evaluacion.map(c => c.nombre).join(', ') : 'General';
            const adaptedQ = {
                ...q,
                asignatura: q.asignatura ? q.asignatura.nombre : 'Sin Asignatura',
                tema: criteriosStr
            };
            const preguntaInstance = new PreguntaClass(adaptedQ);
            return preguntaInstance.getClientData();
        });
    } catch (error) {
        throw new Error('Error al recuperar preguntas: ' + error.message);
    }
};

exports.createQuestion = async (data) => {
    try {
        const { incorrect_options, respuesta_correcta, ...rest } = data;
        const allOptions = [respuesta_correcta, ...incorrect_options];
        const questionToSave = {
            ...rest,
            respuesta_correcta,
            opciones: allOptions
        };
        const newQuestion = new PreguntaModel(questionToSave);
        return await newQuestion.save();
    } catch (error) {
        throw new Error('Error al guardar la pregunta: ' + error.message);
    }
};