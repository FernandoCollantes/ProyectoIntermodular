const mongoose = require('mongoose');
const PreguntaModel = require('../models/PreguntaModelo');
const ExamenModel = require('../models/ExamenModelo');
const IntentoModel = require('../models/Intento');
const ExamenClass = require('../classes/Examen');
const PreguntaClass = require('../classes/Pregunta');
const PDFDocument = require('pdfkit');

exports.generateExamPreview = async (subjectId, amount) => {
    try {
        // subjectId es string, no requiere conversión ObjectId
        const randomQuestions = await PreguntaModel.aggregate([
            { $match: { asignatura: subjectId } },
            { $sample: { size: parseInt(amount) } }
        ]);

        if (randomQuestions.length === 0) throw new Error(`No hay preguntas suficientes.`);

        const preguntasConNombres = await PreguntaModel.populate(randomQuestions, [
            { path: 'asignatura' },
            { path: 'criterios_evaluacion' }
        ]);

        const preguntasAdaptadas = preguntasConNombres.map(q => ({
            ...q,
            asignatura: q.asignatura?.nombre || '',
            tema: q.criterios_evaluacion ? q.criterios_evaluacion.map(c => c.nombre).join(', ') : ''
        }));

        const nombreSugerido = `Examen_${Date.now()}`;
        const examenVista = new ExamenClass(nombreSugerido, preguntasAdaptadas);
        const data = examenVista.getClientData();
        data.asignaturaId = subjectId;
        return data;
    } catch (error) {
        throw new Error('Error generando preview: ' + error.message);
    }
};

// --- Guardar con TIPO ---
exports.saveExamToDb = async (examData) => {
    try {
        console.log("DEBUG SERVICE INPUT:", examData); // Ver qué llega

        const { nombre, asignaturaId, preguntasIds, autor, tipo } = examData;
        const preguntasDocs = await PreguntaModel.find({ _id: { $in: preguntasIds } });
        const allCriterios = preguntasDocs.flatMap(q => q.criterios_evaluacion);
        const criteriosIdsStrings = [...new Set(allCriterios.map(id => id.toString()))];

        // Forzamos el tipo explícitamente para ver si es undefined
        const tipoFinal = tipo || 'PRACTICA';
        console.log("DEBUG TIPO A GUARDAR:", tipoFinal);

        const nuevoExamenDB = new ExamenModel({
            nombre,
            asignatura: asignaturaId,
            preguntas: preguntasIds,
            criterios_abarcados: criteriosIdsStrings,
            autor: autor || 'admin',
            tipo: tipoFinal // Asignación directa
        });

        console.log("DEBUG MONGOOSE OBJECT:", nuevoExamenDB); // Ver qué creó Mongoose

        return await nuevoExamenDB.save();
    } catch (error) {
        throw new Error('Error guardando examen: ' + error.message);
    }
};

// --- Buscar con filtro de TIPO ---
exports.searchExams = async (subjectId, autor, tipo) => {
    try {
        const match = {};
        if (subjectId) match.asignatura = subjectId;
        if (autor) match.autor = { $regex: new RegExp(autor, 'i') };
        if (tipo) match.tipo = tipo; // Filtro exacto (OFICIAL / PRACTICA)

        return await ExamenModel.find(match)
            .populate('asignatura', 'nombre')
            .sort({ fecha_creacion: -1 })
            .lean();
    } catch (error) { throw new Error('Error buscando exámenes: ' + error.message); }
};

exports.generateExamPreview = async (subjectId, amount) => {
    try {
        const randomQuestions = await PreguntaModel.aggregate([
            { $match: { asignatura: subjectId } },
            { $sample: { size: parseInt(amount) } }
        ]);

        if (randomQuestions.length === 0) throw new Error(`No hay preguntas suficientes.`);

        const preguntasConNombres = await PreguntaModel.populate(randomQuestions, [
            { path: 'asignatura' },
            { path: 'criterios_evaluacion' }
        ]);

        const preguntasAdaptadas = preguntasConNombres.map(q => ({
            ...q,
            asignatura: q.asignatura?.nombre || '',
            tema: q.criterios_evaluacion ? q.criterios_evaluacion.map(c => c.nombre).join(', ') : ''
        }));

        const nombreSugerido = `Examen_${Date.now()}`;
        const examenVista = new ExamenClass(nombreSugerido, preguntasAdaptadas);
        const data = examenVista.getClientData();
        data.asignaturaId = subjectId;
        return data;
    } catch (error) {
        throw new Error('Error generando preview: ' + error.message);
    }
};

