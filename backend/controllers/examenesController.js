const examenesService = require('../services/examenesService');
const PreguntaClass = require('../classes/Pregunta'); // Necesario para limpiar respuestas en getExamForStudent
const ExamenModel = require('../models/ExamenModelo'); // Necesario si hacemos la consulta directa aquí (o mover al servicio)

exports.previewExam = async (req, res) => {
    try {
        const { subjectId, amount } = req.body; 
        const examPreview = await examenesService.generateExamPreview(subjectId, parseInt(amount));
        res.status(200).json({ success: true, exam: examPreview });
    } catch (e) { res.status(500).json({success:false, message: e.message}); }
};

// --- MODIFICADO ---
exports.saveExam = async (req, res) => {
    try {
        const { nombre, asignaturaId, preguntasIds, autor, tipo } = req.body; // Añadido tipo

        if (!nombre || !asignaturaId || !preguntasIds) {
            return res.status(400).json({ success: false, message: 'Datos incompletos.' });
        }

        const savedExam = await examenesService.saveExamToDb({ 
            nombre, asignaturaId, preguntasIds, autor, tipo 
        });
        res.status(201).json({ success: true, message: 'Guardado', examId: savedExam._id });
    } catch (e) { res.status(500).json({success:false, message: e.message}); }
};

// --- MODIFICADO ---
exports.searchExams = async (req, res) => {
    try {
        const { subjectId, autor, tipo } = req.query; // Añadido tipo
        const exams = await examenesService.searchExams(subjectId, autor, tipo);
        res.json({ success: true, exams });
    } catch (e) { res.status(500).json({success:false, message: e.message}); }
};

exports.downloadPdfDirect = async (req, res) => {
    const examData = req.body;
    if (!examData) return res.status(400).send('No data');
    try {
        const doc = examenesService.generateExamPdf(examData);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${examData.nombre}.pdf`);
        doc.pipe(res); doc.end();
    } catch (e) { res.status(500).send("Error PDF"); }
};

exports.downloadExamById = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await examenesService.generatePdfFromExamId(id);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Examen_${id}.pdf`);
        doc.pipe(res); doc.end();
    } catch (e) { res.status(500).send("Error PDF: " + e.message); }
};

// --- NUEVO: OBTENER EXAMEN PARA ALUMNO ---
exports.getExamForStudent = async (req, res) => {
    try {
        // Recuperamos el examen
        const examDoc = await ExamenModel.findById(req.params.id).populate('preguntas').lean();
        
        if (!examDoc) return res.status(404).json({ success: false, message: "Examen no encontrado" });

        // IMPORTANTE: Limpiamos las respuestas correctas antes de enviarlo
        // Usamos la clase Pregunta para formatear cada item
        const preguntasLimpias = examDoc.preguntas.map(q => new PreguntaClass(q).getClientData());
        
        // Devolvemos estructura similar a la vista previa
        res.json({ 
            success: true, 
            exam: { 
                nombre: examDoc.nombre,
                autor: examDoc.autor,
                preguntas: preguntasLimpias 
            } 
        });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// --- NUEVO: CORREGIR ---
exports.submitExam = async (req, res) => {
    try {
        const { id } = req.params; // ID del examen
        const { answers } = req.body; // Array [{ preguntaId, valor }]

        if (!answers) return res.status(400).json({success: false, message: "No se enviaron respuestas"});

        const result = await examenesService.submitExamAttempt(id, answers);
        res.json({ success: true, result });
    } catch (e) { 
        console.error(e);
        res.status(500).json({ success: false, message: e.message }); 
    }
};

// --- NUEVO: OBTENER INTENTOS ---
exports.getAttempts = async (req, res) => {
    try {
        // En el futuro, aquí leeríamos req.user.id
        // Por ahora, asumimos 'Invitado' como hace el servicio por defecto
        const intentos = await examenesService.getStudentAttempts();
        res.json({ success: true, intentos });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};