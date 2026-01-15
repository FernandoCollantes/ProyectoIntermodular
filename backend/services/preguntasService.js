const PreguntaModel = require('../models/PreguntaModelo');
const AsignaturaModel = require('../models/Asignatura');
const CriterioModel = require('../models/Criterio');
const PreguntaClass = require('../classes/Pregunta'); 

exports.getQuestionsByCriteria = async (asignaturaNombre, dificultad, criterioNombre) => {
    try {
        const matchCriteria = {};
        
        if (asignaturaNombre) {
            const asigDoc = await AsignaturaModel.findOne({ nombre: { $regex: new RegExp(asignaturaNombre, 'i') } });
            if (asigDoc) matchCriteria.asignatura = asigDoc._id;
            else return []; 
        }
        
        if (criterioNombre) {
            const critDoc = await CriterioModel.findOne({ nombre: { $regex: new RegExp(criterioNombre, 'i') } });
            if (critDoc) matchCriteria.criterios_evaluacion = critDoc._id;
            else return []; 
        }
        
        if (dificultad) matchCriteria.dificultad = parseInt(dificultad, 10);

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