exports.searchExams = async (subjectId, autor) => {
    try {
        const match = {};
        if (subjectId) match.asignatura = subjectId;
        if (autor) match.autor = { $regex: new RegExp(autor, 'i') };
        return await ExamenModel.find(match).populate('asignatura', 'nombre').sort({ fecha_creacion: -1 }).lean();
    } catch (error) { throw new Error('Error buscando exámenes: ' + error.message); }
};

// --- CORRECCIÓN DE EXAMEN ---

exports.submitExamAttempt = async (examId, userAnswers) => {
    try {
        // 1. Recuperar el examen y sus preguntas REALES (con respuesta correcta)
        const examen = await ExamenModel.findById(examId).populate('preguntas');
        if (!examen) throw new Error("Examen no encontrado");

        let aciertos = 0;
        const detallesRespuestas = [];

        // 2. Iterar sobre las preguntas del examen original
        examen.preguntas.forEach(preguntaOriginal => {
            // Buscamos qué respondió el usuario a esta pregunta
            const respuestaUsuario = userAnswers.find(a => a.preguntaId === preguntaOriginal._id.toString());

            const esCorrecta = respuestaUsuario &&
                respuestaUsuario.valor === preguntaOriginal.respuesta_correcta;

            if (esCorrecta) aciertos++;

            detallesRespuestas.push({
                pregunta_id: preguntaOriginal._id,
                respuesta_marcada: respuestaUsuario ? respuestaUsuario.valor : null,
                es_correcta: esCorrecta,
                // Opcional: Devolver cuál era la correcta para feedback inmediato
                correcta_real: preguntaOriginal.respuesta_correcta
            });
        });

        // 3. Calcular Nota (Escala 0-10)
        const totalPreguntas = examen.preguntas.length;
        const notaFinal = totalPreguntas > 0 ? (aciertos / totalPreguntas) * 10 : 0;

        // 4. Guardar el Intento
        const nuevoIntento = new IntentoModel({
            examen_id: examId,
            respuestas: detallesRespuestas.map(d => ({
                pregunta_id: d.pregunta_id,
                respuesta_marcada: d.respuesta_marcada,
                es_correcta: d.es_correcta
            })),
            nota: notaFinal.toFixed(2)
        });

        await nuevoIntento.save();

        // 5. Devolver resultados al frontend
        return {
            nota: notaFinal.toFixed(2),
            aciertos,
            total: totalPreguntas,
            detalles: detallesRespuestas
        };

    } catch (error) {
        throw new Error('Error al corregir examen: ' + error.message);
    }
};


// --- NUEVO: OBTENER HISTORIAL DE INTENTOS ---
exports.getStudentAttempts = async (alumnoName = 'Invitado') => {
    try {
        const intentos = await IntentoModel.find({ alumno: alumnoName })
            .populate({
                path: 'examen_id',
                select: 'nombre asignatura',
                populate: { path: 'asignatura', select: 'nombre' }
            })
            // NUEVO: Populamos las preguntas dentro de las respuestas para tener el enunciado
            .populate({
                path: 'respuestas.pregunta_id',
                select: 'enunciado opciones respuesta_correcta' // Traemos la correcta para mostrarla si falló
            })
            .sort({ fecha_intento: -1 })
            .lean();

        return intentos;
    } catch (error) {
        throw new Error('Error recuperando historial: ' + error.message);
    }
};

exports.generatePdfFromExamId = async (examId) => {
    const examDoc = await ExamenModel.findById(examId)
        .populate('asignatura', 'nombre')
        .populate({ path: 'preguntas', populate: { path: 'criterios_evaluacion' } }).lean();

    if (!examDoc) throw new Error("Examen no encontrado");

    const preguntasAdaptadas = examDoc.preguntas.map(q => ({
        enunciado: q.enunciado,
        opciones: q.opciones,
        ...new PreguntaClass(q).getClientData(),
        asignatura: examDoc.asignatura.nombre
    }));

    return this.generateExamPdf({ nombre: examDoc.nombre, autor: examDoc.autor, preguntas: preguntasAdaptadas });
};

