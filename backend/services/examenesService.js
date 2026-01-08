const mongoose = require('mongoose');
const PreguntaModel = require('../models/PreguntaModelo');
const ExamenModel = require('../models/ExamenModelo');
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

exports.saveExamToDb = async (examData) => {
    try {
        const { nombre, asignaturaId, preguntasIds, autor } = examData;
        const preguntasDocs = await PreguntaModel.find({ _id: { $in: preguntasIds } });
        const allCriterios = preguntasDocs.flatMap(q => q.criterios_evaluacion);
        const criteriosIdsStrings = [...new Set(allCriterios.map(id => id.toString()))];

        const nuevoExamenDB = new ExamenModel({
            nombre,
            asignatura: asignaturaId,
            preguntas: preguntasIds,
            criterios_abarcados: criteriosIdsStrings,
            autor: autor || 'admin'
        });
        return await nuevoExamenDB.save();
    } catch (error) {
        throw new Error('Error guardando examen: ' + error.message);
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