exports.generateExamPdf = (examData) => {
    const doc = new PDFDocument();
    doc.fontSize(20).text(examData.nombre, { align: 'center' });
    doc.moveDown();
    if (examData.autor) doc.fontSize(10).text(`Autor: ${examData.autor}`, { align: 'right' });
    doc.fontSize(12).text(`Asignatura: ${examData.preguntas[0]?.asignatura || 'Varios'}`);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`);
    doc.moveDown(); doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke(); doc.moveDown();
    doc.fontSize(12);
    examData.preguntas.forEach((q, i) => {
        if (doc.y > 700) doc.addPage();
        doc.font('Helvetica-Bold').text(`${i + 1}. ${q.enunciado}`);
        doc.moveDown(0.5);
        doc.font('Helvetica');
        q.opciones.forEach(opt => doc.text(`   O  ${opt}`));
        doc.moveDown(1);
    });
    return doc;
};

exports.getExamForExport = async (examId) => {
    try {
        // Recuperamos el examen con todos los datos populados
        const exam = await ExamenModel.findById(examId)
            .populate('asignatura', 'nombre') // Solo nombre
            .populate({
                path: 'preguntas',
                populate: { path: 'criterios_evaluacion', select: 'nombre' } // Nombres de los criterios
            })
            .lean();

        if (!exam) throw new Error("Examen no encontrado para exportar");

        // TRANSFORMACIÓN DE DATOS (DTO)
        // Convertimos la estructura de Mongo a un JSON genérico para compartir
        const exportData = {
            meta: {
                titulo: exam.nombre,
                asignatura: exam.asignatura.nombre, // Texto plano, no ID
                autor: exam.autor,
                fecha: exam.fecha_creacion,
                tipo: exam.tipo
            },
            preguntas: exam.preguntas.map(p => ({
                pregunta: p.enunciado,
                opciones: p.opciones,
                // IMPORTANTE: Incluimos la respuesta correcta porque es para IMPORTAR en otra app (Kahoot),
                // el profesor de la otra app necesita saber cuál es la correcta.
                respuesta_correcta: p.respuesta_correcta,
                temas: p.criterios_evaluacion.map(c => c.nombre), // Array de nombres
                dificultad: p.dificultad
            }))
        };

        return exportData;

    } catch (error) {
        throw new Error("Error exportando examen: " + error.message);
    }
};

// ============================================================================
// NEW EXAM MANAGEMENT METHODS (Draft/Published System)
// ============================================================================

/**
 * Create a new exam (draft or published)
 */
exports.createExam = async (examData) => {
    try {
        const nuevoExamen = new ExamenModel(examData);
        return await nuevoExamen.save();
    } catch (error) {
        throw new Error(`Error creating exam: ${error.message}`);
    }
};

/**
 * Get exams by user, optionally filtered by estado
 */
exports.getExamsByUser = async (userId, estado = null) => {
    try {
        const query = { creador: userId };
        if (estado) {
            query.estado = estado;
        }
        return await ExamenModel.find(query)
            .populate('preguntas')
            .sort({ createdAt: -1 });
    } catch (error) {
        throw new Error(`Error fetching exams: ${error.message}`);
    }
};

/**
 * Get exam by ID
 */
exports.getExamById = async (id) => {
    try {
        return await ExamenModel.findById(id).populate('preguntas');
    } catch (error) {
        throw new Error(`Error fetching exam: ${error.message}`);
    }
};

/**
 * Update exam
 */
exports.updateExam = async (id, examData) => {
    try {
        return await ExamenModel.findByIdAndUpdate(
            id,
            examData,
            { new: true, runValidators: true }
        );
    } catch (error) {
        throw new Error(`Error updating exam: ${error.message}`);
    }
};

/**
 * Delete exam
 */
exports.deleteExam = async (id) => {
    try {
        return await ExamenModel.findByIdAndDelete(id);
    } catch (error) {
        throw new Error(`Error deleting exam: ${error.message}`);
    }
};

/**
 * Publish a draft exam (change estado to 'publicado')
 */
exports.publishExam = async (id) => {
    try {
        return await ExamenModel.findByIdAndUpdate(
            id,
            { estado: 'publicado' },
            { new: true }
        );
    } catch (error) {
        throw new Error(`Error publishing exam: ${error.message}`);
    }
};